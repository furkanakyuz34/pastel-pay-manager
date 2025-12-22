import { CustomerCard } from "@/types";

/**
 * Customer Card Service
 * Handles all API operations related to customer payment cards
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface CardServiceConfig {
  baseUrl?: string;
}

class CustomerCardService {
  private baseUrl: string;

  constructor(config?: CardServiceConfig) {
    this.baseUrl = config?.baseUrl || API_BASE_URL;
  }

  /**
   * Get all cards for a customer
   */
  async getCustomerCards(customerId: string): Promise<CustomerCard[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/customers/${customerId}/cards`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch cards: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error fetching customer cards:", error);
      throw error;
    }
  }

  /**
   * Add a new card to a customer
   */
  async addCard(customerId: string, card: Omit<CustomerCard, "id" | "createdAt" | "updatedAt">): Promise<CustomerCard> {
    try {
      const response = await fetch(
        `${this.baseUrl}/customers/${customerId}/cards`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(card),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add card: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error adding card:", error);
      throw error;
    }
  }

  /**
   * Update a card
   */
  async updateCard(customerId: string, cardId: string, updates: Partial<CustomerCard>): Promise<CustomerCard> {
    try {
      const response = await fetch(
        `${this.baseUrl}/customers/${customerId}/cards/${cardId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update card: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error updating card:", error);
      throw error;
    }
  }

  /**
   * Delete a card
   */
  async deleteCard(customerId: string, cardId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/customers/${customerId}/cards/${cardId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete card: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting card:", error);
      throw error;
    }
  }

  /**
   * Set a card as default for a customer
   */
  async setDefaultCard(customerId: string, cardId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/customers/${customerId}/cards/${cardId}/set-default`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to set default card: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error setting default card:", error);
      throw error;
    }
  }

  /**
   * Validate card with provider (iyzico/Paynet)
   */
  async validateCard(
    customerId: string,
    cardData: {
      cardNumber: string;
      expiryMonth: number;
      expiryYear: number;
      cvv: string;
    }
  ): Promise<{ valid: boolean; message?: string; cardToken?: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/customers/${customerId}/cards/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cardData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to validate card: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || { valid: false };
    } catch (error) {
      console.error("Error validating card:", error);
      throw error;
    }
  }

  /**
   * Get a single card by ID
   */
  async getCard(customerId: string, cardId: string): Promise<CustomerCard> {
    try {
      const response = await fetch(
        `${this.baseUrl}/customers/${customerId}/cards/${cardId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch card: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching card:", error);
      throw error;
    }
  }

  /**
   * Save card from iyzico tokenization
   */
  async saveIyzcoCard(
    customerId: string,
    tokenData: {
      cardToken: string;
      cardholderName: string;
      isDefault?: boolean;
    }
  ): Promise<CustomerCard> {
    try {
      const response = await fetch(
        `${this.baseUrl}/customers/${customerId}/cards/iyzico`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tokenData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to save iyzico card: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error saving iyzico card:", error);
      throw error;
    }
  }

  /**
   * Check if card has sufficient balance (mock implementation)
   */
  async checkCardBalance(customerId: string, cardId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/customers/${customerId}/cards/${cardId}/balance`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.data?.hasBalance || false;
    } catch (error) {
      console.error("Error checking card balance:", error);
      return false;
    }
  }
}

// Export singleton instance
export const customerCardService = new CustomerCardService();

// Also export the class for testing/custom configuration
export default CustomerCardService;
