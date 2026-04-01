export function badgeClass(status: string): string {
  return `badge badge-${status.replace(/\s+/g, "_")}`;
}

export const ABQ_QUIPS = [
  "Hotter than a green chile roaster",
  "Spotted near the Sandias",
  "Another day in the 505",
  "Roadrunner speed response",
  "Making ABQ better, one report at a time",
] as const;

export function randomQuip(): string {
  return ABQ_QUIPS[Math.floor(Math.random() * ABQ_QUIPS.length)];
}
