# Müşteri Kartı Yönetim Sistemi

Müşterilerin ödeme kartlarını (kredi/debit kartlar) kaydetmek, yönetmek ve kullanmak için tam bir sistem.

## 📋 Özet

Bu sistem müşterilerin aşağıdaki işlemleri yapmasını sağlar:

- ✅ Kredi/debit kartlarını kaydetme
- ✅ Kartları listeleme ve görüntüleme
- ✅ Kartları silme
- ✅ Varsayılan ödeme kartını ayarlama
- ✅ Kartların son kullanma tarihini doğrulama
- ✅ iyzico/Paynet entegrasyonu

## 🏗️ Proje Yapısı

### Types (`src/types/index.ts`)

```typescript
export interface CustomerCard {
  id: string;
  customerId: string;
  cardholderName: string;
  cardNumber: string; // Son 4 hane: ****1234
  cardNumberFull?: string; // Şifreli tam kart numarası
  expiryMonth: number;
  expiryYear: number;
  cardBrand: "visa" | "mastercard" | "amex" | "other";
  cvv?: string; // Sunucu tarafında saklanmalı
  isDefault: boolean;
  isActive: boolean;
  savedFrom?: string; // iyzico, paynet, vb.
  binNumber?: string; // İlk 6 hane
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
  iyzcoCardToken?: string;
  paynetCardToken?: string;
}
```

Customer tipine şu alanlar eklenmişti:
- `cards?: CustomerCard[]` - Müşterinin kartları
- `defaultCardId?: string` - Varsayılan kartın ID'si

### Redux Slice (`src/features/customerCardSlice.ts`)

Kartlar için durum yönetimi:

```typescript
// Actions
- setCards(cards[]) - Tüm kartları ayarla
- addCard(card) - Yeni kart ekle
- updateCard(card) - Kartı güncelle
- deleteCard(cardId) - Kartı sil
- setDefaultCard(cardId) - Varsayılan kartı ayarla
- selectCard(cardId) - Kartı seç
- setLoading(boolean)
- setError(error)
- clearCards() - Tüm kartları temizle
- clearError()
```

### Store Integration (`src/store/store.ts`)

Redux store'a `customerCards` slice'ı eklenmiş:

```typescript
reducer: {
  // ...
  customerCards: customerCardSlice,
  // ...
}
```

### Servisler

#### Card Service (`src/services/cardService.ts`)

API çağrıları için:

```typescript
customerCardService.getCustomerCards(customerId)
customerCardService.addCard(customerId, cardData)
customerCardService.updateCard(customerId, cardId, updates)
customerCardService.deleteCard(customerId, cardId)
customerCardService.setDefaultCard(customerId, cardId)
customerCardService.validateCard(customerId, cardData)
customerCardService.getCard(customerId, cardId)
customerCardService.saveIyzcoCard(customerId, tokenData)
customerCardService.checkCardBalance(customerId, cardId)
```

### Hooks

#### useCustomerCards (`src/hooks/useCustomerCards.ts`)

Kartlarla çalışmak için özel hook:

```typescript
const {
  cards,                          // Tüm kartlar
  loading,                        // Yükleme durumu
  error,                         // Hata mesajı
  selectedCardId,               // Seçili kartın ID'si
  isOperating,                  // İşlem devam ediyor mu
  fetchCards,                   // Kartları getir
  addNewCard,                   // Yeni kart ekle
  updateExistingCard,          // Kartı güncelle
  removeCard,                  // Kartı sil
  setAsDefault,               // Varsayılan yap
  validateCardWithProvider,   // Doğrula
  getDefaultCard,            // Varsayılan kartı getir
  getActiveCards,           // Aktif kartları getir
  isCardExpired,           // Süresi doldu mu
  clearError,             // Hatayı temizle
} = useCustomerCards(customerId);
```

### Bileşenler

#### CustomerCardsModal (`src/components/customers/CustomerCardsModal.tsx`)

Kartları yönetmek için modal:

- **Tabs:**
  - Kartlar: Mevcut kartları listele
  - Yeni Kart Ekle: Form ile yeni kart ekle

- **Özellikler:**
  - Kart numarasının maskelenmesi (****1234)
  - Otomatik kart markası algılaması
  - Süresi dolmuş kartları göster
  - Varsayılan kartı işaretle
  - Kart silme
  - CVV gizle/göster

#### CustomerDetailModal (Güncellenmiş)

Müşteri detayında yeni "Ödeme Kartları" bölümü:

- Kartlar bölümünde kartları göster
- "Kart Ekle" butonu
- Son 3 kartı listeyle
- Varsayılan kartı vurgulamak

## 🚀 Kullanım Örnekleri

