CREATE TYPE "public"."area" AS ENUM('REDES', 'CIBERSEGURANCA', 'SISTEMAS', 'CLOUD', 'DESENVOLVIMENTO', 'SEGURANCA_ELECTRONICA');--> statement-breakpoint
CREATE TYPE "public"."codigo_plano" AS ENUM('ESSENCIAL', 'CERTIFICACAO', 'PERFORMANCE', 'CORPORATIVO');--> statement-breakpoint
CREATE TYPE "public"."estado_curso" AS ENUM('RASCUNHO', 'PUBLICADO', 'ARQUIVADO');--> statement-breakpoint
CREATE TYPE "public"."estado_edicao" AS ENUM('PLANEADA', 'INSCRICOES_ABERTAS', 'A_DECORRER', 'CONCLUIDA', 'CANCELADA');--> statement-breakpoint
CREATE TYPE "public"."estado_lead" AS ENUM('NOVO', 'EM_CONTACTO', 'QUALIFICADO', 'GANHO', 'PERDIDO');--> statement-breakpoint
CREATE TYPE "public"."estado_pre_inscricao" AS ENUM('RECEBIDA', 'EM_CONTACTO', 'FACTURA_EMITIDA', 'PAGA', 'CONFIRMADA', 'LISTA_ESPERA', 'EXPIRADA', 'CANCELADA');--> statement-breakpoint
CREATE TYPE "public"."estado_publicacao" AS ENUM('RASCUNHO', 'AGENDADO', 'PUBLICADO', 'ARQUIVADO');--> statement-breakpoint
CREATE TYPE "public"."estado_utilizador" AS ENUM('ACTIVO', 'SUSPENSO', 'DESACTIVADO');--> statement-breakpoint
CREATE TYPE "public"."modalidade" AS ENUM('PRESENCIAL', 'ONLINE', 'HIBRIDO');--> statement-breakpoint
CREATE TYPE "public"."modo_pagamento" AS ENUM('INTEGRAL', 'DUAS_PRESTACOES');--> statement-breakpoint
CREATE TYPE "public"."nivel" AS ENUM('INICIANTE', 'INTERMEDIO', 'AVANCADO');--> statement-breakpoint
CREATE TYPE "public"."papel_utilizador" AS ENUM('ADMINISTRADOR', 'GESTOR_FORMACAO', 'EDITOR_CONTEUDO', 'LEITOR');--> statement-breakpoint
CREATE TYPE "public"."tipo_candidato" AS ENUM('PARTICULAR', 'EMPRESA');--> statement-breakpoint
CREATE TYPE "public"."tipo_oferta" AS ENUM('SERVICO', 'ESPECIALIDADE');--> statement-breakpoint
CREATE TABLE "artigos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"titulo" text NOT NULL,
	"resumo" text,
	"conteudo" text NOT NULL,
	"estado" "estado_publicacao" DEFAULT 'RASCUNHO' NOT NULL,
	"autor_id" uuid,
	"categoria_id" uuid,
	"etiquetas" text[] DEFAULT '{}' NOT NULL,
	"imagem_url" text,
	"seo_titulo" text,
	"seo_descricao" text,
	"publicado_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categorias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"nome" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cursos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"codigo" text NOT NULL,
	"slug" text NOT NULL,
	"titulo" text NOT NULL,
	"certificacao" text,
	"area" "area" NOT NULL,
	"nivel" "nivel" NOT NULL,
	"resumo" text NOT NULL,
	"duracao_horas" integer NOT NULL,
	"formador" text,
	"imagem_capa_url" text,
	"estado" "estado_curso" DEFAULT 'RASCUNHO' NOT NULL,
	"objectivos" text[] DEFAULT '{}' NOT NULL,
	"destinatarios" text[] DEFAULT '{}' NOT NULL,
	"pre_requisitos" text[] DEFAULT '{}' NOT NULL,
	"seo_titulo" text,
	"seo_descricao" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "definicoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chave" text NOT NULL,
	"valor" jsonb NOT NULL,
	"descricao" text,
	"actualizada_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edicoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"curso_id" uuid NOT NULL,
	"codigo" text NOT NULL,
	"modalidade" "modalidade" NOT NULL,
	"local" text,
	"data_inicio" date NOT NULL,
	"data_fim" date NOT NULL,
	"horario" text NOT NULL,
	"capacidade" integer NOT NULL,
	"estado" "estado_edicao" DEFAULT 'PLANEADA' NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizada_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eventos_externos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"origem" text NOT NULL,
	"id_externo" text NOT NULL,
	"processado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"payload_hash" text
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"origem" text NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"telefone" text,
	"empresa" text,
	"mensagem" text,
	"estado" "estado_lead" DEFAULT 'NOVO' NOT NULL,
	"consentimento_em" timestamp with time zone NOT NULL,
	"consentimento_versao" text NOT NULL,
	"responsavel_id" uuid,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modulos_curso" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"curso_id" uuid NOT NULL,
	"titulo" text NOT NULL,
	"topicos" text[] DEFAULT '{}' NOT NULL,
	"posicao" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ofertas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" "tipo_oferta" NOT NULL,
	"slug" text NOT NULL,
	"titulo" text NOT NULL,
	"resumo" text NOT NULL,
	"descricao" text,
	"para_quem" text[] DEFAULT '{}' NOT NULL,
	"entregaveis" text[] DEFAULT '{}' NOT NULL,
	"tecnologias" text[] DEFAULT '{}' NOT NULL,
	"icone" text,
	"estado" "estado_publicacao" DEFAULT 'RASCUNHO' NOT NULL,
	"posicao" integer DEFAULT 0 NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizada_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paginas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"titulo" text NOT NULL,
	"resumo" text,
	"conteudo" text NOT NULL,
	"estado" "estado_publicacao" DEFAULT 'RASCUNHO' NOT NULL,
	"posicao" integer DEFAULT 0 NOT NULL,
	"seo_titulo" text,
	"seo_descricao" text,
	"imagem_url" text,
	"publicada_em" timestamp with time zone,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizada_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parceiros" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"logo_url" text,
	"website" text,
	"estado" "estado_publicacao" DEFAULT 'PUBLICADO' NOT NULL,
	"posicao" integer DEFAULT 0 NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "perguntas_frequentes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pergunta" text NOT NULL,
	"resposta" text NOT NULL,
	"estado" "estado_publicacao" DEFAULT 'PUBLICADO' NOT NULL,
	"posicao" integer DEFAULT 0 NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizada_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pre_inscricoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referencia" text NOT NULL,
	"edicao_id" uuid NOT NULL,
	"plano" "codigo_plano" NOT NULL,
	"modo_pagamento" "modo_pagamento" NOT NULL,
	"preco_aoa" integer NOT NULL,
	"estado" "estado_pre_inscricao" DEFAULT 'RECEBIDA' NOT NULL,
	"tipo_candidato" "tipo_candidato" NOT NULL,
	"nome" text NOT NULL,
	"nif" text NOT NULL,
	"bi_numero" text,
	"morada_linha" text NOT NULL,
	"morada_municipio" text NOT NULL,
	"morada_provincia" text NOT NULL,
	"telefone" text NOT NULL,
	"email" text NOT NULL,
	"pessoa_contacto" text,
	"email_facturacao" text,
	"numero_formandos" integer,
	"como_conheceu" text,
	"observacoes" text,
	"reservada_ate" timestamp with time zone,
	"consentimento_em" timestamp with time zone NOT NULL,
	"consentimento_versao" text NOT NULL,
	"operador_id" uuid,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizada_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "precos_edicao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"edicao_id" uuid NOT NULL,
	"plano" "codigo_plano" NOT NULL,
	"preco_aoa" integer NOT NULL,
	"disponivel" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prestacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pre_inscricao_id" uuid NOT NULL,
	"numero" integer NOT NULL,
	"valor_aoa" integer NOT NULL,
	"factura_cegid" text,
	"factura_emitida_em" timestamp with time zone,
	"paga_em" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "registos_auditoria" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"autor_id" uuid,
	"accao" text NOT NULL,
	"recurso_tipo" text NOT NULL,
	"recurso_id" text,
	"ip" text,
	"antes" jsonb,
	"depois" jsonb,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"utilizador_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"ip" text,
	"user_agent" text,
	"expira_em" timestamp with time zone NOT NULL,
	"revogada_em" timestamp with time zone,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tokens_recuperacao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"expira_em" timestamp with time zone NOT NULL,
	"usado_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transicoes_pre_inscricao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pre_inscricao_id" uuid NOT NULL,
	"de" "estado_pre_inscricao",
	"para" "estado_pre_inscricao" NOT NULL,
	"autor_id" uuid,
	"nota" text,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "utilizadores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"nome" text NOT NULL,
	"password_hash" text NOT NULL,
	"papel" "papel_utilizador" DEFAULT 'LEITOR' NOT NULL,
	"estado" "estado_utilizador" DEFAULT 'ACTIVO' NOT NULL,
	"email_verificado_em" timestamp with time zone,
	"ultimo_acesso_em" timestamp with time zone,
	"mfa_segredo" text,
	"mfa_activado_em" timestamp with time zone,
	"mfa_codigos_recuperacao" text[],
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "artigos" ADD CONSTRAINT "artigos_autor_id_utilizadores_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."utilizadores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artigos" ADD CONSTRAINT "artigos_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edicoes" ADD CONSTRAINT "edicoes_curso_id_cursos_id_fk" FOREIGN KEY ("curso_id") REFERENCES "public"."cursos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_responsavel_id_utilizadores_id_fk" FOREIGN KEY ("responsavel_id") REFERENCES "public"."utilizadores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modulos_curso" ADD CONSTRAINT "modulos_curso_curso_id_cursos_id_fk" FOREIGN KEY ("curso_id") REFERENCES "public"."cursos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pre_inscricoes" ADD CONSTRAINT "pre_inscricoes_edicao_id_edicoes_id_fk" FOREIGN KEY ("edicao_id") REFERENCES "public"."edicoes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pre_inscricoes" ADD CONSTRAINT "pre_inscricoes_operador_id_utilizadores_id_fk" FOREIGN KEY ("operador_id") REFERENCES "public"."utilizadores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "precos_edicao" ADD CONSTRAINT "precos_edicao_edicao_id_edicoes_id_fk" FOREIGN KEY ("edicao_id") REFERENCES "public"."edicoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prestacoes" ADD CONSTRAINT "prestacoes_pre_inscricao_id_pre_inscricoes_id_fk" FOREIGN KEY ("pre_inscricao_id") REFERENCES "public"."pre_inscricoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registos_auditoria" ADD CONSTRAINT "registos_auditoria_autor_id_utilizadores_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."utilizadores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_utilizador_id_utilizadores_id_fk" FOREIGN KEY ("utilizador_id") REFERENCES "public"."utilizadores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transicoes_pre_inscricao" ADD CONSTRAINT "transicoes_pre_inscricao_pre_inscricao_id_pre_inscricoes_id_fk" FOREIGN KEY ("pre_inscricao_id") REFERENCES "public"."pre_inscricoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transicoes_pre_inscricao" ADD CONSTRAINT "transicoes_pre_inscricao_autor_id_utilizadores_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."utilizadores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "artigos_slug_uq" ON "artigos" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "artigos_estado_publicado_ix" ON "artigos" USING btree ("estado","publicado_em");--> statement-breakpoint
CREATE UNIQUE INDEX "categorias_slug_uq" ON "categorias" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "cursos_codigo_uq" ON "cursos" USING btree ("codigo");--> statement-breakpoint
CREATE UNIQUE INDEX "cursos_slug_uq" ON "cursos" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "cursos_estado_area_ix" ON "cursos" USING btree ("estado","area");--> statement-breakpoint
CREATE UNIQUE INDEX "definicoes_chave_uq" ON "definicoes" USING btree ("chave");--> statement-breakpoint
CREATE UNIQUE INDEX "edicoes_codigo_uq" ON "edicoes" USING btree ("codigo");--> statement-breakpoint
CREATE INDEX "edicoes_curso_estado_ix" ON "edicoes" USING btree ("curso_id","estado");--> statement-breakpoint
CREATE INDEX "edicoes_data_inicio_ix" ON "edicoes" USING btree ("data_inicio");--> statement-breakpoint
CREATE UNIQUE INDEX "eventos_externos_uq" ON "eventos_externos" USING btree ("origem","id_externo");--> statement-breakpoint
CREATE INDEX "leads_estado_criado_ix" ON "leads" USING btree ("estado","criado_em");--> statement-breakpoint
CREATE UNIQUE INDEX "modulos_curso_posicao_uq" ON "modulos_curso" USING btree ("curso_id","posicao");--> statement-breakpoint
CREATE INDEX "modulos_curso_curso_ix" ON "modulos_curso" USING btree ("curso_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ofertas_slug_uq" ON "ofertas" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "ofertas_tipo_estado_ix" ON "ofertas" USING btree ("tipo","estado");--> statement-breakpoint
CREATE UNIQUE INDEX "paginas_slug_uq" ON "paginas" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "paginas_estado_ix" ON "paginas" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "parceiros_estado_posicao_ix" ON "parceiros" USING btree ("estado","posicao");--> statement-breakpoint
CREATE INDEX "perguntas_frequentes_estado_posicao_ix" ON "perguntas_frequentes" USING btree ("estado","posicao");--> statement-breakpoint
CREATE UNIQUE INDEX "pre_inscricoes_referencia_uq" ON "pre_inscricoes" USING btree ("referencia");--> statement-breakpoint
CREATE INDEX "pre_inscricoes_edicao_estado_ix" ON "pre_inscricoes" USING btree ("edicao_id","estado");--> statement-breakpoint
CREATE INDEX "pre_inscricoes_expiracao_ix" ON "pre_inscricoes" USING btree ("estado","reservada_ate");--> statement-breakpoint
CREATE INDEX "pre_inscricoes_email_ix" ON "pre_inscricoes" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "precos_edicao_uq" ON "precos_edicao" USING btree ("edicao_id","plano");--> statement-breakpoint
CREATE UNIQUE INDEX "prestacoes_uq" ON "prestacoes" USING btree ("pre_inscricao_id","numero");--> statement-breakpoint
CREATE INDEX "auditoria_recurso_ix" ON "registos_auditoria" USING btree ("recurso_tipo","recurso_id","criado_em");--> statement-breakpoint
CREATE INDEX "auditoria_autor_ix" ON "registos_auditoria" USING btree ("autor_id","criado_em");--> statement-breakpoint
CREATE UNIQUE INDEX "sessoes_token_uq" ON "sessoes" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "sessoes_utilizador_ix" ON "sessoes" USING btree ("utilizador_id","expira_em");--> statement-breakpoint
CREATE UNIQUE INDEX "tokens_recuperacao_uq" ON "tokens_recuperacao" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "tokens_recuperacao_email_ix" ON "tokens_recuperacao" USING btree ("email");--> statement-breakpoint
CREATE INDEX "transicoes_pre_inscricao_ix" ON "transicoes_pre_inscricao" USING btree ("pre_inscricao_id","criada_em");--> statement-breakpoint
CREATE UNIQUE INDEX "utilizadores_email_uq" ON "utilizadores" USING btree ("email");--> statement-breakpoint
CREATE INDEX "utilizadores_papel_estado_ix" ON "utilizadores" USING btree ("papel","estado");