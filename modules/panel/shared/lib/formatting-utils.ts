export const formatDuration = (timeString: string): string => {
  if (!timeString) return "0 min";

  const [hours, minutes] = timeString.split(":");
  const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);

  return `${totalMinutes} min`;
};

export const truncateFirstLine = (
  text: string | null | undefined,
  maxLength: number = 48,
): string | null => {
  if (!text) return null;
  const firstLine = text.split(/\r?\n/)[0];
  if (firstLine.length > maxLength) {
    return firstLine.slice(0, maxLength) + " ...";
  }
  return firstLine;
};
