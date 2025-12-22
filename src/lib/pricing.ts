import { DiscountType, Product, CustomerPricing } from "@/types";

/**
 * Calculate discount amount based on type and value
 */
export function calculateDiscount(
  basePrice: number,
  discountType: DiscountType,
  discountValue: number
): number {
  if (discountType === "none" || discountValue <= 0) {
    return 0;
  }

  if (discountType === "percentage") {
    return (basePrice * Math.min(discountValue, 100)) / 100;
  }

  if (discountType === "amount") {
    return Math.min(discountValue, basePrice);
  }

  return 0;
}

/**
 * Calculate final price after discount
 */
export function calculateFinalPrice(
  basePrice: number,
  discountType: DiscountType,
  discountValue: number
): number {
  const discount = calculateDiscount(basePrice, discountType, discountValue);
  return Math.max(0, basePrice - discount);
}

/**
 * Format currency for display
 */
export function formatCurrency(
  amount: number,
  currency: string = "TRY",
  locale: string = "tr-TR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d.,]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

/**
 * Get customer-specific price for a product
 */
export function getCustomerPrice(
  product: Product,
  customerId: string,
  customerPricings: CustomerPricing[]
): { finalPrice: number; discountType: DiscountType; discountValue: number; hasCustomPrice: boolean } {
  const customPricing = customerPricings.find(
    (cp) => cp.customerId === customerId && cp.productId === product.id
  );

  if (customPricing) {
    return {
      finalPrice: customPricing.finalPrice,
      discountType: customPricing.discountType,
      discountValue: customPricing.discountValue,
      hasCustomPrice: true,
    };
  }

  return {
    finalPrice: product.finalPrice,
    discountType: product.discountType,
    discountValue: product.discountValue,
    hasCustomPrice: false,
  };
}

/**
 * Calculate savings percentage
 */
export function calculateSavingsPercent(
  originalPrice: number,
  finalPrice: number
): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
}

/**
 * Check if discount is currently valid
 */
export function isDiscountValid(
  validFrom?: string,
  validUntil?: string
): boolean {
  const now = new Date();
  
  if (validFrom && new Date(validFrom) > now) {
    return false;
  }
  
  if (validUntil && new Date(validUntil) < now) {
    return false;
  }
  
  return true;
}

/**
 * Format discount display string
 */
export function formatDiscountDisplay(
  discountType: DiscountType,
  discountValue: number,
  currency: string = "TRY"
): string {
  if (discountType === "none" || discountValue <= 0) {
    return "";
  }

  if (discountType === "percentage") {
    return `%${discountValue} indirim`;
  }

  if (discountType === "amount") {
    return `${formatCurrency(discountValue, currency)} indirim`;
  }

  return "";
}

/**
 * Calculate total with multiple products and customer pricing
 */
export function calculateOrderTotal(
  products: Product[],
  quantities: Record<string, number>,
  customerId?: string,
  customerPricings: CustomerPricing[] = []
): { subtotal: number; discountTotal: number; total: number } {
  let subtotal = 0;
  let discountTotal = 0;

  products.forEach((product) => {
    const quantity = quantities[product.id] || 0;
    if (quantity <= 0) return;

    const baseTotal = product.basePrice * quantity;
    subtotal += baseTotal;

    let finalPrice = product.finalPrice;
    if (customerId) {
      const customerPrice = getCustomerPrice(product, customerId, customerPricings);
      finalPrice = customerPrice.finalPrice;
    }

    const productDiscount = (product.basePrice - finalPrice) * quantity;
    discountTotal += productDiscount;
  });

  return {
    subtotal,
    discountTotal,
    total: subtotal - discountTotal,
  };
}
