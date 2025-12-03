import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Formatea fecha/hora en formato Colombiano
 * Ej: 19/09/2025 14:07
 */
export function formatDateTime(dateString: string): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return format(date, "dd/MM/yyyy HH:mm", { locale: es });
}

/**
 * Solo fecha
 * Ej: 19/09/2025
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return format(date, "dd/MM/yyyy", { locale: es });
}

/**
 * Fecha relativa
 * Ej: "hace 5 minutos", "hace 3 días"
 */
export function formatRelativeDate(dateString: string): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true, locale: es });
}
