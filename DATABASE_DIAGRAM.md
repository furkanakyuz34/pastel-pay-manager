# Veritabanı Diyagramı - Egemen Lisans Yönetimi Sistemi

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    CUSTOMERS                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ • id (PK)                          • name                                           │
│ • email                            • phone                                          │
│ • company                          • address                                        │
│ • status                           • taxId                                          │
│ • taxOffice                        • contactPerson                                  │
│ • notes                            • createdAt                                      │
│ • discountTier                     • defaultDiscountPercent                         │
│ • defaultCardId (FK)               • customPricing (relasyon)                       │
│ • cards (relasyon)                 • subscriptions (relasyon)                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
         │                          │                              │
         │                          │                              │
         │ 1:N                      │ 1:N                          │ 1:N
         ▼                          ▼                              ▼
┌──────────────────────────┐  ┌──────────────────┐   ┌──────────────────────────┐
│   CUSTOMER_CARDS         │  │  SUBSCRIPTIONS   │   │  PLAN_CUSTOMER_PRICING   │
├──────────────────────────┤  ├──────────────────┤   ├──────────────────────────┤
│ • id (PK)                │  │ • id (PK)        │   │ • id (PK)                │
│ • customerId (FK)        │  │ • customerId(FK) │   │ • customerId (FK)        │
│ • cardholderName         │  │ • customerName   │   │ • planId (FK)            │
│ • cardNumber             │  │ • planId (FK)    │   │ • monthlyPrice           │
│ • expiryMonth            │  │ • planName       │   │ • yearlyPrice            │
│ • expiryYear             │  │ • billingCycle   │   │ • monthlyDiscount (obj)  │
│ • cardBrand              │  │ • status         │   │ • yearlyDiscount (obj)   │
│ • cvv                    │  │ • startDate      │   │ • monthlyPriceAfter      │
│ • isDefault              │  │ • nextBillingDate│   │ • yearlyPriceAfter       │
│ • isActive               │  │ • trialEndDate   │   │ • billingStartDate       │
│ • bankName               │  │ • planPrice      │   │ • validUntil             │
│ • iyzcoCardToken         │  │ • discountAmount │   └──────────────────────────┘
│ • paynetCardToken        │  │ • discountPercent│            │
│ • binNumber              │  │ • finalAmount    │ 1:1        │ 1:N
│ • lastUsedAt             │  │ • autoRenew      │            ▼
│ • expiresAt              │  │ • cancelledAt    │   ┌──────────────────┐
│ • createdAt              │  │ • cancelReason   │   │  PLAN_DISCOUNTS  │
│ • updatedAt              │  │ • paymentMethod  │   ├──────────────────┤
└──────────────────────────┘  │ • cashPortion    │   │ • id (PK)        │
                              │ • cardPortion    │   │ • planId (FK)    │
                              │ • customerCardId │   │ • customerId(FK) │
                              │ • planDiscountId │   │ • discountType   │
                              │ • planCustomerP..│   │ • discountValue  │
                              │ • subscription_id│   │ • isActive       │
                              │ • company_code   │   │ • validFrom      │
                              │ • name_surname   │   │ • validUntil     │
                              │ • interval       │   │ • createdAt      │
                              │ • reference_no   │   │ • notes          │
                              │ • end_user_email │   └──────────────────┘
                              │ • end_user_gsm   │
                              │ • agent_id       │
                              │ • agent_amount   │
                              │ • company_amount │
                              │ • end_user_desc  │
                              │ • currency       │
                              │ • period         │
                              │ • user_name      │
                              │ • agent_note     │
                              │ • confirmation...|
                              │ • suceed_webhook │
                              │ • error_webhook  │
                              │ • confirmation_r..│
                              │ • send_mail      │
                              │ • send_sms       │
                              │ • is_fixed_price │
                              │ • agent_logo     │
                              │ • attempt_day_..│
                              │ • daily_attempt..|
                              │ • is_charge_on...|
                              │ • group_reference│
                              │ • otp_control    │
                              │ • plan[] (array) │
                              └──────────────────┘
                                     │
                                     │ 1:N
                                     ▼
                              ┌──────────────────────┐
                              │SUBSCRIPTION_PLAN_DET│
                              ├──────────────────────┤
                              │ • plan_id (PK)       │
                              │ • invoice_id         │
                              │ • val_date           │
                              │ • amount             │
                              │ • xact_id            │
                              │ • status             │
                              │ • status_desc        │
                              └──────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                     PLANS                                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ • id (PK)                          • monthlyPrice                                   │
