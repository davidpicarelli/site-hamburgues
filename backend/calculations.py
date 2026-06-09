"""
Financial calculation engine for forensic loan auditing.
  - Tabela Price (compound interest, fixed installment)
  - SAC (constant amortization, compound interest)
  - Método Hamburguês (simple interest pro-rata daily, NO capitalization)

All monetary values use Decimal (centavos rounding ROUND_HALF_UP).
Dates use python's `date`. day_count: "30" -> diaária = i_m/30; "365" -> diaária = i_a/365.
"""
from __future__ import annotations

import calendar
from dataclasses import dataclass, field
from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional, Tuple

CENT = Decimal("0.01")


def d(x) -> Decimal:
    return Decimal(str(x))


def q(x: Decimal) -> Decimal:
    return x.quantize(CENT, rounding=ROUND_HALF_UP)


def days_between(d1: date, d2: date) -> int:
    return (d2 - d1).days


def add_months(dt: date, months: int) -> date:
    m = dt.month - 1 + months
    y = dt.year + m // 12
    m = m % 12 + 1
    last_day = calendar.monthrange(y, m)[1]
    day = min(dt.day, last_day)
    return date(y, m, day)


@dataclass
class Contract:
    principal: Decimal
    monthly_rate: Decimal
    annual_rate: Decimal
    term_months: int
    start_date: date
    first_due_date: date
    iof: Decimal = Decimal("0")
    fees: Decimal = Decimal("0")
    insurance: Decimal = Decimal("0")

    @property
    def gross_principal(self) -> Decimal:
        return self.principal + self.iof + self.fees + self.insurance


@dataclass
class Payment:
    payment_date: date
    amount: Decimal
    note: str = ""


@dataclass
class ScheduleRow:
    n: int
    due_date: date
    days: int
    opening_balance: Decimal
    interest: Decimal
    amortization: Decimal
    installment: Decimal
    closing_balance: Decimal
    note: str = ""

    def to_dict(self) -> dict:
        return {
            "n": self.n,
            "due_date": self.due_date.isoformat(),
            "days": self.days,
            "opening_balance": float(self.opening_balance),
            "interest": float(self.interest),
            "amortization": float(self.amortization),
            "installment": float(self.installment),
            "closing_balance": float(self.closing_balance),
            "note": self.note,
        }


def build_contract(
    principal: float,
    monthly_rate: Optional[float],
    annual_rate: Optional[float],
    term_months: int,
    start_date: date,
    first_due_date: Optional[date] = None,
    iof: float = 0.0,
    fees: float = 0.0,
    insurance: float = 0.0,
) -> Contract:
    if first_due_date is None:
        first_due_date = add_months(start_date, 1)
    if monthly_rate is None and annual_rate is not None:
        monthly_rate = float((Decimal(1) + d(annual_rate)) ** (Decimal(1) / Decimal(12)) - Decimal(1))
    if annual_rate is None and monthly_rate is not None:
        annual_rate = float((Decimal(1) + d(monthly_rate)) ** Decimal(12) - Decimal(1))
    if monthly_rate is None or annual_rate is None:
        raise ValueError("Informe taxa mensal ou anual.")
    return Contract(
        principal=d(principal),
        monthly_rate=d(monthly_rate),
        annual_rate=d(annual_rate),
        term_months=int(term_months),
        start_date=start_date,
        first_due_date=first_due_date,
        iof=d(iof),
        fees=d(fees),
        insurance=d(insurance),
    )


# -------------------- PRICE --------------------

def price_pmt(principal: Decimal, monthly_rate: Decimal, n: int) -> Decimal:
    i = monthly_rate
    if i == 0:
        return q(principal / Decimal(n))
    factor = Decimal(1) - (Decimal(1) + i) ** Decimal(-n)
    return q(principal * i / factor)


