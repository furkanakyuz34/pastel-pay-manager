// Common types for the application

// ==================== Discount Types ====================
export type DiscountType = "none" | "percentage" | "amount";

export interface Discount {
  type: DiscountType;
  value: number; // Percentage (0-100) or fixed amount
  description?: string;
  validFrom?: string;
  validUntil?: string;
  minQuantity?: number; // Minimum quantity for discount
  maxUsage?: number; // Maximum number of times discount can be used
  usedCount?: number;
}

/**
 * Customer-Plan Discount: Müşteri bazlı plan iskontolarını tanımlar
 * Örn: Müşteri A için PROFESSIONAL plan'ı %10 indirimle, Müşteri B için %15 indirimle
 */
export interface PlanDiscount {
  id: string;
  planId: string;
  customerId: string;
  discountType: DiscountType; // "percentage" veya "amount"
  discountValue: number; // İskonto değeri (% veya sabit tutar)
  isActive: boolean;
  validFrom: string;
  validUntil?: string;
  createdAt: string;
  notes?: string;
}

/**
 * Plan Pricing: Müşteri bazlı uyarlanabilir plan fiyatlandırması
 * Ürün fiyatları sabit, plan fiyatlandırması müşteri bazlı belirlenir
 */
export interface PlanCustomerPricing {
  id: string;
  planId: string;
  customerId: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyDiscount?: PlanDiscount;
  yearlyDiscount?: PlanDiscount;
  monthlyPriceAfterDiscount: number; // Hesaplanan son fiyat
  yearlyPriceAfterDiscount: number;
  billingStartDate: string;
  validUntil?: string;
}

/**
 * @deprecated Use PlanCustomerPricing instead
 * Eski ürün bazlı iskonto sistemi yerine plan bazlı kullanılmalı
 */
export interface CustomerPricing {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  discountType: DiscountType;
  discountValue: number;
  finalPrice: number;
  validFrom?: string;
  validUntil?: string;
  notes?: string;
}

// ==================== Subscription Types ====================
export interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  planId: string;
  planName: string;
  billingCycle: "monthly" | "yearly" | "trial";
  status: "active" | "cancelled" | "expired" | "trial" | "pending" | "paused";
  startDate: string;
  nextBillingDate?: string;
  trialEndDate?: string;
  
  // Fiyatlandırma: Plan fiyatı + müşteri bazlı iskonto
  planPrice: string; // Orijinal plan fiyatı
  discountAmount?: string; // İskonto tutarı (varsa)
  discountPercent?: number; // İskonto yüzdesi
  finalAmount: string; // Son ödeme tutarı (iskonto sonrası)
  
  // İskonto referansı
  planDiscountId?: string; // PlanDiscount referansı
  planCustomerPricingId?: string; // PlanCustomerPricing referansı
  
  autoRenew: boolean;
  cancelledAt?: string;
  cancelReason?: string;

  // Ödeme yöntemi bilgileri
  paymentMethod?: "credit_card" | "cash" | "mixed";
  cashPortion?: string; // Kısmi nakit ödeme tutarı
  cardPortion?: string; // Kısmi kart ödeme tutarı
  customerCardId?: string; // Kullanılan kart referansı

  // iyzico/Paynet API fields
  subscription_id?: string;
  company_code?: string;
  name_surname?: string;
  interval?: number; // 0:Günlük, 1:Haftalık, 2:Aylık, 3:Yıllık
  interval_count?: number;
  begin_date?: string;
  reference_no?: string;
  end_user_email?: string;
  end_user_gsm?: string;
  agent_id?: string;
  agent_amount?: string;
  company_amount?: string;
  end_user_desc?: string;
  add_comission_to_amount?: boolean;
  currency?: string;
  period?: number;
  user_name?: string;
  agent_note?: string;
  confirmation_webhook?: string;
  suceed_webhook?: string;
  error_webhook?: string;
  confirmation_redirect_url?: string;
  send_mail?: boolean;
  send_sms?: boolean;
  is_fixed_price?: boolean;
  agent_logo?: string;
  attempt_day_count?: number;
  daily_attempt_count?: number;
  is_charge_on_card_confirmation?: boolean;
  group_reference_no?: string;
  otp_control?: boolean;

  // iyzico/Paynet plan array
  plan?: SubscriptionPlanDetail[];
}

// iyzico/Paynet subscription plan structure
export interface SubscriptionPlanDetail {
  plan_id: number;
  invoice_id: number;
  val_date: string;
  amount: number;
  xact_id: number;
  status: number;
  status_desc: string;
}

// ==================== Customer Card Types ====================
export interface CustomerCard {
  id: string;
  customerId: string;
  cardholderName: string;
  bankName?: string; // Banka/kart adı (Garanti, TEB, Akbank, vb.)
  cardNumber: string; // Last 4 digits for display (e.g., "****1234")
  cardNumberFull?: string; // Encrypted full card number (server-side only)
  expiryMonth: number;
  expiryYear: number;
  cardBrand: "visa" | "mastercard" | "amex" | "other"; // Card brand/type
  cvv?: string; // Server-side only, never returned in responses
  isDefault: boolean; // Default card for payments
  isActive: boolean; // Card is valid and can be used
  savedFrom?: string; // Where the card was saved from (iyzico, paynet, etc.)
  binNumber?: string; // Bank Identification Number (first 6 digits)
  lastUsedAt?: string;
  expiresAt?: string; // When the card will expire (YYYY-MM-DD)
  createdAt: string;
  updatedAt: string;
  iyzcoCardToken?: string; // iyzico card token for API calls
  paynetCardToken?: string; // Paynet card token for API calls
}