│ • name                             • yearlyPrice                                    │
│ • description                      • currency                                       │
│ • projectId (FK)                   • features                                       │
│ • projectName                      • featuresList                                   │
│ • productIds (array FK)            • maxUsers                                       │
│ • productNames                     • maxStorage                                     │
│ • status                           • maxApiCalls                                    │
│ • trialDays                        • isStaticPlan                                   │
│ • createdAt                        • updatedAt                                      │
│ • planDiscounts (relasyon)         • planCustomerPricings (relasyon)                │
└─────────────────────────────────────────────────────────────────────────────────────┘
         │                                          │
         │ 1:N                                      │ 1:N
         ▼                                          ▼
┌──────────────────────┐                 ┌──────────────────────┐
│    PROJECTS          │                 │     PRODUCTS         │
├──────────────────────┤                 ├──────────────────────┤
│ • id (PK)            │                 │ • id (PK)            │
│ • name               │                 │ • name               │
│ • description        │                 │ • description        │
│ • status             │                 │ • projectId (FK)     │
│ • startDate          │                 │ • projectName        │
│ • endDate            │                 │ • basePrice          │
│ • apiKey             │                 │ • price              │
│ • webhookUrl         │                 │ • currency           │
│ • licenseApiUrl      │                 │ • status             │
│ • iyzicoMerchantKey  │                 │ • discountType       │
└──────────────────────┘                 │ • discountValue      │
                                         │ • discountValidFrom  │
                                         │ • discountValidUntil │
                                         │ • finalPrice         │
                                         │ • discountAmount     │
                                         │ • billingType        │
                                         │ • recurringInterval  │
                                         │ • trialDays          │
                                         │ • features[]         │
                                         │ • maxUsers           │
                                         │ • storageLimit       │
                                         │ • createdAt          │
                                         │ • updatedAt          │
                                         └──────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│                              INVOICES & PAYMENTS                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│ INVOICES:                              PAYMENTS:                                 │
│ • id (PK)                              • id (PK)                                 │
│ • invoiceNumber                        • description                             │
│ • customerId (FK)                      • customer                                │
│ • customerName                         • customerId (FK)                         │
│ • subscriptionId (FK)                  • amount                                  │
│ • items (relasyon)                     • status                                  │
│ • subtotal                             • date                                    │
│ • discountTotal                        • type                                    │
│ • taxRate                              • subscriptionId (FK)                     │
│ • taxAmount                            • invoiceId (FK)                          │
│ • total                                • paymentMethod                           │
│ • currency                             • transactionId                           │
│ • status                               • refundAmount                            │
│ • issueDate                            • refundReason                            │
│ • dueDate                              • refundedAt                              │
│ • paidAt                               └──────────────────────────────────────────┘
│ • notes                                         │
└──────────────────────────────────────────────────┘
         │                                         │ 1:N
         │ 1:N                                     ▼
         ▼                              ┌──────────────────────┐
┌──────────────────────┐                │   INVOICE_ITEMS      │
│   INVOICE_ITEMS      │                ├──────────────────────┤
├──────────────────────┤                │ • id (PK)            │
│ • id (PK)            │                │ • productId (FK)     │
│ • productId (FK)     │                │ • productName        │
│ • productName        │                │ • description        │
│ • description        │                │ • quantity           │
│ • quantity           │                │ • unitPrice          │
│ • unitPrice          │                │ • discountType       │
│ • discountType       │                │ • discountValue      │
│ • discountValue      │                │ • discountAmount     │
│ • discountAmount     │                │ • total              │
│ • total              │                └──────────────────────┘
└──────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│                            LICENSES & USAGE TRACKING                             │
├──────────────────────────────────────────────────────────────────────────────────┤
│ LICENSES:                              USAGE_RECORDS:                            │
│ • id (PK)                              • id (PK)                                 │
│ • name                                 • customerId (FK)                         │
│ • customer                             • subscriptionId (FK)                     │
│ • customerId (FK)                      • metric                                  │
│ • type                                 • value                                   │
│ • status                               • unit                                    │
│ • expiryDate                           • recordedAt                              │
│ • amount                               • billingPeriodStart                      │
│ • productId (FK)                       • billingPeriodEnd                        │
│ • productName                          └──────────────────────────────────────────┘
│ • licenseKey                                    │
│ • maxActivations                               │ 1:N
│ • currentActivations                           ▼
│ • features[]                          ┌──────────────────────────┐
│ • metadata                             │   BILLING_HISTORY        │
│ • activationHistory (relasyon)         ├──────────────────────────┤
└──────────────────────────────────────────┤ • id (PK)                │
         │                                 │ • customerId (FK)        │
         │ 1:N                             │ • customerName           │
         ▼                                 │ • subscriptionId (FK)    │
