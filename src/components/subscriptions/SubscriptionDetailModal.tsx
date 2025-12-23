import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Subscription } from "@/types";
import { Payment } from "@/components/payments/PaymentFormModal";
import { Calendar, CreditCard, RefreshCw, User, Package, FileText, Clock } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface SubscriptionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: Subscription | null;
  payments: Payment[];
}

export function SubscriptionDetailModal({
  open,
  onOpenChange,
  subscription,
  payments,
}: SubscriptionDetailModalProps) {
  const subscriptionPayments = useMemo(() => {
    if (!subscription) return [];
    return payments.filter((p) => p.customer === subscription.customerName);
  }, [subscription, payments]);

  const totalPaid = useMemo(() => {
    return subscriptionPayments
      .filter((p) => p.status === "completed" && p.type === "incoming")
      .reduce((sum, p) => {
        const amount = parseFloat(p.amount.replace("₺", "").replace(".", "").replace(",", ".")) || 0;
        return sum + amount;
      }, 0);
  }, [subscriptionPayments]);

  if (!subscription) return null;

  const statusConfig = {
    active: { label: "Aktif", variant: "success" as const },
    trial: { label: "Deneme", variant: "pending" as const },
    expired: { label: "Süresi Doldu", variant: "destructive" as const },
    cancelled: { label: "İptal Edildi", variant: "secondary" as const },
    pending: { label: "Beklemede", variant: "warning" as const },
    paused: { label: "Donduruldu", variant: "secondary" as const },
  } as const;

  const billingCycleConfig = {
    monthly: "Aylık",
    yearly: "Yıllık",
    trial: "Deneme",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[900px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>Abonelik Detayları</span>
            <Badge variant={statusConfig[subscription.status].variant} className="self-start">
              {statusConfig[subscription.status].label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subscription Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Müşteri</span>
              </div>
              <p className="font-medium text-foreground">{subscription.customerName}</p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Plan</span>
              </div>
              <p className="font-medium text-foreground">{subscription.planName}</p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Başlangıç Tarihi</span>
              </div>
              <p className="font-medium text-foreground">
                {format(new Date(subscription.startDate), "dd MMM yyyy", { locale: tr })}
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {subscription.billingCycle === "trial" ? "Deneme Bitiş" : "Sonraki Faturalama"}
                </span>
              </div>
              <p className="font-medium text-foreground">
                {subscription.billingCycle === "trial" && subscription.trialEndDate
                  ? format(new Date(subscription.trialEndDate), "dd MMM yyyy", { locale: tr })
                  : subscription.nextBillingDate
                  ? format(new Date(subscription.nextBillingDate), "dd MMM yyyy", { locale: tr })
                  : "-"}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-border bg-card text-center">
              <p className="text-sm text-muted-foreground mb-1">Faturalama Döngüsü</p>
              <p className="text-lg font-semibold text-foreground">
                {billingCycleConfig[subscription.billingCycle]}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card text-center">
              <p className="text-sm text-muted-foreground mb-1">Abonelik Türü</p>
              <p className="text-lg font-semibold text-foreground">
                {subscription.autoRenew && !subscription.trialEndDate && subscription.status === "active"
                  ? "Süresiz (otomatik yenilenen)"
                  : "Süreli"}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card text-center">
              <p className="text-sm text-muted-foreground mb-1">Abonelik Tutarı</p>
              <p className="text-lg font-semibold text-foreground">{subscription.finalAmount}</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card text-center">
              <p className="text-sm text-muted-foreground mb-1">Toplam Ödeme</p>
              <p className="text-lg font-semibold text-success">₺{totalPaid.toLocaleString("tr-TR")}</p>
            </div>
          </div>

          {/* Auto Renew */}
          {subscription.autoRenew && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-success/20 bg-success/5">
              <RefreshCw className="h-4 w-4 text-success" />
              <span className="text-sm text-success font-medium">Otomatik yenileme aktif</span>
            </div>
          )}

          {/* Paynet Details */}
          {(subscription.subscription_id || subscription.company_code || subscription.reference_no) && (
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Paynet Bilgileri
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {subscription.subscription_id && (
                  <div>
                    <span className="text-muted-foreground">Abonelik ID:</span>
                    <p className="font-mono text-foreground">{subscription.subscription_id}</p>
                  </div>
                )}
                {subscription.company_code && (
                  <div>
                    <span className="text-muted-foreground">Şirket Kodu:</span>
                    <p className="font-medium text-foreground">{subscription.company_code}</p>
                  </div>
                )}
                {subscription.reference_no && (
                  <div>
                    <span className="text-muted-foreground">Referans No:</span>
                    <p className="font-medium text-foreground">{subscription.reference_no}</p>
                  </div>
                )}
                {subscription.agent_id && (
                  <div>
                    <span className="text-muted-foreground">Bayi Kodu:</span>
                    <p className="font-medium text-foreground">{subscription.agent_id}</p>
                  </div>
                )}
                {subscription.end_user_gsm && (
                  <div>
                    <span className="text-muted-foreground">GSM:</span>
                    <p className="font-medium text-foreground">{subscription.end_user_gsm}</p>
                  </div>
                )}
                {subscription.interval !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Periyod:</span>
                    <p className="font-medium text-foreground">
                      {subscription.interval === 0 ? "Günlük" :
                       subscription.interval === 1 ? "Haftalık" :
                       subscription.interval === 2 ? "Aylık" : "Yıllık"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payments Tab */}
          <Tabs defaultValue="payments" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2">
              <TabsTrigger value="payments" className="text-xs sm:text-sm">
                Ödeme Geçmişi ({subscriptionPayments.length})
              </TabsTrigger>
              <TabsTrigger value="plans" className="text-xs sm:text-sm">
                Ödeme Planı ({subscription.plan?.length || 0})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="payments" className="mt-4">
              {subscriptionPayments.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {subscriptionPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{payment.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(payment.date), "dd MMM yyyy", { locale: tr })}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p
                          className={`font-semibold ${
                            payment.type === "incoming" ? "text-success" : "text-destructive"
                          }`}
                        >
                          {payment.type === "incoming" ? "+" : "-"}
                          {payment.amount}
                        </p>
                        <Badge
                          variant={
                            payment.status === "completed"
                              ? "success"
                              : payment.status === "pending"
                              ? "warning"
                              : "destructive"
                          }
                          className="mt-1"
                        >
                          {payment.status === "completed"
                            ? "Tamamlandı"
                            : payment.status === "pending"
                            ? "Beklemede"
                            : "Başarısız"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Bu aboneliğe ait ödeme bulunmamaktadır.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="plans" className="mt-4">
              {subscription.plan && subscription.plan.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {subscription.plan.map((planItem) => (
                    <div
                      key={planItem.plan_id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium text-foreground">Plan #{planItem.plan_id}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(planItem.val_date), "dd MMM yyyy HH:mm", { locale: tr })}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="font-semibold text-foreground">
                          ₺{planItem.amount.toLocaleString("tr-TR")}
                        </p>
                        <Badge
                          variant={
                            planItem.status === 0
                              ? "warning"
                              : planItem.status === 1
                              ? "success"
                              : "destructive"
                          }
                          className="mt-1"
                        >
                          {planItem.status_desc}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Bu aboneliğe ait ödeme planı bulunmamaktadır.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Kapat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

