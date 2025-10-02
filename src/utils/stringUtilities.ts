export const truncate = (str: string, maxLength: number): string => {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
};

export const truncateSplit = (str: string, delimiter: string, maxParts: number): string => {
  if (!str) return "";
  const parts = str.split(delimiter);
  if (parts.length <= maxParts) return str;
  return parts.slice(0, maxParts).join(delimiter) + "…";
};