┌──────────────────────────────┐          │ • invoiceId (FK)         │
│ LICENSE_ACTIVATIONS          │          │ • amount                 │
├──────────────────────────────┤          │ • currency               │
│ • id (PK)                    │          │ • status                 │
│ • activatedAt                │          │ • billingDate            │
│ • deviceId                   │          │ • paidAt                 │
│ • deviceName                 │          │ • paymentMethod          │
│ • ipAddress                  │          │ • transactionId          │
│ • isActive                   │          └──────────────────────────┘
│ • deactivatedAt              │
└──────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│                            WEBHOOK EVENTS                                        │
├──────────────────────────────────────────────────────────────────────────────────┤
│ WEBHOOK_EVENTS:                                                                 │
│ • id (PK)                                                                       │
│ • type (subscription.created | subscription.cancelled | payment.success |      │
│         payment.failed | license.activated | license.expired)                  │
│ • payload (JSON)                                                                │
│ • createdAt                                                                     │
│ • processedAt                                                                   │
│ • status (pending | processed | failed)                                        │
│ • retryCount                                                                    │
│ • error                                                                         │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## İlişkiler Özeti (Relationships Summary)

### 1. **Müşteri Merkez** (Customer-Centric)
```
CUSTOMERS
├── 1:N → CUSTOMER_CARDS (Müşteri kartları)
├── 1:N → SUBSCRIPTIONS (Müşteri abonelikleri)
├── 1:N → INVOICES (Müşteri faturaları)
├── 1:N → PLAN_CUSTOMER_PRICING (Müşteriye özel plan fiyatlandırması)
├── 1:N → PLAN_DISCOUNTS (Müşteri bazlı iskontolar)
├── 1:N → LICENSES (Müşteri lisansları)
├── 1:N → USAGE_RECORDS (Kullanım kayıtları)
└── 1:N → BILLING_HISTORY (Faturalama geçmişi)
```

### 2. **Plan & Ürün Yapısı**
```
PROJECTS
├── 1:N → PLANS (Projede tanımlı planlar)
└── 1:N → PRODUCTS (Projede tanımlı ürünler)

PLANS
├── N:M → PRODUCTS (Plan içindeki ürünler)
├── 1:N → PLAN_DISCOUNTS (Plan iskontolar)
└── 1:N → PLAN_CUSTOMER_PRICING (Plan müşteri fiyatlandırması)
```

### 3. **Abonelik & Ödeme Akışı**
```
SUBSCRIPTIONS
├── 1:N → INVOICES (Abonelikten oluşan faturalar)
├── 1:N → PAYMENTS (Abonelik ödemeleri)
├── 1:N → USAGE_RECORDS (Abonelik kullanımı)
├── N:1 → CUSTOMER_CARDS (Ödeme kartı kullanımı)
└── N:1 → PLAN_DISCOUNTS (Uygulanan iskonto)
```

### 4. **Fatura Yapısı**
```
INVOICES
├── 1:N → INVOICE_ITEMS (Fatura satırları)
├── N:1 → CUSTOMERS (Faturalanan müşteri)
├── N:1 → SUBSCRIPTIONS (İlgili abonelik)
└── 1:N → PAYMENTS (Fatura ödemeleri)
```

### 5. **Lisans Yönetimi**
```
LICENSES
├── 1:N → LICENSE_ACTIVATIONS (Lisans aktivasyonları)
├── N:1 → CUSTOMERS (Lisans sahibi)
└── N:1 → PRODUCTS (Lisans ürünü)
```

---

## Alan Açıklamaları (Field Definitions)

### Müşteri Alanları
| Alan | Tip | Açıklama |
|------|-----|---------|
| id | UUID | Benzersiz müşteri kimliği |
| name | string | Müşteri adı |
| email | string | E-posta adresi |
| company | string | Şirket adı |
| status | enum | active, inactive |
| taxId | string | Vergi kimlik numarası |
| defaultCardId | FK | Varsayılan ödeme kartı |
| discountTier | enum | standard, silver, gold, platinum |

