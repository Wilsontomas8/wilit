import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

/**
 * Modelo de dados do ecossistema WIL IT — WP-A.06 do SoW v2.1.
 *
 * Convenções fixadas na secção 6.1 do SoW v1.1 e mantidas aqui:
 *   · identificadores UUID
 *   · datas em UTC, convertidas apenas na apresentação
 *   · valores monetários em INTEIRO de kwanzas, nunca vírgula flutuante
 *   · registos financeiros e de auditoria nunca eliminados fisicamente
 *   · unicidade em email, slug, código e referência
 *
 * Nota de arquitectura: o SoW previa Prisma, mas o alojamento passou a ser
 * serverless no Vercel, onde o motor binário do Prisma pesa no arranque a
 * frio. O Drizzle é TypeScript puro, sem binários, e tem driver oficial para
 * o Neon. A decisão está registada no README.
 */

/* ========================================================================== */
/*  Enumerações                                                               */
/* ========================================================================== */

export const papelUtilizador = pgEnum("papel_utilizador", [
  "ADMINISTRADOR",
  "GESTOR_FORMACAO",
  "EDITOR_CONTEUDO",
  "LEITOR",
]);

export const estadoUtilizador = pgEnum("estado_utilizador", [
  "ACTIVO",
  "SUSPENSO",
  "DESACTIVADO",
]);

export const areaEnum = pgEnum("area", [
  "REDES",
  "CIBERSEGURANCA",
  "SISTEMAS",
  "CLOUD",
  "DESENVOLVIMENTO",
  "SEGURANCA_ELECTRONICA",
]);

export const nivelEnum = pgEnum("nivel", [
  "INICIANTE",
  "INTERMEDIO",
  "AVANCADO",
]);

export const modalidadeEnum = pgEnum("modalidade", [
  "PRESENCIAL",
  "ONLINE",
  "HIBRIDO",
]);

export const estadoCurso = pgEnum("estado_curso", [
  "RASCUNHO",
  "PUBLICADO",
  "ARQUIVADO",
]);

export const estadoEdicao = pgEnum("estado_edicao", [
  "PLANEADA",
  "INSCRICOES_ABERTAS",
  "A_DECORRER",
  "CONCLUIDA",
  "CANCELADA",
]);

export const codigoPlano = pgEnum("codigo_plano", [
  "ESSENCIAL",
  "CERTIFICACAO",
  "PERFORMANCE",
  "CORPORATIVO",
]);

export const tipoCandidato = pgEnum("tipo_candidato", ["PARTICULAR", "EMPRESA"]);

export const modoPagamento = pgEnum("modo_pagamento", [
  "INTEGRAL",
  "DUAS_PRESTACOES",
]);

export const estadoPreInscricao = pgEnum("estado_pre_inscricao", [
  "RECEBIDA",
  "EM_CONTACTO",
  "FACTURA_EMITIDA",
  "PAGA",
  "CONFIRMADA",
  "LISTA_ESPERA",
  "EXPIRADA",
  "CANCELADA",
]);

export const estadoPublicacao = pgEnum("estado_publicacao", [
  "RASCUNHO",
  "AGENDADO",
  "PUBLICADO",
  "ARQUIVADO",
]);

export const tipoOferta = pgEnum("tipo_oferta", ["SERVICO", "ESPECIALIDADE"]);

export const estadoLead = pgEnum("estado_lead", [
  "NOVO",
  "EM_CONTACTO",
  "QUALIFICADO",
  "GANHO",
  "PERDIDO",
]);

/* ========================================================================== */
/*  Identidade e autorização                                                  */
/* ========================================================================== */

export const utilizadores = pgTable(
  "utilizadores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    nome: text("nome").notNull(),
    passwordHash: text("password_hash").notNull(),
    papel: papelUtilizador("papel").notNull().default("LEITOR"),
    estado: estadoUtilizador("estado").notNull().default("ACTIVO"),
    emailVerificadoEm: timestamp("email_verificado_em", { withTimezone: true }),
    ultimoAcessoEm: timestamp("ultimo_acesso_em", { withTimezone: true }),
    // MFA obrigatório para ADMINISTRADOR (secção 6.2 do SoW v1.1)
    mfaSegredo: text("mfa_segredo"),
    mfaActivadoEm: timestamp("mfa_activado_em", { withTimezone: true }),
    mfaCodigosRecuperacao: text("mfa_codigos_recuperacao").array(),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
    actualizadoEm: timestamp("actualizado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("utilizadores_email_uq").on(t.email),
    index("utilizadores_papel_estado_ix").on(t.papel, t.estado),
  ]
);

