# iyzico Abonelik Entegrasyonu

Bu dokümantasyon, iyzico API'sini kullanarak abonelik işlemlerinin nasıl yapılacağını açıklar.

## İçindekiler

1. [Kurulum](#kurulum)
2. [Konfigürasyon](#konfigürasyon)
3. [Servis API'si](#servis-apisi)
4. [React Hook'ları](#react-hooks)
5. [Kullanım Örnekleri](#kullanım-örnekleri)
6. [Hata Yönetimi](#hata-yönetimi)
7. [Test Etme](#test-etme)

## Kurulum

iyzico servis dosyaları aşağıdaki konumlarda bulunur:

- **Servis Dosyası**: `src/services/iyzico.ts`
- **Hook'lar**: `src/hooks/useIyzico.ts`
- **Örnek Component**: `src/components/iyzico/IyzCoIntegrationExample.tsx`
- **RTK Query Entegrasyonu**: `src/services/subscriptionApi.ts`

## Konfigürasyon

### Ortam Değişkenleri

`.env` dosyanızda aşağıdaki değişkenleri tanımlayın:

```env
VITE_IYZICO_API_KEY=your_api_key
VITE_IYZICO_SECRET_KEY=your_secret_key
VITE_IYZICO_BASE_URL=https://api.iyzipay.com  # Production
# Sandbox: https://api.sandbox.iyzipay.com
```

### Servis Başlatılması

```typescript
import { createIyzCoService, IyzCoConfig } from '@/services/iyzico';

const config: IyzCoConfig = {
  apiKey: process.env.VITE_IYZICO_API_KEY!,
  secretKey: process.env.VITE_IYZICO_SECRET_KEY!,
  baseUrl: process.env.VITE_IYZICO_BASE_URL!,
};

const service = createIyzCoService(config);
```

## Servis API'si

### 1. Yeni Abonelik Oluşturma

```typescript
const response = await service.createSubscription({
  pricingPlanReferenceCode: 'plan-001',
  subscriptionInitialStatus: 'ACTIVE', // veya 'PENDING'
  customer: {
    name: 'Ahmet',
    surname: 'Yıldız',
    email: 'ahmet@example.com',
    gsmNumber: '+905551234567',
    identityNumber: '12345678901',
    billingAddress: {
      address: 'Ankara Caddesi No:123',
      zipCode: '06100',
      contactName: 'Ahmet Yıldız',
      city: 'Ankara',
      country: 'TR',
    },
  },
  paymentCard: {
    cardHolderName: 'AHMET YILDIZ',
    cardNumber: '4111111111111111',
    expireMonth: '12',
    expireYear: '2026',
    cvc: '123',
  },
});
```

**Dönen Değer:**
```typescript
{
  status: 'success' | 'failure',
  data?: {
    referenceCode: string;
    subscriptionStatus: 'ACTIVE' | 'PENDING';
    trialDays: number;
    createdDate: number;
    startDate: number;
  }
}
```

### 2. Mevcut Müşteri İçin Abonelik Oluşturma

```typescript
const response = await service.createSubscriptionWithCustomer({
  pricingPlanReferenceCode: 'plan-002',
  subscriptionInitialStatus: 'ACTIVE',
  customerReferenceCode: 'customer-ref-001',
});
```

### 3. Pending Aboneliği Aktifleştirme

```typescript
const response = await service.activateSubscription(
  'subscription-reference-code'
);
```

**Başarılı Durumda:**
```typescript
{
  status: 'success',
  systemTime: 1640000000000
}
```

### 4. Aboneliği İptal Etme

```typescript
const response = await service.cancelSubscription(
  'subscription-reference-code'
);
```

### 5. Abonelik Detaylarını Alma

```typescript
const response = await service.getSubscriptionDetail(
  'subscription-reference-code'
);
```

### 6. Abonelikleri Arama

```typescript
const response = await service.searchSubscriptions({
  customerReferenceCode: 'customer-ref-001',
  limit: 20,
  offset: 0,
});
```

### 7. Ödeme Kartını Güncelleme

```typescript
const response = await service.updateSubscriptionCard({
  subscriptionReferenceCode: 'subscription-ref',
  paymentCard: {
    cardHolderName: 'NEW NAME',
    cardNumber: '5555555555554444',
    expireMonth: '06',
    expireYear: '2025',
    cvc: '456',
  },
});
```

## React Hooks

### useCreateSubscription

```typescript
import { useCreateSubscription } from '@/hooks/useIyzico';

function MyComponent() {
  const { loading, error, success, createSubscription } = useCreateSubscription(config);

  const handleCreate = async () => {
    const result = await createSubscription({
      // request params...
    });
    
    if (result) {
      console.log('Subscription created:', result);
    }
  };

  return (
    <button onClick={handleCreate} disabled={loading}>
      {loading ? 'Yükleniyor...' : 'Abonelik Oluştur'}
    </button>
  );
}
```

### useActivateSubscription

```typescript
const { loading, error, success, activate } = useActivateSubscription(config);

const handleActivate = async () => {
  const success = await activate('subscription-ref');
  if (success) {
    // Process...
  }
};
```

### useCancelSubscription

```typescript
const { loading, error, success, cancel } = useCancelSubscription(config);

const handleCancel = async () => {
  const success = await cancel('subscription-ref');
  if (success) {
    // Process...
  }
};
```

### useGetSubscriptionDetail

```typescript
const { loading, error, data, fetch } = useGetSubscriptionDetail(config);

const handleFetch = async () => {
  const detail = await fetch('subscription-ref');
  console.log('Subscription:', detail);
};
```

### useSearchSubscriptions

```typescript
const { loading, error, data, search } = useSearchSubscriptions(config);

const handleSearch = async () => {
  const results = await search(
    undefined,                    // subscriptionReferenceCode
    'customer-ref-001',          // customerReferenceCode
    20,                           // limit
    0                             // offset
  );
  console.log('Results:', results);
};
```

## Kullanım Örnekleri

### Örnek 1: Basit Abonelik Oluşturma

```typescript
import { useCreateSubscription } from '@/hooks/useIyzico';

export function SubscriptionForm() {
  const { loading, error, createSubscription } = useCreateSubscription(config);

  const handleSubmit = async (formData: SubscriptionFormData) => {
    const result = await createSubscription({
      pricingPlanReferenceCode: formData.planId,
      subscriptionInitialStatus: 'ACTIVE',
      customer: {
        name: formData.firstName,
        surname: formData.lastName,
        email: formData.email,
        gsmNumber: formData.phone,
        identityNumber: formData.identityNumber,
        billingAddress: {
          address: formData.address,
          zipCode: formData.zipCode,
          contactName: formData.firstName + ' ' + formData.lastName,
          city: formData.city,
          country: 'TR',
        },
      },
      paymentCard: {
        cardHolderName: formData.cardHolderName,
        cardNumber: formData.cardNumber,
        expireMonth: formData.expireMonth,
        expireYear: formData.expireYear,
        cvc: formData.cvc,
      },
    });

    if (result) {
      // Save to local database
      await saveSubscriptionToDatabase({
        customerId: formData.customerId,
        iyzicoReferenceCode: result.referenceCode,
        status: result.subscriptionStatus,
        createdAt: new Date(),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields... */}
    </form>
  );
}
```

### Örnek 2: Abonelik Yönetimi

```typescript
import { useActivateSubscription, useCancelSubscription } from '@/hooks/useIyzico';

export function SubscriptionManagement({ subscriptionId }: { subscriptionId: string }) {
  const { activate } = useActivateSubscription(config);
  const { cancel } = useCancelSubscription(config);

  const handleActivate = async () => {
    const success = await activate(subscriptionId);
    if (success) {
      // Update UI
    }
  };

  const handleCancel = async () => {
    if (confirm('Aboneliği iptal etmek istediğinizden emin misiniz?')) {
      const success = await cancel(subscriptionId);
      if (success) {
        // Redirect to dashboard
      }
    }
  };

  return (
    <div>
      <button onClick={handleActivate}>Aktifleştir</button>
      <button onClick={handleCancel}>İptal Et</button>
    </div>
  );
}
```

### Örnek 3: RTK Query Kullanımı

```typescript
import { useCreateIyzCoSubscriptionMutation } from '@/services/subscriptionApi';

function Component() {
  const [createSubscription, { isLoading, isSuccess }] = useCreateIyzCoSubscriptionMutation();

  const handleCreate = async () => {
    try {
      const result = await createSubscription({
        pricingPlanReferenceCode: 'plan-001',
        // ... other params
      }).unwrap();
      
      console.log('Created:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <button onClick={handleCreate} disabled={isLoading}>
      {isLoading ? 'Yükleniyor...' : 'Oluştur'}
    </button>
  );
}
```

## Hata Yönetimi

### Hook'larda Hata Yönetimi

```typescript
const { loading, error, success, createSubscription } = useCreateSubscription(config);

const handleCreate = async () => {
  await createSubscription(request);
  
  if (error) {
    console.error('Hata:', error);
    // Kullanıcıya hata mesajı göster
  }
  
  if (success) {
    console.log('Başarılı');
    // Başarı durumunu işle
  }
};
```

### API Yanıt Kontrol Etme

```typescript
const response = await service.createSubscription(request);

if (response.status === 'failure') {
  console.error('Error Code:', response.errorCode);
  console.error('Error Message:', response.errorMessage);
  
  // Hata kodlarına göre özel işlemler yap
  switch (response.errorCode) {
    case 'INVALID_CARD':
      // Kart bilgileri hatalı
      break;
    case 'INSUFFICIENT_FUNDS':
      // Yetersiz bakiye
      break;
    default:
      // Diğer hatalar
  }
}
```

## Test Etme

### Sandbox Test Kartları

iyzico tarafından sağlanan test kartları:

| Kart Numarası | Durum | Ay | Yıl | CVV |
|---|---|---|---|---|
| 4111111111111111 | Başarılı | 12 | 2026 | 123 |
| 5555555555554444 | Başarılı | 06 | 2025 | 456 |
| 9792838383838383 | Başarısız | 12 | 2026 | 123 |

### Test Müşteri Bilgileri

```typescript
const testCustomer = {
  name: 'Test',
  surname: 'User',
  email: 'test@example.com',
  gsmNumber: '+905551234567',
  identityNumber: '12345678901',
  billingAddress: {
    address: 'Test Caddesi No:1',
    zipCode: '34340',
    contactName: 'Test User',
    city: 'İstanbul',
    country: 'TR',
  },
};
```

### Entegrasyon Testleri

```typescript
describe('iyzico Subscription Service', () => {
  it('should create subscription successfully', async () => {
    const response = await service.createSubscription({
      pricingPlanReferenceCode: 'test-plan',
      subscriptionInitialStatus: 'ACTIVE',
      customer: testCustomer,
      paymentCard: testCard,
    });

    expect(response.status).toBe('success');
    expect(response.data?.referenceCode).toBeDefined();
  });

  it('should activate pending subscription', async () => {
    const response = await service.activateSubscription('subscription-ref');
    expect(response.status).toBe('success');
  });

  it('should cancel subscription', async () => {
    const response = await service.cancelSubscription('subscription-ref');
    expect(response.status).toBe('success');
  });

  it('should get subscription detail', async () => {
    const response = await service.getSubscriptionDetail('subscription-ref');
    expect(response.status).toBe('success');
    expect(response.data?.referenceCode).toBeDefined();
  });

  it('should search subscriptions', async () => {
    const response = await service.searchSubscriptions({
      customerReferenceCode: 'customer-ref',
    });
    
    expect(response.status).toBe('success');
    expect(Array.isArray(response.data)).toBe(true);
  });
});
```

## İleri Konular

### Webhook İşleme

iyzico abonelik olayları için webhook'lar gönderir:

```typescript
export async function handleIyzCoWebhook(req: Request) {
  const event = req.body;

  switch (event.eventType) {
    case 'subscription.created':
      // Abonelik oluşturuldu
      await updateSubscriptionStatus(
        event.data.subscriptionReferenceCode,
        'ACTIVE'
      );
      break;

    case 'subscription.cancelled':
      // Abonelik iptal edildi
      await updateSubscriptionStatus(
        event.data.subscriptionReferenceCode,
        'CANCELLED'
      );
      break;

    case 'subscription.failed':
      // Ödeme başarısız
      await handlePaymentFailure(event.data);
      break;
  }

  return { received: true };
}
```

### Error Recovery

```typescript
async function createSubscriptionWithRetry(
  request: CreateSubscriptionRequest,
  maxRetries = 3
) {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await service.createSubscription(request);
      
      if (response.status === 'success') {
        return response;
      }
    } catch (error) {
      lastError = error as Error;
      // Exponential backoff
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }

  throw lastError;
}
```

## Kaynaklar

- [iyzico API Dokümantasyonu](https://docs.iyzico.com)
- [iyzico Sandbox Ortamı](https://sandbox.iyzipay.com)
- [iyzico Control Panel](https://merchant.iyzipay.com)

---

**Son Güncelleme**: Aralık 22, 2025
**Versiyon**: 1.0.0