### Abonelik Alanları
| Alan | Tip | Açıklama |
|------|-----|---------|
| id | UUID | Benzersiz abonelik kimliği |
| customerId | FK | Müşteri referansı |
| planId | FK | Plan referansı |
| billingCycle | enum | monthly, yearly, trial |
| status | enum | active, cancelled, expired, trial, pending, paused |
| startDate | date | Abonelik başlama tarihi |
| nextBillingDate | date | Sonraki faturalama tarihi |
| autoRenew | boolean | Otomatik yenileme |
| paymentMethod | enum | credit_card, cash, mixed |

### Plan Alanları
| Alan | Tip | Açıklama |
|------|-----|---------|
| id | UUID | Benzersiz plan kimliği |
| name | string | Plan adı |
| monthlyPrice | number | Aylık fiyat |
| yearlyPrice | number | Yıllık fiyat |
| productIds | array | İçerdiği ürünler |
| trialDays | number | Deneme süresi (gün) |
| maxUsers | number | Maximum kullanıcı sayısı |

### İskonto Alanları
| Alan | Tip | Açıklama |
|------|-----|---------|
| discountType | enum | none, percentage, amount |
| discountValue | number | İskonto değeri (% veya sabit tutar) |
| validFrom | date | İskonto geçerlilik başlangıcı |
| validUntil | date | İskonto geçerlilik sonu |

### Kart Alanları
| Alan | Tip | Açıklama |
|------|-----|---------|
| id | UUID | Benzersiz kart kimliği |
| customerId | FK | Müşteri referansı |
| cardNumber | string | Son 4 hanesi görüntülenebilir |
| cardBrand | enum | visa, mastercard, amex, other |
| isDefault | boolean | Varsayılan ödeme kartı mı |
| isActive | boolean | Kart aktif mi |
| iyzcoCardToken | string | iyzico API token |

---

## Veritabanı Normalizasyonu (Normalization)

### 1NF (First Normal Form)
- ✅ Tüm alanlar atomiktir
- ✅ Tekrar eden gruplar elimine edilmiştir

### 2NF (Second Normal Form)
- ✅ Tüm non-key alanlar tam olarak primary key'e bağımlıdır

### 3NF (Third Normal Form)
- ✅ Non-key alanlar başka non-key alanlara bağımlı değildir
- ✅ PLAN_DISCOUNTS ve PLAN_CUSTOMER_PRICING ayrı tablolardır

---

## İndeksler (Recommended Indexes)

```sql
-- Performans için önerilen indeksler
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);

CREATE INDEX idx_subscriptions_customerId ON subscriptions(customerId);
CREATE INDEX idx_subscriptions_planId ON subscriptions(planId);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

CREATE INDEX idx_invoices_customerId ON invoices(customerId);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_issueDate ON invoices(issueDate);

CREATE INDEX idx_payments_subscriptionId ON payments(subscriptionId);
CREATE INDEX idx_payments_customerId ON payments(customerId);
CREATE INDEX idx_payments_status ON payments(status);

CREATE INDEX idx_licenses_customerId ON licenses(customerId);
CREATE INDEX idx_licenses_status ON licenses(status);

CREATE INDEX idx_usage_records_subscriptionId ON usage_records(subscriptionId);
CREATE INDEX idx_usage_records_recordedAt ON usage_records(recordedAt);

CREATE INDEX idx_customer_cards_customerId ON customer_cards(customerId);
CREATE INDEX idx_customer_cards_isDefault ON customer_cards(isDefault);

CREATE INDEX idx_plan_discounts_planId ON plan_discounts(planId);
CREATE INDEX idx_plan_discounts_customerId ON plan_discounts(customerId);

CREATE INDEX idx_webhook_events_type ON webhook_events(type);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
```

---

## Veri Akışı (Data Flow)

### 1. Müşteri Kaydı
```
Customer Registration
    ↓
CUSTOMERS tablosuna kayıt
    ↓
CUSTOMER_CARDS (isteğe bağlı)
```

### 2. Abonelik Oluşturma
```
Plan seçimi
    ↓
SUBSCRIPTIONS tablosuna kayıt
    ↓
PLAN_CUSTOMER_PRICING (özel fiyatlandırma varsa)
    ↓
İlk INVOICE oluştur
```

