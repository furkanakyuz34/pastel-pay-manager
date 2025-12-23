import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Trash2, RefreshCw, Repeat, PauseCircle, PlayCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubscriptionFormModal } from "@/components/subscriptions/SubscriptionFormModal";
import type { SubscriptionFormData } from "@/components/subscriptions/SubscriptionFormModal";
import { DeleteSubscriptionDialog } from "@/components/subscriptions/DeleteSubscriptionDialog";
import { SubscriptionDetailModal } from "@/components/subscriptions/SubscriptionDetailModal";
import { useToast } from "@/hooks/use-toast";
import { Subscription, Customer, Plan, Payment } from "@/types";
import { useUpdateSubscriptionMutation } from "@/services/subscriptionApi";

const initialSubscriptions: Subscription[] = [
  {
    id: "SUB-001",
    customerId: "CUS-001",
    customerName: "ABC Teknoloji A.Ş.",
    planId: "PLAN-001",
    planName: "Premium Plan",
    billingCycle: "yearly",
    status: "active",
    startDate: "2024-01-15",
    nextBillingDate: "2025-01-15",
    planPrice: "₺24.000",
    finalAmount: "₺24.000",
    autoRenew: true,
  },
  {
    id: "SUB-002",
    customerId: "CUS-002",
    customerName: "XYZ Yazılım Ltd.",
    planId: "PLAN-002",
    planName: "Standard Plan",
    billingCycle: "monthly",
    status: "active",
    startDate: "2024-12-01",
    nextBillingDate: "2025-01-01",
    planPrice: "₺2.500",
    finalAmount: "₺2.500",
    autoRenew: true,
  },
  {
    id: "SUB-003",
    customerId: "CUS-003",
    customerName: "Demo Şirketi",
    planId: "PLAN-003",
    planName: "Starter Plan",
    billingCycle: "trial",
    status: "trial",
    startDate: "2024-12-20",
    trialEndDate: "2025-01-03",
    planPrice: "₺0",
    finalAmount: "₺0",
    autoRenew: false,
  },
  {
    id: "SUB-004",
    customerId: "CUS-004",
    customerName: "Mega Corp",
    planId: "PLAN-001",
    planName: "Premium Plan",
    billingCycle: "yearly",
    status: "expired",
    startDate: "2023-01-01",
    nextBillingDate: "2024-01-01",
    planPrice: "₺18.000",
    finalAmount: "₺18.000",
    autoRenew: false,
  },
  {
    id: "SUB-005",
    customerId: "CUS-005",
    customerName: "Startup Hub",
    planId: "PLAN-002",
    planName: "Standard Plan",
    billingCycle: "monthly",
    status: "paused",
    startDate: "2024-11-15",
    nextBillingDate: "2024-12-15",
    planPrice: "₺4.500",
    finalAmount: "₺4.500",
    autoRenew: true,
  },
];

const statusConfig = {
  active: { label: "Aktif", variant: "success" as const },
  trial: { label: "Deneme", variant: "pending" as const },
  expired: { label: "Süresi Doldu", variant: "destructive" as const },
  cancelled: { label: "İptal Edildi", variant: "secondary" as const },
  pending: { label: "Beklemede", variant: "warning" as const },
  paused: { label: "Donduruldu", variant: "secondary" as const },
} as const;

const billingCycleConfig = {
  monthly: { label: "Aylık", variant: "secondary" as const },
  yearly: { label: "Yıllık", variant: "outline" as const },
  trial: { label: "Deneme", variant: "pending" as const },
};

interface SubscriptionTableProps {
  onAddClick?: () => void;
  showAddButton?: boolean;
  customers?: Customer[];
  plans?: Plan[];
  payments?: Payment[];
  subscriptions?: Subscription[];
  loading?: boolean;
  searchQuery?: string;
  statusFilter?: "all" | "active" | "trial" | "expired" | "cancelled" | "pending" | "paused";
}

