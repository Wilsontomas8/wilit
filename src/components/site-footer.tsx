import Image from "next/image";
import Link from "next/link";
import { Globe, Mail, MessageCircle } from "lucide-react";

/** Contactos oficiais, conforme o portfólio de serviços 2026. */
export const CONTACTOS = {
  site: "www.wilit.ao",
  email: "geral@wilit.ao",
  telefone: "+244 975 698 019",
  whatsapp: "https://wa.me/244975698019",
} as const;

const ESPECIALIDADES = [
  "Redes e Infraestrutura de TI",
  "Sistemas e Virtualização",
  "Desenvolvimento Web e Aplicações",
  "Formação Profissional",
  "Cibersegurança",
  "Segurança Electrónica",
];

export function SiteFooter() {
  return (
    <footer id="contacto" className="mt-20 border-t border-line-subtle bg-surface-sunken">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <Image src="/brand/logo-192.png" alt="" width={40} height={40} className="rounded-lg" />
            <div className="flex flex-col">
              <span className="font-display text-base font-bold text-text-primary">WIL IT</span>
              <span className="text-xs text-text-muted">Soluções Tecnológicas</span>
            </div>
          </div>
          <p className="max-w-[34ch] text-sm text-text-secondary">
            Inovamos a tecnologia, conectamos negócios e transformamos carreiras.
          </p>
          <p className="text-xs text-text-muted">
            WIL IT Soluções — Tecnologia, Serviços e Formação (SU), LDA
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-text-primary">Especialidades</h2>
          <ul className="flex flex-col gap-1.5">
            {ESPECIALIDADES.map((e) => (
              <li key={e} className="text-sm text-text-secondary">
                {e}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-text-primary">Formação</h2>
          <ul className="flex flex-col gap-1.5">
            <li>
              <Link href="/cursos" className="text-sm text-text-secondary hover:text-brand-text">
                Catálogo de cursos
              </Link>
            </li>
            <li>
              <Link href="/cursos?area=redes" className="text-sm text-text-secondary hover:text-brand-text">
                Redes e infraestrutura
              </Link>
            </li>
            <li>
              <Link href="/cursos?area=ciberseguranca" className="text-sm text-text-secondary hover:text-brand-text">
                Cibersegurança
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-text-primary">Contacto</h2>
          <ul className="flex flex-col gap-2.5">
            <li>
              <a
                href={`https://${CONTACTOS.site}`}
                className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-brand-text"
              >
                <Globe className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
                {CONTACTOS.site}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${CONTACTOS.email}`}
                className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-brand-text"
              >
                <Mail className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
                {CONTACTOS.email}
              </a>
            </li>
            <li>
              <a
                href={CONTACTOS.whatsapp}
                className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-brand-text"
              >
                <MessageCircle className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
                <span className="tnum">{CONTACTOS.telefone}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line-subtle">
        <div className="mx-auto max-w-6xl px-5 py-5">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} WIL IT Soluções (SU), LDA. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
