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

const SubscriptionsPage = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
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
        amount: data.billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice,
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
              className="h-10 w-full sm:w-80 rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrele
            </Button>
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
          subscriptions={subscriptions}
          loading={subscriptionsLoading || customersLoading || plansLoading || paymentsLoading}
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

