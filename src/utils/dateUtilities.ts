export const convertToISOWithTime = (
  dateString: string,
  includeTime: boolean = false,
  hours?: number,
  minutes?: number,
  seconds?: number,
  milliseconds?: number
): string => {
  const date = new Date(dateString);

  const timeProvided =
    hours !== undefined || minutes !== undefined || seconds !== undefined || milliseconds !== undefined;

  if (includeTime || timeProvided) {
    date.setHours(hours ?? 0, minutes ?? 0, seconds ?? 0, milliseconds ?? 0);
    return date.toISOString();
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
