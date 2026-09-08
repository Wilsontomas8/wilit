import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formata valores em kwanza. Angola usa espaço como separador de milhares e vírgula decimal. */
export function formatAOA(value: number, opts?: { decimals?: boolean }) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: opts?.decimals ? 2 : 0,
    maximumFractionDigits: opts?.decimals ? 2 : 0,
  }).format(value);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("pt-AO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function formatDateShort(date: string | Date) {
  return new Intl.DateTimeFormat("pt-AO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(typeof date === "string" ? new Date(date) : date);
}
