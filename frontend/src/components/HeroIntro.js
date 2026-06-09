import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, FileSpreadsheet, FileText, ArrowRight } from "lucide-react";
import { T } from "@/constants/testIds";

export default function HeroIntro({ onStart }) {
  return (
    <section className="hero-accent border-b border-[hsl(var(--border))]" id="metodologia">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 grid md:grid-cols-5 gap-8 items-center">
        <div className="md:col-span-3">
          <p className="text-xs uppercase tracking-widest text-[hsl(var(--primary))] font-semibold mb-3">
            Ferramenta pericial — versão 1
          </p>
          <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl font-bold text-[hsl(var(--primary))] leading-tight">
            Recalcule contratos pelo<br />
            <span className="text-[#B08D2A]">Método Hamburguês</span>
          </h2>
          <p className="mt-5 text-base md:text-lg text-[hsl(var(--muted-foreground))] max-w-2xl">
            Construa o recálculo de empréstimos, financiamentos veiculares e crédito pessoal pelo método de juros
            simples sobre saldo devedor (sem anatocismo), confrontando com a Tabela Price e o SAC, e indicadores
            de abusividade comparados à média BACEN.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={onStart}
              className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[#0A1730]"
              data-testid={T.hero.startBtn}
            >
              Iniciar cálculo <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
              <ShieldCheck className="w-4 h-4 text-[hsl(var(--primary))]" />
              Cálculos auditáveis · memória de cálculo parcela a parcela
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <Card className="border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-widest text-[hsl(var(--muted-foreground))] font-semibold mb-3">
                O que você recebe
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#F1F3F6] flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5 text-[hsl(var(--primary))]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[hsl(var(--foreground))]">Planilha Excel (.xlsx)</p>
                    <p className="text-[hsl(var(--muted-foreground))]">
                      Tabelas Price, SAC e Hamburguês com memória parcela a parcela, BACEN e comparativo.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#F3E7C6] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#B08D2A]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[hsl(var(--foreground))]">Laudo pericial (PDF)</p>
                    <p className="text-[hsl(var(--muted-foreground))]">
                      Documento formatado com metodologia, indicadores e conclusão — pronto para anexar.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
