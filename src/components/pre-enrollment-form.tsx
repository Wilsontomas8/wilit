"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Building2, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, FieldError, Hint, Input, Label, Select, Textarea } from "@/components/ui/field";
import { cn, formatAOA } from "@/lib/utils";
import {
  MODO_PAGAMENTO_LABEL,
  PLANS,
  PROVINCIAS,
  calcularPrestacoes,
  preInscricaoInputSchema,
  type CourseEdition,
  type CourseWithEditions,
  type ModoPagamento,
  type PlanCode,
  type PreInscricaoInput,
} from "@/contracts";

/** Versão do texto de consentimento. Muda sempre que o texto mudar. */
export const CONSENTIMENTO_VERSAO = "2026-09-v1";

type Props = { course: CourseWithEditions; edition: CourseEdition };

const moradaVazia = { line: "", city: "", provincia: "Luanda" as const };

function RadioCard({
  checked,
  children,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { checked: boolean }) {
  return (
    <label
      className={cn(
        "relative flex cursor-pointer gap-3 rounded-[--radius-card] border p-4 transition-colors",
        checked
          ? "border-brand-solid bg-brand-soft"
          : "border-line-strong bg-surface-card hover:bg-surface-sunken"
      )}
    >
      <input
        type="radio"
        checked={checked}
        className="mt-0.5 size-4 shrink-0 accent-[--brand-solid]"
        {...props}
      />
      <span className="flex-1">{children}</span>
    </label>
  );
}

export function PreEnrollmentForm({ course, edition }: Props) {
  const router = useRouter();
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const planosDisponiveis = edition.prices.filter(
    (p) => p.available && p.priceAOA > 0
  );

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PreInscricaoInput>({
    resolver: zodResolver(preInscricaoInputSchema),
    mode: "onTouched",
    defaultValues: {
      edicaoId: edition.id,
      plano: planosDisponiveis[0]?.plan,
      modoPagamento: "integral",
      candidato: {
        tipo: "particular",
        nomeCompleto: "",
        nif: "",
        biNumero: "",
        morada: moradaVazia,
        telefone: "",
        email: "",
      },
      observacoes: "",
    },
  });

  /**
   * O tipo de candidato decide QUE campos existem, por isso vive em estado de
   * React e não em watch(): setValue sobre o objecto candidato inteiro não
   * garante a re-renderização, e o radio voltava sozinho ao estado anterior.
   */
  const [tipo, setTipo] = useState<"particular" | "empresa">("particular");
  const plano = watch("plano");
  const modo = watch("modoPagamento");

  const precoAOA = useMemo(
    () => planosDisponiveis.find((p) => p.plan === plano)?.priceAOA ?? 0,
    [plano, planosDisponiveis]
  );
  const prestacoes = useMemo(
    () => calcularPrestacoes(precoAOA, modo),
    [precoAOA, modo]
  );

  /** Trocar de tipo substitui o subformulário; os campos não são compatíveis. */
  function trocarTipo(novo: "particular" | "empresa") {
    if (novo === tipo) return;
    setTipo(novo);
    setValue(
      "candidato",
      novo === "particular"
        ? {
            tipo: "particular",
            nomeCompleto: "",
            nif: "",
            biNumero: "",
            morada: moradaVazia,
            telefone: "",
            email: "",
          }
        : {
            tipo: "empresa",
            designacaoSocial: "",
            nif: "",
            morada: moradaVazia,
            pessoaContacto: "",
            telefone: "",
            email: "",
            numeroFormandos: 1,
          },
      { shouldValidate: false }
    );
  }

  async function onSubmit(data: PreInscricaoInput) {
    setErroGeral(null);
    try {
      const res = await fetch("/api/v1/pre-inscricoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setErroGeral(
          json?.mensagem ??
            "Não foi possível registar a pré-inscrição. Tente novamente."
        );
        return;
      }
      const params = new URLSearchParams({
        ref: json.referencia,
        espera: String(json.emListaEspera),
      });
      if (json.reservadaAte) params.set("ate", json.reservadaAte);
      router.push(`/pre-inscricao/obrigado?${params}`);
    } catch {
      setErroGeral(
        "Não conseguimos contactar o servidor. Verifique a ligação e tente novamente."
      );
    }
  }

  const cand = errors.candidato as Record<string, { message?: string }> | undefined;
  const err = (k: string) => cand?.[k]?.message;

  /**
   * Rede de segurança: se a validação falhar num campo cujo erro não esteja
   * a ser mostrado, o formulário deixaria de submeter sem explicar porquê.
   * Aqui isso vira uma mensagem visível em vez de um botão que não faz nada.
   */
  function onInvalid() {
    setErroGeral(
      "Há campos por corrigir. Verifique as mensagens a vermelho e tente novamente."
    );
    document
      .querySelector('[aria-invalid="true"]')
      ?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  return (
    <form
      // preventDefault explícito: sem ele o browser fazia submissão nativa GET,
      // recarregava a página sem o parâmetro `edicao` e caía no 404.
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit(onSubmit, onInvalid)(e);
      }}
      className="flex flex-col gap-8"
      noValidate
    >
      {/* ---------- Plano ---------- */}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-lg font-bold text-text-primary">
          1. Escolha o plano
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {planosDisponiveis.map((p) => {
            const info = PLANS[p.plan];
            return (
              <RadioCard
                key={p.plan}
                value={p.plan}
                checked={plano === p.plan}
                {...register("plano")}
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-text-primary">{info.name}</span>
                  <span className="shrink-0 font-display font-bold text-text-primary tnum">
                    {formatAOA(p.priceAOA)}
                  </span>
                </span>
                <span className="mt-1 block text-sm text-text-secondary">
                  {info.tagline}
                </span>
              </RadioCard>
            );
          })}
        </div>
        <FieldError>{errors.plano?.message}</FieldError>
      </fieldset>

      {/* ---------- Pagamento ---------- */}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-lg font-bold text-text-primary">
          2. Modo de pagamento
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(["integral", "duas_prestacoes"] as ModoPagamento[]).map((m) => {
            const parcelas = calcularPrestacoes(precoAOA, m);
            return (
              <RadioCard
                key={m}
                value={m}
                checked={modo === m}
                {...register("modoPagamento")}
              >
                <span className="block font-semibold text-text-primary">
                  {MODO_PAGAMENTO_LABEL[m]}
                </span>
                <span className="mt-1 block text-sm text-text-secondary tnum">
                  {m === "integral"
                    ? formatAOA(parcelas[0].valorAOA)
                    : parcelas.map((p) => formatAOA(p.valorAOA)).join(" + ")}
                </span>
              </RadioCard>
            );
          })}
        </div>
        {modo === "duas_prestacoes" && (
          <Hint>
            A segunda prestação é facturada separadamente. Ambas as facturas são
            emitidas pela WIL IT e enviadas por email.
          </Hint>
        )}
      </fieldset>

      {/* ---------- Dados ---------- */}
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 text-lg font-bold text-text-primary">
          3. Os seus dados
        </legend>
        <Hint>
          Estes dados são usados para emitir a factura, por isso devem
          corresponder exactamente ao documento de identificação ou ao registo
          comercial.
        </Hint>

        <div className="grid gap-3 sm:grid-cols-2">
          <RadioCard
            value="particular"
            checked={tipo === "particular"}
            name="tipoCandidato"
            onChange={() => trocarTipo("particular")}
          >
            <span className="flex items-center gap-2 font-semibold text-text-primary">
              <User className="size-4" aria-hidden="true" /> Particular
            </span>
            <span className="mt-1 block text-sm text-text-secondary">
              Inscrevo-me a título individual
            </span>
          </RadioCard>
          <RadioCard
            value="empresa"
            checked={tipo === "empresa"}
            name="tipoCandidato"
            onChange={() => trocarTipo("empresa")}
          >
            <span className="flex items-center gap-2 font-semibold text-text-primary">
              <Building2 className="size-4" aria-hidden="true" /> Empresa
            </span>
            <span className="mt-1 block text-sm text-text-secondary">
              A factura é emitida à empresa
            </span>
          </RadioCard>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {tipo === "particular" ? (
            <>
              <Field className="sm:col-span-2">
                <Label htmlFor="nomeCompleto" required>Nome completo</Label>
                <Input
                  id="nomeCompleto"
                  autoComplete="name"
                  aria-invalid={!!err("nomeCompleto")}
                  {...register("candidato.nomeCompleto")}
                />
                <FieldError>{err("nomeCompleto")}</FieldError>
              </Field>
              <Field>
                <Label htmlFor="nif" required>NIF</Label>
                <Input id="nif" aria-invalid={!!err("nif")} {...register("candidato.nif")} />
                <Hint>Para pessoa singular é o número do bilhete de identidade.</Hint>
                <FieldError>{err("nif")}</FieldError>
              </Field>
              <Field>
                <Label htmlFor="biNumero" required>Nº do bilhete de identidade</Label>
                <Input id="biNumero" aria-invalid={!!err("biNumero")} {...register("candidato.biNumero")} />
                <FieldError>{err("biNumero")}</FieldError>
              </Field>
            </>
          ) : (
            <>
              <Field className="sm:col-span-2">
                <Label htmlFor="designacaoSocial" required>Designação social</Label>
                <Input
                  id="designacaoSocial"
                  autoComplete="organization"
                  aria-invalid={!!err("designacaoSocial")}
                  {...register("candidato.designacaoSocial")}
                />
                <FieldError>{err("designacaoSocial")}</FieldError>
              </Field>
              <Field>
                <Label htmlFor="nif" required>NIF da empresa</Label>
                <Input id="nif" aria-invalid={!!err("nif")} {...register("candidato.nif")} />
                <FieldError>{err("nif")}</FieldError>
              </Field>
              <Field>
                <Label htmlFor="numeroFormandos" required>Número de formandos</Label>
                <Input
                  id="numeroFormandos"
                  type="number"
                  min={1}
                  aria-invalid={!!err("numeroFormandos")}
                  {...register("candidato.numeroFormandos", { valueAsNumber: true })}
                />
                <FieldError>{err("numeroFormandos")}</FieldError>
              </Field>
              <Field className="sm:col-span-2">
                <Label htmlFor="pessoaContacto" required>Pessoa de contacto</Label>
                <Input id="pessoaContacto" aria-invalid={!!err("pessoaContacto")} {...register("candidato.pessoaContacto")} />
                <FieldError>{err("pessoaContacto")}</FieldError>
              </Field>
            </>
          )}

          <Field className="sm:col-span-2">
            <Label htmlFor="line" required>
              {tipo === "empresa" ? "Morada da sede" : "Morada"}
            </Label>
            <Input id="line" autoComplete="street-address" {...register("candidato.morada.line")} />
            <FieldError>
              {(errors.candidato as { morada?: { line?: { message?: string } } })?.morada?.line?.message}
            </FieldError>
          </Field>
          <Field>
            <Label htmlFor="city" required>Município</Label>
            <Input id="city" {...register("candidato.morada.city")} />
            <FieldError>
              {(errors.candidato as { morada?: { city?: { message?: string } } })?.morada?.city?.message}
            </FieldError>
          </Field>
          <Field>
            <Label htmlFor="provincia" required>Província</Label>
            <Controller
              control={control}
              name="candidato.morada.provincia"
              render={({ field }) => (
                <Select id="provincia" {...field}>
                  {PROVINCIAS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </Select>
              )}
            />
          </Field>

          <Field>
            <Label htmlFor="telefone" required>Telefone</Label>
            <Input
              id="telefone"
              type="tel"
              inputMode="tel"
              placeholder="+244 923 456 789"
              autoComplete="tel"
              aria-invalid={!!err("telefone")}
              {...register("candidato.telefone")}
            />
            <FieldError>{err("telefone")}</FieldError>
          </Field>
          <Field>
            <Label htmlFor="email" required>Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!err("email")}
              {...register("candidato.email")}
            />
            <FieldError>{err("email")}</FieldError>
          </Field>

          {tipo === "empresa" && (
            <Field className="sm:col-span-2">
              <Label htmlFor="emailFacturacao">Email de facturação</Label>
              <Input
                id="emailFacturacao"
                type="email"
                {...register("candidato.emailFacturacao", {
                  setValueAs: (v) => (v === "" ? undefined : v),
                })}
              />
              <Hint>Preencha apenas se for diferente do email de contacto.</Hint>
            </Field>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="comoConheceu">Como soube desta formação?</Label>
            <Select
              id="comoConheceu"
              defaultValue=""
              {...register("comoConheceu", {
                // A opção vazia envia "", que não é membro do enum.
                setValueAs: (v) => (v === "" ? undefined : v),
              })}
            >
              <option value="">Prefiro não dizer</option>
              <option value="pesquisa">Pesquisa na internet</option>
              <option value="redes_sociais">Redes sociais</option>
              <option value="recomendacao">Recomendação</option>
              <option value="empresa">Através da minha empresa</option>
              <option value="outro">Outro</option>
            </Select>
          </Field>
          <Field className="sm:col-span-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea id="observacoes" rows={3} {...register("observacoes")} />
          </Field>
        </div>
      </fieldset>

      {/* ---------- Consentimento ---------- */}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-lg font-bold text-text-primary">
          4. Consentimento
        </legend>
        <label className="flex cursor-pointer gap-3 rounded-[--radius-card] border border-line-strong bg-surface-card p-4">
          <input
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 accent-[--brand-solid]"
            aria-invalid={!!errors.consentimento}
            {...register("consentimento")}
          />
          <span className="text-sm text-text-secondary">
            Autorizo a WIL IT Soluções a tratar os meus dados pessoais e fiscais
            para efeitos de gestão desta pré-inscrição e emissão da respectiva
            factura. Os dados são conservados enquanto durar a relação de
            formação e podem ser corrigidos ou eliminados a pedido, através de{" "}
            <a href="mailto:geral@wilit.ao" className="text-brand-text underline underline-offset-2">
              geral@wilit.ao
            </a>
            .
          </span>
        </label>
        <FieldError>{errors.consentimento?.message}</FieldError>
      </fieldset>

      {erroGeral && (
        <div
          role="alert"
          className="flex gap-3 rounded-[--radius-card] border border-crit bg-crit-soft p-4"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-crit" aria-hidden="true" />
          <p className="text-sm text-text-primary">{erroGeral}</p>
        </div>
      )}

      <Card>
        <CardBody className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <h3 className="font-semibold text-text-primary">Resumo</h3>
            <p className="text-sm text-text-secondary">
              {course.title} · turma {edition.code}
            </p>
            <div className="mt-1 flex items-baseline justify-between gap-3">
              <span className="text-sm text-text-secondary">
                {plano ? PLANS[plano as PlanCode].name : "—"} ·{" "}
                {MODO_PAGAMENTO_LABEL[modo]}
              </span>
              <span className="font-display text-xl font-bold text-text-primary tnum">
                {formatAOA(precoAOA)}
              </span>
            </div>
            {modo === "duas_prestacoes" && (
              <p className="text-sm text-text-muted tnum">
                {prestacoes
                  .map((p) => `${p.numero}.ª: ${formatAOA(p.valorAOA)}`)
                  .join(" · ")}
              </p>
            )}
          </div>

          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
            {isSubmitting ? "A submeter…" : "Submeter pré-inscrição"}
          </Button>

          <p className="text-xs text-text-muted">
            A submissão não confirma a vaga. Reservamos o seu lugar enquanto
            emitimos a factura e confirmamos o pagamento.
          </p>
        </CardBody>
      </Card>
    </form>
  );
}
