export function makePercentageComplete(progressCurrent?: number, progressTotal?: number) {
  if (!progressCurrent || !progressTotal) {
    return undefined;
  }
  return Number((progressCurrent / progressTotal) * 100).toFixed(2);
}
