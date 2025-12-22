/**
 * iyzico Subscription API Service
 * Handles all subscription-related operations with iyzico payment gateway
 */

import { Subscription } from "@/types";

// iyzico Configuration
interface IyzCoConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
}

// Subscription Requests
interface CreateSubscriptionRequest {
  pricingPlanReferenceCode: string;
  customer: {
    name: string;
    surname: string;
    email: string;
    gsmNumber: string;
    identityNumber: string;
    billingAddress: {
      address: string;
      zipCode?: string;
      contactName: string;
      city: string;
      country: string;
    };
    shippingAddress?: {
      address: string;
      zipCode?: string;
      contactName: string;
      city: string;
      country: string;
    };
  };
  paymentCard: {
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
  };
  subscriptionInitialStatus: "ACTIVE" | "PENDING";
  conversationId?: string;
}

interface CreateSubscriptionWithCustomerRequest {
  subscriptionInitialStatus: "ACTIVE" | "PENDING";
  pricingPlanReferenceCode: string;
  customerReferenceCode: string;
  conversationId?: string;
}

interface ActivateSubscriptionRequest {
  subscriptionReferenceCode: string;
}

interface CancelSubscriptionRequest {
  subscriptionReferenceCode: string;
}

interface UpgradeSubscriptionRequest {
  subscriptionReferenceCode: string;
  pricingPlanReferenceCode: string;
  upgradeDays?: number;
  prorationDate?: number;
}

interface SearchSubscriptionRequest {
  subscriptionReferenceCode?: string;
  customerReferenceCode?: string;
  limit?: number;
  offset?: number;
}

interface UpdateCardRequest {
  subscriptionReferenceCode: string;
  paymentCard: {
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
  };
}

// Subscription Responses
interface CreateSubscriptionResponse {
  status: "success" | "failure";
  systemTime: number;
  data?: {
    referenceCode: string;
    parentReferenceCode: string;
    customerReferenceCode: string;
    subscriptionStatus: "ACTIVE" | "PENDING";
    pricingPlanReferenceCode: string;
    trialDays: number;
    trialStartDate: number;
    trialEndDate: number;
    createdDate: number;
    startDate: number;
    endDate?: number;
  };
  errorCode?: string;
  errorMessage?: string;
}

interface ActivateSubscriptionResponse {
  status: "success" | "failure";
  systemTime: number;
  errorCode?: string;
  errorMessage?: string;
}

interface CancelSubscriptionResponse {
  status: "success" | "failure";
  systemTime: number;
  errorCode?: string;
  errorMessage?: string;
}

interface SearchSubscriptionResponse {
  status: "success" | "failure";
  systemTime: number;
  data?: Array<{
    referenceCode: string;
    parentReferenceCode: string;
    customerReferenceCode: string;
    subscriptionStatus: "ACTIVE" | "PENDING" | "CANCELLED" | "EXPIRED";
    pricingPlanReferenceCode: string;
    trialDays: number;
    trialStartDate: number;
    trialEndDate?: number;
    createdDate: number;
    startDate: number;
    endDate?: number;
  }>;
  errorCode?: string;
  errorMessage?: string;
}

interface GetSubscriptionDetailResponse {
  status: "success" | "failure";
  systemTime: number;
  data?: {
    referenceCode: string;
    parentReferenceCode: string;
    customerReferenceCode: string;
    subscriptionStatus: "ACTIVE" | "PENDING" | "CANCELLED" | "EXPIRED";
    pricingPlanReferenceCode: string;
    trialDays: number;
    trialStartDate: number;
    trialEndDate?: number;
    createdDate: number;
    startDate: number;
    endDate?: number;
  };
  errorCode?: string;
  errorMessage?: string;
}

// iyzico Service Class
class IyzCoSubscriptionService {
  private config: IyzCoConfig;

  constructor(config: IyzCoConfig) {
    this.config = config;
  }

  /**
   * Generate iyzico authorization header
   */
  private generateAuthHeader(): string {
    // This would be implemented by MCP Server
    // Returns Base64-encoded signed hash with IYZWSv2 prefix
    return `IYZWSv2 ${Buffer.from(this.config.apiKey).toString("base64")}`;
  }

  /**
   * Create a new subscription with card information
   * @param request - Subscription creation request
   * @returns Created subscription details
   */
  async createSubscription(
    request: CreateSubscriptionRequest
  ): Promise<CreateSubscriptionResponse> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/v2/subscription/initialize`,
        {
          method: "POST",
          headers: {
            Authorization: this.generateAuthHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        }
      );

      const data = (await response.json()) as CreateSubscriptionResponse;
      return data;
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }
  }

  /**
   * Create subscription for existing customer
   * @param request - Subscription creation request for existing customer
   * @returns Created subscription details
   */
  async createSubscriptionWithCustomer(
    request: CreateSubscriptionWithCustomerRequest
  ): Promise<CreateSubscriptionResponse> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/v2/subscription/initialize/with-customer`,
        {
          method: "POST",
          headers: {
            Authorization: this.generateAuthHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        }
      );

