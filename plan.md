# plan.md

## Objectives
- Prove correctness of the **core forensic workflow**: recalculation by **Método Hamburguês (juros simples sobre saldo devedor, sem anatocismo)** and side-by-side comparison with **Tabela Price** and **SAC**, including **real payment history** (dates/amounts, delays).
- Integrate **BACEN SGS** rate lookup (auto) with **manual override** and include abusiveness indicators.
- Deliver a V1 web app (FastAPI + React) that generates **Excel memory of calculation** and **PDF laudo pericial**.

---

## Phase 1 — Core POC (isolation, do not proceed until correct)

### User stories (POC)
1. As a perito, I can run a single script that generates Hamburguês/Price/SAC tables for a sample contract.
2. As a perito, I can input a list of real payments (with dates) and see interest/principal allocation per payment (Hamburguês).
3. As a perito, I can fetch a BACEN SGS series for a date range and compute an average rate.
4. As a perito, I can generate an Excel workbook with the three amortization tables and a comparison summary.
5. As a perito, I can generate a PDF laudo draft with methodology + key results.

### Implementation steps
1. **Web research (quick)**: confirm standard perícia conventions for “Método Hamburguês” (day-count, rounding, payment allocation order, handling partial payments).
2. Create `/app/poc_test.py` with deterministic inputs and prints/checks.
3. Implement calculation engine functions (pure python):
   - `hamburgues_schedule(contract, payments, day_count=30/360|actual/365 configurable)`
   - `price_schedule(contract)`
   - `sac_schedule(contract)`
   - Common helpers: rounding policy, date diff, IRR/CET helpers (optional in POC if time).
4. Implement BACEN SGS call via `httpx` (real fetch) + manual override path.
5. Generate sample outputs:
   - Excel via `openpyxl` (multi-sheet: Inputs, Hamburguês, Price, SAC, Comparison).
   - PDF via `reportlab` (header, identification, methodology, summary table, conclusion placeholders).
6. Validate correctness:
   - Compare Price fixed PMT vs known formula.
   - Verify Hamburguês: no interest capitalization; interest accrues only on outstanding principal between payment dates; payment applies **interest first then principal**.
   - Sanity checks: balances never increase under Hamburguês unless negative amortization is explicitly allowed (flag if payment < interest).

### Success criteria
- `poc_test.py` runs end-to-end producing `.xlsx` and `.pdf` without manual intervention.
- Mathematical checks pass (within rounding tolerance) for at least 2 scenarios:
  - On-time payments.
  - Delayed/irregular payments with partials.
- BACEN series fetch works (and failure gracefully falls back to manual rate input).

### Next actions
- Confirm with user: **day-count convention** (ACT/365 vs 30/360) and **rounding** (centavos per event vs end of month) used in their practice.

---

## Phase 2 — V1 App Development (build around proven core)

### User stories (V1)
1. As a perito, I can enter contract data (principal, rate, term, start date, installment, IOF/tarifas/seguros) in a guided form.
2. As a perito, I can add/edit/delete actual payments (date + amount) in a table and the app validates chronology.
3. As a perito, I can choose Price or SAC as the “original contract method” and compare against Hamburguês.
4. As a perito, I can auto-fetch BACEN rate by operation type/date range and override it manually.
5. As a perito, I can view a results dashboard: totals paid, saldo final, juros totais, excess charged, and abusiveness flags.
6. As a perito, I can download an Excel memory-of-calculation and a PDF laudo pericial.

### Implementation steps
1. Backend (FastAPI):
   - Endpoints: `POST /api/calculate`, `GET /api/bacen/series`, `GET /api/bacen/rates`, `POST /api/report/excel`, `POST /api/report/pdf`.
   - Pydantic models: Contract, FeeItems, Payment, BacenQuery, CalculationResult.
   - Reuse POC calculation code as a module with unit tests.
2. Frontend (React + shadcn/ui):
   - Multi-step flow: Contract → Payments → BACEN → Review/Run → Results.
   - Results: summary cards + amortization tables (tabbed) + chart (balance over time).
   - Download buttons call backend report endpoints.
3. Error/state handling:
   - Invalid dates, missing required fields, BACEN downtime, negative amortization warnings.
   - Clear “assumptions used” section in UI (day-count, rounding, method definitions).
4. One end-to-end test pass after wiring UI↔API.

### Success criteria
- User can complete the full flow in browser: input → calculate → view tables → download Excel/PDF.
- Outputs match Phase-1 POC outputs for the same inputs.
- E2E test passes with at least one complex payment history case.

### Next actions
- Decide default BACEN series list (vehicle financing PF/PJ, personal credit, etc.) and mapping labels in UI.

---

## Phase 3 — Hardening + Forensic Features

### User stories (enhancements)
1. As a perito, I can select rounding policy and day-count convention per case and it is shown in reports.
2. As a perito, I can mark and explain events (inadimplência, pagamento parcial, renegociação) and see them annotated in tables.
3. As a perito, I can generate a more complete laudo with sections, signature block, and anexos tables.
4. As a perito, I can export CSV in addition to Excel for quick cross-checks.
5. As a perito, I can run regression tests on a set of known cases to ensure updates don’t change results.

### Implementation steps
1. Add robust test suite (pytest) for calculation engine (edge cases: partial payments, zero payment, overpayment, early payoff).
2. Improve PDF layout (standard perícia structure; table pagination; “quesitos” placeholders).
3. Add BACEN caching (in-memory) + clearer failure messaging + manual override prominence.
4. Refactor modules for maintainability (calculations, reports, integrations separated).
5. Run another end-to-end test round.

### Success criteria
- Calculation engine has broad automated coverage and stable outputs across edge cases.
- Reports are courtroom-ready in formatting and include assumptions + methodology.

---

## Phase 4 — Optional (only if requested later)
- Persistence/history, multi-contract management, auth/users, templates, additional methodologies (Gauss etc.).
