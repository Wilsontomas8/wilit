import { z } from "zod";
import { planCodeSchema } from "./plans";

/**
 * Contratos da pré-inscrição.
 *
 * Regra da Adenda A do SoW v2.1: o sistema NÃO emite facturas nem processa
 * pagamentos. A factura é emitida no Cegid pela WIL IT. Aqui apenas se
 * reúnem os dados de que ela precisa e se regista a referência do documento
 * emitido.
 *
 * Os campos fiscais abaixo são o conjunto habitual em Angola. A decisão
 * D-13 do SoW continua por confirmar: quando for emitida uma factura de
 * ensaio no Cegid, esta lista deve ser verificada contra o que ele pede.
 */

/* -------------------------------------------------------------------------- */
/*  Contacto e morada                                                          */
/* -------------------------------------------------------------------------- */

export const PROVINCIAS = [
  "Bengo", "Benguela", "Bié", "Cabinda", "Cuando", "Cubango", "Cuanza Norte",
  "Cuanza Sul", "Cunene", "Huambo", "Huíla", "Icolo e Bengo", "Luanda",
  "Lunda Norte", "Lunda Sul", "Malanje", "Moxico", "Moxico Leste", "Namibe",
  "Uíge", "Zaire",
] as const;

export const provinciaSchema = z.enum(PROVINCIAS);

/** Telemóvel angolano: 9 dígitos começados por 9, com ou sem indicativo. */
export const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^(?:\+?244[\s-]?)?9\d{2}[\s-]?\d{3}[\s-]?\d{3}$/,
    "Introduza um número angolano válido, por exemplo +244 923 456 789"
  );

export const addressSchema = z.object({
  line: z.string().trim().min(5).max(160),
  city: z.string().trim().min(2).max(80),
  provincia: provinciaSchema,
});
export type Address = z.infer<typeof addressSchema>;

/* -------------------------------------------------------------------------- */
/*  Candidato                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * NIF em Angola: pessoa singular usa o número do bilhete de identidade
 * (ex. 003456789LA042); pessoa colectiva usa 10 dígitos. A validação é
 * deliberadamente permissiva — recusar um NIF válido custa uma inscrição,
 * aceitar um mal formatado custa uma correcção no backoffice.
 */
export const nifSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(9, "O NIF é demasiado curto")
  .max(20, "O NIF é demasiado longo")
  .regex(/^[0-9A-Z]+$/, "O NIF só pode conter letras e algarismos");

export const candidatoParticularSchema = z.object({
  tipo: z.literal("particular"),
  nomeCompleto: z.string().trim().min(5).max(140),
  nif: nifSchema,
  biNumero: z.string().trim().min(5).max(20),
  morada: addressSchema,
  telefone: phoneSchema,
  email: z.email("Introduza um endereço de email válido"),
});

export const candidatoEmpresaSchema = z.object({
  tipo: z.literal("empresa"),
  designacaoSocial: z.string().trim().min(3).max(160),
  nif: nifSchema,
  morada: addressSchema,
  pessoaContacto: z.string().trim().min(5).max(140),
  cargoContacto: z.string().trim().max(80).optional(),
  telefone: phoneSchema,
  email: z.email(),
  /** Quando a facturação vai para um endereço diferente do contacto. */
  emailFacturacao: z.email().optional(),
  numeroFormandos: z.number().int().positive().max(200),
});

export const candidatoSchema = z.discriminatedUnion("tipo", [
  candidatoParticularSchema,
  candidatoEmpresaSchema,
]);
export type Candidato = z.infer<typeof candidatoSchema>;

/* -------------------------------------------------------------------------- */
/*  Pagamento                                                                  */
/* -------------------------------------------------------------------------- */

export const modoPagamentoSchema = z.enum(["integral", "duas_prestacoes"]);
export type ModoPagamento = z.infer<typeof modoPagamentoSchema>;

export const MODO_PAGAMENTO_LABEL: Record<ModoPagamento, string> = {
  integral: "Pagamento integral",
  duas_prestacoes: "50% + 50% em duas prestações",
};

export const prestacaoSchema = z.object({
  numero: z.union([z.literal(1), z.literal(2)]),
  valorAOA: z.number().int().nonnegative(),
  /** Número do documento emitido no Cegid. Nulo até ser emitido. */
  facturaCegid: z.string().trim().max(40).nullable(),
  facturaEmitidaEm: z.iso.datetime().nullable(),
  pagaEm: z.iso.datetime().nullable(),
});
export type Prestacao = z.infer<typeof prestacaoSchema>;

/**
 * Divide o preço pelas prestações.
 *
 * Em duas prestações, metades exactas nem sempre são possíveis: o resto da
 * divisão inteira é somado à primeira prestação, para que a soma feche
 * sempre com o preço e nunca falte um kwanza na segunda factura.
 */
