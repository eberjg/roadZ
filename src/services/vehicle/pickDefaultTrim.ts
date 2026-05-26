export type TrimOption = { id: string; label: string };

/** Pick the most common default trim: automatic gas, not manual. */
export function pickDefaultTrim(trims: TrimOption[]): TrimOption | null {
  if (trims.length === 0) {
    return null;
  }
  if (trims.length === 1) {
    return trims[0];
  }

  const scored = trims.map((trim) => {
    const label = trim.label.toLowerCase();
    let score = 0;
    if (label.includes("auto") || label.includes("automatic")) {
      score += 20;
    }
    if (label.includes("cvt")) {
      score += 8;
    }
    if (label.includes("manual")) {
      score -= 30;
    }
    if (label.includes("electric") && !label.includes("hybrid")) {
      score -= 5;
    }
    if (label.includes("hybrid") || label.includes("plug-in")) {
      score -= 3;
    }
    return { trim, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.trim ?? trims[0];
}
