// Common types for the application
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

  // Paynet API fields
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
  sms_verification_code?: string;

  // Paynet plan array
  plan?: SubscriptionPlan[];
}

// Paynet subscription plan structure
export interface SubscriptionPlan {
  plan_id: number;
  invoice_id: number;
  val_date: string;
  amount: number;
  xact_id: number;
  status: number;
  status_desc: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  status: "active" | "inactive";
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive" | "archived";
  startDate: string;
  endDate?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  projectName: string;
  price: string;
  status: "active" | "inactive";
}

export interface Payment {
  id: string;
  description: string;
  customer: string;
  amount: string;
  status: "completed" | "pending" | "failed";
  date: string;
  type: "incoming" | "outgoing";
}

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
}

export interface License {
  id: string;
  name: string;
  customer: string;
  type: string;
  status: "active" | "expired" | "pending";
  expiryDate: string;
  amount: string;
}