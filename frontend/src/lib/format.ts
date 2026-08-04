/**
 * "Posted 3 months ago" — the old app leaned on timeago.js for this; a few lines of
 * Intl.RelativeTimeFormat does the same job without the dependency.
 */
const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

export function timeAgo(iso: string): string {
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  let duration = (new Date(iso).getTime() - Date.now()) / 1000;

  for (const division of DIVISIONS) {
    const rounded = Math.round(duration);

    // Carry when rounding lands exactly on the boundary, so a year ago reads as
    // "last year" rather than "12 months ago".
    if (Math.abs(rounded) < division.amount) {
      return formatter.format(rounded, division.unit);
    }

    duration /= division.amount;
  }

  return "";
}

/**
 * The API keeps money as a string so large rupiah values never lose precision.
 */
export function formatMoney(currency: string, amount: string): string {
  const value = Number(amount);

  if (!Number.isFinite(value) || value <= 0) {
    return "Unpaid";
  }

  return `${value.toLocaleString("id-ID")},- ${currency}`;
}

/**
 * An experience's span, as the original's CV block read it. A null end date means the
 * work is still going.
 */
export function formatDateRange(start: string, end: string | null): string {
  const format = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });

  return `${format(start)} — ${end ? format(end) : "Present"}`;
}
