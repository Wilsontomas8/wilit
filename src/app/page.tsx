import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardFooter } from "@/components/ui/card";
import { Field, Input, Label, Select, Hint, FieldError } from "@/components/ui/field";
import { SeatsBadge, SeatsMeter } from "@/components/seats-indicator";
import { ThemeToggle } from "@/components/theme-toggle";
import { computeSeats } from "@/lib/seats";
import { formatAOA, formatDate } from "@/lib/utils";

export const metadata = {
  title: "Catálogo de componentes",
  robots: { index: false },
};

const seatScenarios = [
  { label: "Turma com procura normal", counts: { capacity: 20, confirmed: 6, reserved: 3 } },
  { label: "Turma quase esgotada", counts: { capacity: 20, confirmed: 14, reserved: 4 } },
  { label: "Turma esgotada", counts: { capacity: 12, confirmed: 10, reserved: 2 } },
];

function Section({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex flex-col gap-5 border-t border-line-subtle pt-10">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-bold text-text-primary">{title}</h2>
        {note && <p className="max-w-[65ch] text-[0.9375rem] text-text-secondary">{note}</p>}
      </div>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-line-subtle bg-surface-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3.5">
          <div className="flex items-baseline gap-2.5">
            <span className="font-display text-lg font-bold tracking-tight text-brand-text">
              WIL IT
            </span>
            <span className="text-sm text-text-muted">Design System</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="accent">WP-A.02</Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 pb-24 pt-10">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
            Fundação visual do ecossistema
          </h1>
          <p className="max-w-[68ch] text-base text-text-secondary">
            Componentes e tokens da entrega prioritária — catálogo de cursos, vagas e
            pré-inscrições. Alterne o tema no canto superior direito: ambos os temas são
            definidos ao nível dos tokens, nenhuma cor está escrita fora de{" "}
            <code className="rounded bg-surface-sunken px-1.5 py-0.5 text-sm">globals.css</code>.
          </p>
        </div>

        <Section
          id="palette"
          title="Paleta institucional"
          note="Os três valores aprovados no SoW, com as escalas derivadas. Os neutros são enviesados para o azul da marca, para não lerem como cinzento genérico."
        >
          <div className="flex flex-col gap-4">
            {[
              { name: "Azul principal · #185FA5", steps: ["bg-brand-100", "bg-brand-300", "bg-brand-500", "bg-brand-700", "bg-brand-900"] },
              { name: "Laranja · #EF9F27", steps: ["bg-accent-100", "bg-accent-200", "bg-accent-400", "bg-accent-600", "bg-accent-800"] },
              { name: "Neutros", steps: ["bg-ink-100", "bg-ink-300", "bg-ink-500", "bg-ink-700", "bg-ink-950"] },
            ].map((row) => (
              <div key={row.name} className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-text-secondary">{row.name}</span>
                <div className="flex gap-1.5">
                  {row.steps.map((s) => (
                    <div
                      key={s}
                      className={`h-12 flex-1 rounded border border-line-subtle ${s}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="type" title="Tipografia" note="Archivo para títulos, Source Sans 3 para texto corrido.">
          <div className="flex flex-col gap-3">
            <p className="font-display text-4xl font-bold text-text-primary">
              Formação que se traduz em competência
            </p>
            <p className="font-display text-2xl font-semibold text-text-primary">
              Cursos, bootcamps e laboratórios
            </p>
            <p className="max-w-[65ch] text-base text-text-secondary">
              Texto corrido a 16 pixéis, com medida próxima de 65 caracteres. A WIL IT forma
              profissionais em redes, cibersegurança, sistemas e cloud, com turmas presenciais
              em Luanda e edições online.
            </p>
            <p className="text-sm text-text-muted">
              Texto secundário, para legendas e notas de rodapé.
            </p>
          </div>
        </Section>

        <Section id="buttons" title="Botões">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Pré-inscrever</Button>
            <Button variant="accent">
              Garantir vaga <ArrowRight />
            </Button>
            <Button variant="outline">Ver programa</Button>
            <Button variant="ghost">Cancelar</Button>
            <Button variant="link">Todos os cursos</Button>
            <Button variant="primary" disabled>
              Indisponível
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Pequeno</Button>
            <Button size="md">Médio</Button>
            <Button size="lg">Grande</Button>
          </div>
        </Section>

        <Section
          id="seats"
          title="Indicador de vagas"
          note="Implementa a regra da secção A.4: disponíveis = capacidade − confirmadas − reservadas. O laranja é reservado ao estado de urgência real, não a decoração."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {seatScenarios.map((s) => {
              const seats = computeSeats(s.counts);
              return (
                <Card key={s.label}>
                  <CardBody className="flex flex-col gap-4">
                    <span className="text-sm font-semibold text-text-secondary">{s.label}</span>
                    <SeatsBadge seats={seats} />
                    <SeatsMeter seats={seats} />
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </Section>

        <Section
          id="course-card"
          title="Cartão de curso"
          note="Composição real com dados de exemplo. Os valores são fictícios e servem apenas de demonstração."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "CCNA — Fundamentos de Redes Cisco",
                area: "Redes",
                level: "Iniciante",
                mode: "Presencial · Luanda",
                start: "2026-10-13",
                price: 185000,
                counts: { capacity: 20, confirmed: 9, reserved: 2 },
              },
              {
                title: "Segurança Ofensiva — Bootcamp Intensivo",
                area: "Cibersegurança",
                level: "Avançado",
                mode: "Híbrido",
                start: "2026-11-03",
                price: 340000,
                counts: { capacity: 15, confirmed: 12, reserved: 2 },
              },
            ].map((c) => {
              const seats = computeSeats(c.counts);
              return (
                <Card key={c.title} interactive className="flex flex-col">
                  <CardBody className="flex flex-1 flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="brand">{c.area}</Badge>
                      <Badge tone="outline">{c.level}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary">{c.title}</h3>
                    <dl className="flex flex-col gap-1.5 text-sm text-text-secondary">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
                        <dd className="tnum">Início a {formatDate(c.start)}</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
                        <dd>{c.mode}</dd>
                      </div>
                    </dl>
                    <div className="mt-auto pt-1">
                      <SeatsBadge seats={seats} />
                    </div>
                  </CardBody>
                  <CardFooter className="justify-between">
                    <span className="font-display text-lg font-bold text-text-primary tnum">
                      {formatAOA(c.price)}
                    </span>
                    <Button size="sm">
                      Pré-inscrever <ArrowRight />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </Section>

        <Section
          id="forms"
          title="Campos de formulário"
          note="Base do formulário de pré-inscrição. Os campos fiscais serão fixados no WP-A.01, depois de confirmada a lista exacta que o Cegid exige."
        >
          <Card className="max-w-xl">
            <CardBody className="flex flex-col gap-4">
              <Field>
                <Label htmlFor="ds-name" required>
                  Nome completo
                </Label>
                <Input id="ds-name" placeholder="Como consta no bilhete de identidade" />
              </Field>
              <Field>
                <Label htmlFor="ds-nif" required>
                  NIF
                </Label>
                <Input id="ds-nif" inputMode="numeric" placeholder="Número de identificação fiscal" />
                <Hint>Necessário para a emissão da factura.</Hint>
              </Field>
              <Field>
                <Label htmlFor="ds-course" required>
                  Curso pretendido
                </Label>
                <Select id="ds-course" defaultValue="">
                  <option value="" disabled>
                    Seleccione um curso
                  </option>
                  <option>CCNA — Fundamentos de Redes Cisco</option>
                  <option>Segurança Ofensiva — Bootcamp Intensivo</option>
                </Select>
              </Field>
              <Field>
                <Label htmlFor="ds-email" required>
                  Email
                </Label>
                <Input id="ds-email" type="email" aria-invalid defaultValue="wilson@" />
                <FieldError>Introduza um endereço de email completo.</FieldError>
              </Field>
            </CardBody>
            <CardFooter className="justify-end">
              <Button variant="outline">Limpar</Button>
              <Button>Submeter pré-inscrição</Button>
            </CardFooter>
          </Card>
        </Section>

        <Section id="badges" title="Estados">
          <div className="flex flex-wrap gap-2">
            <Badge tone="neutral">Rascunho</Badge>
            <Badge tone="brand">Publicado</Badge>
            <Badge tone="ok">Confirmada</Badge>
            <Badge tone="warn">Aguarda pagamento</Badge>
            <Badge tone="crit">Expirada</Badge>
            <Badge tone="accent">Últimas vagas</Badge>
            <Badge tone="outline">Arquivado</Badge>
          </div>
        </Section>
      </main>
    </div>
  );
}
