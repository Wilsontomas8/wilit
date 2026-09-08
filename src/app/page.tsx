import { redirect } from "next/navigation";

/**
 * Provisório: o portal institucional entra no WP-A.12. Até lá, a raiz
 * encaminha para o catálogo, que é a funcionalidade prioritária.
 */
export default function Home() {
  redirect("/cursos");
}
