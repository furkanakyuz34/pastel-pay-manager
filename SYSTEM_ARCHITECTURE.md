# Müşteri Kartı Sistemi - Teknik Mimarı

## 📐 Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│                                                              │
│  ┌──────────────────────┐        ┌──────────────────────┐   │
│  │ CustomerDetailModal  │        │ CustomerCardsModal   │   │
│  │                      │        │                      │   │
│  │ - Müşteri bilgileri  │        │ - Kartları listele   │   │
│  │ - Kart bölümü        │        │ - Kart ekle          │   │
│  │ - "Kart Ekle" btn    │───────▶│ - Kartı sil          │   │
│  │                      │        │ - Varsayılan yap     │   │
│  └──────────────────────┘        └──────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      HOOK LAYER                              │
│                                                              │
│            useCustomerCards(customerId)                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  - fetchCards()         - removeCard()                 │ │
│  │  - addNewCard()         - setAsDefault()               │ │
│  │  - updateExistingCard() - validateCardWithProvider()   │ │
│  │  - getDefaultCard()     - getActiveCards()             │ │
│  │  - isCardExpired()      - clearError()                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                          │
│                      (Redux Store)                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         customerCardSlice                            │  │
│  │                                                      │  │
│  │  state: {                                            │  │
│  │    cards: CustomerCard[],                            │  │
│  │    loading: boolean,                                 │  │
│  │    error: string | null,                             │  │
│  │    selectedCardId: string | null                     │  │
│  │  }                                                   │  │
│  │                                                      │  │
│  │  actions:                                            │  │
│  │  - setCards          - setLoading                    │  │
│  │  - addCard           - setError                      │  │
│  │  - updateCard        - clearCards                    │  │
│  │  - deleteCard        - clearError                    │  │
│  │  - setDefaultCard    - selectCard                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVICE LAYER                              │
│                                                              │
│              customerCardService                             │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ API Methods:                                           │ │
│  │                                                        │ │
│  │  - getCustomerCards(customerId)                        │ │
│  │  - addCard(customerId, cardData)                       │ │
│  │  - updateCard(customerId, cardId, updates)             │ │
│  │  - deleteCard(customerId, cardId)                      │ │
│  │  - setDefaultCard(customerId, cardId)                  │ │
│  │  - validateCard(customerId, cardData)                  │ │
│  │  - getCard(customerId, cardId)                         │ │
│  │  - saveIyzcoCard(customerId, tokenData)                │ │
│  │  - checkCardBalance(customerId, cardId)                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   API LAYER                                  │
│                                                              │
│  Backend REST API Endpoints:                                 │
│                                                              │
│  GET    /api/customers/:customerId/cards                     │
│  POST   /api/customers/:customerId/cards                     │
│  GET    /api/customers/:customerId/cards/:cardId             │
│  PUT    /api/customers/:customerId/cards/:cardId             │
│  DELETE /api/customers/:customerId/cards/:cardId             │
│  POST   /api/customers/:customerId/cards/:cardId/set-default │
│  POST   /api/customers/:customerId/cards/validate            │
│  POST   /api/customers/:customerId/cards/iyzico              │
│  GET    /api/customers/:customerId/cards/:cardId/balance     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE LAYER                              │
│                                                              │
│  - customer_cards table                                      │
│  - Encrypted card data                                       │
│  - Card tokens (iyzico, paynet)                             │
│  - Audit logs                                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Veri Akışı

### Kart Ekleme Flow

```
User Input (Form)
       ▼
CustomerCardsModal (Validation)
       ▼
useCustomerCards.addNewCard()
       ▼
dispatch(addCard()) → Redux Store
       ▼
customerCardService.addCard()
       ▼
POST /api/customers/:id/cards
       ▼
Backend Processing (Validate, Encrypt)
       ▼
Database Save
       ▼
Response (CardData)
       ▼
Redux State Update
       ▼
UI Re-render
       ▼
Toast Notification ✅
```

