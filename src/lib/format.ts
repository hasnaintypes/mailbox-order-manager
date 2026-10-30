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

export function nameFromEmail(email: string): string {
  return (email.split("@")[0] ?? email)
    .split(/[._-]/)
    .filter(Boolean)
    .map(capitalize)
    .join(" ");
}

export function greeting(now = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function timeAgo(value: Date, now = new Date()): string {
  const seconds = Math.max(0, Math.round((now.getTime() - value.getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} d ago`;
}
