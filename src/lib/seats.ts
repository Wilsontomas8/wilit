/**
 * Motor de vagas — regras da Adenda A, secção A.4 do SoW v2.1.
 *
 * disponíveis = capacidade − confirmadas − reservadas
 *
 * Esta função é a única fonte de verdade sobre vagas e será partilhada
 * pelo servidor no WP-A.08. O número apresentado publicamente tem de
 * corresponder a este cálculo, sempre.
 */

export type SeatStatus = "open" | "last_seats" | "full";

export interface SeatCounts {
  /** Número máximo de formandos da edição. */
  capacity: number;
  /** Pré-inscrições com pagamento confirmado. Consomem vaga definitivamente. */
  confirmed: number;
  /** Pré-inscrições dentro do prazo de reserva. Consomem vaga temporariamente. */
  reserved: number;
}

export interface SeatAvailability extends SeatCounts {
  available: number;
  taken: number;
  status: SeatStatus;
  /** Percentagem de ocupação, 0 a 100. */
  occupancyPct: number;
}

/**
 * Limiar a partir do qual se assinala "últimas vagas".
 * O menor entre 3 lugares e 20% da capacidade, para que turmas
 * pequenas não fiquem permanentemente em estado de urgência.
 */
export function lastSeatsThreshold(capacity: number): number {
  return Math.max(1, Math.min(3, Math.ceil(capacity * 0.2)));
}

export function computeSeats(counts: SeatCounts): SeatAvailability {
  const capacity = Math.max(0, counts.capacity);
  const confirmed = Math.max(0, counts.confirmed);
  const reserved = Math.max(0, counts.reserved);

  const taken = confirmed + reserved;
  // Nunca negativo: uma sobrelotação por correcção manual não deve
  // produzir um número absurdo na página pública.
  const available = Math.max(0, capacity - taken);

  const status: SeatStatus =
    available === 0
      ? "full"
      : available <= lastSeatsThreshold(capacity)
        ? "last_seats"
        : "open";

  return {
    capacity,
    confirmed,
    reserved,
    taken,
    available,
    status,
    occupancyPct: capacity === 0 ? 100 : Math.min(100, Math.round((taken / capacity) * 100)),
  };
}

/**
 * Texto apresentado ao público.
 * Regra da A.4: o formulário nunca fecha — quando esgota, entra lista de espera.
 */
export function seatLabel(a: SeatAvailability): string {
  if (a.status === "full") return "Esgotado — lista de espera";
  if (a.available === 1) return "Última vaga";
  if (a.status === "last_seats") return `Últimas ${a.available} vagas`;
  return `${a.available} vagas disponíveis`;
}
