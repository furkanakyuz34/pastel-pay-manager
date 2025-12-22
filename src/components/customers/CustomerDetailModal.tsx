import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Subscription, Payment, Customer, CustomerCard } from "@/types";
import { Mail, Phone, Building2, MapPin, RefreshCw, CreditCard } from "lucide-react";
import { CustomerCardsModal } from "./CustomerCardsModal";

interface CustomerDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  subscriptions: Subscription[];
  payments: Payment[];
}

export function CustomerDetailModal({
  open,
  onOpenChange,
  customer,
  subscriptions,
  payments,
}: CustomerDetailModalProps) {
  const [cardsOpen, setCardsOpen] = useState(false);
  const [customerCards, setCustomerCards] = useState<CustomerCard[]>(
    customer?.cards || []
  );
  const [defaultCardId, setDefaultCardId] = useState<string | undefined>(
    customer?.defaultCardId
  );

  const customerSubscriptions = useMemo(() => {
    if (!customer) return [];
    return subscriptions.filter((sub) => sub.customerId === customer.id);
  }, [customer, subscriptions]);

  const customerPayments = useMemo(() => {
    if (!customer) return [];
    return payments.filter((payment) => payment.customer === customer.name);
  }, [customer, payments]);

  const totalSubscriptionAmount = useMemo(() => {
    return customerSubscriptions.reduce((sum, sub) => {
      const amount = parseFloat(sub.amount.replace("₺", "").replace(".", "").replace(",", ".")) || 0;
      return sum + amount;
    }, 0);
  }, [customerSubscriptions]);

  const totalPaymentAmount = useMemo(() => {
    return customerPayments
      .filter((p) => p.type === "incoming" && p.status === "completed")
      .reduce((sum, payment) => {
        const amount = parseFloat(payment.amount.replace("₺", "").replace(".", "").replace(",", ".")) || 0;
        return sum + amount;
      }, 0);
  }, [customerPayments]);

  const handleAddCard = (card: CustomerCard) => {
    setCustomerCards([...customerCards, card]);
    if (customerCards.length === 0) {
      setDefaultCardId(card.id);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    setCustomerCards(customerCards.filter((c) => c.id !== cardId));
    if (defaultCardId === cardId) {
      const remainingCards = customerCards.filter((c) => c.id !== cardId);
      setDefaultCardId(remainingCards[0]?.id);
    }
  };

  const handleSetDefault = (cardId: string) => {
    setDefaultCardId(cardId);
  };

  if (!customer) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-[900px] max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center justify-between">
              <span>{customer.name}</span>
              <Badge variant={customer.status === "active" ? "success" : "secondary"}>
                {customer.status === "active" ? "Aktif" : "Pasif"}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border border-border bg-muted/30">
              {customer.company && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Şirket:</span>
                  <span className="text-sm font-medium text-foreground">{customer.company}</span>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">E-posta:</span>
                  <span className="text-sm font-medium text-foreground">{customer.email}</span>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Telefon:</span>
                  <span className="text-sm font-medium text-foreground">{customer.phone}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-2 md:col-span-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Adres:</span>
                  <span className="text-sm font-medium text-foreground">{customer.address}</span>
                </div>
              )}
            </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="text-sm text-muted-foreground">Aktif Abonelikler</p>
              <p className="text-2xl font-bold text-foreground">
                {customerSubscriptions.filter((s) => s.status === "active" || s.status === "trial").length}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="text-sm text-muted-foreground">Toplam Abonelik Tutarı</p>
              <p className="text-2xl font-bold text-foreground">₺{totalSubscriptionAmount.toLocaleString("tr-TR")}</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="text-sm text-muted-foreground">Toplam Ödeme</p>
              <p className="text-2xl font-bold text-success">₺{totalPaymentAmount.toLocaleString("tr-TR")}</p>
            </div>
          </div>

          {/* Cards Section */}
          <div className="p-4 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">Ödeme Kartları</span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setCardsOpen(true)}
              >
                {customerCards.length > 0 ? `${customerCards.length} Kart` : "Kart Ekle"}
              </Button>
            </div>
            {customerCards.length > 0 && (
              <div className="space-y-2">
                {customerCards.slice(0, 3).map((card) => (
                  <div key={card.id} className="flex items-center gap-2 text-sm">
                    <Badge 
                      variant={card.isDefault ? "default" : "secondary"}
                      className="whitespace-nowrap"
                    >
                      {card.cardNumber}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {card.expiryMonth}/{card.expiryYear}
                    </span>
                  </div>
                ))}
                {customerCards.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{customerCards.length - 3} daha
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Tabs for Subscriptions and Payments */}
          <Tabs defaultValue="subscriptions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="subscriptions">
                Abonelikler ({customerSubscriptions.length})
              </TabsTrigger>
              <TabsTrigger value="payments">
                Ödemeler ({customerPayments.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="subscriptions" className="mt-4">
              {customerSubscriptions.length > 0 ? (
                <div className="max-h-[400px] overflow-y-auto">
                  <CustomerSubscriptionTable subscriptions={customerSubscriptions} />
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Bu müşteriye ait abonelik bulunmamaktadır.
                </div>
              )}
            </TabsContent>
            <TabsContent value="payments" className="mt-4">
              {customerPayments.length > 0 ? (
                <div className="max-h-[400px] overflow-y-auto">
                  <CustomerPaymentList payments={customerPayments} />
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Bu müşteriye ait ödeme bulunmamaktadır.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>

    {/* Customer Cards Modal */}
    <CustomerCardsModal
        open={cardsOpen}
        onOpenChange={setCardsOpen}
        customerId={customer?.id || ""}
        customerName={customer?.name || ""}
        cards={customerCards}
        defaultCardId={defaultCardId}
        onAddCard={handleAddCard}
        onDeleteCard={handleDeleteCard}
        onSetDefault={handleSetDefault}
    />
  </>
);
}

// Simplified Subscription Table for Customer Detail
function CustomerSubscriptionTable({ subscriptions }: { subscriptions: Subscription[] }) {
  const statusConfig = {
    active: { label: "Aktif", variant: "success" as const },
    trial: { label: "Deneme", variant: "pending" as const },
    expired: { label: "Süresi Doldu", variant: "destructive" as const },
    cancelled: { label: "İptal Edildi", variant: "secondary" as const },
    pending: { label: "Beklemede", variant: "warning" as const },
  };

  const billingCycleConfig = {
    monthly: "Aylık",
    yearly: "Yıllık",
    trial: "Deneme",
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Abonelik ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Plan
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Döngü
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Durum
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sonraki Faturalama
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tutar
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subscriptions.map((subscription) => (
              <tr key={subscription.id} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    {subscription.id}
                    {subscription.autoRenew && (
                      <RefreshCw className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">{subscription.planName}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{billingCycleConfig[subscription.billingCycle]}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusConfig[subscription.status].variant}>
                    {statusConfig[subscription.status].label}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">
                  {subscription.billingCycle === "trial" && subscription.trialEndDate
                    ? new Date(subscription.trialEndDate).toLocaleDateString("tr-TR")
                    : subscription.nextBillingDate
                    ? new Date(subscription.nextBillingDate).toLocaleDateString("tr-TR")
                    : "-"}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{subscription.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Simplified Payment List for Customer Detail
function CustomerPaymentList({ payments }: { payments: Payment[] }) {
  const statusConfig = {
    completed: { label: "Tamamlandı", variant: "success" as const },
    pending: { label: "Beklemede", variant: "warning" as const },
    failed: { label: "Başarısız", variant: "destructive" as const },
  };

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <div
          key={payment.id}
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">{payment.description}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(payment.date).toLocaleDateString("tr-TR")}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p
              className={`font-semibold ${
                payment.type === "incoming" ? "text-success" : "text-destructive"
              }`}
            >
              {payment.type === "incoming" ? "+" : "-"}
              {payment.amount}
            </p>
            <Badge variant={statusConfig[payment.status].variant} className="mt-1">
              {statusConfig[payment.status].label}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

