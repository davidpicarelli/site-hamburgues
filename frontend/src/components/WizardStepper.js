import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { T } from "@/constants/testIds";

export default function WizardStepper({ steps, current }) {
  return (
    <nav aria-label="Etapas do recálculo pericial" className="w-full">
      <ol className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-1">
        {steps.map((label, i) => {
          const status = i < current ? "done" : i === current ? "active" : "upcoming";
          const styles =
            status === "done"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : status === "active"
              ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] border-[#E6D7A8]"
              : "bg-slate-50 text-slate-600 border-slate-200";
          return (
            <li key={label} className="flex items-center gap-2 md:gap-3 shrink-0" data-testid={T.wizard.stepBadge(i)}>
              <Badge variant="outline" className={`gap-1.5 px-2.5 py-1 ${styles}`}>
                {status === "done" ? <Check className="w-3.5 h-3.5" /> : <span className="text-xs font-semibold">{i + 1}</span>}
                <span className="text-xs font-medium">{label}</span>
              </Badge>
              {i < steps.length - 1 && (
                <div className="h-px w-6 md:w-12 bg-[hsl(var(--border))] shrink-0" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
