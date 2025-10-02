export const convertToISOWithTime = (
  dateString: string,
  hours: number = 0,
  minutes: number = 0,
  seconds: number = 0,
  milliseconds: number = 0
): string => {
  const date = new Date(dateString);

  if (hours || minutes) date.setHours(hours, minutes, seconds, milliseconds);

  return date.toISOString();
};
