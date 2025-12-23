import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { SubscriptionTable } from "@/components/dashboard/SubscriptionTable";
import { SubscriptionFormModal } from "@/components/subscriptions/SubscriptionFormModal";
import type { SubscriptionFormData } from "@/components/subscriptions/SubscriptionFormModal";
import { Button } from "@/components/ui/button";
import { Plus, Download, Filter, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Subscription } from "@/types";
import {
  useGetSubscriptionsQuery,
  useCreateSubscriptionMutation,
} from "@/services/subscriptionApi";
import {
  useGetCustomersQuery,
  useGetPlansQuery,
  useGetPaymentsQuery,
} from "@/services/managementApi";

// Geçici sahte abonelik verileri (backend hazır olana kadar UI'ı doldurmak için)
const mockSubscriptions: Subscription[] = [
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
    planPrice: "24000",
    finalAmount: "24000",
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
    planPrice: "2500",
    finalAmount: "2500",
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
    planPrice: "0",
    finalAmount: "0",
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
    planPrice: "18000",
    finalAmount: "18000",
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
    planPrice: "4500",
    finalAmount: "4500",
    autoRenew: true,
  },
];

const SubscriptionsPage = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "trial" | "expired" | "cancelled" | "pending" | "paused">("all");
  const { toast } = useToast();

  // Fetch data using RTK Query
  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useGetSubscriptionsQuery();
  const { data: customers = [], isLoading: customersLoading } = useGetCustomersQuery();
  const { data: plans = [], isLoading: plansLoading } = useGetPlansQuery();
  const { data: payments = [], isLoading: paymentsLoading } = useGetPaymentsQuery();

  const [createSubscription, { isLoading: createLoading }] = useCreateSubscriptionMutation();

  const handleAddSubscription = async (data: SubscriptionFormData) => {
    try {
      // Find customer and plan names
      const customer = customers.find(c => c.id === data.customerId);
      const plan = plans.find(p => p.id === data.planId);

      if (!customer || !plan) {
        throw new Error('Customer or plan not found');
      }

      // Transform form data to subscription
      const subscriptionData: Omit<Subscription, 'id'> = {
        customerId: data.customerId!,
        planId: data.planId!,
        billingCycle: data.billingCycle!,
        status: data.status!,
        startDate: data.startDate.toISOString().split('T')[0], // Convert to string
        nextBillingDate: data.nextBillingDate?.toISOString().split('T')[0],
        trialEndDate: data.trialEndDate?.toISOString().split('T')[0],
        customerName: customer.name,
        planName: plan.name,
        planPrice: String(data.billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice),
        finalAmount: String(data.billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice),
        autoRenew: true, // Default value
      };

      await createSubscription(subscriptionData).unwrap();
      toast({
        title: "Abonelik Oluşturuldu",
        description: "Abonelik başarıyla oluşturuldu.",
      });
      setAddModalOpen(false);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Abonelik oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <Header title="Abonelikler" subtitle="Tüm aboneliklerinizi görüntüleyin ve yönetin" />
      
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Abonelik ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full sm:w-80 rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                Tümü
              </Button>
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("active")}
              >
                Aktif
              </Button>
              <Button
                variant={statusFilter === "trial" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("trial")}
              >
                Deneme
              </Button>
              <Button
                variant={statusFilter === "expired" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("expired")}
              >
                Süresi Dolan
              </Button>
              <Button
                variant={statusFilter === "paused" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("paused")}
              >
                Dondurulmuş
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
            <Button size="sm" onClick={() => setAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Abonelik
            </Button>
          </div>
        </div>

        {/* Subscription Table */}
        <SubscriptionTable
          customers={customers}
          plans={plans}
          payments={payments}
          // Backend boş dönerse veya henüz hazır değilse sahte datayı kullan
          subscriptions={subscriptions.length ? subscriptions : mockSubscriptions}
          loading={subscriptionsLoading || customersLoading || plansLoading || paymentsLoading}
          searchQuery={search}
          statusFilter={statusFilter}
        />
      </div>

      {/* Add Subscription Modal */}
      <SubscriptionFormModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        customers={customers}
        plans={plans}
        onSubmit={handleAddSubscription}
      />
    </MainLayout>
  );
};

export default SubscriptionsPage;

