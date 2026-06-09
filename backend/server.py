"""FastAPI server for Forensic Loan Auditor (Método Hamburguês)."""
from __future__ import annotations

import logging
import os
from datetime import date, datetime, timezone
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException, Response
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware

from bacen import BACEN_SERIES_CATALOG, compute_average, fetch_series
from calculations import (
    Payment,
    build_contract,
    hamburgues_schedule,
    price_schedule,
    sac_schedule,
    totals,
)
from excel_generator import build_excel
from models import (
    BacenFetchRequest,
    BacenReference,
    CalculationRequest,
    CalculationResult,
    ContractInput,
    MethodResult,
    PaymentInput,
    ScheduleRowOut,
)
from pdf_generator import build_pdf

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection (kept available; v1 doesn't persist analyses)
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Forensic Loan Auditor — Método Hamburguês")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


# -------------------------- Helpers --------------------------

def _row_to_out(r) -> ScheduleRowOut:
    return ScheduleRowOut(**r.to_dict())


def _method_payload(name: str, rows, pmt: Optional[float] = None) -> dict:
    t = totals(rows)
    return {
        "name": name,
        "rows": [r.to_dict() for r in rows],
        "total_paid": t["total_paid"],
        "total_interest": t["total_interest"],
        "total_amortization": t["total_amortization"],
        "final_balance": t["final_balance"],
        "pmt": pmt,
    }


# -------------------------- Endpoints --------------------------

@api_router.get("/")
async def root():
    return {"message": "Forensic Loan Auditor API", "version": "1.0.0"}


@api_router.get("/bacen/series")
async def list_bacen_series():
    return {"series": BACEN_SERIES_CATALOG}


@api_router.post("/bacen/fetch")
async def fetch_bacen(req: BacenFetchRequest):
    try:
        data = fetch_series(req.series_code, req.start_date, req.end_date)
        avg = compute_average(data) if data else None
        catalog_entry = next((s for s in BACEN_SERIES_CATALOG if s["code"] == req.series_code), None)
        return {
            "series_code": req.series_code,
            "series_label": catalog_entry["label"] if catalog_entry else f"Série {req.series_code}",
            "unit": catalog_entry["unit"] if catalog_entry else "",
            "start_date": req.start_date.isoformat(),
            "end_date": req.end_date.isoformat(),
            "points": data,
            "average": avg,
            "count": len(data) if data else 0,
        }
    except Exception as e:
        logger.exception("BACEN fetch failed")
        raise HTTPException(status_code=502, detail=f"Falha ao consultar BACEN SGS: {e}")


@api_router.post("/calculate")
async def calculate(req: CalculationRequest):
    try:
        c = req.contract
        contract = build_contract(
            principal=c.principal,
            monthly_rate=c.monthly_rate,
            annual_rate=c.annual_rate,
            term_months=c.term_months,
            start_date=c.start_date,
            first_due_date=c.first_due_date,
            iof=c.iof,
            fees=c.fees,
            insurance=c.insurance,
        )
        price_rows, pmt = price_schedule(contract)
        sac_rows = sac_schedule(contract)

        # Build payments: if user didn't provide, simulate paying Price PMT on each due date
        if req.payments:
            payments = [Payment(payment_date=p.payment_date, amount=__import__("decimal").Decimal(str(p.amount)), note=p.note) for p in req.payments]
        else:
            from decimal import Decimal as _Dec
            from calculations import add_months
            payments = []
            for k in range(1, contract.term_months + 1):
                payments.append(Payment(
                    payment_date=add_months(contract.first_due_date, k - 1),
                    amount=pmt,
                    note="Pagamento simulado (Price PMT)",
                ))
        hamb_rows = hamburgues_schedule(contract, payments, day_count=req.day_count)

        # Echo back the contract with normalized rates
        normalized_contract = ContractInput(
            principal=float(contract.principal),
            monthly_rate=float(contract.monthly_rate),
            annual_rate=float(contract.annual_rate),
            term_months=contract.term_months,
            start_date=contract.start_date,
            first_due_date=contract.first_due_date,
            iof=float(contract.iof),
            fees=float(contract.fees),
            insurance=float(contract.insurance),
            contracted_installment=c.contracted_installment,
            original_system=c.original_system,
        )

        price_data = _method_payload("Tabela Price", price_rows, pmt=float(pmt))
        sac_data = _method_payload("SAC", sac_rows)
        hamb_data = _method_payload("Método Hamburguês", hamb_rows)

        # Indicators: compare Price vs Hamburguês juros totais.
        # The compounding effect (anatocismo) is visible when Price interest exceeds Hamburguês
        # by more than ~0.5% of principal (above pure day-count noise from calendar irregularities).
        excess = price_data["total_interest"] - hamb_data["total_interest"]
        anatocism_threshold = max(float(contract.principal) * 0.005, 5.0)
        anatocism = excess > anatocism_threshold
        above_bacen = False
        if req.bacen:
            ref = req.bacen.fetched_average if req.bacen.mode == "auto" else req.bacen.manual_rate
            if ref is not None:
                # If BACEN unit is % a.m. (monthly), compare to contract monthly rate * 100
                contract_rate_pct = float(contract.monthly_rate) * 100.0
                unit = (req.bacen.unit or "").lower()
                if "a.a" in unit:
                    contract_rate_pct = float(contract.annual_rate) * 100.0
                above_bacen = contract_rate_pct > float(ref)

        indicators = {
            "excess_interest_vs_hamburgues": round(excess, 2),
            "anatocism": bool(anatocism),
            "above_bacen": bool(above_bacen),
            "contract_monthly_rate_pct": float(contract.monthly_rate) * 100.0,
            "contract_annual_rate_pct": float(contract.annual_rate) * 100.0,
        }

        result = {
            "contract": normalized_contract.model_dump(mode="json"),
            "price": price_data,
            "sac": sac_data,
            "hamburgues": hamb_data,
            "bacen": req.bacen.model_dump(mode="json") if req.bacen else None,
            "indicators": indicators,
            "assumptions": {
                "day_count": req.day_count,
                "rounding": "ROUND_HALF_UP, 2 casas (centavos)",
                "interest_allocation": "Pagamento abate juros acumulados primeiro; residual amortiza principal",
                "capitalization_hamburgues": "Sem capitalização; juros não pagos não viram principal",
            },
        }
        return result
    except Exception as e:
        logger.exception("calculate failed")
        raise HTTPException(status_code=400, detail=str(e))


@api_router.post("/report/excel")
async def report_excel(result: dict):
    try:
        data = build_excel(result)
        return Response(
            content=data,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": 'attachment; filename="laudo_pericial.xlsx"',
            },
        )
    except Exception as e:
        logger.exception("excel generation failed")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/report/pdf")
async def report_pdf(result: dict):
    try:
        data = build_pdf(result)
        return Response(
            content=data,
            media_type="application/pdf",
            headers={
                "Content-Disposition": 'attachment; filename="laudo_pericial.pdf"',
            },
        )
    except Exception as e:
        logger.exception("pdf generation failed")
        raise HTTPException(status_code=500, detail=str(e))


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
