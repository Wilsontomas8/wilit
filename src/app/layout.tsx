import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";

/**
 * Fontes auto-alojadas em vez de next/font/google.
 * Duas razões: o build deixa de depender de rede externa, e nenhum
 * pedido do visitante chega ao Google — relevante para a política de
 * privacidade exigida no WP-A.11.
 */
import "@fontsource-variable/archivo";
import "@fontsource/source-sans-3/400.css";
import "@fontsource/source-sans-3/600.css";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "WIL IT Soluções — Tecnologia, Serviços e Formação",
    template: "%s · WIL IT Soluções",
  },
  description:
    "Formação certificada em redes, cibersegurança, sistemas e cloud. Cursos e bootcamps presenciais e online em Luanda.",
  metadataBase: new URL("https://wilit.ao"),
  openGraph: {
    type: "website",
    locale: "pt_AO",
    siteName: "WIL IT Soluções",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-AO" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