def price_schedule(contract: Contract) -> Tuple[List[ScheduleRow], Decimal]:
    P = contract.gross_principal
    i = contract.monthly_rate
    n = contract.term_months
    pmt = price_pmt(P, i, n)
    rows: List[ScheduleRow] = []
    balance = P
    prev_date = contract.start_date
    for k in range(1, n + 1):
        due = add_months(contract.first_due_date, k - 1)
        days = days_between(prev_date, due)
        interest = q(balance * i)
        if k == n:
            amort = q(balance)
            installment = q(amort + interest)
        else:
            amort = q(pmt - interest)
            installment = pmt
        new_balance = q(balance - amort)
        rows.append(ScheduleRow(
            n=k, due_date=due, days=days,
            opening_balance=balance, interest=interest,
            amortization=amort, installment=installment,
            closing_balance=new_balance,
        ))
        balance = new_balance
        prev_date = due
    return rows, pmt


# -------------------- SAC --------------------

def sac_schedule(contract: Contract) -> List[ScheduleRow]:
    P = contract.gross_principal
    i = contract.monthly_rate
    n = contract.term_months
    base_amort = q(P / Decimal(n))
    rows: List[ScheduleRow] = []
    balance = P
    prev_date = contract.start_date
    for k in range(1, n + 1):
        due = add_months(contract.first_due_date, k - 1)
        days = days_between(prev_date, due)
        interest = q(balance * i)
        amort = q(balance) if k == n else base_amort
        installment = q(amort + interest)
        new_balance = q(balance - amort)
        rows.append(ScheduleRow(
            n=k, due_date=due, days=days,
            opening_balance=balance, interest=interest,
            amortization=amort, installment=installment,
            closing_balance=new_balance,
        ))
        balance = new_balance
        prev_date = due
    return rows


# -------------------- HAMBURGUÊS --------------------

def hamburgues_schedule(
    contract: Contract,
    payments: List[Payment],
    day_count: str = "30",
) -> List[ScheduleRow]:
    if day_count == "30":
        daily_rate = contract.monthly_rate / Decimal(30)
    else:
        daily_rate = contract.annual_rate / Decimal(365)
    P = contract.gross_principal
    rows: List[ScheduleRow] = []
    balance = P
    last_date = contract.start_date
    pending_interest = Decimal("0")
    payments_sorted = sorted(payments, key=lambda p: p.payment_date)
    for k, pay in enumerate(payments_sorted, start=1):
        days = days_between(last_date, pay.payment_date)
        period_interest = q(balance * daily_rate * Decimal(days))
        total_interest_due = q(pending_interest + period_interest)
        note = ""
        if pay.amount >= total_interest_due:
            interest_paid = total_interest_due
            amort = q(pay.amount - interest_paid)
            if amort > balance:
                refund = q(amort - balance)
                amort = balance
                note = f"Pagamento excedente em R$ {refund} (saldo quitado)."
            pending_interest = Decimal("0")
        else:
            amort = Decimal("0")
            pending_interest = q(total_interest_due - pay.amount)
            note = f"Pagamento insuficiente para juros. Juros não pagos pendentes (NÃO capitalizados): R$ {pending_interest}."
        new_balance = q(balance - amort)
        rows.append(ScheduleRow(
            n=k, due_date=pay.payment_date, days=days,
            opening_balance=balance, interest=total_interest_due,
            amortization=amort, installment=pay.amount,
            closing_balance=new_balance,
            note=(pay.note + (" " if pay.note else "") + note).strip(),
        ))
        balance = new_balance
        last_date = pay.payment_date
    return rows


def totals(rows: List[ScheduleRow]) -> dict:
    total_paid = sum((r.installment for r in rows), Decimal("0"))
    total_interest = sum((r.interest for r in rows), Decimal("0"))
    total_amort = sum((r.amortization for r in rows), Decimal("0"))
    final_balance = rows[-1].closing_balance if rows else Decimal("0")
    return {
        "total_paid": float(q(total_paid)),
        "total_interest": float(q(total_interest)),
        "total_amortization": float(q(total_amort)),
        "final_balance": float(q(final_balance)),
    }