export const sessoes = pgTable(
  "sessoes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    utilizadorId: uuid("utilizador_id")
      .notNull()
      .references(() => utilizadores.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    expiraEm: timestamp("expira_em", { withTimezone: true }).notNull(),
    revogadaEm: timestamp("revogada_em", { withTimezone: true }),
    criadaEm: timestamp("criada_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("sessoes_token_uq").on(t.tokenHash),
    index("sessoes_utilizador_ix").on(t.utilizadorId, t.expiraEm),
  ]
);

export const tokensRecuperacao = pgTable(
  "tokens_recuperacao",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    tokenHash: text("token_hash").notNull(),
    expiraEm: timestamp("expira_em", { withTimezone: true }).notNull(),
    usadoEm: timestamp("usado_em", { withTimezone: true }),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("tokens_recuperacao_uq").on(t.tokenHash),
    index("tokens_recuperacao_email_ix").on(t.email),
  ]
);

/* ========================================================================== */
/*  Catálogo de formação                                                      */
/* ========================================================================== */

export const cursos = pgTable(
  "cursos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    codigo: text("codigo").notNull(),
    slug: text("slug").notNull(),
    titulo: text("titulo").notNull(),
    certificacao: text("certificacao"),
    area: areaEnum("area").notNull(),
    nivel: nivelEnum("nivel").notNull(),
    resumo: text("resumo").notNull(),
    duracaoHoras: integer("duracao_horas").notNull(),
    formador: text("formador"),
    imagemCapaUrl: text("imagem_capa_url"),
    estado: estadoCurso("estado").notNull().default("RASCUNHO"),
    objectivos: text("objectivos").array().notNull().default(sql`'{}'`),
    destinatarios: text("destinatarios").array().notNull().default(sql`'{}'`),
    preRequisitos: text("pre_requisitos").array().notNull().default(sql`'{}'`),
    seoTitulo: text("seo_titulo"),
    seoDescricao: text("seo_descricao"),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
    actualizadoEm: timestamp("actualizado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("cursos_codigo_uq").on(t.codigo),
    uniqueIndex("cursos_slug_uq").on(t.slug),
    index("cursos_estado_area_ix").on(t.estado, t.area),
  ]
);

export const modulosCurso = pgTable(
  "modulos_curso",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cursoId: uuid("curso_id")
      .notNull()
      .references(() => cursos.id, { onDelete: "cascade" }),
    titulo: text("titulo").notNull(),
    topicos: text("topicos").array().notNull().default(sql`'{}'`),
    posicao: integer("posicao").notNull(),
  },
  (t) => [
    uniqueIndex("modulos_curso_posicao_uq").on(t.cursoId, t.posicao),
    index("modulos_curso_curso_ix").on(t.cursoId),
  ]
);

export const edicoes = pgTable(
  "edicoes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cursoId: uuid("curso_id")
      .notNull()
      .references(() => cursos.id, { onDelete: "cascade" }),
    codigo: text("codigo").notNull(),
    modalidade: modalidadeEnum("modalidade").notNull(),
    local: text("local"),
    dataInicio: date("data_inicio").notNull(),
    dataFim: date("data_fim").notNull(),
    horario: text("horario").notNull(),
    capacidade: integer("capacidade").notNull(),
    estado: estadoEdicao("estado").notNull().default("PLANEADA"),
    criadaEm: timestamp("criada_em", { withTimezone: true }).notNull().defaultNow(),
    actualizadaEm: timestamp("actualizada_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("edicoes_codigo_uq").on(t.codigo),
    index("edicoes_curso_estado_ix").on(t.cursoId, t.estado),
    index("edicoes_data_inicio_ix").on(t.dataInicio),
  ]
);

/**
 * O preço vive na edição e não no curso: a mesma formação pode custar
 * diferente presencial e online, e um aumento não deve reescrever o
 * histórico das edições passadas.
 */
