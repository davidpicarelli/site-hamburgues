import { Scale, FilePlus2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { T } from "@/constants/testIds";

export default function AppHeader({ onNewAnalysis }) {
  return (
    <header className="sticky top-0 z-40 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[hsl(var(--primary))] text-white flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif-display text-lg font-semibold text-[hsl(var(--primary))] leading-none">
              Perícia Contábil — Recálculo Hamburguês
            </h1>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
              Tabela Price · SAC · Método Hamburguês · BACEN SGS
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onNewAnalysis}
            data-testid={T.header.newAnalysis}
          >
            <FilePlus2 className="w-4 h-4 mr-1.5" /> Nova análise
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            data-testid={T.header.help}
          >
            <a href="#metodologia" className="hidden sm:inline-flex">
              <HelpCircle className="w-4 h-4 mr-1.5" /> Metodologia
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
