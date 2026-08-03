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
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit);
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