### 3. Faturalama Döngüsü
```
Abonelik süresi dolmak üzere
    ↓
INVOICE oluştur + INVOICE_ITEMS
    ↓
PAYMENT kaydı oluştur
    ↓
BILLING_HISTORY güncelle
    ↓
SUBSCRIPTION'ı yenile (autoRenew=true ise)
```

### 4. Lisans Yönetimi
```
Ürün satın alınması
    ↓
LICENSE kaydı oluştur
    ↓
LICENSE_ACTIVATION (cihaz aktivasyonu)
    ↓
USAGE_RECORDS (kullanım izleme)
```

---

## Güvenlik Notları

⚠️ **Hassas Veriler:**
- CVV numarası
- Tam kart numarası
- iyzico/Paynet token'ları

💾 **Veri Depolama:**
- Hassas veriler şifrelenmiş durumda tutulmalı
- PCI DSS standardına uyulmalı
- Ödeme gateway'leri token-based access kullanmalı

🔒 **Erişim Kontrolü:**
- Database bağlantıları şifrelenmiş olmalı
- API key'ler environment variables'da tutulmalı
- Webhook'lar imzalanmalı (signature verification)

---

## Sorgu Örnekleri

### Aktif Abonelikleri Getir
```sql
SELECT s.*, c.name, p.name as planName
FROM subscriptions s
JOIN customers c ON s.customerId = c.id
JOIN plans p ON s.planId = p.id
WHERE s.status = 'active'
  AND s.nextBillingDate <= CURRENT_DATE
ORDER BY s.nextBillingDate ASC;
```

### Müşteri Gelir Özeti
```sql
SELECT 
  c.id, c.name,
  COUNT(DISTINCT i.id) as invoiceCount,
  SUM(i.total) as totalRevenue,
  AVG(i.total) as avgInvoiceAmount
FROM customers c
LEFT JOIN invoices i ON c.id = i.customerId
WHERE i.status IN ('paid', 'pending')
GROUP BY c.id, c.name
ORDER BY totalRevenue DESC;
```

### Plan-Müşteri İskonto Tarihi
```sql
SELECT 
  pd.id, pd.planId, pd.customerId,
  p.name as planName, c.name as customerName,
  pd.discountValue, pd.discountType,
  pd.validFrom, pd.validUntil
FROM plan_discounts pd
JOIN plans p ON pd.planId = p.id
JOIN customers c ON pd.customerId = c.id
WHERE pd.isActive = true
  AND pd.validFrom <= CURRENT_DATE
  AND (pd.validUntil IS NULL OR pd.validUntil >= CURRENT_DATE)
ORDER BY p.name, c.name;
```

### Kullanım Takibi
```sql
SELECT 
  ur.subscriptionId, s.customerId,
  c.name as customerName,
  ur.metric, ur.value, ur.unit,
  ur.billingPeriodStart, ur.billingPeriodEnd
FROM usage_records ur
JOIN subscriptions s ON ur.subscriptionId = s.id
JOIN customers c ON s.customerId = c.id
WHERE ur.billingPeriodEnd >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
ORDER BY ur.recordedAt DESC;
```

---

## Genişleme Noktaları (Extension Points)

Gelecekte eklenebilecek entityler:

- **TEAMS**: Müşteri içinde takımlar
- **ROLES**: Rol tabanlı erişim kontrolü
- **AUDIT_LOGS**: Sistem denetim günlükleri
- **API_KEYS**: Müşteri API anahtarları
- **NOTIFICATIONS**: Bildirimleri takip
- **TAX_RULES**: Vergi kuralları yönetimi
- **CURRENCY_RATES**: Döviz kurları
- **REFUNDS**: İade işlemleri detayları

---

## Veri Saklama Politikası (Data Retention)

| Tablo | Saklama Süresi | Notlar |
|-------|---|---|
| CUSTOMERS | İlişkili kayıt olmadığı sürece | Hesap silme talebi |
| SUBSCRIPTIONS | 7 yıl | Muhasebe-vergi kanunu |
| INVOICES | 7 yıl | Yasal gereklilik |
| PAYMENTS | 7 yıl | Yasal gereklilik |
| USAGE_RECORDS | 3 yıl | Analitik |
| CUSTOMER_CARDS | 1 yıl (expiresAt) | Süresi dolmuş kartlar |
| WEBHOOK_EVENTS | 30 gün | Loglama/debugging |
| LICENSE_ACTIVATIONS | 1 yıl | Activation history |

---

*Diagram son güncelleme: 23 Aralık 2025*
