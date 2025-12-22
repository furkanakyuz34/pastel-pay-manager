# Müşteri Bazlı Plan İskonto Sistemi

Bu dokümantasyon, yeni iskonto yönetim sisteminin nasıl çalıştığını açıklar.

## Genel Yapı

### Ürün vs Plan İskontousu

#### Eski Sistem (Ürün Bazlı - Devre Dışı)
```
Ürün → Fiyat + İskonto → Final Fiyat
```
**Sorun:** Ürün fiyatı sabit olmamaktaydı, iskonto direkt ürüne uygulanıyordu.

#### Yeni Sistem (Plan Bazlı)
```
Ürün → SABİT Fiyat
    ↓
Plan → Sabit Ürün Fiyatları
    ↓
Müşteri-Plan Kombinasyonu → İskonto Uygulanır → Final Fiyat
```

**Avantajlar:**
- ✅ Ürün fiyatları **HER ZAMAN SABİT**
- ✅ İskontolar **MÜŞTERİ BAZLI** ve **PLAN BAZLI**
- ✅ Farklı müşterilere **farklı iskontolar** uygulanabilir
- ✅ Plan fiyatları **değişmez**, müşteri fiyatlandırması esnetilir

## Veri Modeli

### 1. Product (Ürün)
```typescript
interface Product {
  id: string;
  name: string;
  price: string;          // Display: "₺5.000"
  basePrice: number;      // Numeric: 5000
  currency: string;       // "TRY"
  status: "active" | "inactive";
  // İskonto YALNIZCA plan seviyesinde uygulanır
}
```

### 2. Plan (Abonelik Planı)
```typescript
interface Plan {
  id: string;
  name: string;           // "Professional"
  monthlyPrice: number;   // 500 (SABİT)
  yearlyPrice: number;    // 5000 (SABİT)
  productIds: string[];   // Plan içindeki ürünler
  status: "active" | "inactive";
}
```

### 3. PlanDiscount (Müşteri-Plan İskontousu)
```typescript
interface PlanDiscount {
  id: string;
  planId: string;
  customerId: string;
  discountType: "percentage" | "amount"; // %10 veya ₺500
  discountValue: number;  // 10 (%) veya 500 (₺)
  isActive: boolean;
  validFrom: string;      // "2025-12-22"
  validUntil?: string;    // "2026-12-31"
  createdAt: string;
}
```

### 4. PlanCustomerPricing (Müşteri Fiyatlandırması)
```typescript
interface PlanCustomerPricing {
  id: string;
  planId: string;
  customerId: string;
  monthlyPrice: number;           // Orijinal fiyat
  yearlyPrice: number;
  monthlyDiscount?: PlanDiscount; // İskonto nesnesi
  yearlyDiscount?: PlanDiscount;
  monthlyPriceAfterDiscount: 450; // Final fiyat
  yearlyPriceAfterDiscount: 4500;
  billingStartDate: string;
  validUntil?: string;
}
```

### 5. Subscription (Abonelik)
```typescript
interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  billingCycle: "monthly" | "yearly";
  planPrice: string;          // "₺500" (Plan fiyatı)
  discountAmount?: string;    // "₺50" (İskonto tutarı)
  discountPercent?: number;   // 10 (%)
  finalAmount: string;        // "₺450" (Ödenen tutar)
  planDiscountId?: string;    // PlanDiscount referansı
}
```

## İskonto Hesaplaması

### Örnek Senaryo

**Plan:** Professional - ₺500/aylık, ₺5000/yıllık

**Müşteri A:** Yeni müşteri, %10 aylık iskonto
- Aylık: 500 - (500 × 10%) = 450₺
- Yıllık: 5000 - (5000 × 0%) = 5000₺

**Müşteri B:** VIP müşteri, ₺200 sabit iskonto
- Aylık: 500 - 200 = 300₺
- Yıllık: 5000 - 200 = 4800₺

```typescript
function calculateDiscount(
  basePrice: number,
  discountType: "percentage" | "amount",
  discountValue: number
) {
  let discountAmount = 0;
  
  if (discountType === "percentage") {
    discountAmount = (basePrice * discountValue) / 100;
  } else if (discountType === "amount") {
    discountAmount = Math.min(discountValue, basePrice);
  }
  
  return {
    discountAmount,
    finalPrice: Math.max(0, basePrice - discountAmount)
  };
}
```

## Kullanım

### 1. İskonto Oluşturma

