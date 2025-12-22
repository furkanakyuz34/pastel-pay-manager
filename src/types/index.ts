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
  amount: string;
  autoRenew: boolean;
  cancelledAt?: string;
  cancelReason?: string;

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
  basePrice: number; // Base price before any discount
  currency: string;
  status: "active" | "inactive" | "discontinued";
  
  // Discount settings
  discountType: DiscountType;
  discountValue: number; // Percentage or fixed amount
  discountValidFrom?: string;
  discountValidUntil?: string;
  
  // Calculated fields
  finalPrice: number; // Price after discount
  discountAmount?: number; // Actual discount amount
  
  // SaaS specific
  billingType: "one_time" | "recurring";
  recurringInterval?: "daily" | "weekly" | "monthly" | "yearly";
  trialDays?: number;
  features?: string[];
  maxUsers?: number;
  storageLimit?: string;
}

// ==================== Payment Types ====================
export interface Payment {
  id: string;
  description: string;
  customer: string;
  customerId?: string;
  amount: string;
  status: "completed" | "pending" | "failed" | "refunded" | "partial";
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
export interface Plan {
  id: string;
  name: string;
  description?: string;
  customerId?: string; // Optional: for customer-specific plans
  customerName?: string;
  projectId: string;
  projectName?: string;
  productIds: string[];
  productNames?: string[];
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  features?: string;
  featuresList?: string[];
  status: "active" | "inactive";
  trialDays: number;
  isStaticPlan: boolean; // true: public plan, false: customer-specific
  
  // Plan discounts
  monthlyDiscount?: Discount;
  yearlyDiscount?: Discount;
  
  // Usage limits
  maxUsers?: number;
  maxStorage?: string;
  maxApiCalls?: number;
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
export type ProductFormData = Omit<Product, 'id' | 'projectName' | 'finalPrice' | 'discountAmount'>;
export type PlanFormData = Omit<Plan, 'id' | 'customerName' | 'projectName' | 'productNames' | 'featuresList'>;
export type PaymentFormData = Omit<Payment, 'id'>;
export type LicenseFormData = Omit<License, 'id' | 'productName' | 'activationHistory'>;
export type InvoiceFormData = Omit<Invoice, 'id' | 'invoiceNumber' | 'customerName'>;
export type CustomerPricingFormData = Omit<CustomerPricing, 'id' | 'customerName' | 'productName'>;

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
