import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { CustomerTable } from "@/components/dashboard/CustomerTable";
import { CustomerFormModal, CustomerFormData } from "@/components/customers/CustomerFormModal";
import { Subscription } from "@/components/subscriptions/SubscriptionFormModal";
import { Payment } from "@/components/payments/PaymentFormModal";
import { Button } from "@/components/ui/button";
import { Plus, Download, Filter, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data - In a real app, this would come from an API or context
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
    amount: "₺24.000",
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
    amount: "₺2.500",
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
    amount: "₺0",
    autoRenew: false,
  },
];

const mockPayments: Payment[] = [
  {
    id: "PAY-001",
    description: "Enterprise Pro Lisans Ödemesi",
    customer: "ABC Teknoloji A.Ş.",
    amount: "₺24.000",
    status: "completed",
    date: "2024-12-18",
    type: "incoming",
  },
  {
    id: "PAY-002",
    description: "Standard Lisans Yenileme",
    customer: "XYZ Yazılım Ltd.",
    amount: "₺2.500",
    status: "pending",
    date: "2024-12-17",
    type: "incoming",
  },
  {
    id: "PAY-003",
    description: "Professional Lisans",
    customer: "Startup Hub",
    amount: "₺4.500",
    status: "completed",
    date: "2024-12-15",
    type: "incoming",
  },
  {
    id: "PAY-004",
    description: "Paynet Komisyon Kesintisi",
    customer: "Paynet",
    amount: "₺850",
    status: "completed",
    date: "2024-12-14",
    type: "outgoing",
  },
  {
    id: "PAY-005",
    description: "Enterprise Lisans Ödemesi",
    customer: "Mega Corp",
    amount: "₺18.000",
    status: "failed",
    date: "2024-12-10",
    type: "incoming",
  },
];

const CustomersPage = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { toast } = useToast();

  const handleAddCustomer = (data: CustomerFormData) => {
    console.log("New customer:", data);
    toast({
      title: "Müşteri Eklendi",
      description: `${data.name} müşterisi başarıyla oluşturuldu.`,
    });
  };

  return (
    <MainLayout>
      <Header title="Müşteriler" subtitle="Tüm müşterilerinizi görüntüleyin ve yönetin" />
      
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Müşteri ara..."
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
              Yeni Müşteri
            </Button>
          </div>
        </div>

        {/* Customer Table */}
        <CustomerTable subscriptions={mockSubscriptions} payments={mockPayments} />
      </div>

      {/* Add Customer Modal */}
      <CustomerFormModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSubmit={handleAddCustomer}
      />
    </MainLayout>
  );
};

export default CustomersPage;

