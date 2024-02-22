export const parseLength = (length: number) => {
  const minutes = Math.floor(length / 60);
  const seconds = Math.floor(length % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export const parseLengthHours = (length: number) => {
  const hours = Math.floor(length / 3600);
  const minutes = Math.floor((length % 3600) / 60);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

export const mustNumber = (value: number | null | undefined): number => {
  if (value === null || value === undefined || isNaN(value)) {
    return 0;
  }
  return value;
};
