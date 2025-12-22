# Müşteri Kartı Sistemi - Hızlı Başlangıç Rehberi

## 🎯 Ne Yapıldı?

Proje müşterilerin kredi/debit kartlarını yönetebilmesi için geliştirildi.

## 📦 Eklenen Bileşenler

### 1. **Yeni Dosyalar**
```
src/
├── types/index.ts (güncellendi)
│   └── CustomerCard interface eklendi
│
├── features/
│   └── customerCardSlice.ts (YENİ)
│       └── Redux state yönetimi
│
├── services/
│   └── cardService.ts (YENİ)
│       └── API çağrıları
│
├── hooks/
│   └── useCustomerCards.ts (YENİ)
│       └── Custom hook
│
└── components/customers/
    ├── CustomerCardsModal.tsx (YENİ)
    │   └── Kart yönetimi modal
    └── CustomerDetailModal.tsx (güncellendi)
        └── Kart bölümü eklendi

CUSTOMER_CARDS_SYSTEM.md (YENİ)
└── Detaylı dokümantasyon
```

## 🚀 Hızlı Kullanım

### Müşteri Detayında Kartları Görmek

Müşteri detayı açıldığında otomatik olarak kartlar gösterilir:
1. Müşteri listesinden bir müşteri seç
2. Detay panelinde "Ödeme Kartları" bölümünü gör
3. "Kart Ekle" butonuna tıkla
4. Modal açılır ve kart ekleyebilir/yönetebilirsin

### Kart Yönetimi

**Kart Ekleme:**
- Kart sahibi adı gir
- Kart numarasını gir (sadece rakamlar)
- Son kullanma ay ve yılını gir
- CVV gir
- "Kartı Kaydet" tıkla

**Varsayılan Kartı Ayarlama:**
- Kartın yanındaki ✓ butonuna tıkla
- Sistem otomatik olarak bu kartı varsayılan yapar

**Kartı Silme:**
- Kartın yanındaki 🗑️ butonuna tıkla
- Onayı ver

## 🔧 Geliştirici için

### Hook Kullanımı

```typescript
import { useCustomerCards } from "@/hooks/useCustomerCards";

function MyComponent() {
  const customerId = "CUS-001";
  const {
    cards,
    loading,
    addNewCard,
    removeCard,
  } = useCustomerCards(customerId);

  // Yeni kart ekle
  const handleAdd = async (cardData) => {
    await addNewCard(customerId, cardData);
  };

  // Kartı sil
  const handleDelete = async (cardId) => {
    await removeCard(customerId, cardId);
  };

  return (
    <div>
      {loading && <p>Yükleniyor...</p>}
      {cards.map(card => (
        <div key={card.id}>
          <p>{card.cardNumber}</p>
          <button onClick={() => handleDelete(card.id)}>Sil</button>
        </div>
      ))}
    </div>
  );
}
```

### Redux Direkt Kullanımı

```typescript
import { useDispatch, useSelector } from "react-redux";
import { setDefaultCard } from "@/features/customerCardSlice";

function MyComponent() {
  const dispatch = useDispatch();
  const cards = useSelector(state => state.customerCards.cards);

  const handleSetDefault = (cardId) => {
    dispatch(setDefaultCard(cardId));
  };

  return <div>...</div>;
}
```

## 🔌 Backend Entegrasyonu

### Gerekli API Endpoints

Backend aşağıdaki endpoint'leri sağlamalıdır:

```
GET    /api/customers/:customerId/cards
POST   /api/customers/:customerId/cards
PUT    /api/customers/:customerId/cards/:cardId
DELETE /api/customers/:customerId/cards/:cardId
POST   /api/customers/:customerId/cards/:cardId/set-default
```

### API Response Format

```json
{
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
  "success": true
}
```

## 🛡️ Güvenlik Uyarıları

1. **CVV:** Asla database'de saklanmamalı
2. **Kart Numarası:** Tam numarası şifreli saklanmalı
3. **PCI DSS:** Uyumlu olmalı
4. **Token Kullanımı:** iyzico/Paynet token'larını kullan
5. **HTTPS:** Tüm transferler şifreli olmalı

## 📱 Kullanıcı Arayüzü

### Modal Tabları

1. **Kartlar Sekmesi**
   - Tüm kartları listele
   - Her kart için: Kart numarası, marka, süresi, durum
   - Aksiyonlar: Varsayılan yap, Sil

2. **Yeni Kart Ekle Sekmesi**
   - Form ile yeni kart ekleme
   - Validasyon otomatik
   - İşlem başarılı olunca modal kapanır

## 🎨 Özellikler

- ✅ Kart maskeleme (****1234)
- ✅ Otomatik kart markası algılaması (Visa, Mastercard, Amex)
- ✅ Süresi dolmuş kart uyarısı
- ✅ Varsayılan kart işaretleme
- ✅ CVV gizle/göster
- ✅ Türkçe arayüz
- ✅ Responsive tasarım

## 📊 State Yapısı

```typescript
// Redux state
{
  customerCards: {
    cards: CustomerCard[],
    loading: boolean,
    error: string | null,
    selectedCardId: string | null,
  }
}
```

## 🔄 Veri Akışı

```
UI (Modal)
  ↓
Hook (useCustomerCards)
  ↓
Service (cardService)
  ↓
API Backend
  ↓
Redux Store
  ↓
UI (Render)
```

## 📝 Form Validasyonu

Tüm alanlar otomatik olarak doğrulanır:

- **Kart Sahibi:** Min 2 karakter
- **Kart Numarası:** 13-19 haneli
- **Ay:** 1-12 arası
- **Yıl:** Geçmiş yıl olamaz
- **CVV:** 3-4 haneli

## 🐛 Hata Yönetimi

Tüm işlemlerde hata yönetimi yapılmıştır:
- Toast notifications
- Redux error state
- Console logging
- User-friendly messages

## 📚 Dokümantasyon

Detaylı dokümantasyon için: `CUSTOMER_CARDS_SYSTEM.md`

## ⚙️ Test Etme

1. Müşteri sayfasına git
2. Bir müşteri seç
3. Detay panelinde "Kart Ekle" tıkla
4. Kart formu doldur
5. "Kartı Kaydet" tıkla
6. Kartın listeye eklendiğini kontrol et

## 🤝 Sonraki Adımlar

1. Backend API'leri geliştir
2. iyzico/Paynet tokenization ekle
3. Kart doğrulama ekle
4. Ödeme sırasında kartları seçme özelliği ekle
5. Düzenli ödeme ayarlaması ekle

## 📞 Destek

Sorularınız için dokümantasyonu kontrol edin veya proje maintainer'ı ile iletişime geçin.