```typescript
import { useAppDispatch } from "@/hooks/redux";
import { addPlanDiscount } from "@/features/discountSlice";

const dispatch = useAppDispatch();

const newDiscount: PlanDiscount = {
  id: "discount-123",
  planId: "plan-prof",
  customerId: "cust-001",
  discountType: "percentage",
  discountValue: 10,
  isActive: true,
  validFrom: "2025-12-22",
  validUntil: "2025-12-31",
  createdAt: new Date().toISOString()
};

dispatch(addPlanDiscount(newDiscount));
```

### 2. Plan Fiyatlandırması Oluşturma

```typescript
import { createPlanCustomerPricing } from "@/services/discountService";

const plan: Plan = {
  id: "plan-prof",
  name: "Professional",
  monthlyPrice: 500,
  yearlyPrice: 5000,
  // ...
};

const pricing = createPlanCustomerPricing(
  plan,
  "cust-001",
  {
    discountType: "percentage",
    discountValue: 10,
    notes: "Yeni müşteri indirimi"
  },
  undefined, // Yıllık iskonto yok
  "2025-12-22",
  "2025-12-31"
);

dispatch(addPlanCustomerPricing(pricing));
```

### 3. UI'da İskonto Uygulamak

```typescript
import { PlanDiscountModal } from "@/components/discounts/PlanDiscountModal";
import { useState } from "react";

function MyComponent() {
  const [modalOpen, setModalOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setModalOpen(true)}>
        İskonto Ekle
      </button>
      
      <PlanDiscountModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        customerId="cust-001"
        planId="plan-prof"
      />
    </>
  );
}
```

## İskonto Yönetimi Sayfası

Yeni **İskonto Yönetimi** sayfasına erişmek için:
1. Sidebar'daki "İskonto Yönetimi" menü öğesine tıklayın
2. Veya doğrudan `/discounts` URL'sine gidin

### Sayfanın Özellikleri

#### İstatistikler
- Toplam İskonto Sayısı
- Aktif İskonto Sayısı
- İskonto Yapılan Müşteri Sayısı

#### Sekmeler
1. **Tüm İskontolar** - Tüm iskontouların listesi
2. **Müşteriye Göre** - Müşteri başına gruplanan iskontolar
3. **Plana Göre** - Plan başına gruplanan iskontolar

#### İşlemler
- ➕ Yeni iskonto ekle
- ✏️ İskonto düzenle
- 🗑️ İskonto sil

## İskonto Modal'ı

### Sekmeler

#### 1. İskonto Detayları
- **Plan Seçimi** - Hangi plana iskonto
- **İskonto Tipi** - Yüzde (%) veya Sabit Tutar (₺)
- **İskonto Değeri** - Miktar (0-100 için % veya herhangi bir tutar)
- **Geçerlilik Tarihleri** - Başlangıç ve bitiş tarihleri
- **Notlar** - İskonto nedeni

#### 2. Fiyat Önizlemesi
Real-time hesaplanmış fiyatlar:
- Aylık fiyat (orijinal + iskonto + final)
- Yıllık fiyat (orijinal + iskonto + final)
- Toplam yıllık tasarruf

## Servis Fonksiyonları

### discountService.ts

```typescript
// İskonto hesaplama
calculateDiscount(basePrice, discountType, discountValue)
// Döner: { discountAmount, finalPrice }

// Müşteri fiyatlandırması oluşturma
createPlanCustomerPricing(plan, customerId, monthlyDiscount, yearlyDiscount)
// Döner: PlanCustomerPricing

// İskonto geçerliliğini kontrol
isDiscountValid(discount, checkDate?)
// Döner: boolean

// Aktif iskontouyu getirme
getActivePlanDiscount(customerId, planId, allDiscounts, billingCycle)
// Döner: PlanDiscount | undefined

// Plan fiyatını hesaplama
calculatePlanPrice(plan, billingCycle, discount?)
// Döner: { basePrice, discountType, discountValue, discountAmount, finalPrice }
```

## Redux State Yönetimi

### discountSlice.ts

```typescript
// Actions
dispatch(setPlanDiscounts(discounts))
dispatch(addPlanDiscount(discount))
dispatch(updatePlanDiscount(discount))
dispatch(deletePlanDiscount(id))

dispatch(setPlanCustomerPricings(pricings))
dispatch(addPlanCustomerPricing(pricing))
dispatch(updatePlanCustomerPricing(pricing))
dispatch(deletePlanCustomerPricing(id))

// State
const state = useAppSelector(state => state.discounts)
// { planDiscounts, customerPricings, loading, error, selectedDiscount }
```

