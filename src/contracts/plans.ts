import { z } from "zod";

/**
 * Planos de formação da WIL IT.
 *
 * Renomeados a partir do portfólio 2026 por decisão da Direcção. Os nomes
 * anteriores — "It's to Easy", "Small Boy", "Together" e "Goat" — eram gíria
 * e prejudicavam a leitura em propostas empresariais, que é precisamente
 * onde o plano mais completo é avaliado.
 *
 * Os nomes novos dizem o que se compra, em vez de sugerirem um nível de
 * estatuto: quem quer certificar-se percebe imediatamente qual escolher.
 *
 * A composição dos planos não foi alterada. Note-se que no portfólio os
 * planos "Together" e "Goat" tinham exactamente os mesmos componentes e
 * diferiam apenas no destinatário. Essa diferença passa agora a estar
 * explícita no campo `audience`, em vez de escondida no nome.
 */

export const planCodeSchema = z.enum([
  "essencial",
  "certificacao",
  "performance",
  "corporativo",
]);
export type PlanCode = z.infer<typeof planCodeSchema>;

export const planFeatureSchema = z.enum([
  "treinamento",
  "bootcamp",
  "mentoria",
  "preparacao_exame",
  "avaliacao_desempenho",
]);
export type PlanFeature = z.infer<typeof planFeatureSchema>;

export const FEATURE_LABEL: Record<PlanFeature, string> = {
  treinamento: "Treinamento",
  bootcamp: "Bootcamp",
  mentoria: "Mentoria",
  preparacao_exame: "Preparação para exame",
  avaliacao_desempenho: "Avaliação de desempenho",
};

export const planSchema = z.object({
  code: planCodeSchema,
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  features: z.array(planFeatureSchema),
  audience: z.enum(["individual", "empresa"]),
  /** Ordem de apresentação no catálogo, do mais simples ao mais completo. */
  position: z.number().int(),
});
export type Plan = z.infer<typeof planSchema>;

export const PLANS: Record<PlanCode, Plan> = {
  essencial: {
    code: "essencial",
    name: "Essencial",
    tagline: "Aprender e praticar",
    description:
      "Formação técnica com prática intensiva. Para quem quer dominar a matéria e aplicá-la no trabalho, sem prestar exame de certificação.",
    features: ["treinamento", "bootcamp"],
    audience: "individual",
    position: 1,
  },
  certificacao: {
    code: "certificacao",
    name: "Certificação",
    tagline: "Chegar ao exame preparado",
    description:
      "Tudo o que o plano Essencial inclui, mais acompanhamento individual por um mentor e preparação dirigida ao exame oficial.",
    features: ["treinamento", "bootcamp", "mentoria", "preparacao_exame"],
    audience: "individual",
    position: 2,
  },
  performance: {
    code: "performance",
    name: "Performance",
    tagline: "Acompanhamento até ao resultado",
    description:
      "O percurso completo, com avaliações de desempenho periódicas que medem o progresso e corrigem o rumo antes do exame.",
    features: [
      "treinamento",
      "bootcamp",
      "mentoria",
      "preparacao_exame",
      "avaliacao_desempenho",
    ],
    audience: "individual",
    position: 3,
  },
  corporativo: {
    code: "corporativo",
    name: "Corporativo",
    tagline: "Para equipas, em turma fechada",
    description:
      "O percurso completo entregue à medida de uma organização: turma fechada, calendário acordado, conteúdos ajustados ao contexto da empresa e relatório de progresso para a chefia.",
    features: [
      "treinamento",
      "bootcamp",
      "mentoria",
      "preparacao_exame",
      "avaliacao_desempenho",
    ],
    audience: "empresa",
    position: 4,
  },
};

export const PLAN_LIST: Plan[] = Object.values(PLANS).sort(
  (a, b) => a.position - b.position
);

/** Mapa dos nomes antigos, para não perder o histórico em materiais já distribuídos. */
export const LEGACY_PLAN_NAMES: Record<string, PlanCode> = {
  "It's to Easy": "essencial",
  "Small Boy": "certificacao",
  Goat: "performance",
  Together: "corporativo",
};
