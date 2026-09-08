import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/cursos", label: "Formação" },
  { href: "/#servicos", label: "Serviços" },
  { href: "/#especialidades", label: "Especialidades" },
  { href: "/#contacto", label: "Contacto" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line-subtle bg-surface-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-[--radius-control]"
          aria-label="WIL IT Soluções — página inicial"
        >
          <Image
            src="/brand/logo-192.png"
            alt=""
            width={36}
            height={36}
            className="rounded-lg"
            priority
          />
          <span className="font-display text-base font-bold tracking-tight text-text-primary">
            WIL IT
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Principal">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[--radius-control] px-3 py-2 text-[0.9375rem] font-medium text-text-secondary transition-colors hover:bg-surface-sunken hover:text-text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/cursos">Ver cursos</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
