/** All prices are stored and transmitted as integer minor units (pence), never a float. */
export function formatGBP(minorUnits: number): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(minorUnits / 100)
}
