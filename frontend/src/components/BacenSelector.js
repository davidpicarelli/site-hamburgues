import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Download, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { T } from "@/constants/testIds";
import { listBacenSeries, fetchBacen } from "@/lib/api";
import { addMonthsISO, formatDate } from "@/lib/format";

export default function BacenSelector({ value, onChange, contract }) {
  const [seriesList, setSeriesList] = useState([]);
  const [mode, setMode] = useState(value?.mode || "auto");
  const [seriesCode, setSeriesCode] = useState(value?.series_code || 25471);
  const [startDate, setStartDate] = useState(value?.start_date || contract.start_date || "");
  const [endDate, setEndDate] = useState(
    value?.end_date || (contract.start_date ? addMonthsISO(contract.start_date, Number(contract.term_months || 12)) : "")
  );
  const [manualRate, setManualRate] = useState(value?.manual_rate || "");
  const [fetching, setFetching] = useState(false);
  const [status, setStatus] = useState(null); // {kind:'ok'|'err', msg}

  useEffect(() => {
    listBacenSeries().then(setSeriesList).catch(() => setSeriesList([]));
  }, []);

  const currentSeries = useMemo(
    () => seriesList.find((s) => s.code === Number(seriesCode)),
    [seriesList, seriesCode]
  );

  const onFetch = async () => {
    if (!startDate || !endDate) return toast.error("Informe o período (início e fim).");
    setFetching(true);
    setStatus(null);
    try {
      const data = await fetchBacen(Number(seriesCode), startDate, endDate);
      if (!data.average) {
        setStatus({ kind: "err", msg: "Série sem pontos no período informado." });
        toast.error("BACEN: sem dados no período.");
      } else {
        const next = {
          mode: "auto",
          series_code: data.series_code,
          series_label: data.series_label,
          unit: data.unit,
          start_date: data.start_date,
          end_date: data.end_date,
          manual_rate: null,
          fetched_average: data.average,
          raw_points: data.points,
        };
        onChange(next);
        setStatus({ kind: "ok", msg: `Taxa média carregada: ${data.average.toFixed(4)} ${data.unit} — ${data.count} pontos.` });
        toast.success("Taxa média BACEN carregada.");
      }
    } catch (e) {
      setStatus({ kind: "err", msg: e?.response?.data?.detail || e.message });
      toast.error("Falha ao consultar BACEN. Tente novamente ou use o modo manual.");
    } finally {
      setFetching(false);
    }
  };

  const onModeChange = (m) => {
    setMode(m);
    setStatus(null);
    if (m === "manual") {
      const cs = currentSeries;
      onChange({
        mode: "manual",
        series_code: Number(seriesCode),
        series_label: cs?.label || `Série ${seriesCode}`,
        unit: cs?.unit || "",
        start_date: startDate,
        end_date: endDate,
        manual_rate: manualRate ? Number(manualRate) : null,
        fetched_average: null,
        raw_points: null,
      });
    }
  };

  const onManualRate = (v) => {
    setManualRate(v);
    const cs = currentSeries;
    onChange({
      mode: "manual",
      series_code: Number(seriesCode),
      series_label: cs?.label || `Série ${seriesCode}`,
      unit: cs?.unit || "",
      start_date: startDate,
      end_date: endDate,
      manual_rate: v ? Number(v) : null,
      fetched_average: null,
      raw_points: null,
    });
  };

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3">
        <h3 className="font-serif-display text-lg text-[hsl(var(--primary))] mb-4">
          Taxa média BACEN (referência de abusividade)
        </h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-5">
          Escolha a série do BACEN/SGS pertinente à modalidade do contrato e o período de análise.
          Você pode buscar automaticamente ou inserir a taxa média manualmente.
        </p>

        <Card className="border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <CardContent className="p-5 grid gap-5">
            <div>
              <Label className="text-sm font-medium">Modo</Label>
              <RadioGroup
                value={mode}
                onValueChange={onModeChange}
                className="grid sm:grid-cols-2 gap-3 mt-2"
              >
                <label className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer ${mode === "auto" ? "border-[hsl(var(--primary))] bg-[hsl(var(--accent))]" : "border-[hsl(var(--border))] bg-white"}`}>
                  <RadioGroupItem value="auto" id="mode-auto" data-testid={T.bacen.modeAuto} />
                  <div>
                    <p className="text-sm font-medium">Buscar automático (BACEN SGS)</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Consulta a API pública do Banco Central.</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer ${mode === "manual" ? "border-[hsl(var(--primary))] bg-[hsl(var(--accent))]" : "border-[hsl(var(--border))] bg-white"}`}>
                  <RadioGroupItem value="manual" id="mode-manual" data-testid={T.bacen.modeManual} />
                  <div>
                    <p className="text-sm font-medium">Informar manualmente</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Use quando já possuir a taxa de referência.</p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-1.5 sm:col-span-2">
                <Label>Série BACEN</Label>
                <Select value={String(seriesCode)} onValueChange={(v) => setSeriesCode(Number(v))}>
                  <SelectTrigger data-testid={T.bacen.seriesSelect}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {seriesList.map((s) => (
                      <SelectItem key={s.code} value={String(s.code)}>
                        {s.code} — {s.label} ({s.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="bacen-start">Início do período</Label>
                <Input
                  id="bacen-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  data-testid={T.bacen.startDate}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="bacen-end">Fim do período</Label>
                <Input
                  id="bacen-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  data-testid={T.bacen.endDate}
                />
              </div>
            </div>

            {mode === "auto" ? (
              <div className="flex items-center gap-3">
                <Button
                  onClick={onFetch}
                  disabled={fetching}
                  className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[#0A1730]"
                  data-testid={T.bacen.fetchBtn}
                >
                  {fetching ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Consultando BACEN…
                    </span>
                  ) : (
                    <span>Buscar taxa média</span>
                  )}
                </Button>
                <span
                  className="text-sm text-[hsl(var(--muted-foreground))]"
                  data-testid={T.bacen.status}
                >
                  {status?.kind === "ok" && (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" /> {status.msg}
                    </span>
                  )}
                  {status?.kind === "err" && (
                    <span className="inline-flex items-center gap-1.5 text-[#B42318]">
                      <AlertTriangle className="w-4 h-4" /> {status.msg}
                    </span>
                  )}
                </span>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="bacen-manual">
                    Taxa média (mesma unidade da série: {currentSeries?.unit || "—"})
                  </Label>
                  <Input
                    id="bacen-manual"
                    type="number"
                    step="0.0001"
                    min="0"
                    placeholder="Ex: 1.95"
                    value={manualRate}
                    onChange={(e) => onManualRate(e.target.value)}
                    data-testid={T.bacen.manualRate}
                    className="tabular-nums"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <aside className="lg:col-span-2">
        <Card className="border-[hsl(var(--border))] bg-[hsl(var(--secondary))]">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-widest text-[hsl(var(--primary))] font-semibold mb-3">
              Resumo da referência
            </p>
            {value?.series_label ? (
              <div className="space-y-2 text-sm">
                <div>
                  <Badge variant="outline" className="bg-white">{value.mode === "auto" ? "Automático" : "Manual"}</Badge>
                </div>
                <p><span className="text-[hsl(var(--muted-foreground))]">Série:</span> <strong>{value.series_code}</strong> — {value.series_label}</p>
                <p><span className="text-[hsl(var(--muted-foreground))]">Unidade:</span> {value.unit || "—"}</p>
                <p><span className="text-[hsl(var(--muted-foreground))]">Período:</span> {formatDate(value.start_date)} → {formatDate(value.end_date)}</p>
                <p><span className="text-[hsl(var(--muted-foreground))]">Taxa média:</span> <strong className="tabular-nums">{(value.fetched_average ?? value.manual_rate)?.toFixed(4) || "—"}</strong> {value.unit}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                  Selecione a série e busque ou informe a taxa manualmente.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
