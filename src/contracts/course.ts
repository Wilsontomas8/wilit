import { z } from "zod";
import { planCodeSchema } from "./plans";

/**
 * Contratos do catálogo de formação.
 *
 * Fonte: portfólio de serviços WIL IT 2026, secção "Formação Profissional".
 * Estes schemas são o contrato entre interface e servidor (WP-A.03 do SoW
 * v2.1). Depois de aprovados ficam congelados; alterá-los exige pedido de
 * mudança.
 */

/* -------------------------------------------------------------------------- */
/*  Vocabulário                                                                */
/* -------------------------------------------------------------------------- */

export const areaSchema = z.enum([
  "redes",
  "ciberseguranca",
  "sistemas",
  "cloud",
  "desenvolvimento",
  "seguranca_electronica",
]);
export type Area = z.infer<typeof areaSchema>;

export const AREA_LABEL: Record<Area, string> = {
  redes: "Redes e Infraestrutura",
  ciberseguranca: "Cibersegurança",
  sistemas: "Sistemas e Virtualização",
  cloud: "Cloud",
  desenvolvimento: "Desenvolvimento",
  seguranca_electronica: "Segurança Electrónica",
};

export const levelSchema = z.enum(["iniciante", "intermedio", "avancado"]);
export type Level = z.infer<typeof levelSchema>;

export const LEVEL_LABEL: Record<Level, string> = {
  iniciante: "Iniciante",
  intermedio: "Intermédio",
  avancado: "Avançado",
};

export const modalitySchema = z.enum(["presencial", "online", "hibrido"]);
export type Modality = z.infer<typeof modalitySchema>;

export const MODALITY_LABEL: Record<Modality, string> = {
  presencial: "Presencial",
  online: "Online",
  hibrido: "Híbrido",
};

/* -------------------------------------------------------------------------- */
/*  Curso                                                                      */
/* -------------------------------------------------------------------------- */

export const syllabusModuleSchema = z.object({
  title: z.string().min(1),
  topics: z.array(z.string().min(1)),
});
export type SyllabusModule = z.infer<typeof syllabusModuleSchema>;

export const courseStatusSchema = z.enum([
  "rascunho",
  "publicado",
  "arquivado",
]);
export type CourseStatus = z.infer<typeof courseStatusSchema>;

export const courseSchema = z.object({
  id: z.uuid(),
  /** Código interno, ex. "CCNA-200-301". */
  code: z.string().min(2).max(32),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido"),
  title: z.string().min(3).max(160),
  /** Certificação oficial visada, quando aplicável. */
  certification: z.string().max(120).nullable(),
  area: areaSchema,
  level: levelSchema,
  summary: z.string().min(20).max(400),
  objectives: z.array(z.string().min(3)).min(1),
  targetAudience: z.array(z.string().min(3)).min(1),
  prerequisites: z.array(z.string().min(3)),
  syllabus: z.array(syllabusModuleSchema),
  durationHours: z.number().int().positive().max(500),
  instructorName: z.string().max(120).nullable(),
  coverImageUrl: z.url().nullable(),
  status: courseStatusSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Course = z.infer<typeof courseSchema>;

/* -------------------------------------------------------------------------- */
/*  Edição (turma)                                                             */
/* -------------------------------------------------------------------------- */

export const editionStatusSchema = z.enum([
  "planeada",
  "inscricoes_abertas",
  "a_decorrer",
  "concluida",
  "cancelada",
]);
export type EditionStatus = z.infer<typeof editionStatusSchema>;

/**
 * Preço por plano, dentro de uma edição.
 *
 * O preço vive na edição e não no curso porque a mesma formação pode ter
 * preços diferentes entre uma turma presencial e uma turma online, e porque
 * um aumento de preço não deve reescrever o histórico das edições passadas.
 */
export const editionPlanPriceSchema = z.object({
  plan: planCodeSchema,
  /** Kwanzas. Inteiro em unidades de AOA — nunca vírgula flutuante. */
  priceAOA: z.number().int().nonnegative(),
  available: z.boolean(),
});
export type EditionPlanPrice = z.infer<typeof editionPlanPriceSchema>;

export const courseEditionSchema = z
  .object({
    id: z.uuid(),
    courseId: z.uuid(),
    /** Referência legível, ex. "CCNA-2026-04". */
    code: z.string().min(2).max(32),
    modality: modalitySchema,
    /** Sala, endereço ou plataforma. */
    location: z.string().max(160).nullable(),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    /** Horário em texto livre, ex. "Segunda a sexta, 18h00–21h00". */
    schedule: z.string().max(160),
    capacity: z.number().int().positive().max(500),
    /** Pré-inscrições com pagamento confirmado. */
    confirmedCount: z.number().int().nonnegative(),
    /** Pré-inscrições dentro do prazo de reserva. */
    reservedCount: z.number().int().nonnegative(),
    prices: z.array(editionPlanPriceSchema).min(1),
    status: editionStatusSchema,
  })
  .refine((e) => e.endDate >= e.startDate, {
    message: "A data de fim não pode ser anterior à data de início",
    path: ["endDate"],
  });
export type CourseEdition = z.infer<typeof courseEditionSchema>;

/** Curso com as suas edições, tal como o catálogo público o consome. */
export const courseWithEditionsSchema = courseSchema.extend({
  editions: z.array(courseEditionSchema),
});
export type CourseWithEditions = z.infer<typeof courseWithEditionsSchema>;

/* -------------------------------------------------------------------------- */
/*  Filtros do catálogo                                                        */
/* -------------------------------------------------------------------------- */

export const catalogueQuerySchema = z.object({
  area: areaSchema.optional(),
  level: levelSchema.optional(),
  modality: modalitySchema.optional(),
  search: z.string().max(120).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(48).default(12),
});
export type CatalogueQuery = z.infer<typeof catalogueQuerySchema>;
