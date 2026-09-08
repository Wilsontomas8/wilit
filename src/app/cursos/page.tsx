import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CourseCard } from "@/components/course-card";
import { getPublishedCourses, DADOS_PUBLICAVEIS } from "@/data/courses";
import { cn } from "@/lib/utils";
import {
  AREA_LABEL,
  LEVEL_LABEL,
  MODALITY_LABEL,
  areaSchema,
  levelSchema,
  modalitySchema,
  type Area,
  type Level,
  type Modality,
} from "@/contracts";

export const metadata: Metadata = {
  title: "Formação e certificação",
  description:
    "Cursos e bootcamps em redes, cibersegurança e sistemas, com preparação para certificação Cisco, Fortinet, Check Point e CompTIA. Turmas presenciais em Luanda e edições online.",
};

/** Next 16: searchParams chega como Promise e tem de ser aguardado. */
type SearchParams = Promise<{ [k: string]: string | string[] | undefined }>;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

/** Constrói o href de um filtro preservando os restantes. */
function filterHref(
  current: Record<string, string | undefined>,
  key: string,
  value: string | undefined
) {
  const next = { ...current, [key]: value };
  const qs = new URLSearchParams(
    Object.entries(next).filter(([, v]) => Boolean(v)) as [string, string][]
  ).toString();
  return qs ? `/cursos?${qs}` : "/cursos";
}

function FilterRow<T extends string>({
  label,
  options,
  labels,
  paramKey,
  active,
  current,
}: {
  label: string;
  options: readonly T[];
  labels: Record<T, string>;
  paramKey: string;
  active: T | undefined;
  current: Record<string, string | undefined>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-full text-xs font-semibold uppercase tracking-wider text-text-muted sm:w-auto sm:pr-1">
        {label}
      </span>
      <Link
        href={filterHref(current, paramKey, undefined)}
        aria-current={!active ? "true" : undefined}
        className={cn(
          "rounded-full border px-3 py-1 text-sm transition-colors",
          !active
            ? "border-brand-solid bg-brand-soft font-semibold text-brand-text"
            : "border-line-strong text-text-secondary hover:bg-surface-sunken"
        )}
      >
        Todas
      </Link>
      {options.map((o) => (
        <Link
          key={o}
          href={filterHref(current, paramKey, o)}
          aria-current={active === o ? "true" : undefined}
          className={cn(
            "rounded-full border px-3 py-1 text-sm transition-colors",
            active === o
              ? "border-brand-solid bg-brand-soft font-semibold text-brand-text"
              : "border-line-strong text-text-secondary hover:bg-surface-sunken"
          )}
        >
          {labels[o]}
        </Link>
      ))}
    </div>
  );
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const area = areaSchema.safeParse(first(sp.area)).data;
  const level = levelSchema.safeParse(first(sp.nivel)).data;
  const modality = modalitySchema.safeParse(first(sp.modalidade)).data;

  const current = { area, nivel: level, modalidade: modality };

  let cursos = getPublishedCourses();
  if (area) cursos = cursos.filter((c) => c.area === area);
  if (level) cursos = cursos.filter((c) => c.level === level);
  if (modality)
    cursos = cursos.filter((c) =>
      c.editions.some(
        (e) => e.modality === modality && e.status === "inscricoes_abertas"
      )
    );

  const areasComCursos = [
    ...new Set(getPublishedCourses().map((c) => c.area)),
  ] as Area[];

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="border-b border-line-subtle bg-surface-card">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-12">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-text">
              Academia WIL IT
            </p>
            <h1 className="max-w-[20ch] text-3xl font-bold text-text-primary sm:text-4xl">
              Formação que leva à certificação
            </h1>
            <p className="max-w-[62ch] text-lg text-text-secondary">
              Cursos práticos em redes, cibersegurança e sistemas, alinhados com os
              exames oficiais da Cisco, Fortinet, Check Point e CompTIA. Turmas
              presenciais em Luanda e edições online.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-5 py-10">
          {!DADOS_PUBLICAVEIS && (
            <div className="mb-8 rounded-[--radius-card] border border-line-strong bg-surface-sunken px-4 py-3">
              <p className="text-sm text-text-secondary">
                Os programas são os oficiais de cada certificação. Para datas das
                próximas turmas e valores, fale connosco — respondemos no mesmo dia.
              </p>
            </div>
          )}

          <section aria-label="Filtros" className="flex flex-col gap-4">
            <FilterRow
              label="Área"
              options={areasComCursos}
              labels={AREA_LABEL}
              paramKey="area"
              active={area}
              current={current}
            />
            <FilterRow
              label="Nível"
              options={levelSchema.options as readonly Level[]}
              labels={LEVEL_LABEL}
              paramKey="nivel"
              active={level}
              current={current}
            />
            <FilterRow
              label="Modalidade"
              options={modalitySchema.options as readonly Modality[]}
              labels={MODALITY_LABEL}
              paramKey="modalidade"
              active={modality}
              current={current}
            />
          </section>

          <p className="mt-8 text-sm text-text-muted tnum" aria-live="polite">
            {cursos.length === 1
              ? "1 curso encontrado"
              : `${cursos.length} cursos encontrados`}
          </p>

          {cursos.length > 0 ? (
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cursos.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[--radius-card] border border-line-subtle bg-surface-card px-6 py-14 text-center">
              <p className="text-lg font-semibold text-text-primary">
                Nenhum curso corresponde a estes filtros
              </p>
              <p className="mx-auto mt-2 max-w-[46ch] text-[0.9375rem] text-text-secondary">
                Experimente alargar a pesquisa. Se procura formação que ainda não
                está no catálogo, fale connosco — organizamos turmas à medida.
              </p>
              <Link
                href="/cursos"
                className="mt-5 inline-block text-sm font-semibold text-brand-text underline underline-offset-4"
              >
                Limpar filtros
              </Link>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
