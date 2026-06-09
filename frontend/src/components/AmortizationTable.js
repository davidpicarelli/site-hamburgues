import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatBRL, formatDate } from "@/lib/format";

export default function AmortizationTable({ rows, showObs = false, testid }) {
  if (!rows || !rows.length) {
    return (
      <p className="text-sm text-[hsl(var(--muted-foreground))] py-8 text-center">
        Sem linhas para exibir.
      </p>
    );
  }

  const totals = rows.reduce(
    (s, r) => ({
      interest: s.interest + r.interest,
      amortization: s.amortization + r.amortization,
      installment: s.installment + r.installment,
    }),
    { interest: 0, amortization: 0, installment: 0 }
  );

  return (
    <div data-testid={testid}>
      <ScrollArea className="h-[440px] rounded-lg border border-[hsl(var(--border))]">
        <Table className="fz-table">
          <TableHeader className="sticky top-0 bg-[hsl(var(--secondary))] z-10">
            <TableRow>
              <TableHead className="w-12 text-center">Nº</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-center w-16">Dias</TableHead>
              <TableHead className="text-right">Saldo Inicial</TableHead>
              <TableHead className="text-right">Juros</TableHead>
              <TableHead className="text-right">Amortização</TableHead>
              <TableHead className="text-right">Parcela</TableHead>
              <TableHead className="text-right">Saldo Final</TableHead>
              {showObs && <TableHead>Observação</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.n} className="hover:bg-slate-50 odd:bg-white even:bg-[#FBFCFE]">
                <TableCell className="text-center text-xs text-[hsl(var(--muted-foreground))]">
                  {r.n}
                </TableCell>
                <TableCell>{formatDate(r.due_date)}</TableCell>
                <TableCell className="text-center tabular-nums">{r.days}</TableCell>
                <TableCell className="text-right tabular-nums">{formatBRL(r.opening_balance)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatBRL(r.interest)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatBRL(r.amortization)}</TableCell>
                <TableCell className="text-right tabular-nums font-medium">{formatBRL(r.installment)}</TableCell>
                <TableCell className="text-right tabular-nums font-medium">{formatBRL(r.closing_balance)}</TableCell>
                {showObs && (
                  <TableCell className="text-xs text-[hsl(var(--muted-foreground))] max-w-xs">
                    {r.note || "—"}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <div className="px-4 py-3 bg-[hsl(var(--secondary))] border-t border-[hsl(var(--border))] rounded-b-lg mt-[-1px] grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Total Juros</p>
          <p className="font-semibold tabular-nums">{formatBRL(totals.interest)}</p>
        </div>
        <div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Total Amortizado</p>
          <p className="font-semibold tabular-nums">{formatBRL(totals.amortization)}</p>
        </div>
        <div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Total Pago</p>
          <p className="font-semibold tabular-nums">{formatBRL(totals.installment)}</p>
        </div>
        <div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Saldo Final</p>
          <p className="font-semibold tabular-nums">{formatBRL(rows[rows.length - 1].closing_balance)}</p>
        </div>
      </div>
    </div>
  );
}
