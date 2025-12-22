// Common types for the application

// ==================== Subscription Types ====================
export interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  planId: string;
  planName: string;
  billingCycle: "monthly" | "yearly" | "trial";
  status: "active" | "cancelled" | "expired" | "trial" | "pending";
  startDate: string;
  nextBillingDate?: string;
  trialEndDate?: string;
  amount: string;
  autoRenew: boolean;

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
  plan?: SubscriptionPlan[];
}

// iyzico/Paynet subscription plan structure
export interface SubscriptionPlan {
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
}

// ==================== Project Types ====================
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive" | "archived";
  startDate: string;
  endDate?: string;
}

// ==================== Product Types ====================
export interface Product {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  projectName: string;
  price: string;
  basePrice?: string; // Base price before discount
  discountPercent?: number; // Discount percentage
  discountAmount?: string; // Discount amount
  status: "active" | "inactive";
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
  paymentMethod?: "credit_card" | "bank_transfer" | "cash";
  transactionId?: string; // iyzico/Paynet transaction ID
}

// ==================== Plan Types ====================
export interface Plan {
  id: string;
  name: string;
  description?: string;
  customerId: string;
  customerName?: string;
  projectId: string;
  projectName?: string;
  productIds: string[];
  productNames?: string[];
  monthlyPrice: string;
  yearlyPrice: string;
  features?: string;
  status: "active" | "inactive";
  trialDays: number;
  isStaticPlan?: boolean; // Static plan vs customer-specific plan
}

// ==================== License Types ====================
export interface License {
  id: string;
  name: string;
  customer: string;
  customerId?: string;
  type: string;
  status: "active" | "expired" | "pending";
  expiryDate: string;
  amount: string;
  productId?: string;
  licenseKey?: string;
  maxActivations?: number;
  currentActivations?: number;
}

// ==================== API Integration Types ====================
export interface IyzicoConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
}

export interface LicenseApiConfig {
  apiUrl: string;
  apiKey: string;
}

// ==================== Form Data Types ====================
export type CustomerFormData = Omit<Customer, 'id'>;
export type ProjectFormData = Omit<Project, 'id'> & { startDate: Date; endDate?: Date };
export type ProductFormData = Omit<Product, 'id' | 'projectName'>;
export type PlanFormData = Omit<Plan, 'id' | 'customerName' | 'projectName' | 'productNames'>;
export type PaymentFormData = Omit<Payment, 'id'>;
export type LicenseFormData = Omit<License, 'id'>;