export function SubscriptionTable({
  onAddClick,
  showAddButton = false,
  customers = [],
  plans = [],
  payments = [],
  subscriptions: propSubscriptions,
  loading = false,
  searchQuery = "",
  statusFilter = "all",
}: SubscriptionTableProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(propSubscriptions || initialSubscriptions);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const { toast } = useToast();
  const [updateSubscription] = useUpdateSubscriptionMutation();

  useEffect(() => {
    if (propSubscriptions) {
      setSubscriptions(propSubscriptions);
    }
  }, [propSubscriptions]);

  const handleView = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setDetailModalOpen(true);
  };

  const handleEdit = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setEditModalOpen(true);
  };

  const handleDelete = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedSubscription) {
      setSubscriptions((prev) => prev.filter((s) => s.id !== selectedSubscription.id));
      toast({
        title: "Abonelik İptal Edildi",
        description: `${selectedSubscription.id} aboneliği başarıyla iptal edildi.`,
      });
      setSelectedSubscription(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleUpdateSubscription = (data: SubscriptionFormData) => {
    if (selectedSubscription) {
      const plan = plans.find((p) => p.id === data.planId);
      const customer = customers.find((c) => c.id === data.customerId);
      
      const amount = data.billingCycle === "monthly" 
        ? plan?.monthlyPrice || "0"
        : data.billingCycle === "yearly"
        ? plan?.yearlyPrice || "0"
        : "₺0";

      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === selectedSubscription.id
            ? {
                ...s,
                customerId: data.customerId,
                customerName: customer?.name || s.customerName,
                planId: data.planId,
                planName: plan?.name || s.planName,
                billingCycle: data.billingCycle,
                status: data.status,
                startDate: data.startDate.toISOString().split("T")[0],
                nextBillingDate: data.nextBillingDate?.toISOString().split("T")[0],
                trialEndDate: data.trialEndDate?.toISOString().split("T")[0],
                amount: `₺${amount}`,
              }
            : s
        )
      );
      setSelectedSubscription(null);
    }
  };

  const handleTogglePause = async (subscription: Subscription) => {
    if (subscription.status === "cancelled" || subscription.status === "expired") {
      toast({
        title: "İşlem yapılamıyor",
        description: "İptal edilmiş veya süresi dolmuş abonelikler dondurulamaz.",
        variant: "destructive",
      });
      return;
    }

    const newStatus: Subscription["status"] =
      subscription.status === "paused" ? "active" : "paused";

    // Optimistic update
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === subscription.id ? { ...s, status: newStatus } : s))
    );

    try {
      await updateSubscription({ id: subscription.id, data: { status: newStatus } }).unwrap();
      toast({
        title: newStatus === "paused" ? "Abonelik Donduruldu" : "Abonelik Devam Ettirildi",
        description:
          newStatus === "paused"
            ? `${subscription.id} aboneliği geçici olarak durduruldu.`
            : `${subscription.id} aboneliği tekrar aktif hale getirildi.`,
      });
    } catch (error) {
      // Revert on error
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === subscription.id ? { ...s, status: subscription.status } : s))
      );
      toast({
        title: "İşlem başarısız",
        description: "Abonelik durumu güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const normalizedQuery = searchQuery.toLowerCase().trim();
  const filteredByStatus =
    statusFilter === "all"
      ? subscriptions
      : subscriptions.filter((s) => s.status === statusFilter);

  const filteredSubscriptions = normalizedQuery
    ? filteredByStatus.filter((s) => {
        const haystack = `${s.id} ${s.customerName} ${s.planName}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : filteredByStatus;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (filteredSubscriptions.length === 0) {
    return (
      <EmptyState
        icon={<Repeat className="h-12 w-12" />}
        title={subscriptions.length === 0 ? "Abonelik bulunamadı" : "Sonuç bulunamadı"}
        description={
          subscriptions.length === 0
            ? "Henüz hiç abonelik oluşturulmamış. Yeni bir abonelik oluşturmak için yukarıdaki butona tıklayın."
            : "Arama ya da filtre kriterlerinizi değiştirerek tekrar deneyin."
        }
      />
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3 max-w-full overflow-hidden">
        {filteredSubscriptions.map((subscription) => (
          <div
            key={subscription.id}
            className="p-4 rounded-lg border border-border bg-card space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{subscription.id}</p>
                <p className="text-sm text-muted-foreground truncate">{subscription.customerName}</p>
              </div>
              <Badge variant={statusConfig[subscription.status].variant}>
                {statusConfig[subscription.status].label}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">{subscription.planName}</Badge>
              <Badge variant={billingCycleConfig[subscription.billingCycle].variant} className="text-xs">
                {billingCycleConfig[subscription.billingCycle].label}
              </Badge>
              {subscription.autoRenew && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Otomatik
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Sonraki Faturalama</p>
                <p className="text-sm font-medium text-foreground">
                  {subscription.billingCycle === "trial" && subscription.trialEndDate
                    ? new Date(subscription.trialEndDate).toLocaleDateString("tr-TR")
                    : subscription.nextBillingDate
                    ? new Date(subscription.nextBillingDate).toLocaleDateString("tr-TR")
                    : "-"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Tutar</p>
                <p className="text-sm font-semibold text-foreground">{subscription.finalAmount}</p>
              </div>
            </div>
            <div className="flex gap-1 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => handleView(subscription)}
              >
                <Eye className="h-3 w-3 mr-1" />
                Detay
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleEdit(subscription)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-destructive hover:text-destructive"
                onClick={() => handleDelete(subscription)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-hidden rounded-lg border border-border bg-card max-w-full">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-3 xl:px-4 py-2 xl:py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  ID
                </th>
                <th className="px-3 xl:px-4 py-2 xl:py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                  Müşteri
                </th>
                <th className="px-3 xl:px-4 py-2 xl:py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                  Plan
                </th>
                <th className="px-3 xl:px-4 py-2 xl:py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden xl:table-cell">
                  Döngü
                </th>
                <th className="px-3 xl:px-4 py-2 xl:py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Durum
                </th>
                <th className="px-3 xl:px-4 py-2 xl:py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                  Sonraki
                </th>
                <th className="px-3 xl:px-4 py-2 xl:py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tutar
                </th>
                <th className="px-3 xl:px-4 py-2 xl:py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSubscriptions.map((subscription) => (
                <tr
                  key={subscription.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="whitespace-nowrap px-3 xl:px-4 py-2 xl:py-3">
                    <div>
                      <p className="font-medium text-xs xl:text-sm text-foreground">{subscription.id}</p>
                      {subscription.autoRenew && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <RefreshCw className="h-3 w-3" />
                          <span className="hidden lg:inline">Otomatik</span>
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 xl:px-4 py-2 xl:py-3 text-xs xl:text-sm text-foreground hidden md:table-cell">
                    <span className="block truncate max-w-[120px] xl:max-w-none" title={subscription.customerName}>
                      {subscription.customerName}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 xl:px-4 py-2 xl:py-3 hidden lg:table-cell">
                    <Badge variant="outline" className="text-xs">{subscription.planName}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-3 xl:px-4 py-2 xl:py-3 hidden xl:table-cell">
                    <Badge variant={billingCycleConfig[subscription.billingCycle].variant} className="text-xs">
                      {billingCycleConfig[subscription.billingCycle].label}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-3 xl:px-4 py-2 xl:py-3">
                    <Badge variant={statusConfig[subscription.status].variant} className="text-xs">
                      {statusConfig[subscription.status].label}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-3 xl:px-4 py-2 xl:py-3 text-xs xl:text-sm text-foreground hidden md:table-cell">
                    {subscription.billingCycle === "trial" && subscription.trialEndDate
                      ? new Date(subscription.trialEndDate).toLocaleDateString("tr-TR")
                      : subscription.nextBillingDate
                      ? new Date(subscription.nextBillingDate).toLocaleDateString("tr-TR")
                      : "-"}
                  </td>
                  <td className="whitespace-nowrap px-3 xl:px-4 py-2 xl:py-3 text-xs xl:text-sm font-medium text-foreground">
                    {subscription.finalAmount}
                  </td>
                  <td className="whitespace-nowrap px-3 xl:px-4 py-2 xl:py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 xl:h-8 xl:w-8">
                          <MoreHorizontal className="h-3 w-3 xl:h-4 xl:w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(subscription)} className="text-xs xl:text-sm">
                          <Eye className="mr-2 h-3 w-3 xl:h-4 xl:w-4" />
                          Detayları Görüntüle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(subscription)} className="text-xs xl:text-sm">
                          <Edit className="mr-2 h-3 w-3 xl:h-4 xl:w-4" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleTogglePause(subscription)}
                          className="text-xs xl:text-sm"
                        >
                          {subscription.status === "paused" ? (
                            <>
                              <PlayCircle className="mr-2 h-3 w-3 xl:h-4 xl:w-4" />
                              Devam Ettir
                            </>
                          ) : (
                            <>
                              <PauseCircle className="mr-2 h-3 w-3 xl:h-4 xl:w-4" />
                              Dondur
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive text-xs xl:text-sm"
                          onClick={() => handleDelete(subscription)}
                        >
                          <Trash2 className="mr-2 h-3 w-3 xl:h-4 xl:w-4" />
                          İptal Et
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <SubscriptionFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        subscription={selectedSubscription}
        customers={customers}
        plans={plans}
        onSubmit={handleUpdateSubscription}
      />

      {/* Delete Dialog */}
      <DeleteSubscriptionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        subscriptionId={selectedSubscription?.id || ""}
        onConfirm={handleConfirmDelete}
      />

      {/* Detail Modal */}
      <SubscriptionDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        subscription={selectedSubscription}
        payments={payments}
      />
    </>
  );
}

