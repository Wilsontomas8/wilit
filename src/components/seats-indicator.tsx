import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { seatLabel, type SeatAvailability } from "@/lib/seats";

const toneByStatus = {
  open: "ok",
  last_seats: "warn",
  full: "neutral",
} as const;

export function SeatsBadge({ seats }: { seats: SeatAvailability }) {
  return (
    <Badge tone={toneByStatus[seats.status]}>
      <Users aria-hidden="true" />
      <span className="tnum">{seatLabel(seats)}</span>
    </Badge>
  );
}

/** Barra de ocupação com o número, para a página de curso. */
export function SeatsMeter({
  seats,
  className,
}: {
  seats: SeatAvailability;
  className?: string;
}) {
  const barTone =
    seats.status === "full"
      ? "bg-line-strong"
      : seats.status === "last_seats"
        ? "bg-accent-solid"
        : "bg-brand-solid";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {/* Empilhado, não lado a lado: em cartões estreitos o texto de estado
          pode ter duas linhas e partia o alinhamento entre cartões irmãos. */}
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-text-primary tnum">
          {seatLabel(seats)}
        </span>
        <span className="text-xs text-text-muted tnum">
          {seats.taken}/{seats.capacity} lugares ocupados
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken"
        role="progressbar"
        aria-valuenow={seats.occupancyPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Ocupação da turma"
      >
        <div
          className={cn("h-full rounded-full transition-[width]", barTone)}
          style={{ width: `${seats.occupancyPct}%` }}
        />
      </div>
    </div>
  );
}
