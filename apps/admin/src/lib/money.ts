export function formatGBP(minorUnits: number): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(minorUnits / 100)
}
