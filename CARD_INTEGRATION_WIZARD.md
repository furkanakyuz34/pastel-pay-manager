# Kart Yönetimi ve Satış Sihirbazı Entegrasyonu

## Genel Bakış

Müşterilerin kredi/debit kartlarını yönetmesi ve satış sihirbazı aracılığıyla ödeme kartlarını seçmesi için kapsamlı bir sistem oluşturulmuştur.

## Implementasyon Özeti

### 1. Veri Modeli (Tamamlandı)
**Dosya:** `src/types/index.ts`

`CustomerCard` interface'i aşağıdaki alanları içerir:
```typescript
export interface CustomerCard {
  id: string;
  customerId: string;
  cardholderName: string;
  bankName?: string;  // ✅ Yeni - Banka adı (Garanti, TEB, Akbank vb.)
  cardNumber: string; // Masked: ****1234
  cardNumberFull: string; // Encrypted on server
  expiryMonth: number;
  expiryYear: number;
  cardBrand: "visa" | "mastercard" | "amex" | "other";
  cvv?: string;
  binNumber?: string;
  isDefault: boolean;
  isActive: boolean;
  savedFrom: "manual" | "subscription" | "payment";
  lastUsedAt?: string;
  iyzcoCardToken?: string; // For payment integration
  createdAt: string;
  updatedAt: string;
}
```

### 2. Kart Yönetimi Bileşeni (Güncellenmiş)
**Dosya:** `src/components/customers/CustomerCardsModal.tsx`

#### Yeni Özellikler:
- ✅ **Banka Adı Alanı**: Garanti, TEB, Akbank gibi banka adları için autocomplete desteği
- ✅ **Kart Formu Şeması**: Zod validation ile bankName isteğe bağlı alanı
- ✅ **Kart Listeleme**: Banka adı badge'i ile kartların gösterimi
- ✅ **Form Alanları**:
  - Kart Sahibi Adı
  - Banka Adı (İsteğe bağlı, autocomplete)
  - Kart Numarası
  - Son Kullanma Ayı/Yılı
  - CVV

#### Kart Bilgisi Gösterimi:
```
Ahmet Yılmaz  [Garanti BBVA]  [Visa]  [Varsayılan]  [Süresi Dolmuş]
Kart Numarası: ****1234
Son Kullanma: 12/2026
```

### 3. Satış Sihirbazı Entegrasyonu (Yeni)
**Dosya:** `src/components/customers/wizard/CustomerSalesWizard.tsx`

#### Adım 4 - Ödeme İşlemleri:

**Yeni Özellikler:**
1. ✅ **Müşteri Kartlarının Listesi**: Seçili müşteriye ait kartların dropdown'ı
2. ✅ **Yeni Kart Ekleme**: Modal üzerinden yeni kart ekleme
3. ✅ **Otomatik Kartı Seçme**: Yeni kart eklendiğinde otomatik seçim
4. ✅ **Özet Bölümü**: Seçili kartın bilgilerini gösterme

#### UI Yapısı:
```
Step 4: Ödeme İşlemleri
├── Ödeme Kartı Seçimi
│   ├── Dropdown (Mevcut Kartlar)
│   └── Yeni Kart Ekle Butonu
├── Başlangıç Tarihi
├── Otomatik Yenileme
├── İç Not
└── Özet (Müşteri, Plan, Döngü, Fiyat, Kart)
```

#### Yeni State Değişkenleri:
```typescript
const [selectedCardId, setSelectedCardId] = useState<string>("");
const [showCardsModal, setShowCardsModal] = useState(false);
const { cards: customerCards, loading: cardsLoading } = useCustomerCards(selectedCustomerId);
```

#### Kart Seçim Dropdown:
- Kart sahibi adı gösterimi
- Banka adı badge'i (varsa)
- Kart numarasının son 4 hanesi
- Varsayılan kart göstergesi
- Yeni kart ekleme butonu

### 4. Banka Adı Autocomplete
**Dosya:** `src/components/customers/CustomerCardsModal.tsx`

Önceden tanımlı banka seçenekleri:
- Garanti BBVA
- TEB
- Akbank
- Halkbank
- İş Bankası
- Ziraat Bankası
- DenizBank
- Yapi Kredi
- ING Bank
- Santander
- Albaraka
- ICBC Turkey

Kullanıcılar kendi banka adlarını da girebilir (özel bankalar için).

### 5. Mock Veriler (Güncellenmiş)
**Dosya:** `src/mocks/customerCardsMocks.ts`

Banka adı örnekleri eklendi:
```typescript
{
  id: "CARD-001",
  customerId: "CUS-001",
  cardholderName: "Ahmet Yılmaz",
  bankName: "Garanti BBVA",  // ✅ Yeni
  cardNumber: "****1234",
  // ... diğer alanlar
}
```

## Özellik Akışı

### Kart Ekleme Akışı:
```
1. Satış Sihirbazı → Adım 4 (Ödeme)
2. "Yeni Kart Ekle" Tıkla
3. CustomerCardsModal Açılır
4. Kart Bilgilerini Gir:
   - Kart Sahibi Adı
   - Banka Adı (autocomplete)
   - Kart Numarası
   - Son Kullanma Tarihi
   - CVV
5. Kart Kaydedilir
6. Otomatik Olarak Seçilir
7. Satışa Devam Edilir
```

### Satış Sihirbazı Akışı:
```
Adım 1: Müşteri Seçimi
   ↓
Adım 2: Proje & Ürün Seçimi
   ↓
Adım 3: Plan & Fiyatlandırma
   ↓
Adım 4: Ödeme İşlemleri ← YENI BÖLÜM
   - Kart Seçimi (veya yeni kart ekleme)
   - Başlangıç Tarihi
   - Otomatik Yenileme
   - İç Not
   - Özet Görüntüleme
   ↓
Satışı Tamamla
```

