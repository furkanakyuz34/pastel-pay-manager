/**
 * Plan Discount Service
 * Müşteri bazlı plan iskontolarını yönetir
 * Ürün fiyatları SABİT, iskontolar plan seviyesinde uygulanır
 */

import {
  PlanDiscount,
  PlanCustomerPricing,
  Plan,
  DiscountType,
} from "@/types";

/**
 * İskonto hesaplaması
 * @param basePrice - Orijinal fiyat
 * @param discountType - İskonto tipi ("percentage" veya "amount")
 * @param discountValue - İskonto değeri (% veya tutar)
 * @returns { discountAmount, finalPrice }
 */
export function calculateDiscount(
  basePrice: number,
  discountType: DiscountType,
  discountValue: number
): { discountAmount: number; finalPrice: number } {
  if (discountType === "none" || discountValue === 0) {
    return { discountAmount: 0, finalPrice: basePrice };
  }

  let discountAmount = 0;

  if (discountType === "percentage") {
    // Yüzde iskonto
    discountAmount = (basePrice * discountValue) / 100;
  } else if (discountType === "amount") {
    // Sabit tutar iskonto
    discountAmount = Math.min(discountValue, basePrice); // Negatif fiyat olmasın
  }

  const finalPrice = Math.max(0, basePrice - discountAmount);

  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100,
  };
}

/**
 * Müşteri için plan fiyatlandırması oluştur
 * @param plan - Temel plan
 * @param customerId - Müşteri ID
 * @param monthlyDiscount - Aylık iskonto (isteğe bağlı)
 * @param yearlyDiscount - Yıllık iskonto (isteğe bağlı)
 * @param validFrom - Geçerlilik başlangıcı
 * @param validUntil - Geçerlilik sonu
 * @returns PlanCustomerPricing
 */
export function createPlanCustomerPricing(
  plan: Plan,
  customerId: string,
  monthlyDiscount?: Partial<PlanDiscount>,
  yearlyDiscount?: Partial<PlanDiscount>,
  validFrom: string = new Date().toISOString().split("T")[0],
  validUntil?: string
): PlanCustomerPricing {
  // Aylık fiyat hesapla
  const monthlyCalc = monthlyDiscount
    ? calculateDiscount(plan.monthlyPrice, monthlyDiscount.discountType!, monthlyDiscount.discountValue!)
    : { discountAmount: 0, finalPrice: plan.monthlyPrice };

  // Yıllık fiyat hesapla
  const yearlyCalc = yearlyDiscount
    ? calculateDiscount(plan.yearlyPrice, yearlyDiscount.discountType!, yearlyDiscount.discountValue!)
    : { discountAmount: 0, finalPrice: plan.yearlyPrice };

  return {
    id: `pricing-${customerId}-${plan.id}-${Date.now()}`,
    planId: plan.id,
    customerId,
    monthlyPrice: plan.monthlyPrice,
    yearlyPrice: plan.yearlyPrice,
    monthlyDiscount: monthlyDiscount?.discountValue
      ? {
          id: `discount-monthly-${customerId}-${plan.id}`,
          planId: plan.id,
          customerId,
          discountType: monthlyDiscount.discountType || "none",
          discountValue: monthlyDiscount.discountValue || 0,
          isActive: true,
          validFrom,
          validUntil,
          createdAt: new Date().toISOString(),
          notes: monthlyDiscount.notes,
        }
      : undefined,
    yearlyDiscount: yearlyDiscount?.discountValue
      ? {
          id: `discount-yearly-${customerId}-${plan.id}`,
          planId: plan.id,
          customerId,
          discountType: yearlyDiscount.discountType || "none",
          discountValue: yearlyDiscount.discountValue || 0,
          isActive: true,
          validFrom,
          validUntil,
          createdAt: new Date().toISOString(),
          notes: yearlyDiscount.notes,
        }
      : undefined,
    monthlyPriceAfterDiscount: monthlyCalc.finalPrice,
    yearlyPriceAfterDiscount: yearlyCalc.finalPrice,
    billingStartDate: validFrom,
    validUntil,
  };
}

/**
 * İskonto bilgilerini dönem için kontrol et
 * @param discount - İskonto
 * @param checkDate - Kontrol tarihi (default: bugün)
 * @returns İskonto aktif mi?
 */
