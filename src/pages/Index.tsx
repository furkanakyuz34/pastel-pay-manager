import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { SubscriptionTable } from "@/components/dashboard/SubscriptionTable";
import { PaymentList } from "@/components/dashboard/PaymentList";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { Button } from "@/components/ui/button";
import { SubscriptionFormModal, SubscriptionFormData } from "@/components/subscriptions/SubscriptionFormModal";
import { Customer } from "@/components/customers/CustomerFormModal";
import { Plan } from "@/components/plans/PlanFormModal";
import { CreditCard, TrendingUp, Users, Plus, Download, Repeat } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockCustomers: Customer[] = [
  {
    id: "CUS-001",
    name: "ABC Teknoloji A.Ş.",
    email: "info@abcteknoloji.com",
    phone: "+90 212 555 1234",
    company: "ABC Teknoloji",
    address: "İstanbul, Türkiye",
    status: "active",
  },
  {
    id: "CUS-002",
    name: "XYZ Yazılım Ltd.",
    email: "iletisim@xyzyazilim.com",
    phone: "+90 312 555 5678",
    company: "XYZ Yazılım",
    address: "Ankara, Türkiye",
    status: "active",
  },
];

const mockPlans: Plan[] = [
  {
    id: "PLAN-001",
    name: "Premium Plan",
    description: "Tüm özellikler dahil",
    customerId: "CUS-001",
    customerName: "ABC Teknoloji A.Ş.",
    projectId: "PROJ-001",
    projectName: "Ana Proje",
    productIds: ["PROD-001", "PROD-002"],
    productNames: ["Lisans 1", "Lisans 2"],
    monthlyPrice: "₺2.000",
    yearlyPrice: "₺20.000",
    features: "Tüm özellikler",
    status: "active",
    trialDays: 14,
  },
  {
    id: "PLAN-002",
    name: "Standard Plan",
    description: "Orta ölçekli işletmeler için",
    customerId: "CUS-002",
    customerName: "XYZ Yazılım Ltd.",
    projectId: "PROJ-002",
    projectName: "Standart Proje",
    productIds: ["PROD-003"],
    productNames: ["Standart Lisans"],
    monthlyPrice: "₺1.000",
    yearlyPrice: "₺10.000",
    features: "Temel özellikler",
    status: "active",
    trialDays: 14,
  },
];

const Index = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { toast } = useToast();

  const handleAddSubscription = (data: SubscriptionFormData) => {
    console.log("New subscription:", data);
    toast({
      title: "Abonelik Oluşturuldu",
      description: `Abonelik başarıyla oluşturuldu.`,
    });
  };

  return (
    <MainLayout>
      <Header title="Dashboard" subtitle="Abonelik ve ödeme işlemlerinizi takip edin" />
      
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Stats */}
        <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-full">
          <StatCard
            title="Aktif Abonelikler"
            value="128"
            change="+12 bu ay"
            changeType="positive"
            icon={<Repeat className="h-6 w-6" />}
            delay={0}
          />
          <StatCard
            title="Toplam Gelir"
            value="₺284.500"
            change="+18.2% geçen aya göre"
            changeType="positive"
            icon={<TrendingUp className="h-6 w-6" />}
            delay={100}
          />
          <StatCard
            title="Bekleyen Ödemeler"
            value="₺12.800"
            change="3 işlem bekliyor"
            changeType="neutral"
            icon={<CreditCard className="h-6 w-6" />}
            delay={200}
          />
          <StatCard
            title="Toplam Müşteri"
            value="84"
            change="+5 yeni müşteri"
            changeType="positive"
            icon={<Users className="h-6 w-6" />}
            delay={300}
          />
        </div>

        {/* Revenue Chart */}
        <div className="rounded-lg border border-border bg-card p-3 sm:p-4 lg:p-6 max-w-full overflow-hidden">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">Gelir Trendi</h2>
            <p className="text-sm text-muted-foreground">Son 6 ay gelir analizi</p>
          </div>
          <RevenueChart />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 lg:gap-6 max-w-full">
          {/* Subscriptions Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base lg:text-lg font-semibold text-foreground">Son Abonelikler</h2>
                <p className="text-xs lg:text-sm text-muted-foreground">Tüm aboneliklerinizi yönetin</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                <Button variant="outline" size="sm" className="hidden sm:flex text-xs lg:text-sm">
                  <Download className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                  <span className="hidden lg:inline">Dışa Aktar</span>
                  <span className="lg:hidden">Aktar</span>
                </Button>
                <Button size="sm" onClick={() => setAddModalOpen(true)} className="flex-1 sm:flex-initial text-xs lg:text-sm">
                  <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Yeni Abonelik</span>
                  <span className="sm:hidden">Yeni</span>
                </Button>
              </div>
            </div>
            <SubscriptionTable customers={mockCustomers} plans={mockPlans} payments={[]} />
          </div>

          {/* Payments Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base lg:text-lg font-semibold text-foreground">Son Ödemeler</h2>
                <p className="text-xs lg:text-sm text-muted-foreground">Paynet işlemleri</p>
              </div>
              <Button variant="ghost" size="sm" className="text-primary hidden sm:flex text-xs lg:text-sm">
                <span className="hidden lg:inline">Tümünü Gör</span>
                <span className="lg:hidden">Tümü</span>
              </Button>
            </div>
            <PaymentList />
          </div>
        </div>
      </div>

      {/* Add Subscription Modal */}
      <SubscriptionFormModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        customers={mockCustomers}
        plans={mockPlans}
        onSubmit={handleAddSubscription}
      />
    </MainLayout>
  );
};

export default Index;
