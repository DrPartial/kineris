// Royal Mail's own track-and-trace URL pattern -- constructed in one place
// so neither the admin UI nor any customer-facing order page ever retypes
// it by hand.
export function royalMailTrackingUrl(trackingNumber: string): string {
  return `https://www.royalmail.com/track-your-item#/tracking-results/${encodeURIComponent(trackingNumber)}`
}