export function isDiscountValid(
  discount: PlanDiscount,
  checkDate: string = new Date().toISOString().split("T")[0]
): boolean {
  if (!discount.isActive) return false;

  if (discount.validFrom && checkDate < discount.validFrom) {
    return false;
  }

  if (discount.validUntil && checkDate > discount.validUntil) {
    return false;
  }

  return true;
}

/**
 * Müşteri-plan kombinasyonu için iskonto getir
 * @param customerId - Müşteri ID
 * @param planId - Plan ID
 * @param allDiscounts - Tüm iskontolar
 * @param billingCycle - Faturalandırma dönemi ("monthly" | "yearly")
 * @returns İskonto veya undefined
 */
export function getActivePlanDiscount(
  customerId: string,
  planId: string,
  allDiscounts: PlanDiscount[],
  billingCycle: "monthly" | "yearly"
): PlanDiscount | undefined {
  const discount = allDiscounts.find(
    (d) =>
      d.customerId === customerId &&
      d.planId === planId &&
      isDiscountValid(d)
  );

  return discount;
}

/**
 * Müşteri-plan fiyatlandırması hesapla
 * @param plan - Plan
 * @param billingCycle - Faturalandırma dönemi
 * @param discount - Müşteri iskontosi (varsa)
 * @returns { basePrice, discount, finalPrice }
 */
export function calculatePlanPrice(
  plan: Plan,
  billingCycle: "monthly" | "yearly" = "monthly",
  discount?: PlanDiscount
): {
  basePrice: number;
  discountType?: DiscountType;
  discountValue?: number;
  discountAmount: number;
  finalPrice: number;
} {
  const basePrice =
    billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

  if (!discount) {
    return {
      basePrice,
      discountAmount: 0,
      finalPrice: basePrice,
    };
  }

  const { discountAmount, finalPrice } = calculateDiscount(
    basePrice,
    discount.discountType,
    discount.discountValue
  );

  return {
    basePrice,
    discountType: discount.discountType,
    discountValue: discount.discountValue,
    discountAmount,
    finalPrice,
  };
}

/**
 * Toplu iskonto sonrası faturalandırma hesapla
 * @param planPrices - Farklı planların fiyatları
 * @returns Toplam tutar
 */
export function calculateTotalPrice(
  planPrices: Array<{
    basePrice: number;
    discountAmount: number;
    finalPrice: number;
  }>
): number {
  return planPrices.reduce((sum, price) => sum + price.finalPrice, 0);
}

/**
 * İskonto örneği oluştur (test/demo)
 */
export const discountExamples = {
  // 10% aylık iskonto
  monthlyPercentage: {
    discountType: "percentage" as DiscountType,
    discountValue: 10,
    description: "Aylık %10 iskonto",
  },

  // 15% yıllık iskonto
  yearlyPercentage: {
    discountType: "percentage" as DiscountType,
    discountValue: 15,
    description: "Yıllık %15 iskonto",
  },

  // 500₺ sabit iskonto
  fixedAmount: {
    discountType: "amount" as DiscountType,
    discountValue: 500,
    description: "500₺ sabit iskonto",
  },

  // VIP: %25 iskonto
  vipDiscount: {
    discountType: "percentage" as DiscountType,
    discountValue: 25,
    description: "VIP müşteri %25 iskonto",
  },

  // Startup: %50 ilk 6 ay
  startupPromo: {
    discountType: "percentage" as DiscountType,
    discountValue: 50,
    description: "Startup programı - %50 indirim (6 ay)",
  },
};

/**
 * Formatlı iskonto açıklaması oluştur
 * @param discount - İskonto
 * @param basePrice - Orijinal fiyat (tutar göstermek için)
 * @returns İskonto açıklaması (Türkçe)
 */
export function formatDiscountDescription(
  discount: PlanDiscount | Partial<PlanDiscount>,
  basePrice?: number
): string {
  const type = discount.discountType || "none";
  const value = discount.discountValue || 0;

  if (type === "none" || value === 0) {
    return "İskonto yok";
  }

  if (type === "percentage") {
    const desc = `%${value} indirim`;
    if (basePrice) {
      const amount = (basePrice * value) / 100;
      return `${desc} (${Math.round(amount * 100) / 100}₺)`;
    }
    return desc;
  }

  if (type === "amount") {
    return `${value}₺ indirim`;
  }

  return "Tanımlanmamış iskonto";
}
