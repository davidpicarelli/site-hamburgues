"""BACEN SGS API integration. Public endpoint, no auth."""
from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import List, Optional

import httpx

BACEN_SERIES_CATALOG = [
    {"code": 25471, "label": "PF — Aquisição de veículos", "unit": "% a.m.", "frequency": "mensal"},
    {"code": 20749, "label": "PF — Aquisição de veículos (anualizada)", "unit": "% a.a.", "frequency": "mensal"},
    {"code": 20714, "label": "PF — Total (recursos livres)", "unit": "% a.a.", "frequency": "mensal"},
    {"code": 20739, "label": "PF — Crédito pessoal não consignado", "unit": "% a.a.", "frequency": "mensal"},
    {"code": 20741, "label": "PF — Crédito pessoal consignado total", "unit": "% a.a.", "frequency": "mensal"},
    {"code": 20753, "label": "PF — Cheque especial", "unit": "% a.a.", "frequency": "mensal"},
    {"code": 20756, "label": "PF — Cartão de crédito rotativo total", "unit": "% a.a.", "frequency": "mensal"},
    {"code": 25472, "label": "PJ — Aquisição de veículos", "unit": "% a.m.", "frequency": "mensal"},
    {"code": 25474, "label": "PJ — Capital de giro com prazo até 365 dias", "unit": "% a.m.", "frequency": "mensal"},
    {"code": 4189, "label": "Taxa Selic (anualizada base 252)", "unit": "% a.a.", "frequency": "diária"},
    {"code": 433, "label": "IPCA (mensal)", "unit": "%", "frequency": "mensal"},
]


def get_series_catalog():
    return BACEN_SERIES_CATALOG


def fetch_series(code: int, start: date, end: date) -> List[dict]:
    url = f"https://api.bcb.gov.br/dados/serie/bcdata.sgs.{code}/dados"
    params = {
        "formato": "json",
        "dataInicial": start.strftime("%d/%m/%Y"),
        "dataFinal": end.strftime("%d/%m/%Y"),
    }
    with httpx.Client(timeout=20.0) as client:
        r = client.get(url, params=params)
        r.raise_for_status()
        return r.json()


def compute_average(series: List[dict]) -> Optional[float]:
    if not series:
        return None
    total = Decimal("0")
    n = 0
    for item in series:
        try:
            v = Decimal(str(item["valor"]).replace(",", "."))
            total += v
            n += 1
        except Exception:
            continue
    if n == 0:
        return None
    return float(total / Decimal(n))
