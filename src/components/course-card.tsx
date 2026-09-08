import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardFooter } from "@/components/ui/card";
import { SeatsBadge } from "@/components/seats-indicator";
import { computeSeats } from "@/lib/seats";
import { formatAOA, formatDateShort } from "@/lib/utils";
import { DADOS_PUBLICAVEIS } from "@/data/courses";
import {
  AREA_LABEL,
  LEVEL_LABEL,
  MODALITY_LABEL,
  type CourseWithEditions,
} from "@/contracts";

/** Próxima edição com inscrições abertas, pela data de início. */
export function proximaEdicao(course: CourseWithEditions) {
  return course.editions
    .filter((e) => e.status === "inscricoes_abertas")
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
}

/** Preço mais baixo entre os planos disponíveis de uma edição. */
export function precoDesde(course: CourseWithEditions): number | null {
  const precos = course.editions
    .filter((e) => e.status === "inscricoes_abertas")
    .flatMap((e) => e.prices.filter((p) => p.available).map((p) => p.priceAOA))
    .filter((v) => v > 0);
  return precos.length ? Math.min(...precos) : null;
}

export function CourseCard({ course }: { course: CourseWithEditions }) {
  const edicao = proximaEdicao(course);
  const desde = precoDesde(course);
  const seats = edicao
    ? computeSeats({
        capacity: edicao.capacity,
        confirmed: edicao.confirmedCount,
        reserved: edicao.reservedCount,
      })
    : null;

  return (
    <Card interactive className="relative flex flex-col">
      <CardBody className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{AREA_LABEL[course.area]}</Badge>
          <Badge tone="outline">{LEVEL_LABEL[course.level]}</Badge>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold leading-snug text-text-primary">
            <Link
              href={`/cursos/${course.slug}`}
              className="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {course.title}
            </Link>
          </h3>
          {course.certification && (
            <p className="text-sm text-text-muted">{course.certification}</p>
          )}
        </div>

        <p className="line-clamp-3 text-[0.9375rem] text-text-secondary">
          {course.summary}
        </p>

        <dl className="mt-1 flex flex-col gap-1.5 text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <Clock className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
            <dd className="tnum">{course.durationHours} horas</dd>
          </div>
          {edicao && (
            <>
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
                <dd className={DADOS_PUBLICAVEIS ? "tnum" : undefined}>
                  {DADOS_PUBLICAVEIS
                    ? `Início a ${formatDateShort(edicao.startDate)}`
                    : "Datas sob consulta"}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
                <dd>
                  {MODALITY_LABEL[edicao.modality]}
                  {DADOS_PUBLICAVEIS && edicao.location ? ` · ${edicao.location}` : ""}
                </dd>
              </div>
            </>
          )}
        </dl>

        {DADOS_PUBLICAVEIS && (
          <div className="mt-auto pt-2">
            {seats ? (
              <SeatsBadge seats={seats} />
            ) : (
              <Badge tone="neutral">Sem edições agendadas</Badge>
            )}
          </div>
        )}
      </CardBody>

      <CardFooter className="justify-between">
        <div className="flex flex-col">
          {!DADOS_PUBLICAVEIS ? (
            <span className="text-sm font-semibold text-text-secondary">
              Preço sob consulta
            </span>
          ) : desde !== null ? (
            <>
              <span className="text-xs text-text-muted">desde</span>
              <span className="font-display text-lg font-bold text-text-primary tnum">
                {formatAOA(desde)}
              </span>
            </>
          ) : (
            <span className="text-sm text-text-muted">Preço sob consulta</span>
          )}
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-text">
          Ver curso <ArrowRight className="size-4" aria-hidden="true" />
        </span>
      </CardFooter>
    </Card>
  );
}
