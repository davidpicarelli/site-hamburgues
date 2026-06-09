import { useState } from "react";
import { toast } from "sonner";
import {
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  RefreshCcw,
  Loader2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AmortizationTable from "@/components/AmortizationTable";
import ChartsView from "@/components/ChartsView";
import { downloadReport } from "@/lib/api";
import { formatBRL, formatPercent } from "@/lib/format";
import { T } from "@/constants/testIds";

function KpiCard({ title, value, hint, tone = "neutral", testid }) {
  const toneClasses = {
    neutral: "bg-[hsl(var(--card))] border-[hsl(var(--border))]",
    danger: "bg-[#FEE4E2] border-[#FECDCA]",
    good: "bg-emerald-50 border-emerald-200",
    accent: "bg-[hsl(var(--accent))] border-[#E6D7A8]",
  }[tone];
  return (
    <Card className={`rounded-xl ${toneClasses}`} data-testid={testid}>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))] font-semibold">
          {title}
        </p>
        <p className="mt-2 text-2xl md:text-3xl font-semibold tabular-nums text-[hsl(var(--foreground))]">
          {value}
        </p>
        {hint && (
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResultsView({ result, onReset }) {
  const { contract, price, sac, hamburgues, indicators, bacen, assumptions } = result;
  const [downloading, setDownloading] = useState({ excel: false, pdf: false });

  const onDownload = async (kind) => {
    setDownloading((s) => ({ ...s, [kind]: true }));
    try {
      await downloadReport(kind, result);
      toast.success(`${kind === "excel" ? "Planilha Excel" : "Laudo PDF"} gerado.`);
    } catch (e) {
      toast.error("Falha ao gerar arquivo: " + (e?.response?.data?.detail || e.message));
    } finally {
      setDownloading((s) => ({ ...s, [kind]: false }));
    }
  };

  const bacenRef = bacen ? (bacen.fetched_average ?? bacen.manual_rate) : null;
  const ratePct = bacen?.unit?.toLowerCase().includes("a.a")
    ? indicators.contract_annual_rate_pct
    : indicators.contract_monthly_rate_pct;
  const rateUnit = bacen?.unit?.toLowerCase().includes("a.a") ? "% a.a." : "% a.m.";

  const excess = indicators.excess_interest_vs_hamburgues || 0;
  const overchargeTone = excess > 0 ? "danger" : "good";

  return (
    <div className="space-y-8">
      {/* Top alert */}
      <div
        data-testid={T.results.anatocism}
        className={`rounded-xl border p-4 flex items-start gap-3 ${
          indicators.anatocism || indicators.above_bacen
            ? "bg-[#FEE4E2] border-[#FECDCA] text-[#7A271A]"
            : "bg-emerald-50 border-emerald-200 text-emerald-800"
        }`}
      >
        {indicators.anatocism || indicators.above_bacen ? (
          <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
        ) : (
          <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
        )}
        <div className="text-sm">
          <p className="font-semibold">
            {indicators.anatocism || indicators.above_bacen
              ? "Indícios de abusividade identificados"
              : "Sem indícios de abusividade pelos critérios atuais"}
          </p>
          <ul className="mt-1 list-disc pl-5 space-y-0.5">
            <li>
              Excesso de juros (Price − Hamburguês): <strong>{formatBRL(excess)}</strong>
            </li>
            <li>
              Anatocismo (capitalização de juros): <strong>{indicators.anatocism ? "SIM" : "NÃO"}</strong>
            </li>
            <li>
              Taxa contratada acima da média BACEN: <strong>{indicators.above_bacen ? "SIM" : "NÃO"}</strong>
              {bacenRef !== null && (
                <> — contratada {ratePct?.toFixed(4)}{rateUnit} vs BACEN {Number(bacenRef).toFixed(4)} {bacen?.unit || ""}</>
              )}
            </li>
          </ul>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Juros totais (Price)"
          value={formatBRL(price.total_interest)}
          hint="Contrato original (juros compostos)"
          testid={T.results.kpiPrice}
        />
        <KpiCard
          title="Juros totais (Hamburguês)"
          value={formatBRL(hamburgues.total_interest)}
          hint="Recálculo (juros simples, sem anatocismo)"
          tone="accent"
          testid={T.results.kpiHamb}
        />
        <KpiCard
          title="Excesso cobrado"
          value={formatBRL(excess)}
          hint={excess > 0 ? "Price excede o método Hamburguês" : "Nenhum excesso identificado"}
          tone={overchargeTone}
          testid={T.results.kpiOvercharge}
        />
        <KpiCard
          title="Taxa contratada vs BACEN"
          value={bacenRef !== null
            ? `${ratePct?.toFixed(4) || "—"}${rateUnit} vs ${Number(bacenRef).toFixed(4)} ${bacen?.unit || ""}`
            : `${ratePct?.toFixed(4) || "—"}${rateUnit}`}
          hint={bacenRef !== null ? (indicators.above_bacen ? "Acima da média divulgada" : "Dentro/abaixo da média") : "Referência BACEN não informada"}
          tone={bacenRef !== null ? (indicators.above_bacen ? "danger" : "good") : "neutral"}
          testid={T.results.kpiRateBacen}
        />
      </div>

      {/* Comparative summary card */}
      <Card className="border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <CardContent className="p-5">
          <p className="text-xs uppercase tracking-widest font-semibold text-[hsl(var(--primary))] mb-3">
            Resumo comparativo dos métodos
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm fz-table">
              <thead className="bg-[hsl(var(--secondary))]">
                <tr>
                  <th className="text-left px-3 py-2">Método</th>
                  <th className="text-right px-3 py-2">Total Juros</th>
                  <th className="text-right px-3 py-2">Total Pago</th>
                  <th className="text-right px-3 py-2">Amortizado</th>
                  <th className="text-right px-3 py-2">Saldo Final</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[hsl(var(--border))]">
                  <td className="px-3 py-2 font-medium">Tabela Price (Original)</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatBRL(price.total_interest)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatBRL(price.total_paid)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatBRL(price.total_amortization)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatBRL(price.final_balance)}</td>
                </tr>
                <tr className="border-t border-[hsl(var(--border))] bg-[#FBFCFE]">
                  <td className="px-3 py-2 font-medium">SAC</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatBRL(sac.total_interest)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatBRL(sac.total_paid)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatBRL(sac.total_amortization)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatBRL(sac.final_balance)}</td>
                </tr>
                <tr className="border-t border-[hsl(var(--border))]">
                  <td className="px-3 py-2 font-medium">Método Hamburguês</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatBRL(hamburgues.total_interest)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatBRL(hamburgues.total_paid)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatBRL(hamburgues.total_amortization)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatBRL(hamburgues.final_balance)}</td>
                </tr>
                <tr className="border-t border-[hsl(var(--border))] bg-[#FEE4E2] text-[#7A271A] font-semibold">
                  <td className="px-3 py-2">Diferença (Price − Hamburguês)</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatBRL(price.total_interest - hamburgues.total_interest)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatBRL(price.total_paid - hamburgues.total_paid)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">—</td>
                  <td className="px-3 py-2 text-right tabular-nums">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card className="border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-widest font-semibold text-[hsl(var(--primary))]">
              Saldo devedor ao longo do tempo
            </p>
            <Badge variant="outline" className="bg-white">
              <TrendingUp className="w-3 h-3 mr-1" /> Comparação gráfica
            </Badge>
          </div>
          <ChartsView price={price} sac={sac} hamburgues={hamburgues} />
        </CardContent>
      </Card>

      {/* Tabs with amortization tables */}
      <Card className="border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <CardContent className="p-5">
          <p className="text-xs uppercase tracking-widest font-semibold text-[hsl(var(--primary))] mb-3">
            Memória de cálculo — parcela a parcela
          </p>
          <Tabs defaultValue="hamburgues" className="w-full">
            <TabsList>
              <TabsTrigger value="hamburgues">Método Hamburguês</TabsTrigger>
              <TabsTrigger value="price">Tabela Price</TabsTrigger>
              <TabsTrigger value="sac">SAC</TabsTrigger>
            </TabsList>
            <TabsContent value="hamburgues" className="mt-4">
              <AmortizationTable rows={hamburgues.rows} showObs testid={T.results.table("hamburgues")} />
            </TabsContent>
            <TabsContent value="price" className="mt-4">
              <AmortizationTable rows={price.rows} testid={T.results.table("price")} />
            </TabsContent>
            <TabsContent value="sac" className="mt-4">
              <AmortizationTable rows={sac.rows} testid={T.results.table("sac")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Assumptions panel */}
      <Card className="border-[hsl(var(--border))] bg-[hsl(var(--secondary))]" data-testid={T.results.assumptions}>
        <CardContent className="p-5">
          <p className="text-xs uppercase tracking-widest font-semibold text-[hsl(var(--primary))] mb-3 flex items-center gap-2">
            <Info className="w-3.5 h-3.5" /> Premissas e metodologia
          </p>
          <Accordion type="single" collapsible>
            <AccordionItem value="assumptions">
              <AccordionTrigger>Ver detalhes das premissas utilizadas</AccordionTrigger>
              <AccordionContent>
                <ul className="grid sm:grid-cols-2 gap-3 text-sm">
                  <li><strong>Convenção de dias:</strong> {assumptions.day_count === "30" ? "30 (diária = mensal / 30)" : "365 (diária = anual / 365)"}</li>
                  <li><strong>Arredondamento:</strong> {assumptions.rounding}</li>
                  <li className="sm:col-span-2"><strong>Alocação do pagamento:</strong> {assumptions.interest_allocation}</li>
                  <li className="sm:col-span-2"><strong>Capitalização no Hamburguês:</strong> {assumptions.capitalization_hamburgues}</li>
                  <li className="sm:col-span-2"><strong>Fonte de taxa de mercado:</strong> BACEN — Sistema Gerenciador de Séries Temporais (SGS)</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Downloads */}
      <Card className="border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="font-serif-display text-lg text-[hsl(var(--primary))]">Exportar relatórios</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Inclui memória de cálculo parcela a parcela e laudo formatado para anexação em processo.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => onDownload("excel")}
                disabled={downloading.excel}
                className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[#0A1730]"
                data-testid={T.results.downloadExcel}
              >
                {downloading.excel ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4 mr-1.5" />
                )}
                Baixar Planilha (.xlsx)
              </Button>
              <Button
                variant="outline"
                onClick={() => onDownload("pdf")}
                disabled={downloading.pdf}
                data-testid={T.results.downloadPdf}
              >
                {downloading.pdf ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-1.5" />
                )}
                Baixar Laudo (PDF)
              </Button>
              <Button variant="ghost" onClick={onReset}>
                <RefreshCcw className="w-4 h-4 mr-1.5" /> Nova análise
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