// ==================== Customer Types ====================
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  status: "active" | "inactive";
  taxId?: string;
  taxOffice?: string;
  contactPerson?: string;
  notes?: string;
  createdAt?: string;
  // Customer-specific pricing
  customPricing?: CustomerPricing[];
  discountTier?: "standard" | "silver" | "gold" | "platinum";
  defaultDiscountPercent?: number;
  // Customer cards
  cards?: CustomerCard[];
  defaultCardId?: string;
}

// ==================== Project Types ====================
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive" | "archived";
  startDate: string;
  endDate?: string;
  // SaaS specific fields
  apiKey?: string;
  webhookUrl?: string;
  licenseApiUrl?: string;
  iyzicoMerchantKey?: string;
}

// ==================== Product Types ====================
export interface Product {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  projectName: string;
  
  // Ürün fiyatı SABIT - İskontolar plan seviyesinde uygulanır
  price: string; // Display price format (e.g., "₺5.000")
  basePrice: number; // Base price (numeric, for calculations)
  currency?: string; // Default: "TRY"
  
  status: "active" | "inactive" | "discontinued";
  
  // SaaS specific
  billingType?: "one_time" | "recurring";
  recurringInterval?: "daily" | "weekly" | "monthly" | "yearly";
  trialDays?: number;
  features?: string[];
  maxUsers?: number;
  storageLimit?: string;
  
  createdAt?: string;
  updatedAt?: string;
}

// ==================== Payment Types ====================
export interface Payment {
  id: string;
  description: string;
  customer: string;
  customerId?: string;
  amount: string;
  status: "completed" | "pending" | "failed";
  date: string;
  type: "incoming" | "outgoing";
  subscriptionId?: string;
  invoiceId?: string;
  paymentMethod?: "credit_card" | "bank_transfer" | "cash" | "check";
  transactionId?: string; // iyzico/Paynet transaction ID
  refundAmount?: string;
  refundReason?: string;
  refundedAt?: string;
}

// ==================== Invoice Types ====================
export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  subscriptionId?: string;
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  total: number;
}

// ==================== Plan Types ====================
/**
 * Plan: SaaS ürün planları (aylık, yıllık)
 * Fiyatlar SABIT - Müşteri bazlı iskontolar PlanDiscount ve PlanCustomerPricing ile yönetilir
 */
export interface Plan {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  projectName?: string;
  
  // Plan içeriği: Hangi ürünleri içeriyor
  productIds: string[];
  productNames?: string[];
  
  // Sabit fiyatlar (iskontosuz)
  monthlyPrice: number; // Numeric value
  yearlyPrice: number;
  currency?: string; // Default: "TRY"
  
  // Plan özellikleri
  features?: string;
  featuresList?: string[];
  
  // Status
  status: "active" | "inactive";
  
  // Trial dönem
  trialDays: number;
  
  // Plan tipi
  isStaticPlan?: boolean; // true: herkese açık public plan, false: custom plan (deprecated)
  
  // Usage limits
  maxUsers?: number;
  maxStorage?: string;
  maxApiCalls?: number;
  
  createdAt?: string;
  updatedAt?: string;
}

// ==================== License Types ====================
export interface License {
  id: string;
  name: string;
  customer: string;
  customerId?: string;
  type: string;
  status: "active" | "expired" | "pending" | "suspended" | "revoked";
  expiryDate: string;
  amount: string;
  productId?: string;
  productName?: string;
  licenseKey?: string;
  maxActivations?: number;
  currentActivations?: number;
  activationHistory?: LicenseActivation[];
  features?: string[];
  metadata?: Record<string, unknown>;
}

export interface LicenseActivation {
  id: string;
  activatedAt: string;
  deviceId: string;
  deviceName?: string;
  ipAddress?: string;
  isActive: boolean;
  deactivatedAt?: string;
}

// ==================== Usage & Analytics Types ====================
export interface UsageRecord {
  id: string;
  customerId: string;
  subscriptionId: string;
  metric: string; // e.g., "api_calls", "storage_used", "users"
  value: number;
  unit: string;
  recordedAt: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
}

export interface BillingHistory {
  id: string;
  customerId: string;
  customerName: string;
  subscriptionId: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed" | "refunded";
  billingDate: string;
  paidAt?: string;
  paymentMethod?: string;
  transactionId?: string;
}

// ==================== API Integration Types ====================
export interface IyzicoConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  merchantId?: string;
}

export interface LicenseApiConfig {
  apiUrl: string;
  apiKey: string;
  projectId?: string;
}

// ==================== Webhook Types ====================
export interface WebhookEvent {
  id: string;
  type: "subscription.created" | "subscription.cancelled" | "payment.success" | "payment.failed" | "license.activated" | "license.expired";
  payload: Record<string, unknown>;
  createdAt: string;
  processedAt?: string;
  status: "pending" | "processed" | "failed";
  retryCount: number;
  error?: string;
}

// ==================== Form Data Types ====================
export type CustomerFormData = Omit<Customer, 'id' | 'customPricing' | 'createdAt'>;
export type ProjectFormData = Omit<Project, 'id'> & { startDate: Date; endDate?: Date };
export type ProductFormData = Omit<Product, 'id' | 'projectName' | 'createdAt' | 'updatedAt'>;
export type PlanFormData = Omit<Plan, 'id' | 'projectName' | 'productNames' | 'featuresList' | 'createdAt' | 'updatedAt'>;
export type PaymentFormData = Omit<Payment, 'id'>;
export type LicenseFormData = Omit<License, 'id' | 'productName' | 'activationHistory'>;
export type InvoiceFormData = Omit<Invoice, 'id' | 'invoiceNumber' | 'customerName'>;
export type PlanDiscountFormData = Omit<PlanDiscount, 'id' | 'createdAt'>;
export type PlanCustomerPricingFormData = Omit<PlanCustomerPricing, 'id'>;

// ==================== Utility Types ====================
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
