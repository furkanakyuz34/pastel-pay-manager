/**
 * iyzico Subscription Integration Example Component
 * Demonstrates how to use iyzico subscription operations
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import {
  useCreateSubscription,
  useActivateSubscription,
  useCancelSubscription,
  useGetSubscriptionDetail,
  useSearchSubscriptions,
} from "@/hooks/useIyzico";
import { IyzCoConfig } from "@/services/iyzico";

// Example iyzico configuration
const IYZICO_CONFIG: IyzCoConfig = {
  apiKey: process.env.REACT_APP_IYZICO_API_KEY || "your_api_key",
  secretKey: process.env.REACT_APP_IYZICO_SECRET_KEY || "your_secret_key",
  baseUrl: process.env.REACT_APP_IYZICO_BASE_URL || "https://api.iyzipay.com",
};

interface IyzCoIntegrationExampleProps {
  subscriptionReferenceCode?: string;
}

export function IyzCoIntegrationExample({
  subscriptionReferenceCode,
}: IyzCoIntegrationExampleProps) {
  const [activeTab, setActiveTab] = useState<
    "create" | "activate" | "cancel" | "detail" | "search"
  >("create");

  // Hooks
  const createSub = useCreateSubscription(IYZICO_CONFIG);
  const activateSub = useActivateSubscription(IYZICO_CONFIG);
  const cancelSub = useCancelSubscription(IYZICO_CONFIG);
  const detailSub = useGetSubscriptionDetail(IYZICO_CONFIG);
  const searchSub = useSearchSubscriptions(IYZICO_CONFIG);

  // Example: Create subscription with card
  const handleCreateSubscription = async () => {
    const result = await createSub.createSubscription({
      pricingPlanReferenceCode: "pricing-plan-001",
      subscriptionInitialStatus: "PENDING", // or "ACTIVE"
      customer: {
        name: "Ahmet",
        surname: "Yıldız",
        email: "ahmet@example.com",
        gsmNumber: "+905551234567",
        identityNumber: "12345678901",
        billingAddress: {
          address: "Ankara Caddesi No:123",
          zipCode: "06100",
          contactName: "Ahmet Yıldız",
          city: "Ankara",
          country: "TR",
        },
      },
      paymentCard: {
        cardHolderName: "AHMET YILDIZ",
        cardNumber: "4111111111111111",
        expireMonth: "12",
        expireYear: "2026",
        cvc: "123",
      },
    });

    if (result) {
      console.log("Subscription created:", result);
    }
  };

  // Example: Create subscription for existing customer
  const handleCreateSubscriptionWithCustomer = async () => {
    const result = await createSub.createSubscription({
      pricingPlanReferenceCode: "pricing-plan-002",
      subscriptionInitialStatus: "ACTIVE",
      customer: {
        name: "Fatih",
        surname: "Demir",
        email: "fatih@example.com",
        gsmNumber: "+905559876543",
        identityNumber: "12345678902",
        billingAddress: {
          address: "İstanbul Caddesi No:456",
          zipCode: "34000",
          contactName: "Fatih Demir",
          city: "İstanbul",
          country: "TR",
        },
      },
      paymentCard: {
        cardHolderName: "FATIH DEMIR",
        cardNumber: "5555555555554444",
        expireMonth: "06",
        expireYear: "2025",
        cvc: "456",
      },
    });

    if (result) {
      console.log("Subscription created for customer:", result);
    }
  };

  // Example: Activate pending subscription
  const handleActivateSubscription = async () => {
    if (!subscriptionReferenceCode) {
      alert("Subscription reference code is required");
      return;
    }

    const success = await activateSub.activate(subscriptionReferenceCode);
    if (success) {
      console.log("Subscription activated");
    }
  };

  // Example: Cancel subscription
  const handleCancelSubscription = async () => {
    if (!subscriptionReferenceCode) {
      alert("Subscription reference code is required");
      return;
    }

    const success = await cancelSub.cancel(subscriptionReferenceCode);
    if (success) {
      console.log("Subscription cancelled");
    }
  };

  // Example: Get subscription details
  const handleGetDetail = async () => {
    if (!subscriptionReferenceCode) {
      alert("Subscription reference code is required");
      return;
    }

    const detail = await detailSub.fetch(subscriptionReferenceCode);
    if (detail) {
      console.log("Subscription detail:", detail);
    }
  };

  // Example: Search subscriptions
  const handleSearchSubscriptions = async () => {
    const results = await searchSub.search(undefined, undefined, 20, 0);
    if (results) {
      console.log("Search results:", results);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">iyzico Abonelik İşlemleri</CardTitle>
          <CardDescription className="text-muted-foreground">
            iyzico API ile abonelik yönetimi örneği
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "create" as const, label: "Oluştur" },
              { id: "activate" as const, label: "Aktifleştir" },
              { id: "cancel" as const, label: "İptal Et" },
              { id: "detail" as const, label: "Detay" },
              { id: "search" as const, label: "Ara" },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id)}
                size="sm"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-3">
            {/* Create Subscription */}
            {activeTab === "create" && (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Yeni Abonelik Oluştur</h3>
                <p className="text-sm text-muted-foreground">
                  Kredi kartı bilgilerini kullanarak yeni bir abonelik oluşturun.
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleCreateSubscription}
                    disabled={createSub.loading}
                    className="w-full"
                  >
                    {createSub.loading && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Pending Abonelik Oluştur
                  </Button>
                  <Button
                    onClick={handleCreateSubscriptionWithCustomer}
                    disabled={createSub.loading}
                    variant="outline"
                    className="w-full"
                  >
                    {createSub.loading && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Aktif Abonelik Oluştur
                  </Button>
                </div>

                {createSub.success && (
                  <Alert className="border-green-500/50 bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Abonelik başarıyla oluşturuldu!
                    </AlertDescription>
                  </Alert>
                )}

                {createSub.error && (
                  <Alert className="border-red-500/50 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      {createSub.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Activate Subscription */}
            {activeTab === "activate" && (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Pending Aboneliği Aktifleştir</h3>
                <p className="text-sm text-muted-foreground">
                  Pending durumundaki bir aboneliği aktif hale getirin.
                </p>
                <Button
                  onClick={handleActivateSubscription}
                  disabled={activateSub.loading}
                  className="w-full"
                >
                  {activateSub.loading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Aktifleştir
                </Button>

                {activateSub.success && (
                  <Alert className="border-green-500/50 bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Abonelik başarıyla aktifleştirildi!
                    </AlertDescription>
                  </Alert>
                )}

                {activateSub.error && (
                  <Alert className="border-red-500/50 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      {activateSub.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Cancel Subscription */}
            {activeTab === "cancel" && (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Aboneliği İptal Et</h3>
                <p className="text-sm text-muted-foreground">
                  Aktif bir aboneliği iptal edin.
                </p>
                <Button
                  onClick={handleCancelSubscription}
                  disabled={cancelSub.loading}
                  variant="destructive"
                  className="w-full"
                >
                  {cancelSub.loading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  İptal Et
                </Button>

                {cancelSub.success && (
                  <Alert className="border-green-500/50 bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Abonelik başarıyla iptal edildi!
                    </AlertDescription>
                  </Alert>
                )}

                {cancelSub.error && (
                  <Alert className="border-red-500/50 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      {cancelSub.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Get Detail */}
            {activeTab === "detail" && (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Abonelik Detaylarını Getir</h3>
                <p className="text-sm text-muted-foreground">
                  Belirli bir aboneliğin detaylı bilgilerini görüntüleyin.
                </p>
                <Button
                  onClick={handleGetDetail}
                  disabled={detailSub.loading}
                  className="w-full"
                >
                  {detailSub.loading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Detayları Getir
                </Button>

                {detailSub.data && (
                  <div className="bg-muted/50 p-3 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Referans Kodu:</span>
                      <code className="font-mono">{detailSub.data.referenceCode}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Durum:</span>
                      <Badge>{detailSub.data.subscriptionStatus}</Badge>
                    </div>
                  </div>
                )}

                {detailSub.error && (
                  <Alert className="border-red-500/50 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      {detailSub.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Search */}
            {activeTab === "search" && (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Abonelikleri Ara</h3>
                <p className="text-sm text-muted-foreground">
                  Tüm abonelikleri veya belirli bir müşteriye ait abonelikleri arayın.
                </p>
                <Button
                  onClick={handleSearchSubscriptions}
                  disabled={searchSub.loading}
                  className="w-full"
                >
                  {searchSub.loading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Ara
                </Button>

                {searchSub.data && searchSub.data.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {searchSub.data.length} abonelik bulundu
                    </p>
                    <div className="bg-muted/50 p-3 rounded-lg max-h-60 overflow-y-auto space-y-2">
                      {searchSub.data.map((sub: any) => (
                        <div key={sub.referenceCode} className="text-xs border-b border-border pb-2 last:border-0">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Ref:</span>
                            <code className="font-mono">{sub.referenceCode}</code>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-muted-foreground">Durum:</span>
                            <Badge variant="outline" className="text-xs">
                              {sub.subscriptionStatus}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchSub.error && (
                  <Alert className="border-red-500/50 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      {searchSub.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          {/* Info Box */}
          <Alert className="border-blue-500/50 bg-blue-500/10">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>Not:</strong> Gerçek kredi kartı bilgileri kullanmayın. Sandbox ortamında test
              için iyzico tarafından sağlanan test kartlarını kullanın.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

export default IyzCoIntegrationExample;