### 1. Müşteri Detayında Kartları Görmek

```typescript
// CustomerDetailModal otomatik olarak kartları gösterir
// "Kart Ekle" butonuna tıklayarak yeni kart ekleyebilirsiniz
```

### 2. Hook ile Kartları Yönetmek

```typescript
import { useCustomerCards } from "@/hooks/useCustomerCards";

function MyComponent() {
  const { 
    cards, 
    addNewCard, 
    removeCard, 
    setAsDefault 
  } = useCustomerCards(customerId);

  const handleAddCard = async (cardData) => {
    const newCard = await addNewCard(customerId, cardData);
  };

  const handleDelete = async (cardId) => {
    await removeCard(customerId, cardId);
  };

  const handleSetDefault = async (cardId) => {
    await setAsDefault(customerId, cardId);
  };
}
```

### 3. Redux ile Doğrudan Kullanmak

```typescript
import { useDispatch, useSelector } from "react-redux";
import { setDefaultCard, deleteCard } from "@/features/customerCardSlice";

function MyComponent() {
  const dispatch = useDispatch();
  const { cards } = useSelector((state) => state.customerCards);

  const handleSetDefault = (cardId) => {
    dispatch(setDefaultCard(cardId));
  };
}
```

## 🔌 API Endpoints (Beklenen)

Arka uç şu endpoint'leri sağlamalıdır:

```
GET    /api/customers/:customerId/cards
POST   /api/customers/:customerId/cards
GET    /api/customers/:customerId/cards/:cardId
PUT    /api/customers/:customerId/cards/:cardId
DELETE /api/customers/:customerId/cards/:cardId
POST   /api/customers/:customerId/cards/:cardId/set-default
POST   /api/customers/:customerId/cards/validate
POST   /api/customers/:customerId/cards/iyzico
GET    /api/customers/:customerId/cards/:cardId/balance
```

## 🔐 Güvenlik Notları

1. **CVV ve Tam Kart Numarası:** Asla frontenddde saklanmamalı, sadece gösterim sırasında geçici
2. **PCI DSS Uyumluluğu:** Kart verilerini işlemek sunucu tarafında yapılmalı
3. **Token Tabanlı Ödeme:** iyzico/Paynet gibi servislerle token alma önerilir
4. **HTTPS:** Tüm kart işlemleri HTTPS üzerinden yapılmalı

## 📝 Form Validasyonu

Zod ile tanımlanmış:

```typescript
const cardSchema = z.object({
  cardholderName: z.string().min(2, "Kart sahibi adı gereklidir"),
  cardNumber: z.string().regex(/^\d{13,19}$/, "Geçerli kart numarası"),
  expiryMonth: z.number().min(1).max(12),
  expiryYear: z.number().min(currentYear),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV 3-4 haneli"),
});
```

## 🔄 İyzico/Paynet Entegrasyonu

Kart tokenization için:

```typescript
// iyzico token'ı ile kart kaydetme
const result = await customerCardService.saveIyzcoCard(customerId, {
  cardToken: iyzcoToken,
  cardholderName: "John Doe",
  isDefault: true,
});
```

## 📊 Mevcut Durum

✅ **Tamamlanan:**
- CustomerCard type tanımı
- Redux slice ve actions
- Card Service (API çağrıları)
- useCustomerCards hook
- CustomerCardsModal bileşeni
- CustomerDetailModal entegrasyonu

⏳ **Opsiyonel Eklemeler:**
- Kart doğrulama (iyzico/Paynet)
- Kart kullanım geçmişi
- Düzenli ödeme metodu olarak ayarlama
- Kart logoları
- Gelişmiş güvenlik özellikleri

## 🛠️ Geliştirme Adımları

Arka uçta uygulanması gereken:

1. Kart depolama ve şifreleme
2. API endpoint'leri oluştur
3. iyzico/Paynet tokenization
4. Kart doğrulama
5. PCI DSS uyumluluğu sağla
6. Webhook'lar (ödeme sonuçları için)

## 📚 İlgili Dosyalar

- `src/types/index.ts` - Tip tanımları
- `src/features/customerCardSlice.ts` - Redux slice
- `src/services/cardService.ts` - API servisi
- `src/hooks/useCustomerCards.ts` - Custom hook
- `src/components/customers/CustomerCardsModal.tsx` - Kart yönetimi modal
- `src/components/customers/CustomerDetailModal.tsx` - Müşteri detayı
- `src/store/store.ts` - Redux store

## 🤝 Notlar

Bu sistem tamamen modüler ve backend'ten bağımsız. Backend hazır olduğunda, sadece `src/services/cardService.ts` dosyasında endpoint'leri güncellemek yeterli olacaktır.