## Abonelik Oluştururken İskonto

Abonelik oluştururken müşteri için iskonto otomatik uygulanır:

```typescript
const subscription = {
  id: "sub-001",
  customerId: "cust-001",
  planId: "plan-prof",
  planPrice: "₺500",           // Orijinal plan fiyatı
  discountAmount: "₺50",       // İskonto tutarı
  discountPercent: 10,         // %10
  finalAmount: "₺450",         // Müşteri öder
  planDiscountId: "discount-123",
  planCustomerPricingId: "pricing-456"
};
```

## İskonto Örnekleri

Önceden hazır iskonto templates'i:

```typescript
import { discountExamples } from "@/services/discountService";

// %10 aylık iskonto
discountExamples.monthlyPercentage
// { discountType: "percentage", discountValue: 10 }

// %15 yıllık iskonto
discountExamples.yearlyPercentage
// { discountType: "percentage", discountValue: 15 }

// 500₺ sabit iskonto
discountExamples.fixedAmount
// { discountType: "amount", discountValue: 500 }

// VIP %25 iskonto
discountExamples.vipDiscount
// { discountType: "percentage", discountValue: 25 }

// Startup %50 (6 ay)
discountExamples.startupPromo
// { discountType: "percentage", discountValue: 50 }
```

## Ortak Kullanım Senaryoları

### Senaryo 1: Yeni Müşteri İndirimи

```
Müşteri: Ahmed Teknoloji
Plan: Professional (₺500/aylık)
İskonto: %20 aylık (ilk 3 ay)
Final: ₺400/aylık
```

### Senaryo 2: Yıllık Ödeyen Müşteri

```
Müşteri: Zeki Yazılım
Plan: Enterprise (₺5000/yıllık)
İskonto: %15 yıllık
Final: ₺4250/yıllık
```

### Senaryo 3: Volume Discount

```
Müşteri: Mega Corp
Plan: Professional (₺500/aylık)
İskonto: ₺100 sabit aylık (tüm yıl)
Final: ₺400/aylık
```

## Teknik Notlar

### Geçerlilik Kontrolü

- İskonto `validFrom` tarihinden itibaren geçerlidir
- `validUntil` varsa, bu tarih dahil olmak üzere geçerlidir
- Tarihten sonra iskonto otomatik geçersiz hale gelir
- `isActive` false ise, tarih ne olursa olsun iskonto uygulanmaz

### Formatlama

```typescript
// Türkçe formatlı açıklama
formatDiscountDescription(discount, basePrice)
// "₺200 indirim"
// "%15 indirim (₺700)"
```

### Negatif Fiyat Koruması

```typescript
// Sabit iskonto hiçbir zaman fiyatı negatif yapmaz
finalPrice = Math.max(0, basePrice - discountAmount)
```

## Entegrasyon Noktaları

### 1. Abonelik Oluştururken
`src/components/subscriptions/SubscriptionFormModal.tsx` → Müşteri seçilince iskonto otomatik uygulanır

### 2. İfatura Oluştururken
`src/components/invoices/InvoiceFormModal.tsx` → Final fiyat iskonto ile gösterilir

### 3. Fatura Detayında
`src/components/invoices/InvoiceTable.tsx` → Ödenen ve iskonto tutarları görüntülenir

## Hatalar ve Çözümleri

| Hata | Neden | Çözüm |
|------|-------|-------|
| "Plan seçiniz" | Plan seçilmemiş | Modal'da plan dropdown'undan seç |
| "İskonto değeri 0'dan büyük" | 0 girilmiş | 1 veya daha büyük bir değer gir |
| "Bitiş tarihi başlangıçtan sonra" | Tarihleri yanlış girmişsin | validUntil > validFrom emin ol |
| İskonto gösterilmiyor | Tarih geçmiş | validUntil tarihini güncelleyin |

## Gelecek İyileştirmeler

- [ ] Otomatik iskonto kuralları (müşteri kategorisine göre)
- [ ] Askonto şablonları
- [ ] İskonto raporları ve analytics
- [ ] Toplu iskonto işlemleri
- [ ] İskonto onay akışı
- [ ] E-mail bildirimleri

---

**Son Güncelleme:** Aralık 22, 2025
**Versiyon:** 1.0.0
