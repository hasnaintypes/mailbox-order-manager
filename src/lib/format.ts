const dateTime = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

export const formatDateTime = (value: Date) => `${dateTime.format(value)} UTC`;

export const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);
