import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ScaleIcon, FileSpreadsheet, FileText, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import AppHeader from "@/components/AppHeader";
import HeroIntro from "@/components/HeroIntro";
import WizardStepper from "@/components/WizardStepper";
import ContractForm from "@/components/ContractForm";
import PaymentsEditor from "@/components/PaymentsEditor";
import BacenSelector from "@/components/BacenSelector";
import ResultsView from "@/components/ResultsView";
import { calculate } from "@/lib/api";
import { T } from "@/constants/testIds";
import { addMonthsISO, todayISO } from "@/lib/format";

const STEPS = ["Dados do Contrato", "Pagamentos Realizados", "Taxa BACEN", "Resultados"];

const defaultContract = () => ({
  principal: "",
  rateMode: "monthly",
  monthly_rate: "",
  annual_rate: "",
  term_months: "",
  start_date: todayISO(),
  first_due_date: "",
  iof: "",
  fees: "",
  insurance: "",
  contracted_installment: "",
  original_system: "price",
  day_count: "30",
});

export default function CalculatorPage() {
  const [step, setStep] = useState(0);
  const [contract, setContract] = useState(defaultContract());
  const [payments, setPayments] = useState([]);
  const [bacen, setBacen] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  // Derived: implied first_due_date
  const impliedFirstDue = useMemo(() => {
    if (contract.start_date && !contract.first_due_date) {
      return addMonthsISO(contract.start_date, 1);
    }
    return contract.first_due_date;
  }, [contract.start_date, contract.first_due_date]);

  const goNext = () => {
    const errs = validateCurrentStep();
    if (errs.length) {
      setErrors(errs);
      toast.error("Verifique os campos destacados.");
      return;
    }
    setErrors([]);
    if (step === 2) {
      handleCalculate();
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const goBack = () => {
    setErrors([]);
    setStep((s) => Math.max(0, s - 1));
  };

  const validateCurrentStep = () => {
    const errs = [];
    if (step === 0) {
      if (!contract.principal || Number(contract.principal) <= 0)
        errs.push("Valor financiado é obrigatório e deve ser maior que zero.");
      if (!contract.term_months || Number(contract.term_months) <= 0)
        errs.push("Prazo (meses) é obrigatório.");
      if (!contract.start_date) errs.push("Data de início é obrigatória.");
      if (contract.rateMode === "monthly" && (!contract.monthly_rate || Number(contract.monthly_rate) <= 0))
        errs.push("Taxa mensal é obrigatória.");
      if (contract.rateMode === "annual" && (!contract.annual_rate || Number(contract.annual_rate) <= 0))
        errs.push("Taxa anual é obrigatória.");
    }
    return errs;
  };

  const handleCalculate = async () => {
    const errs = validateCurrentStep();
    if (errs.length) {
      setErrors(errs);
      toast.error("Verifique os campos destacados.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        contract: {
          principal: Number(contract.principal),
          monthly_rate: contract.rateMode === "monthly" ? Number(contract.monthly_rate) / 100 : null,
          annual_rate: contract.rateMode === "annual" ? Number(contract.annual_rate) / 100 : null,
          term_months: Number(contract.term_months),
          start_date: contract.start_date,
          first_due_date: contract.first_due_date || impliedFirstDue,
          iof: Number(contract.iof || 0),
          fees: Number(contract.fees || 0),
          insurance: Number(contract.insurance || 0),
          contracted_installment: contract.contracted_installment ? Number(contract.contracted_installment) : null,
          original_system: contract.original_system,
        },
        payments: payments.map((p) => ({
          payment_date: p.payment_date,
          amount: Number(p.amount),
          note: p.note || "",
        })),
        bacen: bacen,
        day_count: contract.day_count || "30",
      };
      const r = await calculate(payload);
      setResult(r);
      setStep(3);
      toast.success("Cálculo concluído.");
    } catch (e) {
      toast.error("Erro no cálculo: " + (e?.response?.data?.detail || e.message));
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setContract(defaultContract());
    setPayments([]);
    setBacen(null);
    setResult(null);
    setErrors([]);
    setStep(0);
    toast("Nova análise iniciada.");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader onNewAnalysis={resetAll} />
      {step === 0 && (
        <HeroIntro
          onStart={() => {
            const target = document.getElementById("wizard-card");
            if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      )}

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div id="wizard-card">
          <Card className="border-[hsl(var(--border))] shadow-sm bg-[hsl(var(--card))]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="font-serif-display text-xl text-[hsl(var(--primary))]">
                    Recálculo Pericial — Método Hamburguês
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Etapa {step + 1} de {STEPS.length} — {STEPS[step]}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="hidden sm:inline-flex bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] border-[#E6D7A8]">
                  <Sparkles className="w-3 h-3 mr-1" /> Análise pericial
                </Badge>
              </div>
              <div className="pt-4">
                <WizardStepper steps={STEPS} current={step} />
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              {errors.length > 0 && (
                <div
                  data-testid={T.wizard.validationAlert}
                  className="mb-4 rounded-lg border border-[#FECDCA] bg-[#FEE4E2] text-[#7A271A] p-3"
                >
                  <p className="font-semibold mb-1">Corrija os seguintes itens:</p>
                  <ul className="list-disc pl-5 text-sm">
                    {errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  {step === 0 && (
                    <ContractForm value={contract} onChange={setContract} impliedFirstDue={impliedFirstDue} />
                  )}
                  {step === 1 && (
                    <PaymentsEditor
                      payments={payments}
                      onChange={setPayments}
                      contract={contract}
                      impliedFirstDue={impliedFirstDue}
                    />
                  )}
                  {step === 2 && (
                    <BacenSelector value={bacen} onChange={setBacen} contract={contract} />
                  )}
                  {step === 3 && result && (
                    <ResultsView result={result} onReset={resetAll} />
                  )}
                </motion.div>
              </AnimatePresence>

              {step < 3 && (
                <div className="mt-8 flex items-center justify-between flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={goBack}
                    disabled={step === 0}
                    data-testid={T.wizard.back}
                  >
                    Voltar
                  </Button>
                  <div className="flex gap-2">
                    {step === 2 ? (
                      <Button
                        onClick={handleCalculate}
                        disabled={loading}
                        className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[#0A1730]"
                        data-testid={T.wizard.calculate}
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" /> Calculando…
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <ScaleIcon className="w-4 h-4" /> Calcular recálculo pericial
                          </span>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={goNext}
                        className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[#0A1730]"
                        data-testid={T.wizard.next}
                      >
                        Avançar
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-xs text-[hsl(var(--muted-foreground))]">
          <p>
            <strong>Disclaimer:</strong> Esta ferramenta apoia análises de perícia contábil pelo Método Hamburguês
            (juros simples sobre saldo devedor, sem capitalização). Os resultados são informativos; o perito é
            responsável pela interpretação final e adequação ao caso concreto.
          </p>
          <p className="mt-2">Fonte das taxas de mercado: BACEN — Sistema Gerenciador de Séries Temporais (SGS).</p>
        </div>
      </footer>
    </div>
  );
}
