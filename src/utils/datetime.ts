export function toHoursAndMinutes(isoString: string): string {
  const date = new Date(isoString);

  const hh = date.getUTCHours().toString().padStart(2, "0");
  const mm = date.getUTCMinutes().toString().padStart(2, "0");

  return `${hh}:${mm}`;
}
