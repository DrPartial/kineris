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
  // Added for the accounts/order-status/checkout/promotions pass -- same
  // "constant now, no SDK yet" treatment as the five above.
  promoModalShown: 'promo_modal_shown',
  promoModalSubmitted: 'promo_modal_submitted',
  promoCodeApplied: 'promo_code_applied',
  promoCodeRejected: 'promo_code_rejected',
  orderStatusLookup: 'order_status_lookup',
  accountModalOpened: 'account_modal_opened',
  guestAccountOfferShown: 'guest_account_offer_shown',
  guestAccountOfferAccepted: 'guest_account_offer_accepted',
} as const

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]
