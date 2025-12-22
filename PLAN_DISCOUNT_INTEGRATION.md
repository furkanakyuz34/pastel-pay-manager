# Plan Yönetiminde İskonto Entegrasyonu

## 🎯 Yapılanlar

Plan oluştururken ve yönetirken müşteri bazlı iskontolar tamamen entegre edildi.

## 📁 Oluşturulan Dosyalar

### 1. PlanPriceDisplay Component
**Dosya:** `src/components/plans/PlanPriceDisplay.tsx`

Müşteri-plan kombinasyonunda fiyat ve iskontouyu gösteren component.

**Özellikler:**
- Orijinal plan fiyatını göster
- Müşteri için aktif iskontouyu otomatik bul
- Final fiyatı hesapla ve göster
- İskonto detaylarını göster (yüzde, tutar, son tarih)
- İskonto ekleme/düzenleme butonu

**Kullanım:**
```tsx
<PlanPriceDisplay
  plan={plan}
  customerId="customer-id"
  billingCycle="monthly"
  onManageDiscount={handleManageDiscount}
/>
```

**Çıktı:**
```
[Orijinal Fiyat] ₺500
[İskonto Badge] %10 İndirim Uygulanıyor
[Orijinal] ₺500
[İskonto] -₺50
[Final] ₺450
```

### 2. PlanDetailsModal Component
**Dosya:** `src/components/plans/PlanDetailsModal.tsx`

Plan detaylarını ve müşteri iskontolarını yönetmek için modal.

**2 Sekme:**

**a) Plan Özeti**
- Aylık/Yıllık fiyatlar
- Ürünler listesi
- Plan özelikleri

**b) Müşteri İskontouları**
- Bu plana atanmış iskontolar listesi
- Müşteri adı, iskonto türü, miktar, son tarih
- Iskonto ekle butonu
- Iskonto sil butonu

## 🔗 Entegrasyonlar

### 1. Subscription Form Modal'ında
**Dosya:** `src/components/subscriptions/SubscriptionFormModal.tsx`

Plan seçildiğinde müşteri için iskonto otomatik gösterilir.

**Akış:**
```
Müşteri Seçimi
    ↓
Plan Seçimi
    ↓
PlanPriceDisplay (iskonto varsa otomatik göster)
    ↓
Abonelik Oluşturulur
```

**Görünen Bilgiler:**
- Orijinal plan fiyatı
- Müşteri iskontousu (varsa)
- Final ödeme tutarı
- İskonto detayları

### 2. PlanTable (Dashboard)
**Dosya:** `src/components/dashboard/PlanTable.tsx`

"Detayları Görüntüle" butonu → PlanDetailsModal açılır

**Fayda:**
- Planın tüm bilgilerini görüntüle
- Bu plan için tüm iskontouları yönet
- Müşteriler başına iskontouları düzenle

## 💡 Kullanım Senaryoları

### Senaryo 1: Abonelik Oluştururken İskontolu Fiyat Görmek

```
1. Subscriptions sayfasına git
2. "Yeni Abonelik" tıkla
3. Müşteri seç (örn: "Ahmed Teknoloji")
4. Plan seç (örn: "Professional")
5. PlanPriceDisplay otomatik gösterilir:
   - Müşteri Professional planı için %10 iskontolu mu?
   - Varsa: ₺500 → ₺450 göster
   - Yoksa: ₺500 olarak göster
6. Aboneliği oluştur
```

### Senaryo 2: Plana Müşteri İskontolarını Yönetmek

```
1. Plans sayfasına git
2. Plan seç
3. "Detayları Görüntüle" tıkla
4. "Müşteri İskontouları" sekmesine git
5. "Iskonto Ekle" tıkla
6. Modal açılır:
   - Müşteri seç
   - İskonto tipi/değeri gir
   - Tarihleri ayarla
7. Uygula
8. Plan detayında listeye eklenir
```

### Senaryo 3: Mevcut İskontouyu Düzenlemek

```
1. Plan Detaylarında "Müşteri İskontouları" sekmesi
2. Müşteri iskontousunu görüntüle
3. "Sil" ile kaldır → Yenisini ekle (PlanDiscountModal)
4. Veya Discounts sayfasından düzenle
```

## 🎨 UI Akışı