## Teknik Detaylar

### Redux State Management
**Dosya:** `src/features/customerCardSlice.ts`

State yapısı:
```typescript
{
  customerCards: {
    cards: CustomerCard[],
    loading: boolean,
    error: string | null,
    selectedCardId: string | null,
  }
}
```

### API Servisleri
**Dosya:** `src/services/cardService.ts`

Mevcut API Metodları:
- `getCustomerCards(customerId: string)` - Müşteri kartlarını getir
- `addCard(customerId: string, card: CustomerCard)` - Kart ekle
- `updateCard(customerId: string, cardId: string, updates: Partial<CustomerCard>)` - Kartı güncelle
- `deleteCard(customerId: string, cardId: string)` - Kartı sil
- `setDefaultCard(customerId: string, cardId: string)` - Varsayılan kart ayarla
- `validateCard(card: CustomerCard)` - Kart doğrulaması

### Custom Hook
**Dosya:** `src/hooks/useCustomerCards.ts`

Sağlanan fonksiyonlar:
- `fetchCards(customerId)` - Kartları yükle
- `addNewCard(card)` - Yeni kart ekle
- `updateExistingCard(cardId, updates)` - Kartı güncelle
- `removeCard(cardId)` - Kartı sil
- `setAsDefault(cardId)` - Varsayılan yap
- `selectCard(cardId)` - Kart seç
- `clearCards()` - Tüm kartları temizle
- `clearError()` - Hata temizle

## Kullanım Örneği

### Satış Sihirbazında Kart Seçimi:
```tsx
// Adım 4'te otomatik olarak şu gösterilir:
{customerCards.length > 0 ? (
  <Select value={selectedCardId} onValueChange={setSelectedCardId}>
    <SelectTrigger>
      <SelectValue placeholder="Kartlardan birini seçin" />
    </SelectTrigger>
    <SelectContent>
      {customerCards.map((card) => (
        <SelectItem key={card.id} value={card.id}>
          {card.cardholderName} {card.bankName} •••• {card.cardNumber.slice(-4)}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
) : (
  <div>Henüz kart eklenmemiş - Yeni Kart Ekle</div>
)}
```

## Validasyon Kuralları

### Zod Schema (CustomerCardsModal):
```typescript
const cardSchema = z.object({
  cardholderName: z.string().min(2, "Kart sahibi adı gereklidir"),
  bankName: z.string().optional(), // ✅ Yeni - İsteğe bağlı
  cardNumber: z.string().regex(/^\d{13,19}$/, "Geçerli bir kart numarası giriniz"),
  expiryMonth: z.number().min(1).max(12, "Ay 1-12 arasında olmalıdır"),
  expiryYear: z.number().min(new Date().getFullYear(), "Geçmiş yıl girilemez"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV 3-4 haneli olmalıdır").optional(),
});
```

## Uyumlu Özellikler

### Dark Mode:
- ✅ Tüm renkler tailwind dark mode uyumlu
- ✅ Badge'ler theme-aware

### Responsive Design:
- ✅ Mobile (1 kolon) ve Desktop (2 kolon) layout
- ✅ Touch-friendly dropdown'lar

### Erişilebilirlik:
- ✅ Form labels
- ✅ Error messages
- ✅ Tooltip açıklamaları

## Yapılandırma Dosyaları

### Güncellenen Dosyalar:
1. **src/types/index.ts** - CustomerCard interface
2. **src/components/customers/CustomerCardsModal.tsx** - bankName alanı + gösterimi
3. **src/components/customers/wizard/CustomerSalesWizard.tsx** - Adım 4 entegrasyonu
4. **src/mocks/customerCardsMocks.ts** - bankName örnekleri
5. **src/store/store.ts** - customerCardSlice (mevcut)
6. **src/features/customerCardSlice.ts** - Redux slice (mevcut)
7. **src/services/cardService.ts** - API servis (mevcut)
8. **src/hooks/useCustomerCards.ts** - Custom hook (mevcut)

## İleri Adımlar

### Backend Entegrasyonu:
- [ ] API endpoint'leri oluştur
- [ ] Kart şifrelemesi (server-side)
- [ ] iyzico/Paynet token oluştur
- [ ] Veritabanı şeması (customerCards tablosu)

### Ödeme İşleme:
- [ ] Seçili kartla ödeme işlemi
- [ ] Hata yönetimi
- [ ] Başarı bildirim mesajları
- [ ] İşlem geçmişi kaydı

### Ek Özellikler:
- [ ] Kart resmi gösterimi
- [ ] 3D Secure doğrulaması
- [ ] Yinelenen ödeme yönetimi
- [ ] Kart numarası şifreli saklama

## Notlar

- Kart numaraları ve CVV verisi sunucu tarafında şifrelenmelidir
- iyzico entegrasyonu için token'lar saklanmalıdır
- Banka adı kullanıcı tarafından özelleştirilebilir
- Varsayılan kart otomatik seçim desteği bulunmaktadır
- Dark mode tam uyumlu

## Sorun Giderme

### Kartlar Yüklenmiyor:
1. Redux store'da customerCardSlice kayıtlı mı kontrol et
2. useCustomerCards hook'unu doğru customerId ile çağrıyor musun?
3. API response'ı kontrol et

### Form Doğrulamadan Hata:
1. Zod schema kurallarını kontrol et
2. FormField component'lerinin adları schema'yla eşleşiyor mu?
3. Console'da error mesajlarını kontrol et

### Kart Seçim Dropdown Boş:
1. customerCards array'inin doldu olduğunu kontrol et
2. selectedCustomerId'nin boş olmadığını kontrol et
3. useCustomerCards hook'unun doğru çalıştığını kontrol et
