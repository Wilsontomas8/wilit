# WIL IT — Ecossistema Digital

Implementação da entrega prioritária definida na Adenda A do SoW v2.1: catálogo de
cursos, vagas disponíveis e pré-inscrições.

## Estado

| Pacote | Descrição | Estado |
|---|---|---|
| WP-A.01 | Inventário, decisões e conta Oracle | Pendente — decisões D-11, D-13, D-14 |
| WP-A.02 | Base do projecto e design system | **Concluído** |
| WP-A.03 | Contratos de dados (Zod) | **Concluído** |
| WP-A.04 | Catálogo e página de curso | **Concluído** |
| WP-A.05 | Formulário de pré-inscrição | Por iniciar |

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** em modo estrito
- **Tailwind CSS 4** — tokens em `src/app/globals.css`
- **Zod** para contratos, **react-hook-form** para formulários
- **Lucide** para ícones, **next-themes** para tema claro/escuro
- **Playwright** para testes ponta a ponta

Sem Material UI, conforme o risco R2 do SoW v1.1 e o critério de aceitação do WP-A.02.

## Comandos

```bash
pnpm install
pnpm dev          # desenvolvimento em http://localhost:3000
pnpm build        # build de produção
pnpm start        # servir o build
npx tsc --noEmit  # verificação de tipos
```

## Decisões de implementação

**Tokens, nunca cores literais.** Toda a cor vive em `src/app/globals.css`, em duas
camadas: a escala da marca (`--color-brand-*`, `--color-accent-*`, `--color-ink-*`) e os
papéis semânticos (`--surface-*`, `--text-*`, `--line-*`). Os componentes usam apenas os
papéis. Mudar o tema é redefinir tokens, não reescrever componentes.

**Três estados de tema, não dois.** O `:root` define a paleta clara completa;
`prefers-color-scheme: dark` redefine os tokens sob `:root:not([data-theme="light"])`; e
`:root[data-theme="dark"]` redefine-os outra vez para o alternador manual ganhar nos dois
sentidos. Quem não escolheu tema vê o documento sem atributo, e só a media query o separa.

**Fontes auto-alojadas.** Archivo e Source Sans 3 vêm de `@fontsource`, não de
`next/font/google`. Duas razões: o build deixa de depender de rede externa, e nenhum
pedido do visitante chega ao Google — o que interessa para a política de privacidade
exigida no WP-A.11.

**O cálculo de vagas é código partilhado.** `src/lib/seats.ts` implementa a regra da
secção A.4 do SoW — `disponíveis = capacidade − confirmadas − reservadas` — e será a mesma
função usada pelo servidor no WP-A.08. O número mostrado publicamente tem de corresponder
sempre a este cálculo; havendo duas implementações, mais cedo ou mais tarde divergem.

**Laranja só para urgência real.** O `#EF9F27` assinala últimas vagas e chamadas para
acção, não decoração. O estado "esgotado" é neutro, não vermelho: não é um erro, é uma
turma cheia com lista de espera aberta.

## Estrutura

```
src/
  app/
    globals.css          # tokens e tema — única fonte de cor
    layout.tsx           # fontes, metadados, provider de tema
    page.tsx             # catálogo de componentes (temporário)
  components/
    ui/                  # primitivas: button, badge, card, field
    seats-indicator.tsx  # componente de domínio: vagas
    theme-provider.tsx
    theme-toggle.tsx
  lib/
    seats.ts             # regra de negócio das vagas
    utils.ts             # cn, formatação AOA e datas em pt-AO
```

## Por decidir antes do WP-A.05

O formulário de pré-inscrição não fica fechado sem estas três respostas:

- **D-11** — quantos dias úteis dura a reserva da vaga, antes e depois da emissão da factura
- **D-13** — a lista exacta de campos que o Cegid exige para facturar a particular e a empresa
- **D-14** — mostrar o preço no catálogo ou indicar "sob consulta"
