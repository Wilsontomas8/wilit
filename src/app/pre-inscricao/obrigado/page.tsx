import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock3, Mail } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CONTACTOS } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pré-inscrição recebida",
  robots: { index: false },
};

type SearchParams = Promise<{ [k: string]: string | string[] | undefined }>;

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ObrigadoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const referencia = one(sp.ref);
  const emEspera = one(sp.espera) === "true";
  const ate = one(sp.ate);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-5 py-16">
          <div
            className={`flex size-12 items-center justify-center rounded-full ${
              emEspera ? "bg-warn-soft" : "bg-ok-soft"
            }`}
          >
            {emEspera ? (
              <Clock3 className="size-6 text-warn" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="size-6 text-ok" aria-hidden="true" />
            )}
          </div>

          <h1 className="mt-5 text-3xl font-bold text-text-primary">
            {emEspera
              ? "Está na lista de espera"
              : "Pré-inscrição recebida"}
          </h1>

          <p className="mt-4 text-lg text-text-secondary">
            {emEspera ? (
              <>
                A turma está cheia, mas o seu pedido ficou registado. Assim que
                houver uma desistência ou abrirmos nova edição, contactamo-lo
                pela ordem de chegada.
              </>
            ) : (
              <>
                Recebemos os seus dados e reservámos o seu lugar.{" "}
                <strong>Isto ainda não é uma confirmação de vaga</strong> — a
                vaga fica garantida quando o pagamento estiver confirmado.
              </>
            )}
          </p>

          {referencia && (
            <Card className="mt-8">
              <CardBody className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    A sua referência
                  </span>
                  <span className="font-mono text-2xl font-bold text-text-primary tnum">
                    {referencia}
                  </span>
                  <span className="text-sm text-text-secondary">
                    Guarde esta referência. Use-a sempre que falar connosco sobre
                    esta inscrição.
                  </span>
                </div>

                {!emEspera && ate && (
                  <div className="flex flex-col gap-1 border-t border-line-subtle pt-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Lugar reservado até
                    </span>
                    <span className="font-semibold text-text-primary tnum">
                      {formatDate(ate)}
                    </span>
                    <span className="text-sm text-text-secondary">
                      Passada esta data sem confirmação de pagamento, a vaga
                      volta a ficar disponível. Avisamo-lo antes disso acontecer.
                    </span>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          <section className="mt-8 flex flex-col gap-3">
            <h2 className="text-lg font-bold text-text-primary">
              O que acontece a seguir
            </h2>
            <ol className="flex flex-col gap-3">
              {(emEspera
                ? [
                    "Fica registado na lista de espera desta turma.",
                    "Se abrir uma vaga, contactamo-lo por email ou telefone.",
                    "A partir daí o processo é o normal: factura, pagamento e confirmação.",
                  ]
                : [
                    "Vai receber um email a confirmar que a pré-inscrição chegou.",
                    "A WIL IT emite a factura e envia-lha por email.",
                    "Depois de confirmado o pagamento, a vaga fica garantida.",
                    "Recebe a confirmação final com os detalhes da turma.",
                  ]
              ).map((t, i) => (
                <li key={t} className="flex gap-3 text-[0.9375rem] text-text-secondary">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-text tnum">
                    {i + 1}
                  </span>
                  {t}
                </li>
              ))}
            </ol>
          </section>

          <div className="mt-8 rounded-[--radius-card] border border-line-subtle bg-surface-sunken p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Mail className="size-4 text-text-muted" aria-hidden="true" />
              Não recebeu o email?
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Verifique a pasta de spam. Se ainda assim não aparecer, escreva
              para{" "}
              <a
                href={`mailto:${CONTACTOS.email}`}
                className="text-brand-text underline underline-offset-2"
              >
                {CONTACTOS.email}
              </a>{" "}
              ou fale connosco pelo WhatsApp para{" "}
              <a
                href={CONTACTOS.whatsapp}
                className="text-brand-text underline underline-offset-2 tnum"
              >
                {CONTACTOS.telefone}
              </a>
              , indicando a sua referência.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/cursos">Ver outros cursos</Link>
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
