export const formatDuration = (timeString: string): string => {
  if (!timeString) return "0 min";

  const [hours, minutes] = timeString.split(":");
  const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);

  return `${totalMinutes} min`;
};
