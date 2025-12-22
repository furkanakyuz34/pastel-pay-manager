import { CustomerCard } from "@/types";

/**
 * Mock Customer Cards Data
 * For development and testing purposes
 */

export const mockCustomerCards: CustomerCard[] = [
  {
    id: "CARD-001",
    customerId: "CUS-001",
    cardholderName: "Ahmet Yılmaz",
    bankName: "Garanti BBVA",
    cardNumber: "****1234",
    cardNumberFull: "4532123456781234",
    expiryMonth: 12,
    expiryYear: 2026,
    cardBrand: "visa",
    binNumber: "453212",
    isDefault: true,
    isActive: true,
    savedFrom: "manual",
    lastUsedAt: "2024-12-20T15:30:00Z",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-12-20T15:30:00Z",
    iyzcoCardToken: "token_visa_1234",
  },
  {
    id: "CARD-002",
    customerId: "CUS-001",
    cardholderName: "Ayşe Yılmaz",
    bankName: "TEB",
    cardNumber: "****5678",
    cardNumberFull: "5412345678905678",
    expiryMonth: 8,
    expiryYear: 2025,
    cardBrand: "mastercard",
    binNumber: "541234",
    isDefault: false,
    isActive: true,
    savedFrom: "manual",
    lastUsedAt: "2024-12-10T09:15:00Z",
    createdAt: "2024-03-20T14:20:00Z",
    updatedAt: "2024-12-10T09:15:00Z",
  },
  {
    id: "CARD-003",
    customerId: "CUS-001",
    cardholderName: "Ahmet Yılmaz",
    bankName: "Akbank",
    cardNumber: "****9012",
    cardNumberFull: "374245123456789",
    expiryMonth: 6,
    expiryYear: 2024, // Expired
    cardBrand: "amex",
    binNumber: "374245",
    isDefault: false,
    isActive: false,
    savedFrom: "manual",
    createdAt: "2023-06-10T11:45:00Z",
    updatedAt: "2024-12-15T12:00:00Z",
  },
];

export const mockCustomerCards2: CustomerCard[] = [
  {
    id: "CARD-004",
    customerId: "CUS-002",
    cardholderName: "Mehmet Kaya",
    cardNumber: "****3456",
    cardNumberFull: "4111111111111111",
    expiryMonth: 3,
    expiryYear: 2027,
    cardBrand: "visa",
    binNumber: "411111",
    isDefault: true,
    isActive: true,
    savedFrom: "iyzico",
    lastUsedAt: "2024-12-22T10:30:00Z",
    createdAt: "2024-02-01T08:00:00Z",
    updatedAt: "2024-12-22T10:30:00Z",
    iyzcoCardToken: "token_visa_3456",
  },
];

/**
 * Mock function to simulate adding a card
 */
export function createMockCard(data: Partial<CustomerCard>): CustomerCard {
  const now = new Date().toISOString();
  return {
    id: `CARD-${Date.now()}`,
    customerId: "CUS-001",
    cardholderName: "Test User",
    cardNumber: "****1234",
    expiryMonth: 12,
    expiryYear: 2026,
    cardBrand: "visa",
    isDefault: false,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    ...data,
  };
}

/**
 * Mock function to simulate fetching cards
 */
export function getMockCardsByCustomerId(customerId: string): CustomerCard[] {
  if (customerId === "CUS-001") {
    return mockCustomerCards;
  } else if (customerId === "CUS-002") {
    return mockCustomerCards2;
  }
  return [];
}

/**
 * Sample card numbers for testing (from stripe/iyzico test docs)
 */
export const testCardNumbers = {
  visa: {
    valid: "4532123456781234",
    invalid: "4532123456781235",
  },
  mastercard: {
    valid: "5412345678905670",
    invalid: "5412345678905671",
  },
  amex: {
    valid: "374245454545454",
    invalid: "374245454545455",
  },
};

/**
 * Test card holder names
 */
export const testCardholderNames = [
  "Ahmet Yılmaz",
  "Ayşe Demir",
  "Mehmet Kaya",
  "Fatih Ünal",
  "Zeynep Ş",
];

/**
 * Default test data for forms
 */
export const defaultTestCardData = {
  cardholderName: "Test User",
  cardNumber: testCardNumbers.visa.valid,
  expiryMonth: 12,
  expiryYear: new Date().getFullYear() + 2,
  cvv: "123",
};

/**
 * Mock validation response
 */
export const mockValidationResponse = {
  valid: true,
  message: "Kart doğrulandı",
  cardToken: "token_" + Date.now(),
};

/**
 * Mock expired card
 */
export const mockExpiredCard: CustomerCard = {
  id: "CARD-EXPIRED",
  customerId: "CUS-001",
  cardholderName: "Expired Card",
  cardNumber: "****9999",
  expiryMonth: 1,
  expiryYear: 2023,
  cardBrand: "visa",
  isDefault: false,
  isActive: false,
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2024-12-22T00:00:00Z",
};

/**
 * Generate random 16-digit card number (valid format, not real)
 */
export function generateTestCardNumber(): string {
  const prefix = "4532"; // Visa-like
  let number = prefix;
  for (let i = 0; i < 12; i++) {
    number += Math.floor(Math.random() * 10);
  }
  return number;
}
