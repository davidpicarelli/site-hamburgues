"""PDF laudo pericial generator using reportlab."""
from __future__ import annotations

from datetime import datetime
from io import BytesIO
from typing import List

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

NAVY = colors.HexColor("#0B1D3A")
GOLD = colors.HexColor("#B08D2A")
INK = colors.HexColor("#111827")
MUTED = colors.HexColor("#475569")
BORDER = colors.HexColor("#D7DEE8")
SURFACE2 = colors.HexColor("#F1F3F6")
DANGER_SOFT = colors.HexColor("#FEE4E2")
DANGER = colors.HexColor("#B42318")
EMERALD_SOFT = colors.HexColor("#D1FAE5")
EMERALD = colors.HexColor("#065F46")


def _fmt_money(v: float) -> str:
    try:
        s = f"{v:,.2f}"
        s = s.replace(",", "X").replace(".", ",").replace("X", ".")
        return f"R$ {s}"
    except Exception:
        return f"R$ {v}"


def _fmt_pct(v: float) -> str:
    try:
        return f"{v*100:.4f}%".replace(".", ",")
    except Exception:
        return f"{v}"


def _fmt_date(iso: str) -> str:
    try:
        y, m, d = iso.split("-")
        return f"{d}/{m}/{y}"
    except Exception:
        return str(iso)