### Kartları Getirme Flow

```
useCustomerCards(customerId)
       ▼
Hook Mount / fetchCards()
       ▼
dispatch(setLoading(true))
       ▼
customerCardService.getCustomerCards()
       ▼
GET /api/customers/:id/cards
       ▼
Backend Query
       ▼
Response (Cards[])
       ▼
dispatch(setCards(cards))
       ▼
dispatch(setLoading(false))
       ▼
Component Re-render
       ▼
Cards Display ✅
```

### Varsayılan Kartı Ayarlama Flow

```
Click "Varsayılan Yap"
       ▼
handleSetDefault(cardId)
       ▼
useCustomerCards.setAsDefault()
       ▼
dispatch(setDefaultCard())
       ▼
POST /api/.../cards/:id/set-default
       ▼
Backend Update
       ▼
Database Update
       ▼
Response Success
       ▼
Redux State Update
       ▼
UI Update
       ▼
Toast "Varsayılan Kart Güncellendi" ✅
```

## 📦 Type System

```
CustomerCard Interface
│
├─ Identity
│  ├─ id: string
│  ├─ customerId: string
│  └─ createdAt: string
│
├─ Card Information
│  ├─ cardholderName: string
│  ├─ cardNumber: string (masked: ****1234)
│  ├─ cardNumberFull: string (encrypted, server-side)
│  ├─ expiryMonth: number (1-12)
│  ├─ expiryYear: number (YYYY)
│  ├─ cardBrand: "visa" | "mastercard" | "amex" | "other"
│  └─ cvv: string (server-side only)
│
├─ Status Flags
│  ├─ isDefault: boolean
│  ├─ isActive: boolean
│  └─ savedFrom: string (manual, iyzico, paynet, etc.)
│
├─ Additional Info
│  ├─ binNumber: string (first 6 digits)
│  ├─ lastUsedAt: string | undefined
│  ├─ expiresAt: string | undefined
│  └─ updatedAt: string
│
└─ Integration Tokens
   ├─ iyzcoCardToken: string | undefined
   └─ paynetCardToken: string | undefined
```

## 🔐 Security Architecture

```
┌─────────────────────────────────────────┐
│        FRONTEND (Browser)                │
│                                         │
│  - Card input masked ****1234           │
│  - CVV hidden (password type)           │
│  - Form validation (Zod)                │
│  - No sensitive data in localStorage    │
└──────────────┬──────────────────────────┘
               │
         HTTPS/TLS
               │
┌──────────────▼──────────────────────────┐
│        BACKEND (Server)                  │
│                                         │
│  - Input validation & sanitization      │
│  - Card data encryption                 │
│  - PCI-DSS compliance                   │
│  - Tokenization (iyzico/Paynet)        │
│  - Rate limiting                        │
│  - Audit logging                        │
└──────────────┬──────────────────────────┘
               │
         Database Encryption
               │
┌──────────────▼──────────────────────────┐
│        DATABASE                          │
│                                         │
│  - Encrypted card data                  │
│  - Card tokens (not full numbers)      │
│  - No CVV storage                       │
│  - Audit trail                          │
└─────────────────────────────────────────┘
```

## 🎯 Component Hierarchy

```
App
└── MainLayout
    └── Customers Page
        └── CustomerTable
            └── onClick → CustomerDetailModal
                ├── Customer Info Section
                ├── Cards Section
                │   └── Button "Kart Ekle"
                │       ▼
                │   CustomerCardsModal
                │   ├── TabsList
                │   │   ├── "Kartlar" Tab
                │   │   └── "Yeni Kart Ekle" Tab
                │   │
                │   ├── TabsContent: Kartlar
                │   │   └── CardsList
                │   │       └── CardItem
                │   │           ├── Card Info
                │   │           ├── "Varsayılan Yap" Button
                │   │           └── "Sil" Button
                │   │
                │   └── TabsContent: Yeni Kart Ekle
                │       └── CardForm
                │           ├── Input: Kart Sahibi
                │           ├── Input: Kart Numarası
                │           ├── Inputs: Ay/Yıl
                │           ├── Input: CVV
                │           └── Button: "Kartı Kaydet"
                │
                ├── Subscriptions Section
                └── Payments Section
```

