/**
 * Cricket overs conversion.
 * Storage uses legal-ball counts (Int). The frontend contract uses decimal
 * notation where 18.4 means 18 overs and 4 balls (NOT 18.4 x 6 balls).
 */
export function ballsToDecimalOvers(balls: number): number {
  const full = Math.floor(balls / 6);
  const rem = balls % 6;
  return Number(`${full}.${rem}`);
}

export function decimalOversToBalls(overs: number): number {
  const full = Math.floor(overs);
  const balls = Math.round((overs - full) * 10);
  return full * 6 + balls;
}

/** Overs as a real number of six-ball overs (for rate calculations). */
export function ballsToOversFloat(balls: number): number {
  return balls / 6;
}
