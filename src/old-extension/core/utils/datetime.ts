export namespace DateTime {
  export function toHoursAndMinutes(isoString: string): string;
  export function toHoursAndMinutes(date: Date): string;

  export function toHoursAndMinutes(input: string | Date): string {
    const date = typeof input === "string" ? new Date(input) : input;
    const hh = date.getUTCHours().toString().padStart(2, "0");
    const mm = date.getUTCMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}`;
  }
}