## 🔌 State Management Flow

```
Redux Store: customerCards
│
├─ Selectors (useSelector)
│  ├─ cards[]
│  ├─ loading
│  ├─ error
│  └─ selectedCardId
│
├─ Dispatch Actions (dispatch)
│  ├─ setCards()
│  ├─ addCard()
│  ├─ updateCard()
│  ├─ deleteCard()
│  ├─ setDefaultCard()
│  ├─ selectCard()
│  ├─ setLoading()
│  ├─ setError()
│  ├─ clearCards()
│  └─ clearError()
│
└─ Hook Wrapper (useCustomerCards)
   ├─ Fetches from selectors
   ├─ Wraps dispatch calls
   ├─ Provides error handling
   └─ Manages side effects
```

## 📡 API Contract

### Request Format

```json
{
  "customerId": "CUS-001",
  "cardData": {
    "cardholderName": "John Doe",
    "cardNumber": "4532123456781234",
    "expiryMonth": 12,
    "expiryYear": 2026,
    "cvv": "123"
  }
}
```

### Response Format

```json
{
  "success": true,
  "data": {
    "id": "CARD-001",
    "customerId": "CUS-001",
    "cardholderName": "John Doe",
    "cardNumber": "****1234",
    "expiryMonth": 12,
    "expiryYear": 2026,
    "cardBrand": "visa",
    "isDefault": true,
    "isActive": true,
    "createdAt": "2024-12-22T10:00:00Z",
    "updatedAt": "2024-12-22T10:00:00Z"
  },
  "error": null,
  "message": "Kart başarıyla eklendi"
}
```

## 🧪 Testing Strategy

```
Unit Tests
├─ customerCardSlice
│  ├─ setCards action
│  ├─ addCard action
│  ├─ deleteCard action
│  └─ setDefaultCard action
│
├─ cardService
│  ├─ getCustomerCards()
│  ├─ addCard()
│  └─ deleteCard()
│
└─ useCustomerCards hook
   ├─ fetchCards()
   ├─ addNewCard()
   └─ removeCard()

Integration Tests
├─ CustomerCardsModal
│  ├─ Display cards
│  ├─ Add card flow
│  └─ Delete card flow
│
└─ CustomerDetailModal
   ├─ Show cards section
   └─ Open cards modal

E2E Tests
└─ Full card management flow
   ├─ Add card
   ├─ List cards
   ├─ Set default
   └─ Delete card
```

## 📊 Performance Considerations

```
Optimization:
├─ Memoization
│  ├─ useMemo for card lists
│  └─ useCallback for handlers
│
├─ Lazy Loading
│  ├─ Modal opens on demand
│  └─ Cards loaded on modal open
│
├─ Pagination (optional)
│  ├─ Limit cards per page
│  └─ Lazy load more
│
└─ Caching
   ├─ Redux store cache
   └─ API response cache
```

## 🔄 Update Cycle

```
1. User Action (add/delete/update)
            ▼
2. Component Event Handler
            ▼
3. Hook Method Call (addNewCard, etc.)
            ▼
4. Redux Dispatch (setLoading(true))
            ▼
5. Service API Call
            ▼
6. Backend Processing
            ▼
7. Response Handling
            ▼
8. Redux Update (setCards, clearLoading)
            ▼
9. Component Re-render
            ▼
10. User Feedback (Toast)
```

---

**Bu dokuman:** Müşteri Kartı Sisteminin teknik mimarisini açıklamaktadır.