def build_pdf(result: dict) -> bytes:
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm,
        title="Laudo Pericial Contábil — Recálculo de Contrato",
        author="Perícia Contábil",
    )
    styles = getSampleStyleSheet()
    h1 = ParagraphStyle("h1", parent=styles["Heading1"], fontSize=16, alignment=1, spaceAfter=8, textColor=NAVY, fontName="Helvetica-Bold")
    sub = ParagraphStyle("sub", parent=styles["BodyText"], fontSize=10, alignment=1, textColor=MUTED, spaceAfter=14)
    h2 = ParagraphStyle("h2", parent=styles["Heading2"], fontSize=12, spaceAfter=6, textColor=NAVY, fontName="Helvetica-Bold")
    body = ParagraphStyle("body", parent=styles["BodyText"], fontSize=10, leading=14, alignment=4, textColor=INK)
    small = ParagraphStyle("small", parent=styles["BodyText"], fontSize=8.5, leading=11, textColor=MUTED)

    story = []
    contract = result["contract"]
    bacen = result.get("bacen") or {}
    indicators = result.get("indicators", {})
    assumptions = result.get("assumptions", {})

    story.append(Paragraph("LAUDO PERICIAL CONTÁBIL", h1))
    story.append(Paragraph("Recálculo de Contrato de Financiamento pelo Método Hamburguês", sub))
    story.append(Paragraph(f"<b>Data de emissão:</b> {datetime.now().strftime('%d/%m/%Y %H:%M')}", small))
    story.append(Spacer(1, 0.4*cm))

    # ---- Section 1: Contract ----
    story.append(Paragraph("1. IDENTIFICAÇÃO DO CONTRATO", h2))
    gross = contract["principal"] + contract.get("iof", 0) + contract.get("fees", 0) + contract.get("insurance", 0)
    data = [
        ["Valor financiado (líquido)", _fmt_money(contract["principal"])],
        ["IOF / Tarifas / Seguros", f"{_fmt_money(contract.get('iof',0))} / {_fmt_money(contract.get('fees',0))} / {_fmt_money(contract.get('insurance',0))}"],
        ["Total bruto financiado", _fmt_money(gross)],
        ["Taxa contratada", f"{_fmt_pct(contract.get('monthly_rate',0) or 0)} a.m. ({_fmt_pct(contract.get('annual_rate',0) or 0)} a.a.)"],
        ["Prazo", f"{contract['term_months']} meses"],
        ["Início / 1ª parcela", f"{_fmt_date(str(contract['start_date']))} / {_fmt_date(str(contract.get('first_due_date','')))}"],
        ["Sistema do contrato", str(contract.get("original_system", "price")).upper()],
        ["Parcela contratada", _fmt_money(contract.get("contracted_installment") or 0)],
        ["Parcela calculada (Price PMT)", _fmt_money(result["price"].get("pmt") or 0)],
    ]
    t = Table(data, colWidths=[6.5*cm, 10*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), SURFACE2),
        ("TEXTCOLOR", (0, 0), (0, -1), NAVY),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("FONTSIZE", (0, 0), (-1, -1), 9.5),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.4*cm))

    # ---- Section 2: Methodology ----
    story.append(Paragraph("2. METODOLOGIA", h2))
    story.append(Paragraph(
        "Aplicou-se o <b>Método Hamburguês</b>, que apura juros de forma <b>simples e pro-rata diária</b> sobre o "
        "saldo devedor remanescente, <b>sem capitalização de juros</b> (sem anatocismo). Cada pagamento efetivo é "
        "alocado primeiramente à quitação dos juros acumulados no período e, somente o residual, à amortização do "
        "principal. Eventuais juros não pagos NÃO são incorporados ao saldo devedor.", body))
    story.append(Paragraph(
        f"<b>Convenção de dias:</b> {('30 (taxa diária = mensal / 30)' if assumptions.get('day_count')=='30' else '365 (taxa diária = anual / 365)')}. "
        "<b>Arredondamento:</b> 2 casas decimais (centavos), método half-up.", small))
    story.append(Spacer(1, 0.3*cm))

    # ---- Section 3: BACEN ----
    story.append(Paragraph("3. REFERÊNCIA BACEN (TAXA MÉDIA DE MERCADO)", h2))
    if bacen and (bacen.get("fetched_average") or bacen.get("manual_rate")):
        avg = bacen.get("fetched_average") or bacen.get("manual_rate")
        unit = bacen.get("unit", "") or ""
        story.append(Paragraph(
            f"Série SGS <b>{bacen.get('series_code','manual')}</b> — {bacen.get('series_label','Taxa informada manualmente')}.<br/>"
            f"Período: {bacen.get('start_date','—')} a {bacen.get('end_date','—')}.<br/>"
            f"<b>Taxa média observada:</b> {avg:.4f} {unit} — <b>Modo:</b> {bacen.get('mode','manual')}.", body))
    else:
        story.append(Paragraph("Referência BACEN não informada.", body))
    story.append(Spacer(1, 0.3*cm))

    # ---- Section 4: Results ----
    story.append(Paragraph("4. RESULTADOS COMPARATIVOS", h2))
    cmp_data = [
        ["Método", "Total Juros", "Total Pago", "Saldo Final"],
        ["Tabela Price (Original)",
         _fmt_money(result["price"]["total_interest"]),
         _fmt_money(result["price"]["total_paid"]),
         _fmt_money(result["price"]["final_balance"])],
        ["SAC",
         _fmt_money(result["sac"]["total_interest"]),
         _fmt_money(result["sac"]["total_paid"]),
         _fmt_money(result["sac"]["final_balance"])],
        ["Método Hamburguês",
         _fmt_money(result["hamburgues"]["total_interest"]),
         _fmt_money(result["hamburgues"]["total_paid"]),
         _fmt_money(result["hamburgues"]["final_balance"])],
    ]
    diff_int = result["price"]["total_interest"] - result["hamburgues"]["total_interest"]
    cmp_data.append(["Diferença (Price − Hamburguês)", _fmt_money(diff_int), "—", "—"])
    t2 = Table(cmp_data, colWidths=[6*cm, 3.5*cm, 3.5*cm, 3.5*cm])
    t2.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
        ("FONTSIZE", (0, 0), (-1, -1), 9.5),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("BACKGROUND", (0, -1), (-1, -1), DANGER_SOFT),
        ("TEXTCOLOR", (0, -1), (-1, -1), DANGER),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(t2)
    story.append(Spacer(1, 0.3*cm))

    # ---- Section 5: Indicators ----
    story.append(Paragraph("5. INDICADORES DE ABUSIVIDADE", h2))
    anatocism = indicators.get("anatocism", False)
    above_bacen = indicators.get("above_bacen", False)
    abuse_color = DANGER if (anatocism or above_bacen) else EMERALD
    abuse_bg = DANGER_SOFT if (anatocism or above_bacen) else EMERALD_SOFT
    ind_data = [
        ["Excesso cobrado em juros (Price − Hamburguês)", _fmt_money(indicators.get("excess_interest_vs_hamburgues", 0))],
        ["Taxa contratada acima da média BACEN?", "SIM" if above_bacen else "NÃO"],
        ["Indícios de anatocismo (capitalização de juros)?", "SIM" if anatocism else "NÃO"],
    ]
    t3 = Table(ind_data, colWidths=[10*cm, 6.5*cm])
    t3.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), SURFACE2),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("FONTSIZE", (0, 0), (-1, -1), 9.5),
        ("BACKGROUND", (1, 1), (1, 2), abuse_bg),
        ("TEXTCOLOR", (1, 1), (1, 2), abuse_color),
        ("FONTNAME", (1, 1), (1, 2), "Helvetica-Bold"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(t3)
    story.append(Spacer(1, 0.4*cm))

    # ---- Section 6: Hamburgues table ----
    story.append(Paragraph("6. MEMÓRIA DE CÁLCULO — MÉTODO HAMBURGUÊS", h2))
    rows = result["hamburgues"]["rows"]
    table_data = [["Nº", "Data", "Dias", "Saldo Inicial", "Juros", "Amortização", "Pagamento", "Saldo Final"]]
    for r in rows[:200]:  # cap to avoid huge PDF
        table_data.append([
            str(r["n"]),
            _fmt_date(r["due_date"]),
            str(r["days"]),
            _fmt_money(r["opening_balance"]),
            _fmt_money(r["interest"]),
            _fmt_money(r["amortization"]),
            _fmt_money(r["installment"]),
            _fmt_money(r["closing_balance"]),
        ])
    t4 = Table(table_data, colWidths=[0.9*cm, 2.0*cm, 1.0*cm, 2.6*cm, 2.4*cm, 2.5*cm, 2.4*cm, 2.6*cm], repeatRows=1)
    t4.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ALIGN", (0, 0), (-1, 0), "CENTER"),
        ("ALIGN", (3, 1), (-1, -1), "RIGHT"),
        ("ALIGN", (0, 1), (2, -1), "CENTER"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("GRID", (0, 0), (-1, -1), 0.3, BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(t4)
    story.append(Spacer(1, 0.5*cm))

    # ---- Section 7: Conclusion ----
    story.append(Paragraph("7. CONCLUSÃO", h2))
    conclusion = (
        "Com base na reconstituição pelo Método Hamburguês e na confrontação com o sistema original do contrato "
        f"({str(contract.get('original_system','price')).upper()}), apurou-se um excesso de juros estimado de "
        f"<b>{_fmt_money(indicators.get('excess_interest_vs_hamburgues',0))}</b>. "
    )
    if anatocism:
        conclusion += "Foram identificados <b>indícios de anatocismo</b> (capitalização de juros) considerando a diferença entre as metodologias. "
    if above_bacen:
        conclusion += "A taxa contratada apresenta-se <b>acima da média divulgada pelo BACEN</b> para a modalidade no período. "
    conclusion += "A planilha eletrônica anexa contém a memória de cálculo detalhada parcela a parcela."
    story.append(Paragraph(conclusion, body))

    story.append(Spacer(1, 1.0*cm))
    story.append(Paragraph("_______________________________________", small))
    story.append(Paragraph("Perito Contábil responsável", small))

    doc.build(story)
    return buf.getvalue()