export const precosEdicao = pgTable(
  "precos_edicao",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    edicaoId: uuid("edicao_id")
      .notNull()
      .references(() => edicoes.id, { onDelete: "cascade" }),
    plano: codigoPlano("plano").notNull(),
    /** Kwanzas, inteiro. Nunca vírgula flutuante. */
    precoAOA: integer("preco_aoa").notNull(),
    disponivel: boolean("disponivel").notNull().default(true),
  },
  (t) => [uniqueIndex("precos_edicao_uq").on(t.edicaoId, t.plano)]
);

/* ========================================================================== */
/*  Pré-inscrições                                                            */
/* ========================================================================== */

export const preInscricoes = pgTable(
  "pre_inscricoes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    referencia: text("referencia").notNull(),
    edicaoId: uuid("edicao_id")
      .notNull()
      .references(() => edicoes.id),
    plano: codigoPlano("plano").notNull(),
    modoPagamento: modoPagamento("modo_pagamento").notNull(),
    /** Fotografia do preço no momento da submissão. */
    precoAOA: integer("preco_aoa").notNull(),
    estado: estadoPreInscricao("estado").notNull().default("RECEBIDA"),

    // ---- dados do candidato, tal como a factura do Cegid os exige ----
    tipoCandidato: tipoCandidato("tipo_candidato").notNull(),
    /** Nome completo, ou designação social no caso de empresa. */
    nome: text("nome").notNull(),
    nif: text("nif").notNull(),
    biNumero: text("bi_numero"),
    moradaLinha: text("morada_linha").notNull(),
    moradaMunicipio: text("morada_municipio").notNull(),
    moradaProvincia: text("morada_provincia").notNull(),
    telefone: text("telefone").notNull(),
    email: text("email").notNull(),
    pessoaContacto: text("pessoa_contacto"),
    emailFacturacao: text("email_facturacao"),
    numeroFormandos: integer("numero_formandos"),

    comoConheceu: text("como_conheceu"),
    observacoes: text("observacoes"),

    /** Fim do prazo de reserva. Nulo em lista de espera e estados finais. */
    reservadaAte: timestamp("reservada_ate", { withTimezone: true }),

    consentimentoEm: timestamp("consentimento_em", { withTimezone: true }).notNull(),
    consentimentoVersao: text("consentimento_versao").notNull(),

    operadorId: uuid("operador_id").references(() => utilizadores.id),

    criadaEm: timestamp("criada_em", { withTimezone: true }).notNull().defaultNow(),
    actualizadaEm: timestamp("actualizada_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("pre_inscricoes_referencia_uq").on(t.referencia),
    index("pre_inscricoes_edicao_estado_ix").on(t.edicaoId, t.estado),
    index("pre_inscricoes_expiracao_ix").on(t.estado, t.reservadaAte),
    index("pre_inscricoes_email_ix").on(t.email),
  ]
);

/** Uma prestação por factura a emitir no Cegid. Em pagamento integral há uma. */
export const prestacoes = pgTable(
  "prestacoes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    preInscricaoId: uuid("pre_inscricao_id")
      .notNull()
      .references(() => preInscricoes.id, { onDelete: "cascade" }),
    numero: integer("numero").notNull(),
    valorAOA: integer("valor_aoa").notNull(),
    /** Número do documento emitido no Cegid. O sistema não emite facturas. */
    facturaCegid: text("factura_cegid"),
    facturaEmitidaEm: timestamp("factura_emitida_em", { withTimezone: true }),
    pagaEm: timestamp("paga_em", { withTimezone: true }),
  },
  (t) => [uniqueIndex("prestacoes_uq").on(t.preInscricaoId, t.numero)]
);

/**
 * Histórico de estados. A auditoria genérica não substitui isto quando um
 * cliente pergunta o que aconteceu à inscrição dele.
 */