### Subscription Modal Akışı
```
┌─────────────────────────────────┐
│ Müşteri Seçim Dropdown          │ ← Select from list
├─────────────────────────────────┤
│ Plan Seçim Dropdown             │ ← Müşteri-spesifik planlar
├─────────────────────────────────┤
│ PlanPriceDisplay                │ ← İskonto otomatik kontrol
│ ┌─────────────────────────────┐ │
│ │ Orijinal: ₺500              │ │
│ │ İskonto:  %10               │ │
│ │ -₺50                        │ │
│ │ Final:    ₺450              │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Faturalama Döngüsü Seçimi       │
├─────────────────────────────────┤
│ ... diğer alanlar ...           │
└─────────────────────────────────┘
```

### Plan Details Modal Akışı
```
┌────────────────────────────────────┐
│ Plan Adı                           │
├────────────────────────────────────┤
│ [Plan Özeti] [Müşteri İskontolar] │
├────────────────────────────────────┤
│ İçerik (Secilen tabı göster)       │
│                                    │
│ Tab: Müşteri İskontouları          │
│ ┌────────────────────────────────┐ │
│ │ [Iskonto Ekle] Butonu          │ │
│ │                                │ │
│ │ Müşteri: Ahmed Teknoloji       │ │
│ │ İskonto: %10 | Sil Butonu      │ │
│ │                                │ │
│ │ Müşteri: Zeki Yazılım          │ │
│ │ İskonto: ₺200 | Sil Butonu     │ │
│ └────────────────────────────────┘ │
├────────────────────────────────────┤
│ [Kapat]                            │
└────────────────────────────────────┘
```

## 🔧 Teknik Detaylar

### PlanPriceDisplay Props
```typescript
interface PlanPriceDisplayProps {
  plan: Plan;                    // Plan nesnesi
  customerId?: string;           // Müşteri ID (iskonto için)
  billingCycle?: "monthly" | "yearly";  // Default: "monthly"
  onManageDiscount?: () => void; // İskonto düzenleme callback
}
```

### PlanDetailsModal Props
```typescript
interface PlanDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan | null;
}
```

### Redux Integration
```typescript
// PlanPriceDisplay'de kullanılan
const discounts = useAppSelector(
  (state) => state.discounts.planDiscounts
);

// Müşteri için iskontouyu bul
const customerDiscount = discounts.find(
  (d) => d.customerId === customerId && d.planId === plan.id
);
```

## 🎯 İş Mantığı

### İskonto Otomatik Kontrolü

1. **Müşteri seçilir** → PlanPriceDisplay'a `customerId` iletilir
2. **Redux'tan iskontolar alınır** → `state.discounts.planDiscounts`
3. **Müşteri-plan kombinasyonu aranır**
4. **İskonto bulunursa:**
   - İskonto tipi ve değeri alınır
   - Final fiyat hesaplanır
   - Tüm bilgiler ekranda gösterilir
5. **İskonto bulunamazsa:**
   - Uyarı gösterilir: "Iskonto eklemek için butona tıklayın"

### Fiyat Hesaplama
```typescript
// discountService.ts'den
const priceInfo = calculatePlanPrice(
  plan,
  billingCycle,
  customerDiscount
);

// Sonuç:
{
  basePrice: 500,          // Orijinal
  discountType: "percentage",
  discountValue: 10,       // %10
  discountAmount: 50,      // ₺50
  finalPrice: 450          // Final fiyat
}
```

## ✅ Kontrol Listesi

- ✅ Subscription oluştururken iskonto gösterimi
- ✅ Plan detaylarında müşteri iskontolarını yönet
- ✅ Plana iskonto ekle/düzenle/sil
- ✅ Real-time fiyat hesaplaması
- ✅ Redux entegrasyonu
- ✅ Türkçe UI
- ✅ Responsive tasarım

## 🚀 Geliştirilecek Özellikler

- [ ] Bulk iskonto ataması (birden fazla müşteriye aynı iskonto)
- [ ] İskonto şablonları
- [ ] Plan bazlı iskonto raporları
- [ ] Otomatik iskonto kuralları
- [ ] İskonto tahmini hesaplama

---

**Son Güncelleme:** 22 Aralık 2025
**Versiyon:** 1.0.0
