"""Pydantic models for the calculation API."""
from __future__ import annotations

from datetime import date
from typing import List, Optional, Literal

from pydantic import BaseModel, Field, ConfigDict


class ContractInput(BaseModel):
    model_config = ConfigDict(extra="ignore")
    principal: float = Field(..., gt=0, description="Valor financiado (R$)")
    monthly_rate: Optional[float] = Field(None, description="Taxa mensal (decimal, ex 0.02 = 2% a.m.)")
    annual_rate: Optional[float] = Field(None, description="Taxa anual (decimal). Informe taxa mensal OU anual.")
    term_months: int = Field(..., gt=0, le=600)
    start_date: date
    first_due_date: Optional[date] = None
    iof: float = 0.0
    fees: float = 0.0
    insurance: float = 0.0
    contracted_installment: Optional[float] = Field(None, description="Parcela contratada (opcional, p/ referência)")
    original_system: Literal["price", "sac"] = "price"


class PaymentInput(BaseModel):
    payment_date: date
    amount: float = Field(..., ge=0)
    note: str = ""


class BacenReference(BaseModel):
    mode: Literal["auto", "manual"] = "manual"
    series_code: Optional[int] = None
    series_label: Optional[str] = None
    unit: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    manual_rate: Optional[float] = None
    fetched_average: Optional[float] = None
    raw_points: Optional[List[dict]] = None


class CalculationRequest(BaseModel):
    contract: ContractInput
    payments: List[PaymentInput] = []
    bacen: Optional[BacenReference] = None
    day_count: Literal["30", "365"] = "30"


class ScheduleRowOut(BaseModel):
    n: int
    due_date: str
    days: int
    opening_balance: float
    interest: float
    amortization: float
    installment: float
    closing_balance: float
    note: str = ""


class MethodResult(BaseModel):
    name: str
    rows: List[ScheduleRowOut]
    total_paid: float
    total_interest: float
    total_amortization: float
    final_balance: float
    pmt: Optional[float] = None


class CalculationResult(BaseModel):
    contract: ContractInput
    price: MethodResult
    sac: MethodResult
    hamburgues: MethodResult
    bacen: Optional[BacenReference] = None
    indicators: dict
    assumptions: dict


class BacenFetchRequest(BaseModel):
    series_code: int
    start_date: date
    end_date: date
