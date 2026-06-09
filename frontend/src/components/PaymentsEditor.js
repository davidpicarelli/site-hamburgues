import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Sparkles, FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { T } from "@/constants/testIds";
import { addMonthsISO, formatBRL, formatDate, todayISO } from "@/lib/format";

export default function PaymentsEditor({ payments, onChange, contract, impliedFirstDue }) {
  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [draft, setDraft] = useState({ payment_date: todayISO(), amount: "", note: "" });

  const sorted = useMemo(
    () => [...payments].sort((a, b) => a.payment_date.localeCompare(b.payment_date)),
    [payments]
  );

  const totalPaid = useMemo(
    () => sorted.reduce((s, p) => s + Number(p.amount || 0), 0),
    [sorted]
  );

  const openAdd = () => {
    setEditingIndex(null);
    setDraft({ payment_date: todayISO(), amount: "", note: "" });
    setOpen(true);
  };

  const openEdit = (i) => {
    const p = sorted[i];
    const orig = payments.findIndex(
      (x) => x.payment_date === p.payment_date && x.amount === p.amount && x.note === p.note
    );
    setEditingIndex(orig);
    setDraft({ payment_date: p.payment_date, amount: String(p.amount), note: p.note || "" });
    setOpen(true);
  };

  const remove = (i) => {
    const p = sorted[i];
    const orig = payments.findIndex(
      (x) => x.payment_date === p.payment_date && x.amount === p.amount && x.note === p.note
    );
    if (orig >= 0) {
      const next = [...payments];
      next.splice(orig, 1);
      onChange(next);
      toast("Pagamento removido.");
    }
  };

  const save = () => {
    if (!draft.payment_date) return toast.error("Informe a data.");
    if (!draft.amount || Number(draft.amount) < 0) return toast.error("Informe um valor válido.");
    const item = {
      payment_date: draft.payment_date,
      amount: Number(draft.amount),
      note: draft.note || "",
    };
    if (editingIndex === null) {
      onChange([...payments, item]);
      toast.success("Pagamento adicionado.");
    } else {
      const next = [...payments];
      next[editingIndex] = item;
      onChange(next);
      toast.success("Pagamento atualizado.");
    }
    setOpen(false);
  };

  const autoFill = () => {
    const term = Number(contract.term_months || 0);
    if (!term) return toast.error("Informe o prazo do contrato.");
    if (!contract.principal || !contract.start_date) return toast.error("Informe os dados do contrato.");
    const firstDue = contract.first_due_date || impliedFirstDue;
    if (!firstDue) return toast.error("Informe a data da 1ª parcela.");
    // estimate PMT for default fill
    const principal = Number(contract.principal) + Number(contract.iof || 0) + Number(contract.fees || 0) + Number(contract.insurance || 0);
    const i = contract.rateMode === "monthly"
      ? Number(contract.monthly_rate || 0) / 100
      : Math.pow(1 + Number(contract.annual_rate || 0) / 100, 1/12) - 1;
    let pmt;
    if (i > 0) {
      pmt = (principal * i) / (1 - Math.pow(1 + i, -term));
    } else {
      pmt = principal / term;
    }
    pmt = Math.round(pmt * 100) / 100;
    const list = [];
    for (let k = 1; k <= term; k++) {
      list.push({
        payment_date: addMonthsISO(firstDue, k - 1),
        amount: pmt,
        note: `Parcela ${k} (Price PMT estimada)`,
      });
    }
    onChange(list);
    toast.success(`${term} pagamentos gerados (parcelas pontuais).`);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
        <div>
          <h3 className="font-serif-display text-lg text-[hsl(var(--primary))]">
            Pagamentos efetivamente realizados
          </h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Adicione cada pagamento (data e valor) conforme efetivamente realizado pelo devedor.
            Inclua atrasos, parciais ou pagamentos a maior. Caso não haja histórico, use{" "}
            <em>Gerar parcelas pontuais</em> para simular o cumprimento integral do contrato.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={autoFill} data-testid={T.payments.autoFillBtn}>
            <Sparkles className="w-4 h-4 mr-1.5" /> Gerar parcelas pontuais
          </Button>
          {payments.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => onChange([])} data-testid={T.payments.clearBtn}>
              <FileX className="w-4 h-4 mr-1.5" /> Limpar
            </Button>
          )}
          <Button
            size="sm"
            className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[#0A1730]"
            onClick={openAdd}
            data-testid={T.payments.addBtn}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Adicionar pagamento
          </Button>
        </div>
      </div>

      {payments.length === 0 ? (
        <Card className="border-dashed border-[hsl(var(--border))] bg-[hsl(var(--secondary))]">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Nenhum pagamento adicionado ainda.
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
              Use os botões acima para adicionar pagamentos individualmente ou gerar parcelas pontuais.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <ScrollArea className="max-h-[420px]">
            <Table className="fz-table">
              <TableHeader className="sticky top-0 bg-[hsl(var(--secondary))]">
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Valor (R$)</TableHead>
                  <TableHead>Observação</TableHead>
                  <TableHead className="text-right w-32">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((p, i) => (
                  <TableRow key={i} className="hover:bg-slate-50 odd:bg-white even:bg-[#FBFCFE]">
                    <TableCell className="text-center text-xs text-[hsl(var(--muted-foreground))]">
                      {i + 1}
                    </TableCell>
                    <TableCell>{formatDate(p.payment_date)}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatBRL(Number(p.amount))}
                    </TableCell>
                    <TableCell className="text-xs text-[hsl(var(--muted-foreground))] max-w-md truncate">
                      {p.note || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(i)}
                          data-testid={T.payments.editBtn(i)}
                          aria-label="Editar pagamento"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#B42318] hover:text-[#7A271A] hover:bg-[#FEE4E2]"
                          onClick={() => remove(i)}
                          data-testid={T.payments.deleteBtn(i)}
                          aria-label="Excluir pagamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          <div className="px-4 py-3 border-t border-[hsl(var(--border))] flex items-center justify-between bg-[hsl(var(--secondary))]">
            <Badge variant="outline" className="bg-white">
              {sorted.length} {sorted.length === 1 ? "pagamento" : "pagamentos"}
            </Badge>
            <p className="text-sm font-medium tabular-nums">
              Total pago: <span className="text-[hsl(var(--primary))]">{formatBRL(totalPaid)}</span>
            </p>
          </div>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIndex === null ? "Adicionar pagamento" : "Editar pagamento"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="pay-date">Data do pagamento</Label>
              <Input
                id="pay-date"
                type="date"
                value={draft.payment_date}
                onChange={(e) => setDraft({ ...draft, payment_date: e.target.value })}
                data-testid={T.payments.dateInput}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pay-amount">Valor (R$)</Label>
              <Input
                id="pay-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 1820.50"
                value={draft.amount}
                onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                data-testid={T.payments.amountInput}
                className="tabular-nums"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pay-note">Observação (opcional)</Label>
              <Textarea
                id="pay-note"
                rows={2}
                placeholder="Ex: pagamento parcial, atraso, renegociação…"
                value={draft.note}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                data-testid={T.payments.noteInput}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              onClick={save}
              className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[#0A1730]"
              data-testid={T.payments.saveBtn}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
