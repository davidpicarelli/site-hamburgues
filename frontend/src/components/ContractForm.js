import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import { T } from "@/constants/testIds";
import { formatDate } from "@/lib/format";

function Field({ label, hint, children, htmlFor }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium text-[hsl(var(--foreground))]">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-[hsl(var(--muted-foreground))]">{hint}</p>}
    </div>
  );
}

export default function ContractForm({ value, onChange, impliedFirstDue }) {
  const set = (key, v) => onChange({ ...value, [key]: v });

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h3 className="font-serif-display text-lg text-[hsl(var(--primary))] mb-4">
          Dados básicos do contrato
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Valor financiado (R$)" hint="Valor liberado ao tomador (antes de IOF/tarifas/seguros embutidos)" htmlFor="principal">
            <Input
              id="principal"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 50000"
              value={value.principal}
              onChange={(e) => set("principal", e.target.value)}
              data-testid={T.contract.principal}
              className="tabular-nums"
            />
          </Field>
          <Field label="Prazo (meses)" htmlFor="term">
            <Input
              id="term"
              type="number"
              min="1"
              max="600"
              placeholder="Ex: 36"
              value={value.term_months}
              onChange={(e) => set("term_months", e.target.value)}
              data-testid={T.contract.term}
              className="tabular-nums"
            />
          </Field>
          <Field label="Modo da taxa contratada">
            <Select value={value.rateMode} onValueChange={(v) => set("rateMode", v)}>
              <SelectTrigger data-testid={T.contract.rateMode}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensal (% a.m.)</SelectItem>
                <SelectItem value="annual">Anual (% a.a.)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {value.rateMode === "monthly" ? (
            <Field label="Taxa mensal contratada (%)" hint="Ex.: 2 para 2% a.m." htmlFor="rate-m">
              <Input
                id="rate-m"
                type="number"
                step="0.0001"
                min="0"
                placeholder="Ex: 2.50"
                value={value.monthly_rate}
                onChange={(e) => set("monthly_rate", e.target.value)}
                data-testid={T.contract.rateMonthly}
                className="tabular-nums"
              />
            </Field>
          ) : (
            <Field label="Taxa anual contratada (%)" hint="Ex.: 24 para 24% a.a." htmlFor="rate-a">
              <Input
                id="rate-a"
                type="number"
                step="0.0001"
                min="0"
                placeholder="Ex: 24.00"
                value={value.annual_rate}
                onChange={(e) => set("annual_rate", e.target.value)}
                data-testid={T.contract.rateAnnual}
                className="tabular-nums"
              />
            </Field>
          )}
          <Field label="Data de início do contrato" htmlFor="start-date">
            <Input
              id="start-date"
              type="date"
              value={value.start_date}
              onChange={(e) => set("start_date", e.target.value)}
              data-testid={T.contract.startDate}
            />
          </Field>
          <Field
            label="Data da 1ª parcela (opcional)"
            hint={`Se em branco, será usada ${formatDate(impliedFirstDue) || "início + 1 mês"}`}
            htmlFor="first-due"
          >
            <Input
              id="first-due"
              type="date"
              value={value.first_due_date}
              onChange={(e) => set("first_due_date", e.target.value)}
              data-testid={T.contract.firstDueDate}
            />
          </Field>
          <Field label="Sistema do contrato (referência)">
            <Select value={value.original_system} onValueChange={(v) => set("original_system", v)}>
              <SelectTrigger data-testid={T.contract.system}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Tabela Price (parcela fixa)</SelectItem>
                <SelectItem value="sac">SAC (amortização constante)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Parcela contratada (R$) (opcional)" hint="Se preenchida, será exibida no laudo para referência" htmlFor="contracted">
            <Input
              id="contracted"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 1820.50"
              value={value.contracted_installment}
              onChange={(e) => set("contracted_installment", e.target.value)}
              data-testid={T.contract.contractedInstallment}
              className="tabular-nums"
            />
          </Field>
        </div>

        <h3 className="font-serif-display text-lg text-[hsl(var(--primary))] mt-8 mb-4">
          Custos embutidos (opcional)
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="IOF (R$)" htmlFor="iof">
            <Input
              id="iof"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 350.00"
              value={value.iof}
              onChange={(e) => set("iof", e.target.value)}
              data-testid={T.contract.iof}
              className="tabular-nums"
            />
          </Field>
          <Field label="Tarifas embutidas (R$)" htmlFor="fees">
            <Input
              id="fees"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 250.00"
              value={value.fees}
              onChange={(e) => set("fees", e.target.value)}
              data-testid={T.contract.fees}
              className="tabular-nums"
            />
          </Field>
          <Field label="Seguros embutidos (R$)" htmlFor="insurance">
            <Input
              id="insurance"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 800.00"
              value={value.insurance}
              onChange={(e) => set("insurance", e.target.value)}
              data-testid={T.contract.insurance}
              className="tabular-nums"
            />
          </Field>
        </div>

        <h3 className="font-serif-display text-lg text-[hsl(var(--primary))] mt-8 mb-4">
          Convenção de contagem de dias (Hamburguês)
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Convenção" hint="Padrão pericial: taxa diária = taxa mensal / 30.">
            <Select value={value.day_count} onValueChange={(v) => set("day_count", v)}>
              <SelectTrigger data-testid={T.contract.dayCount}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 dias (taxa diária = mensal / 30)</SelectItem>
                <SelectItem value="365">365 dias (taxa diária = anual / 365)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      <aside className="lg:col-span-1">
        <Card className="border-[hsl(var(--border))] bg-[hsl(var(--secondary))]">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[hsl(var(--primary))] mt-0.5" />
              <div>
                <p className="font-semibold text-[hsl(var(--primary))]">Boas práticas periciais</p>
                <ul className="text-sm mt-2 space-y-1.5 text-[hsl(var(--foreground))]">
                  <li>Informe a taxa <strong>contratual</strong> (não a CET).</li>
                  <li>IOF, tarifas e seguros embutidos somam-se ao saldo financiado bruto.</li>
                  <li>A 1ª parcela costuma vencer ~30 dias após a liberação.</li>
                  <li>Use a aba seguinte para registrar pagamentos efetivamente realizados.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
