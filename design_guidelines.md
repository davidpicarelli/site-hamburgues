{
  "product": {
    "name": "Ferramenta Pericial de Recalculo de Contratos",
    "locale": "pt-BR",
    "brand_attributes": [
      "sério",
      "confiável",
      "forense/jurídico",
      "preciso",
      "alta densidade informacional",
      "pronto para anexar em processos"
    ],
    "north_star_action": "Gerar comparativo Hamburguês vs Price vs SAC + exportar Excel e PDF (laudo pericial)."
  },

  "visual_identity": {
    "style": {
      "direction": "Legal-tech moderno + dashboard analítico (light mode), com estética de laudo: superfícies sólidas, tipografia editorial nos títulos, dados em sans neutra.",
      "layout_principles": [
        "Hierarquia forte (títulos serifados, dados sans)",
        "Agrupamento por cartões e seções com separadores",
        "Progressive disclosure via Stepper",
        "Tabelas como elemento principal (sticky header, zebra sutil, alinhamento numérico)"
      ],
      "no_transparency_rule": "Não usar fundos transparentes. Cards e superfícies sempre com cores sólidas."
    },

    "color_system": {
      "notes": [
        "Light mode por padrão.",
        "Azul-marinho/slate como âncora (jurídico).",
        "Dourado quente apenas como acento (seleção/CTA), nunca para texto longo.",
        "Vermelho reservado para abusividade/anatocismo.",
        "Sem gradientes escuros/saturados; gradiente só decorativo e pequeno (<=20% viewport)."
      ],
      "palette_hex": {
        "bg": "#F7F6F2",
        "surface": "#FFFFFF",
        "surface_2": "#F1F3F6",
        "ink": "#0B1220",
        "muted_ink": "#475569",
        "border": "#D7DEE8",
        "primary_navy": "#0B1D3A",
        "primary_navy_hover": "#0A1730",
        "accent_gold": "#B08D2A",
        "accent_gold_soft": "#F3E7C6",
        "success_emerald": "#0F766E",
        "warning_amber": "#B45309",
        "danger_red": "#B42318",
        "danger_red_soft": "#FEE4E2",
        "info_blue": "#1D4ED8",
        "focus_ring": "#1D4ED8"
      },
      "semantic_tokens_css": {
        "instructions": "Atualizar /app/frontend/src/index.css em :root (HSL) para refletir a paleta. Manter tokens shadcn, mas trocar valores.",
        "css_variables": {
          "--background": "40 20% 96%",
          "--foreground": "222 47% 11%",
          "--card": "0 0% 100%",
          "--card-foreground": "222 47% 11%",
          "--popover": "0 0% 100%",
          "--popover-foreground": "222 47% 11%",
          "--primary": "215 67% 14%",
          "--primary-foreground": "0 0% 98%",
          "--secondary": "220 20% 95%",
          "--secondary-foreground": "215 67% 14%",
          "--muted": "220 18% 94%",
          "--muted-foreground": "215 16% 35%",
          "--accent": "43 55% 86%",
          "--accent-foreground": "215 67% 14%",
          "--destructive": "4 74% 42%",
          "--destructive-foreground": "0 0% 98%",
          "--border": "215 22% 86%",
          "--input": "215 22% 86%",
          "--ring": "221 83% 53%",
          "--radius": "0.75rem",
          "--chart-1": "215 67% 14%",
          "--chart-2": "173 58% 32%",
          "--chart-3": "28 85% 45%",
          "--chart-4": "43 74% 52%",
          "--chart-5": "4 74% 42%"
        }
      },
      "allowed_gradients": {
        "usage": [
          "Somente em fundos de seção (hero) e overlays decorativos",
          "Nunca em áreas de leitura/tabelas",
          "Nunca em elementos pequenos"
        ],
        "examples": [
          "hero_bg: linear-gradient(135deg, #F7F6F2 0%, #F1F3F6 55%, #F7F6F2 100%)",
          "accent_wash (decorativo): radial-gradient(closest-side, rgba(176,141,42,0.18), rgba(176,141,42,0))"
        ]
      }
    },

    "typography": {
      "font_pairing": {
        "headings_serif": {
          "name": "Spectral",
          "google_fonts": "https://fonts.google.com/specimen/Spectral",
          "usage": "Títulos (H1/H2), nomes de seções, cabeçalhos de laudo/relatório."
        },
        "body_sans": {
          "name": "IBM Plex Sans",
          "google_fonts": "https://fonts.google.com/specimen/IBM+Plex+Sans",
          "usage": "UI, formulários, textos auxiliares."
        },
        "numbers_mono_optional": {
          "name": "IBM Plex Mono",
          "google_fonts": "https://fonts.google.com/specimen/IBM+Plex+Mono",
          "usage": "Opcional para colunas numéricas densas (saldo, juros, amortização) e IDs/SGS."
        }
      },
      "implementation": {
        "instructions": [
          "Importar fontes via <link> no index.html ou via @import no index.css.",
          "Aplicar font-feature-settings para números tabulares quando possível.",
          "Usar Tailwind classes: font-serif para headings (mapear para Spectral), font-sans para corpo (IBM Plex Sans)."
        ],
        "css_snippet": ":root{--font-sans:'IBM Plex Sans', ui-sans-serif, system-ui; --font-serif:'Spectral', ui-serif, Georgia; --font-mono:'IBM Plex Mono', ui-monospace, SFMono-Regular;}\nbody{font-family:var(--font-sans);}\n.tabular-nums{font-variant-numeric: tabular-nums; font-feature-settings:'tnum' 1, 'lnum' 1;}"
      },
      "type_scale_tailwind": {
        "h1": "text-4xl sm:text-5xl lg:text-6xl font-serif tracking-tight",
        "h2": "text-base md:text-lg font-sans text-slate-600",
        "section_title": "text-lg md:text-xl font-serif text-slate-900",
        "kpi_value": "text-2xl md:text-3xl font-sans tabular-nums",
        "table": "text-sm tabular-nums",
        "helper": "text-xs text-slate-500"
      }
    },

    "spacing_and_layout": {
      "spacing_scale_px": {
        "2": 8,
        "3": 12,
        "4": 16,
        "6": 24,
        "8": 32,
        "10": 40,
        "12": 48,
        "16": 64
      },
      "grid": {
        "container": "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
        "page_structure": [
          "Topo: header fixo (compacto) com nome do projeto + status BACEN",
          "Hero curto (explica e CTA 'Iniciar cálculo')",
          "Stepper (4 etapas) em card grande",
          "Resultados: KPIs + Tabs + Chart + Downloads",
          "Rodapé com disclaimer"
        ],
        "responsive": {
          "mobile": "Single column; tabelas em ScrollArea horizontal; KPIs em 2 colunas",
          "desktop": "KPIs em 4 colunas; resultados em 2 colunas (tabela + painel de premissas/alertas)"
        }
      },
      "elevation": {
        "card_shadow": "shadow-[0_1px_0_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.06)]",
        "focus_ring": "focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
      },
      "radius": {
        "default": "rounded-xl",
        "inputs": "rounded-lg",
        "tables": "rounded-lg"
      }
    }
  },

  "component_patterns": {
    "component_path": {
      "shadcn_primary": "/app/frontend/src/components/ui",
      "use_components": [
        "button.jsx",
        "card.jsx",
        "tabs.jsx",
        "table.jsx",
        "input.jsx",
        "textarea.jsx",
        "select.jsx",
        "calendar.jsx",
        "popover.jsx",
        "dialog.jsx",
        "alert.jsx",
        "badge.jsx",
        "separator.jsx",
        "scroll-area.jsx",
        "skeleton.jsx",
        "sonner.jsx"
      ]
    },

    "header": {
      "layout": "Header compacto com borda inferior; à esquerda nome + subtítulo; à direita botões: 'Novo cálculo', 'Ajuda', toggle de tema (opcional).",
      "classes": "sticky top-0 z-40 bg-[hsl(var(--background))] border-b border-[hsl(var(--border))]",
      "data_testids": {
        "new_analysis": "header-new-analysis-button",
        "help": "header-help-button",
        "theme": "header-theme-toggle"
      }
    },

    "hero_intro": {
      "goal": "Explicar em 2-3 linhas o que a ferramenta faz e reforçar credibilidade (Método Hamburguês sem anatocismo + BACEN SGS).",
      "layout": "Seção curta (não landing longa). À esquerda texto; à direita mini-card com 'O que você recebe' (Excel + PDF).",
      "background": "Sólido (bg) com overlay decorativo radial dourado muito sutil (<=20% viewport).",
      "primary_cta": {
        "label": "Iniciar cálculo",
        "component": "Button",
        "variant": "default",
        "classes": "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[#0A1730]",
        "data-testid": "hero-start-button"
      }
    },

    "stepper_wizard": {
      "steps": [
        "Dados do Contrato",
        "Pagamentos Realizados",
        "Taxa BACEN",
        "Resultados"
      ],
      "pattern": "Stepper horizontal no desktop e vertical/compacto no mobile. Cada etapa é um Card com título serifado + descrição curta + formulário.",
      "implementation_note": "Se não houver componente Stepper pronto, criar componente local WizardStepper.js usando Button/Badge/Separator. Não usar HTML puro para selects/calendário.",
      "step_header_classes": "flex items-center gap-3",
      "step_badge": {
        "component": "Badge",
        "states": {
          "done": "bg-emerald-50 text-emerald-800 border border-emerald-200",
          "active": "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] border border-[#E6D7A8]",
          "upcoming": "bg-slate-50 text-slate-700 border border-slate-200"
        }
      },
      "navigation": {
        "back": {"data-testid": "wizard-back-button"},
        "next": {"data-testid": "wizard-next-button"},
        "calculate": {"data-testid": "wizard-calculate-button"}
      },
      "validation": {
        "pattern": "Erros inline abaixo do campo + Alert no topo do Card quando houver erros críticos.",
        "error_color": "danger_red",
        "data-testid": "wizard-validation-alert"
      }
    },

    "contract_form": {
      "fields": [
        "Valor financiado (R$)",
        "Data de contratação (dd/mm/aaaa)",
        "Prazo (meses)",
        "Taxa nominal do contrato (% a.m. ou % a.a.)",
        "Sistema do contrato (Price/SAC) (se informado)",
        "Tarifas/seguros (opcional)"
      ],
      "components": {
        "date": "Calendar + Popover",
        "numbers": "Input com máscara (se existir) + tabular-nums",
        "select": "Select"
      },
      "data_testids": {
        "principal": "contract-principal-input",
        "start_date": "contract-start-date-input",
        "term": "contract-term-input",
        "rate": "contract-rate-input",
        "system": "contract-system-select"
      }
    },

    "payments_table_editor": {
      "goal": "Adicionar/editar/excluir pagamentos reais (atrasos, parciais, inadimplência).",
      "components": ["Table", "Dialog", "Calendar", "Input", "Button", "ScrollArea"],
      "table_design": {
        "header": "Sticky + fundo surface_2",
        "row_hover": "hover:bg-slate-50",
        "zebra": "odd:bg-white even:bg-[#FBFCFE]",
        "numeric_alignment": "text-right tabular-nums",
        "empty_state": "Card com texto + botão 'Adicionar pagamento'"
      },
      "actions": {
        "add": {"data-testid": "payments-add-button"},
        "edit": {"data-testid": "payments-edit-button"},
        "delete": {"data-testid": "payments-delete-button"}
      },
      "dialog": {
        "title": "Pagamento",
        "fields": ["Data", "Valor (R$)", "Observação (opcional)"],
        "data_testids": {
          "date": "payment-date-input",
          "amount": "payment-amount-input",
          "note": "payment-note-textarea",
          "save": "payment-save-button"
        }
      }
    },

    "bacen_selector": {
      "goal": "Selecionar série SGS e buscar taxa média do período; permitir override manual.",
      "components": ["Select", "Input", "Button", "Alert", "Skeleton"],
      "loading_state": "Skeleton em cards + linha de status 'Consultando BACEN (SGS)...'",
      "success_state": "Badge 'Taxa BACEN carregada' + mostrar fonte (SGS série + período).",
      "error_state": "Alert destructive com ação 'Tentar novamente' e opção de inserir taxa manual.",
      "data_testids": {
        "series_select": "bacen-series-select",
        "fetch_button": "bacen-fetch-button",
        "manual_rate": "bacen-manual-rate-input",
        "status": "bacen-fetch-status"
      }
    },

    "results_dashboard": {
      "kpi_cards": {
        "layout": "Grid 2 colunas (mobile) / 4 colunas (desktop).",
        "card": {
          "component": "Card",
          "classes": "rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]",
          "header": "Título pequeno + tooltip (Tooltip) com definição jurídica/contábil.",
          "value": "Número grande tabular-nums",
          "delta": "Badge sutil (ex: vs BACEN)"
        },
        "kpis": [
          {
            "title": "Juros totais (Price)",
            "data-testid": "kpi-total-interest-price"
          },
          {
            "title": "Juros totais (Hamburguês)",
            "data-testid": "kpi-total-interest-hamburgues"
          },
          {
            "title": "Excesso cobrado (estimado)",
            "data-testid": "kpi-overcharge"
          },
          {
            "title": "Taxa efetiva vs BACEN",
            "data-testid": "kpi-rate-vs-bacen"
          }
        ],
        "semantic_coloring": {
          "overcharge_positive": "text-[color:var(--danger)] (usar token destructive) + badge danger_red_soft",
          "within_reference": "text-emerald-800 + badge emerald-50"
        }
      },

      "anatocism_indicator": {
        "pattern": "Badge + Alert contextual.",
        "badge": {
          "true": "bg-[#FEE4E2] text-[#7A271A] border border-[#FECDCA]",
          "false": "bg-emerald-50 text-emerald-800 border border-emerald-200"
        },
        "alert_copy": {
          "true": "Indícios de capitalização de juros (anatocismo) ao comparar Price vs Hamburguês.",
          "false": "Não foram identificados indícios de anatocismo pelos critérios selecionados."
        },
        "data-testid": "anatocism-indicator"
      },

      "tabs_tables": {
        "component": "Tabs",
        "tabs": ["Tabela Price", "SAC", "Método Hamburguês"],
        "table": {
          "component": "Table",
          "columns": [
            "Parcela",
            "Data",
            "Saldo inicial",
            "Juros",
            "Amortização",
            "Prestação",
            "Saldo final"
          ],
          "styling": {
            "header": "bg-[hsl(var(--secondary))] text-slate-800",
            "cell": "py-2",
            "numeric": "text-right tabular-nums",
            "sticky_header": "sticky top-0",
            "scroll": "ScrollArea h-[420px]"
          },
          "data-testid": "amortization-table"
        }
      },

      "comparison_chart": {
        "library": "recharts",
        "chart_type": "LineChart (saldo devedor ao longo do tempo)",
        "styling": {
          "grid": "stroke #E2E8F0, strokeDasharray '3 3'",
          "lines": {
            "hamburgues": {"stroke": "#0F766E", "strokeWidth": 2.5},
            "price": {"stroke": "#0B1D3A", "strokeWidth": 2.5},
            "sac": {"stroke": "#B08D2A", "strokeWidth": 2.5}
          },
          "dots": "dot={false} (reduz ruído)",
          "tooltip": "Tooltip com Card compacto; valores em R$ com tabular-nums",
          "legend": "Topo direito, labels curtas"
        },
        "data-testid": "balance-comparison-chart"
      },

      "assumptions_panel": {
        "pattern": "Card lateral (desktop) / Accordion (mobile) com premissas e convenções.",
        "items": [
          "Convenção de contagem de dias (pro-rata diária)",
          "Arredondamento (2 casas, regra)",
          "Sem capitalização (Hamburguês)",
          "Fonte BACEN (SGS série + período)",
          "Tratamento de pagamentos parciais/atrasos"
        ],
        "components": ["Card", "Accordion", "Separator"],
        "data-testid": "assumptions-panel"
      },

      "download_ctas": {
        "pattern": "Barra de ações fixa no final do card de resultados (desktop) e sticky bottom no mobile.",
        "buttons": [
          {
            "label": "Baixar Excel (.xlsx)",
            "variant": "default",
            "data-testid": "download-excel-button"
          },
          {
            "label": "Baixar Laudo (PDF)",
            "variant": "secondary",
            "data-testid": "download-pdf-button"
          }
        ],
        "microcopy": "Inclui memória de cálculo parcela a parcela e laudo formatado para anexação.",
        "disabled_state": "Enquanto calculando/gerando arquivo: mostrar spinner + texto 'Gerando…'"
      }
    },

    "toasts_and_feedback": {
      "library": "sonner",
      "use_cases": [
        "BACEN carregado com sucesso",
        "Pagamento adicionado/removido",
        "Excel/PDF gerado",
        "Erro de validação não bloqueante"
      ],
      "data_testids": {
        "toast_region": "toast-region"
      }
    }
  },

  "motion_and_microinteractions": {
    "principles": [
      "Movimento discreto e funcional (jurídico).",
      "Nada de bounce exagerado.",
      "Preferir transições curtas e específicas (não usar transition-all)."
    ],
    "durations": {
      "fast": "150ms",
      "base": "200ms",
      "slow": "280ms"
    },
    "interactions": {
      "buttons": "hover: leve escurecimento; active: scale-[0.98]; focus-visible ring forte",
      "table_rows": "hover:bg-slate-50; selected:bg-[hsl(var(--accent))]",
      "step_change": "animar entrada do conteúdo com fade+slide (Framer Motion opcional)"
    },
    "optional_library": {
      "name": "framer-motion",
      "install": "npm i framer-motion",
      "usage": "Animar transição entre etapas e entrada de KPIs (opacity/y)."
    }
  },

  "accessibility": {
    "requirements": [
      "WCAG AA: contraste forte em texto e números.",
      "Focus visível em todos os controles.",
      "Tabelas com cabeçalhos claros e alinhamento numérico.",
      "Não depender apenas de cor para indicar abusividade/anatocismo (usar Badge + texto).",
      "Preferir labels explícitos (Label) e helper text."
    ],
    "keyboard": [
      "Stepper navegável por teclado",
      "Dialogs com foco preso (AlertDialog/Dialog shadcn)",
      "Atalhos opcionais: Ctrl+Enter para calcular (documentar)"
    ]
  },

  "data_density_rules": {
    "tables": [
      "Usar tabular-nums e alinhamento à direita para valores monetários",
      "Cabeçalho sticky",
      "ScrollArea vertical para tabelas longas",
      "Zebra sutil + separadores finos",
      "Mostrar totais no rodapé (se aplicável) com fundo surface_2"
    ],
    "formatting": {
      "currency": "R$ 1.234,56",
      "date": "dd/mm/aaaa",
      "percent": "12,34%"
    }
  },

  "image_urls": [
    {
      "category": "hero_background_optional",
      "description": "Imagem institucional discreta (usar com overlay branco sólido 85-90% para não competir com texto).",
      "url": "https://images.unsplash.com/photo-1720650154225-ab0dbdf78d2c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwyfHxicmF6aWwlMjBjb3VydGhvdXNlJTIwYnVpbGRpbmclMjBleHRlcmlvcnxlbnwwfHx8fDE3ODA5NzMwODd8MA&ixlib=rb-4.1.0&q=85"
    },
    {
      "category": "hero_supporting_image_optional",
      "description": "Imagem de documentos/cálculo (boa para card lateral 'Excel + PDF').",
      "url": "https://images.unsplash.com/photo-1625225233840-695456021cde?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwyfHxjbG9zZSUyMHVwJTIwcGFwZXIlMjBkb2N1bWVudHMlMjBkZXNrJTIwY2FsY3VsYXRvciUyMHBlbnxlbnwwfHx8fDE3ODA5NzMwOTJ8MA&ixlib=rb-4.1.0&q=85"
    },
    {
      "category": "empty_state_optional",
      "description": "Imagem neutra para estados vazios (pagamentos ainda não inseridos).",
      "url": "https://images.unsplash.com/photo-1648201637025-1c77b9be3013?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxjbG9zZSUyMHVwJTIwcGFwZXIlMjBkb2N1bWVudHMlMjBkZXNrJTIwY2FsY3VsYXRvciUyMHBlbnxlbnwwfHx8fDE3ODA5NzMwOTJ8MA&ixlib=rb-4.1.0&q=85"
    }
  ],

  "do_dont": {
    "do": [
      "Usar linguagem objetiva e jurídica (pt-BR).",
      "Priorizar legibilidade de tabelas (tabular-nums, alinhamento, zebra sutil).",
      "Usar dourado apenas como acento (seleção/CTA).",
      "Mostrar premissas e fontes (BACEN SGS) sempre visíveis.",
      "Exibir indicadores de abusividade/anatocismo com Badge + texto explicativo.",
      "Adicionar data-testid em todos os elementos interativos e KPIs críticos."
    ],
    "dont": [
      "Não usar estética de fintech consumidor (gradientes chamativos, neon, ilustrações lúdicas).",
      "Não usar fundos transparentes/glass.",
      "Não usar roxo.",
      "Não usar gradientes escuros/saturados.",
      "Não esconder cálculos: sempre oferecer memória de cálculo e premissas.",
      "Não centralizar todo o layout (evitar leitura artificial)."
    ]
  },

  "instructions_to_main_agent": {
    "critical_fixes": [
      "Remover estilos default do CRA em /app/frontend/src/App.css (App-header dark/center).",
      "Atualizar tokens em /app/frontend/src/index.css para paleta navy/gold light.",
      "Garantir que o layout principal não use text-align:center.",
      "Usar apenas componentes shadcn em /src/components/ui para inputs/selects/calendar/tabs/table/dialog.",
      "Adicionar data-testid em: botões, inputs, selects, tabs triggers, linhas de ação (editar/excluir), KPIs e mensagens de erro.",
      "Implementar tabelas com ScrollArea e sticky header para densidade informacional."
    ],
    "suggested_structure": {
      "pages": "SPA com seções: Header, Hero curto, Wizard (Card), Resultados (KPIs + Tabs + Chart + Downloads), Footer.",
      "state": "Manter estado do wizard em um store simples (useState/useReducer).",
      "exports": "Botões de download devem refletir estado (disabled + loading)."
    }
  },

  "appendix_general_ui_ux_design_guidelines": "<General UI UX Design Guidelines>  \n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
