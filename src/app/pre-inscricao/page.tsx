import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PreEnrollmentForm } from "@/components/pre-enrollment-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { SeatsMeter } from "@/components/seats-indicator";
import { computeSeats } from "@/lib/seats";
import { formatDate } from "@/lib/utils";
import { COURSES, SEED_DATA } from "@/data/courses";
import { AREA_LABEL, MODALITY_LABEL } from "@/contracts";

export const metadata: Metadata = {
  title: "Pré-inscrição",
  description:
    "Reserve o seu lugar numa turma da Academia WIL IT. A pré-inscrição não obriga ao pagamento imediato.",
  robots: { index: false },
};

type SearchParams = Promise<{ [k: string]: string | string[] | undefined }>;

export default async function PreInscricaoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const edicaoId = Array.isArray(sp.edicao) ? sp.edicao[0] : sp.edicao;

  const course = COURSES.find((c) => c.editions.some((e) => e.id === edicaoId));
  const edition = course?.editions.find((e) => e.id === edicaoId);

  if (!course || !edition || edition.status !== "inscricoes_abertas") notFound();

  const seats = computeSeats({
    capacity: edition.capacity,
    confirmed: edition.confirmedCount,
    reserved: edition.reservedCount,
  });

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="border-b border-line-subtle bg-surface-card">
          <div className="mx-auto max-w-6xl px-5 py-10">
            <Link
              href={`/cursos/${course.slug}`}
              className="text-sm font-medium text-brand-text underline underline-offset-4"
            >
              ← Voltar ao curso
            </Link>
            <h1 className="mt-4 max-w-[26ch] text-3xl font-bold text-text-primary sm:text-4xl">
              {seats.status === "full"
                ? "Entrar na lista de espera"
                : "Reservar o seu lugar"}
            </h1>
            <p className="mt-3 max-w-[62ch] text-lg text-text-secondary">
              {seats.status === "full" ? (
                <>
                  Esta turma está cheia. Deixe os seus dados e contactamos assim
                  que houver uma desistência ou abrir nova edição.
                </>
              ) : (
                <>
                  A pré-inscrição reserva o seu lugar. Só depois emitimos a
                  factura — <strong>não paga nada agora</strong>.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-5 py-10">
          {SEED_DATA && (
            <div className="mb-8 rounded-[--radius-card] border border-accent-solid/40 bg-accent-soft px-4 py-3">
              <p className="text-sm text-text-primary">
                <strong>Ambiente de demonstração.</strong> Este formulário valida
                os dados mas ainda não os regista. Nenhuma inscrição submetida
                aqui chega à WIL IT.
              </p>
            </div>
          )}

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
            <PreEnrollmentForm course={course} edition={edition} />

            <aside className="order-first flex flex-col gap-4 lg:order-last lg:sticky lg:top-24 lg:self-start">
              <Card>
                <CardBody className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Badge tone="brand">{AREA_LABEL[course.area]}</Badge>
                    <h2 className="font-semibold leading-snug text-text-primary">
                      {course.title}
                    </h2>
                    {course.certification && (
                      <p className="text-sm text-text-muted">
                        {course.certification}
                      </p>
                    )}
                  </div>

                  <dl className="flex flex-col gap-2 border-t border-line-subtle pt-4 text-sm text-text-secondary">
                    <div className="flex items-start gap-2">
                      <CalendarDays className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden="true" />
                      <dd className="tnum">
                        {formatDate(edition.startDate)} a {formatDate(edition.endDate)}
                      </dd>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden="true" />
                      <dd>{edition.schedule}</dd>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden="true" />
                      <dd>
                        {MODALITY_LABEL[edition.modality]}
                        {edition.location ? ` · ${edition.location}` : ""}
                      </dd>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden="true" />
                      <dd className="tnum">{course.durationHours} horas</dd>
                    </div>
                  </dl>

                  <div className="border-t border-line-subtle pt-4">
                    <SeatsMeter seats={seats} />
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="flex flex-col gap-3">
                  <h2 className="text-sm font-semibold text-text-primary">
                    O que acontece a seguir
                  </h2>
                  <ol className="flex flex-col gap-2.5">
                    {[
                      "Recebe um email a confirmar que a pré-inscrição chegou.",
                      "A WIL IT emite a factura e envia-lha por email.",
                      "Confirmado o pagamento, a vaga fica garantida.",
                      "Recebe a confirmação com os detalhes da turma.",
                    ].map((t, i) => (
                      <li key={t} className="flex gap-2.5 text-sm text-text-secondary">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-text tnum">
                          {i + 1}
                        </span>
                        {t}
                      </li>
                    ))}
                  </ol>
                </CardBody>
              </Card>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
