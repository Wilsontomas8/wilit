import { Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTACTOS } from "@/components/site-footer";

/**
 * Encaminha o interesse para os canais que já funcionam, enquanto o registo
 * de pré-inscrições não estiver ligado a uma base de dados.
 */
export function ContactoCTA({
  assunto,
  titulo = "Interessado nesta formação?",
  texto = "Fale connosco e enviamos-lhe o programa completo, as datas da próxima turma e o valor.",
}: {
  assunto: string;
  titulo?: string;
  texto?: string;
}) {
  const corpo = `Olá, tenho interesse na formação: ${assunto}.`;
  const mailto = `mailto:${CONTACTOS.email}?subject=${encodeURIComponent(
    `Interesse em formação — ${assunto}`
  )}&body=${encodeURIComponent(corpo)}`;
  const whatsapp = `${CONTACTOS.whatsapp}?text=${encodeURIComponent(corpo)}`;

  return (
    <div className="flex flex-col gap-4 rounded-[--radius-card] border border-line-strong bg-surface-card p-5">
      <div className="flex flex-col gap-1.5">
        <h3 className="font-semibold text-text-primary">{titulo}</h3>
        <p className="text-[0.9375rem] text-text-secondary">{texto}</p>
      </div>
      <div className="flex flex-col gap-2.5">
        <Button asChild>
          <a href={whatsapp}>
            <MessageCircle aria-hidden="true" />
            Falar por WhatsApp
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href={mailto}>
            <Mail aria-hidden="true" />
            Enviar email
          </a>
        </Button>
      </div>
      <p className="text-xs text-text-muted tnum">
        {CONTACTOS.telefone} · {CONTACTOS.email}
      </p>
    </div>
  );
}
