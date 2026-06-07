// src/utils/formatters.ts

/**
 * Formats a ISO date string into a friendly Turkish date format.
 * Example: 2026-06-04T11:18:38 -> "04 Haz 2026 11:18"
 */
export const formatDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Formats time durations into readable string representation.
 * Example: 125 -> "2 sa 5 dk" or 45 -> "45 dk"
 */
export const formatDuration = (minutes: number | undefined): string => {
  if (minutes === undefined || minutes === null) return '-';
  if (minutes < 60) return `${minutes} dk`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  
  if (remainingMins === 0) return `${hours} sa`;
  return `${hours} sa ${remainingMins} dk`;
};

/**
 * Formats currency (USD) for LLM Costs.
 * Example: 0.1245 -> "$0.125" or 12.5 -> "$12.50"
 */
export const formatCurrency = (val: number | undefined): string => {
  if (val === undefined || val === null) return '$0.00';
  
  // High precision for small token amounts
  if (val > 0 && val < 0.01) {
    return `$${val.toFixed(5)}`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  }).format(val);
};

/**
 * Formats values to Turkish percentage format (symbol first).
 * Example: 85 -> "%85"
 */
export const formatPercent = (val: number | undefined): string => {
  if (val === undefined || val === null) return '%0';
  return `%${Math.round(val)}`;
};