      const data = (await response.json()) as CreateSubscriptionResponse;
      return data;
    } catch (error) {
      console.error("Error creating subscription with customer:", error);
      throw error;
    }
  }

  /**
   * Activate a pending subscription
   * @param subscriptionReferenceCode - Reference code of the pending subscription
   * @returns Activation response
   */
  async activateSubscription(
    subscriptionReferenceCode: string
  ): Promise<ActivateSubscriptionResponse> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/v2/subscription/subscriptions/${subscriptionReferenceCode}/activate`,
        {
          method: "POST",
          headers: {
            Authorization: this.generateAuthHeader(),
            "Content-Type": "application/json",
          },
        }
      );

      const data = (await response.json()) as ActivateSubscriptionResponse;
      return data;
    } catch (error) {
      console.error("Error activating subscription:", error);
      throw error;
    }
  }

  /**
   * Cancel an active subscription
   * @param subscriptionReferenceCode - Reference code of the subscription to cancel
   * @returns Cancellation response
   */
  async cancelSubscription(
    subscriptionReferenceCode: string
  ): Promise<CancelSubscriptionResponse> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/v2/subscription/subscriptions/${subscriptionReferenceCode}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: this.generateAuthHeader(),
            "Content-Type": "application/json",
          },
        }
      );

      const data = (await response.json()) as CancelSubscriptionResponse;
      return data;
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      throw error;
    }
  }

  /**
   * Get subscription details
   * @param subscriptionReferenceCode - Reference code of the subscription
   * @returns Subscription details
   */
  async getSubscriptionDetail(
    subscriptionReferenceCode: string
  ): Promise<GetSubscriptionDetailResponse> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/v2/subscription/subscriptions/${subscriptionReferenceCode}`,
        {
          method: "GET",
          headers: {
            Authorization: this.generateAuthHeader(),
            "Content-Type": "application/json",
          },
        }
      );

      const data = (await response.json()) as GetSubscriptionDetailResponse;
      return data;
    } catch (error) {
      console.error("Error fetching subscription detail:", error);
      throw error;
    }
  }

  /**
   * Search subscriptions by reference code or customer reference code
   * @param request - Search request parameters
   * @returns List of subscriptions matching the criteria
   */
  async searchSubscriptions(
    request: SearchSubscriptionRequest
  ): Promise<SearchSubscriptionResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (request.subscriptionReferenceCode) {
        queryParams.append(
          "subscriptionReferenceCode",
          request.subscriptionReferenceCode
        );
      }
      if (request.customerReferenceCode) {
        queryParams.append(
          "customerReferenceCode",
          request.customerReferenceCode
        );
      }
      if (request.limit) {
        queryParams.append("limit", request.limit.toString());
      }
      if (request.offset) {
        queryParams.append("offset", request.offset.toString());
      }

      const response = await fetch(
        `${this.config.baseUrl}/v2/subscription/subscriptions?${queryParams}`,
        {
          method: "GET",
          headers: {
            Authorization: this.generateAuthHeader(),
            "Content-Type": "application/json",
          },
        }
      );

      const data = (await response.json()) as SearchSubscriptionResponse;
      return data;
    } catch (error) {
      console.error("Error searching subscriptions:", error);
      throw error;
    }
  }

  /**
   * Upgrade subscription to a different pricing plan
   * @param request - Upgrade request parameters
   * @returns Response
   */
  async upgradeSubscription(
    request: UpgradeSubscriptionRequest
  ): Promise<CancelSubscriptionResponse> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/v2/subscription/subscriptions/${request.subscriptionReferenceCode}/upgrade`,
        {
          method: "POST",
          headers: {
            Authorization: this.generateAuthHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pricingPlanReferenceCode: request.pricingPlanReferenceCode,
            upgradeDays: request.upgradeDays,
            prorationDate: request.prorationDate,
          }),
        }
      );

      const data = (await response.json()) as CancelSubscriptionResponse;
      return data;
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      throw error;
    }
  }

  /**
   * Update payment card for a subscription
   * @param request - Update card request
   * @returns Response
   */
  async updateSubscriptionCard(
    request: UpdateCardRequest
  ): Promise<CancelSubscriptionResponse> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/v2/subscription/subscriptions/${request.subscriptionReferenceCode}/payment-method`,
        {
          method: "PUT",
          headers: {
            Authorization: this.generateAuthHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentCard: request.paymentCard,
          }),
        }
      );

      const data = (await response.json()) as CancelSubscriptionResponse;
      return data;
    } catch (error) {
      console.error("Error updating subscription card:", error);
      throw error;
    }
  }
}

// Export singleton instance and types
export { IyzCoSubscriptionService };

export type {
  CreateSubscriptionRequest,
  CreateSubscriptionWithCustomerRequest,
  CreateSubscriptionResponse,
  ActivateSubscriptionResponse,
  CancelSubscriptionResponse,
  SearchSubscriptionResponse,
  GetSubscriptionDetailResponse,
  UpdateCardRequest,
  IyzCoConfig,
};

// Factory function to create service instance
export function createIyzCoService(config: IyzCoConfig): IyzCoSubscriptionService {
  return new IyzCoSubscriptionService(config);
}
