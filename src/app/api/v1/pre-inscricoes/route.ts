import { NextResponse } from "next/server";
import {
  calcularPrestacoes,
  preInscricaoInputSchema,
  type PreInscricaoResposta,
} from "@/contracts";
import { computeSeats } from "@/lib/seats";
import { COURSES, DADOS_PUBLICAVEIS } from "@/data/courses";

/**
 * Recepção de pré-inscrições — implementação simulada do WP-A.05.
 *
 * Enquanto não existe base de dados (WP-A.06), este handler valida contra o
 * contrato real e devolve a forma real da resposta. Quando o servidor chegar,
 * troca-se o corpo e a interface não muda.
 *
 * NÃO PERSISTE. Uma submissão feita aqui não fica registada em lado nenhum.
 */

/** Prazo de reserva. Valor a fixar na decisão D-11; cinco dias úteis é a proposta. */
const DIAS_RESERVA = 5;

function proximosDiasUteis(dias: number): Date {
  const d = new Date();
  let restantes = dias;
  while (restantes > 0) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) restantes--;
  }
  return d;
}

let contador = 41;

export async function POST(request: Request) {
  // Defesa em profundidade: esconder o formulário na interface não chega,
  // porque qualquer pessoa pode fazer POST directamente. Enquanto não houver
  // persistência, o servidor recusa em vez de aceitar e deitar fora.
  if (!DADOS_PUBLICAVEIS) {
    return NextResponse.json(
      {
        erro: "inscricoes_fechadas",
        mensagem:
          "As inscrições online ainda não estão activas. Contacte-nos por email para geral@wilit.ao ou pelo WhatsApp +244 975 698 019.",
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { erro: "corpo_invalido", mensagem: "O pedido não contém JSON válido." },
      { status: 400 }
    );
  }

  const parsed = preInscricaoInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        erro: "validacao",
        mensagem: "Alguns campos não estão preenchidos correctamente.",
        campos: parsed.error.issues.map((i) => ({
          campo: i.path.join("."),
          mensagem: i.message,
        })),
      },
      { status: 422 }
    );
  }

  const input = parsed.data;

  // A edição tem de existir e estar aberta.
  const curso = COURSES.find((c) =>
    c.editions.some((e) => e.id === input.edicaoId)
  );
  const edicao = curso?.editions.find((e) => e.id === input.edicaoId);

  if (!curso || !edicao || edicao.status !== "inscricoes_abertas") {
    return NextResponse.json(
      {
        erro: "edicao_indisponivel",
        mensagem: "Esta turma já não está a aceitar inscrições.",
      },
      { status: 409 }
    );
  }

  // O plano tem de estar disponível nesta edição, e o preço vem do servidor —
  // nunca do que o cliente enviar.
  const preco = edicao.prices.find(
    (p) => p.plan === input.plano && p.available && p.priceAOA > 0
  );
  if (!preco) {
    return NextResponse.json(
      {
        erro: "plano_indisponivel",
        mensagem: "O plano escolhido não está disponível nesta turma.",
      },
      { status: 409 }
    );
  }

  const seats = computeSeats({
    capacity: edicao.capacity,
    confirmed: edicao.confirmedCount,
    reserved: edicao.reservedCount,
  });

  // Regra da secção A.4: o formulário nunca fecha por falta de vagas.
  const emListaEspera = seats.available === 0;

  const resposta: PreInscricaoResposta = {
    referencia: `PI-${new Date().getFullYear()}-${String(++contador).padStart(4, "0")}`,
    estado: emListaEspera ? "lista_espera" : "recebida",
    reservadaAte: emListaEspera
      ? null
      : proximosDiasUteis(DIAS_RESERVA).toISOString(),
    emListaEspera,
  };

  // Aqui entrarão, no WP-A.09 e WP-A.10: persistência, reserva de vaga
  // com protecção de concorrência, e os emails ao candidato e à WIL IT.
  void calcularPrestacoes(preco.priceAOA, input.modoPagamento);

  return NextResponse.json(resposta, { status: 201 });
}
