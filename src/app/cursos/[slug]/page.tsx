import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Check, Clock, MapPin, Users } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/card";
import { SeatsMeter } from "@/components/seats-indicator";
import { computeSeats } from "@/lib/seats";
import { formatAOA, formatDate } from "@/lib/utils";
import { ContactoCTA } from "@/components/contacto-cta";
import {
  getCourseBySlug,
  getPublishedCourses,
  DADOS_PUBLICAVEIS,
} from "@/data/courses";
import {
  AREA_LABEL,
  FEATURE_LABEL,
  LEVEL_LABEL,
  MODALITY_LABEL,
  PLANS,
  type CourseEdition,
} from "@/contracts";

/** Next 16: params chega como Promise. */
type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getPublishedCourses().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return { title: "Curso não encontrado" };
  return {
    title: course.title,
    description: course.summary,
    openGraph: { title: course.title, description: course.summary },
  };
}

function EdicaoCard({ edicao }: { edicao: CourseEdition }) {
  const seats = computeSeats({
    capacity: edicao.capacity,
    confirmed: edicao.confirmedCount,
    reserved: edicao.reservedCount,
  });
  const planos = edicao.prices.filter((p) => p.available && p.priceAOA > 0);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{MODALITY_LABEL[edicao.modality]}</Badge>
          <span className="font-mono text-xs text-text-muted">{edicao.code}</span>
        </div>
        <dl className="flex flex-col gap-1.5 text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
            <dd className="tnum">
              {formatDate(edicao.startDate)} a {formatDate(edicao.endDate)}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
            <dd>{edicao.schedule}</dd>
          </div>
          {edicao.location && (
            <div className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
              <dd>{edicao.location}</dd>
            </div>
          )}
        </dl>
      </CardHeader>

      <CardBody className="flex flex-col gap-5">
        <SeatsMeter seats={seats} />

        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Planos disponíveis
          </h4>
          <ul className="flex flex-col divide-y divide-line-subtle">
            {planos.map((p) => {
              const plano = PLANS[p.plan];
              return (
                <li key={p.plan} className="flex items-baseline justify-between gap-4 py-2.5">
                  <div className="flex flex-col">
                    <span className="text-[0.9375rem] font-semibold text-text-primary">
                      {plano.name}
                    </span>
                    <span className="text-xs text-text-muted">{plano.tagline}</span>
                  </div>
                  <span className="shrink-0 font-display font-bold text-text-primary tnum">
                    {formatAOA(p.priceAOA)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </CardBody>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/pre-inscricao?edicao=${edicao.id}`}>
            {seats.status === "full" ? "Entrar em lista de espera" : "Pré-inscrever"}
            <ArrowRight />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default async function CursoPage({ params }: { params: Params }) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  const edicoes = course.editions
    .filter((e) => e.status === "inscricoes_abertas")
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="border-b border-line-subtle bg-surface-card">
          <div className="mx-auto max-w-6xl px-5 py-12">
            <Link
              href="/cursos"
              className="text-sm font-medium text-brand-text underline underline-offset-4"
            >
              ← Todos os cursos
            </Link>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Badge tone="brand">{AREA_LABEL[course.area]}</Badge>
              <Badge tone="outline">{LEVEL_LABEL[course.level]}</Badge>
              {course.certification && <Badge tone="accent">{course.certification}</Badge>}
            </div>
            <h1 className="mt-4 max-w-[24ch] text-3xl font-bold text-text-primary sm:text-4xl">
              {course.title}
            </h1>
            <p className="mt-4 max-w-[65ch] text-lg text-text-secondary">{course.summary}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-2">
                <Clock className="size-4 text-text-muted" aria-hidden="true" />
                <span className="tnum">{course.durationHours} horas de formação</span>
              </span>
              {DADOS_PUBLICAVEIS && (
                <span className="inline-flex items-center gap-2">
                  <Users className="size-4 text-text-muted" aria-hidden="true" />
                  {edicoes.length === 1
                    ? "1 edição aberta"
                    : `${edicoes.length} edições abertas`}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-5 py-10">
          {!DADOS_PUBLICAVEIS && (
            <div className="mb-8 rounded-[--radius-card] border border-line-strong bg-surface-sunken px-4 py-3">
              <p className="text-sm text-text-secondary">
                O programa abaixo é o oficial do exame. Para datas da próxima
                turma e valores, fale connosco — respondemos no mesmo dia.
              </p>
            </div>
          )}

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="flex flex-col gap-10">
              <section className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-text-primary">O que vai aprender</h2>
                <ul className="flex flex-col gap-2.5">
                  {course.objectives.map((o) => (
                    <li key={o} className="flex gap-3">
                      <Check className="mt-1 size-4 shrink-0 text-ok" aria-hidden="true" />
                      <span className="text-[0.9375rem] text-text-secondary">{o}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-text-primary">Programa</h2>
                <ol className="flex flex-col gap-3">
                  {course.syllabus.map((m, i) => (
                    <li
                      key={m.title}
                      className="rounded-[--radius-card] border border-line-subtle bg-surface-card p-5"
                    >
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-xs font-semibold text-accent-text tnum">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3 className="font-semibold text-text-primary">{m.title}</h3>
                      </div>
                      <ul className="mt-2.5 flex flex-wrap gap-x-2 gap-y-1.5 pl-8">
                        {m.topics.map((t) => (
                          <li
                            key={t}
                            className="rounded-full bg-surface-sunken px-2.5 py-0.5 text-xs text-text-secondary"
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              </section>

              <div className="grid gap-8 sm:grid-cols-2">
                <section className="flex flex-col gap-3">
                  <h2 className="text-lg font-bold text-text-primary">A quem se destina</h2>
                  <ul className="flex flex-col gap-2">
                    {course.targetAudience.map((t) => (
                      <li key={t} className="text-[0.9375rem] text-text-secondary">
                        · {t}
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="flex flex-col gap-3">
                  <h2 className="text-lg font-bold text-text-primary">Pré-requisitos</h2>
                  {course.prerequisites.length ? (
                    <ul className="flex flex-col gap-2">
                      {course.prerequisites.map((t) => (
                        <li key={t} className="text-[0.9375rem] text-text-secondary">
                          · {t}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[0.9375rem] text-text-secondary">
                      Não são exigidos pré-requisitos formais.
                    </p>
                  )}
                </section>
              </div>

              <section className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-text-primary">Planos de formação</h2>
                <p className="max-w-[62ch] text-[0.9375rem] text-text-secondary">
                  Todos os planos incluem a formação completa. O que muda é o
                  acompanhamento a seguir.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {Object.values(PLANS).map((p) => (
                    <Card key={p.code}>
                      <CardBody className="flex flex-col gap-2.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="font-display font-bold text-text-primary">{p.name}</h3>
                          {p.audience === "empresa" && <Badge tone="accent">Empresas</Badge>}
                        </div>
                        <p className="text-sm text-text-secondary">{p.description}</p>
                        <ul className="mt-1 flex flex-wrap gap-1.5">
                          {p.features.map((f) => (
                            <li
                              key={f}
                              className="rounded-full bg-surface-sunken px-2.5 py-0.5 text-xs text-text-secondary"
                            >
                              {FEATURE_LABEL[f]}
                            </li>
                          ))}
                        </ul>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </section>
            </div>

            <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
              <h2 className="text-xl font-bold text-text-primary">
                {DADOS_PUBLICAVEIS && edicoes.length ? "Próximas turmas" : "Inscrições"}
              </h2>
              {!DADOS_PUBLICAVEIS ? (
                <ContactoCTA assunto={course.title} />
              ) : edicoes.length ? (
                edicoes.map((e) => <EdicaoCard key={e.id} edicao={e} />)
              ) : (
                <Card>
                  <CardBody className="flex flex-col gap-3">
                    <p className="text-[0.9375rem] text-text-secondary">
                      Não há turmas agendadas de momento. Deixe o seu contacto e
                      avisamos quando abrir a próxima edição.
                    </p>
                    <Button asChild variant="outline">
                      <Link href="/#contacto">Falar connosco</Link>
                    </Button>
                  </CardBody>
                </Card>
              )}
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