export function calcularPrestacoes(
  precoAOA: number,
  modo: ModoPagamento
): { numero: 1 | 2; valorAOA: number }[] {
  if (modo === "integral") return [{ numero: 1, valorAOA: precoAOA }];
  const metade = Math.floor(precoAOA / 2);
  const resto = precoAOA - metade * 2;
  return [
    { numero: 1, valorAOA: metade + resto },
    { numero: 2, valorAOA: metade },
  ];
}

/* -------------------------------------------------------------------------- */
/*  Estados                                                                    */
/* -------------------------------------------------------------------------- */

export const estadoPreInscricaoSchema = z.enum([
  "recebida",
  "em_contacto",
  "factura_emitida",
  "paga",
  "confirmada",
  "lista_espera",
  "expirada",
  "cancelada",
]);
export type EstadoPreInscricao = z.infer<typeof estadoPreInscricaoSchema>;

export const ESTADO_LABEL: Record<EstadoPreInscricao, string> = {
  recebida: "Recebida",
  em_contacto: "Em contacto",
  factura_emitida: "Factura emitida",
  paga: "Paga",
  confirmada: "Vaga confirmada",
  lista_espera: "Lista de espera",
  expirada: "Reserva expirada",
  cancelada: "Cancelada",
};

/** Estados que consomem vaga temporariamente (contam como reservadas). */
export const ESTADOS_QUE_RESERVAM: EstadoPreInscricao[] = [
  "recebida",
  "em_contacto",
  "factura_emitida",
  "paga",
];

/** Estados que consomem vaga definitivamente. */
export const ESTADOS_QUE_CONFIRMAM: EstadoPreInscricao[] = ["confirmada"];

/** Transições permitidas. Qualquer outra é recusada no servidor. */
export const TRANSICOES: Record<EstadoPreInscricao, EstadoPreInscricao[]> = {
  recebida: ["em_contacto", "lista_espera", "cancelada", "expirada"],
  em_contacto: ["factura_emitida", "lista_espera", "cancelada", "expirada"],
  factura_emitida: ["paga", "cancelada", "expirada"],
  paga: ["confirmada", "cancelada"],
  confirmada: ["cancelada"],
  lista_espera: ["em_contacto", "cancelada"],
  expirada: ["em_contacto"],
  cancelada: [],
};

export function podeTransitar(
  de: EstadoPreInscricao,
  para: EstadoPreInscricao
): boolean {
  return TRANSICOES[de].includes(para);
}

/* -------------------------------------------------------------------------- */
/*  Pré-inscrição                                                              */
/* -------------------------------------------------------------------------- */

/** O que o formulário público envia. */
export const preInscricaoInputSchema = z.object({
  edicaoId: z.uuid(),
  plano: planCodeSchema,
  modoPagamento: modoPagamentoSchema,
  candidato: candidatoSchema,
  comoConheceu: z
    .enum(["pesquisa", "redes_sociais", "recomendacao", "empresa", "outro"])
    .optional(),
  observacoes: z.string().trim().max(1000).optional(),
  /** Tem de ser verdadeiro. Nunca pré-marcado na interface. */
  consentimento: z.literal(true, {
    message: "É necessário aceitar o tratamento dos dados para continuar",
  }),
});
export type PreInscricaoInput = z.infer<typeof preInscricaoInputSchema>;

/** O que o servidor devolve. */
export const preInscricaoSchema = z.object({
  id: z.uuid(),
  /** Referência legível dada ao candidato, ex. "PI-2026-0042". */
  referencia: z.string().regex(/^PI-\d{4}-\d{4,}$/),
  edicaoId: z.uuid(),
  cursoId: z.uuid(),
  plano: planCodeSchema,
  modoPagamento: modoPagamentoSchema,
  precoAOA: z.number().int().nonnegative(),
  prestacoes: z.array(prestacaoSchema).min(1).max(2),
  candidato: candidatoSchema,
  estado: estadoPreInscricaoSchema,
  /** Fim do prazo de reserva. Nulo em lista de espera e em estados finais. */
  reservadaAte: z.iso.datetime().nullable(),
  comoConheceu: z.string().nullable(),
  observacoes: z.string().nullable(),
  consentimentoEm: z.iso.datetime(),
  /** Versão do texto de consentimento aceite, para prova futura. */
  consentimentoVersao: z.string(),
  criadaEm: z.iso.datetime(),
  actualizadaEm: z.iso.datetime(),
});
export type PreInscricao = z.infer<typeof preInscricaoSchema>;

/** Resposta imediata ao candidato. Não confirma vaga. */
export const preInscricaoRespostaSchema = z.object({
  referencia: z.string(),
  estado: estadoPreInscricaoSchema,
  reservadaAte: z.iso.datetime().nullable(),
  emListaEspera: z.boolean(),
});
export type PreInscricaoResposta = z.infer<typeof preInscricaoRespostaSchema>;