export const transicoesPreInscricao = pgTable(
  "transicoes_pre_inscricao",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    preInscricaoId: uuid("pre_inscricao_id")
      .notNull()
      .references(() => preInscricoes.id, { onDelete: "cascade" }),
    de: estadoPreInscricao("de"),
    para: estadoPreInscricao("para").notNull(),
    autorId: uuid("autor_id").references(() => utilizadores.id),
    nota: text("nota"),
    criadaEm: timestamp("criada_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("transicoes_pre_inscricao_ix").on(t.preInscricaoId, t.criadaEm)]
);

/* ========================================================================== */
/*  CMS institucional                                                         */
/* ========================================================================== */

export const paginas = pgTable(
  "paginas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    titulo: text("titulo").notNull(),
    resumo: text("resumo"),
    conteudo: text("conteudo").notNull(),
    estado: estadoPublicacao("estado").notNull().default("RASCUNHO"),
    posicao: integer("posicao").notNull().default(0),
    seoTitulo: text("seo_titulo"),
    seoDescricao: text("seo_descricao"),
    imagemUrl: text("imagem_url"),
    publicadaEm: timestamp("publicada_em", { withTimezone: true }),
    criadaEm: timestamp("criada_em", { withTimezone: true }).notNull().defaultNow(),
    actualizadaEm: timestamp("actualizada_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("paginas_slug_uq").on(t.slug),
    index("paginas_estado_ix").on(t.estado),
  ]
);

export const categorias = pgTable(
  "categorias",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    nome: text("nome").notNull(),
  },
  (t) => [uniqueIndex("categorias_slug_uq").on(t.slug)]
);

export const artigos = pgTable(
  "artigos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    titulo: text("titulo").notNull(),
    resumo: text("resumo"),
    conteudo: text("conteudo").notNull(),
    estado: estadoPublicacao("estado").notNull().default("RASCUNHO"),
    autorId: uuid("autor_id").references(() => utilizadores.id),
    categoriaId: uuid("categoria_id").references(() => categorias.id),
    etiquetas: text("etiquetas").array().notNull().default(sql`'{}'`),
    imagemUrl: text("imagem_url"),
    seoTitulo: text("seo_titulo"),
    seoDescricao: text("seo_descricao"),
    /** Data de publicação. No futuro, se o estado for AGENDADO. */
    publicadoEm: timestamp("publicado_em", { withTimezone: true }),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
    actualizadoEm: timestamp("actualizado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("artigos_slug_uq").on(t.slug),
    index("artigos_estado_publicado_ix").on(t.estado, t.publicadoEm),
  ]
);

/**
 * Serviços e especialidades do portfólio. Partilham a mesma forma; o campo
 * `tipo` separa-os, para não duplicar duas tabelas quase iguais.
 */
export const ofertas = pgTable(
  "ofertas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tipo: tipoOferta("tipo").notNull(),
    slug: text("slug").notNull(),
    titulo: text("titulo").notNull(),
    resumo: text("resumo").notNull(),
    descricao: text("descricao"),
    paraQuem: text("para_quem").array().notNull().default(sql`'{}'`),
    entregaveis: text("entregaveis").array().notNull().default(sql`'{}'`),
    tecnologias: text("tecnologias").array().notNull().default(sql`'{}'`),
    icone: text("icone"),
    estado: estadoPublicacao("estado").notNull().default("RASCUNHO"),
    posicao: integer("posicao").notNull().default(0),
    criadaEm: timestamp("criada_em", { withTimezone: true }).notNull().defaultNow(),
    actualizadaEm: timestamp("actualizada_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("ofertas_slug_uq").on(t.slug),
    index("ofertas_tipo_estado_ix").on(t.tipo, t.estado),
  ]
);

