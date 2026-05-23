const TIME_UNIT_IN_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

export const tokenExpiryToMs = (expiresIn: string, fallbackMs: number): number => {
  const trimmed = expiresIn.trim();
  const numericValue = Number(trimmed);

  if (Number.isFinite(numericValue)) {
    return numericValue * 1000;
  }

  const match = trimmed.match(/^(\d+)([smhd])$/i);
  if (!match) {
    return fallbackMs;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();

  return value * TIME_UNIT_IN_MS[unit];
};
