/**
 * Event names shared across PostHog, GA4 and Meta, instruction pack section
 * 4: "use these everywhere... so every A/B test is measured on revenue."
 * No provider SDK is wired yet (deferred per the project plan); these
 * constants exist now so every call site that will eventually fire one uses
 * the same literal string from day one, instead of three slightly different
 * spellings showing up once a provider is actually installed.
 */
export const ANALYTICS_EVENTS = {
  viewItem: 'view_item',
  addToCart: 'add_to_cart',
  beginCheckout: 'begin_checkout',
  purchase: 'purchase',
  signUp: 'sign_up',
} as const

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]