export const parceiros = pgTable(
  "parceiros",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nome: text("nome").notNull(),
    logoUrl: text("logo_url"),
    website: text("website"),
    estado: estadoPublicacao("estado").notNull().default("PUBLICADO"),
    posicao: integer("posicao").notNull().default(0),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
    actualizadoEm: timestamp("actualizado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("parceiros_estado_posicao_ix").on(t.estado, t.posicao)]
);

export const perguntasFrequentes = pgTable(
  "perguntas_frequentes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pergunta: text("pergunta").notNull(),
    resposta: text("resposta").notNull(),
    estado: estadoPublicacao("estado").notNull().default("PUBLICADO"),
    posicao: integer("posicao").notNull().default(0),
    criadaEm: timestamp("criada_em", { withTimezone: true }).notNull().defaultNow(),
    actualizadaEm: timestamp("actualizada_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("perguntas_frequentes_estado_posicao_ix").on(t.estado, t.posicao)]
);

/* ========================================================================== */
/*  Leads e plataforma                                                        */
/* ========================================================================== */

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    origem: text("origem").notNull(),
    nome: text("nome").notNull(),
    email: text("email").notNull(),
    telefone: text("telefone"),
    empresa: text("empresa"),
    mensagem: text("mensagem"),
    estado: estadoLead("estado").notNull().default("NOVO"),
    /** Registo de consentimento com data e finalidade (secção 8.3 do SoW). */
    consentimentoEm: timestamp("consentimento_em", { withTimezone: true }).notNull(),
    consentimentoVersao: text("consentimento_versao").notNull(),
    responsavelId: uuid("responsavel_id").references(() => utilizadores.id),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
    actualizadoEm: timestamp("actualizado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("leads_estado_criado_ix").on(t.estado, t.criadoEm)]
);

export const definicoes = pgTable(
  "definicoes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    chave: text("chave").notNull(),
    valor: jsonb("valor").notNull(),
    descricao: text("descricao"),
    actualizadaEm: timestamp("actualizada_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("definicoes_chave_uq").on(t.chave)]
);

/**
 * Idempotência de eventos externos. A secção 6.1 do SoW exige operações
 * idempotentes mas o v1.1 não tinha onde registar o que já foi processado.
 */
export const eventosExternos = pgTable(
  "eventos_externos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    origem: text("origem").notNull(),
    idExterno: text("id_externo").notNull(),
    processadoEm: timestamp("processado_em", { withTimezone: true }).notNull().defaultNow(),
    payloadHash: text("payload_hash"),
  },
  (t) => [uniqueIndex("eventos_externos_uq").on(t.origem, t.idExterno)]
);

export const registosAuditoria = pgTable(
  "registos_auditoria",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    autorId: uuid("autor_id").references(() => utilizadores.id),
    accao: text("accao").notNull(),
    recursoTipo: text("recurso_tipo").notNull(),
    recursoId: text("recurso_id"),
    ip: text("ip"),
    antes: jsonb("antes"),
    depois: jsonb("depois"),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("auditoria_recurso_ix").on(t.recursoTipo, t.recursoId, t.criadoEm),
    index("auditoria_autor_ix").on(t.autorId, t.criadoEm),
  ]
);

/* ========================================================================== */
/*  Relações                                                                  */
/* ========================================================================== */

export const cursosRelations = relations(cursos, ({ many }) => ({
  modulos: many(modulosCurso),
  edicoes: many(edicoes),
}));

export const modulosCursoRelations = relations(modulosCurso, ({ one }) => ({
  curso: one(cursos, { fields: [modulosCurso.cursoId], references: [cursos.id] }),
}));

export const edicoesRelations = relations(edicoes, ({ one, many }) => ({
  curso: one(cursos, { fields: [edicoes.cursoId], references: [cursos.id] }),
  precos: many(precosEdicao),
  preInscricoes: many(preInscricoes),
}));

export const precosEdicaoRelations = relations(precosEdicao, ({ one }) => ({
  edicao: one(edicoes, { fields: [precosEdicao.edicaoId], references: [edicoes.id] }),
}));

export const preInscricoesRelations = relations(preInscricoes, ({ one, many }) => ({
  edicao: one(edicoes, { fields: [preInscricoes.edicaoId], references: [edicoes.id] }),
  operador: one(utilizadores, {
    fields: [preInscricoes.operadorId],
    references: [utilizadores.id],
  }),
  prestacoes: many(prestacoes),
  transicoes: many(transicoesPreInscricao),
}));

export const prestacoesRelations = relations(prestacoes, ({ one }) => ({
  preInscricao: one(preInscricoes, {
    fields: [prestacoes.preInscricaoId],
    references: [preInscricoes.id],
  }),
}));

export const artigosRelations = relations(artigos, ({ one }) => ({
  autor: one(utilizadores, { fields: [artigos.autorId], references: [utilizadores.id] }),
  categoria: one(categorias, {
    fields: [artigos.categoriaId],
    references: [categorias.id],
  }),
}));

export const utilizadoresRelations = relations(utilizadores, ({ many }) => ({
  sessoes: many(sessoes),
  artigos: many(artigos),
}));
