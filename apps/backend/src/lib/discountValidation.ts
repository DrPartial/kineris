import { prisma } from './prisma.ts'

export type DiscountFailureReason =
  | 'not_found'
  | 'inactive'
  | 'not_started'
  | 'expired'
  | 'usage_limit_reached'
  | 'minimum_order_not_met'
  | 'restricted_to_different_email'

export type DiscountValidationResult =
  | { valid: true; discountCodeId: string; discountAmountMinorUnits: number }
  | { valid: false; reason: DiscountFailureReason }

/**
 * One validation function used by both the public validate-as-you-type
 * endpoint and order creation, so the two can never disagree about whether a
 * code is actually usable right now.
 */
export async function validateDiscountCode(
  code: string,
  subtotalMinorUnits: number,
  customerEmail: string,
): Promise<DiscountValidationResult> {
  const discount = await prisma.discountCode.findUnique({
    where: { code },
    include: { _count: { select: { redemptions: true } } },
  })
  if (!discount) return { valid: false, reason: 'not_found' }
  if (!discount.active || discount.status === 'ended' || discount.status === 'paused') {
    return { valid: false, reason: 'inactive' }
  }

  const now = new Date()
  if (discount.startsAt && now < discount.startsAt) return { valid: false, reason: 'not_started' }
  if (discount.endsAt && now > discount.endsAt) return { valid: false, reason: 'expired' }

  if (discount.restrictedToEmail && discount.restrictedToEmail !== customerEmail) {
    return { valid: false, reason: 'restricted_to_different_email' }
  }

  if (discount.minimumOrderValueMinorUnits && subtotalMinorUnits < discount.minimumOrderValueMinorUnits) {
    return { valid: false, reason: 'minimum_order_not_met' }
  }

  if (discount.usageLimitType === 'total_redemption_cap' && discount.totalRedemptionCap != null) {
    if (discount._count.redemptions >= discount.totalRedemptionCap) return { valid: false, reason: 'usage_limit_reached' }
  }

  if (discount.usageLimitType === 'single_use_per_customer' || discount.perCustomerLimit > 0) {
    const customerRedemptions = await prisma.discountRedemption.count({
      where: { discountCodeId: discount.id, customerEmail },
    })
    const limit = discount.usageLimitType === 'single_use_per_customer' ? 1 : discount.perCustomerLimit
    if (customerRedemptions >= limit) return { valid: false, reason: 'usage_limit_reached' }
  }

  const discountAmountMinorUnits = discount.percentOff
    ? Math.round((subtotalMinorUnits * discount.percentOff) / 100)
    : (discount.amountOffMinorUnits ?? 0)

  return { valid: true, discountCodeId: discount.id, discountAmountMinorUnits }
}

export const DISCOUNT_FAILURE_MESSAGES: Record<DiscountFailureReason, string> = {
  not_found: 'That code doesn’t exist.',
  inactive: 'That code is no longer active.',
  not_started: 'That code isn’t active yet.',
  expired: 'That code has expired.',
  usage_limit_reached: 'That code has already been used.',
  minimum_order_not_met: 'Your order doesn’t meet the minimum for this code.',
  restricted_to_different_email: 'That code isn’t valid for this email address.',
}
