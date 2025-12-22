import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { PlanDiscountModal } from "@/components/discounts/PlanDiscountModal";
import { PlanDiscountTable } from "@/components/discounts/PlanDiscountTable";
import { useAppSelector } from "@/hooks/redux";
import { Plus, Filter, Download, Search } from "lucide-react";

export default function Discounts() {
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>();
  const [selectedPlanId, setSelectedPlanId] = useState<string>();

  const discounts = useAppSelector((state) => state.discounts.planDiscounts);
  const customers = useAppSelector((state) => state.customers.customers);

  // İstatistikler
  const activeDiscounts = discounts.filter((d) => d.isActive).length;
  const totalDiscounts = discounts.length;
  const uniqueCustomers = new Set(discounts.map((d) => d.customerId)).size;

  const handleOpenDiscountModal = (customerId?: string, planId?: string) => {
    setSelectedCustomerId(customerId);
    setSelectedPlanId(planId);
    setDiscountModalOpen(true);
  };

  return (
    <MainLayout>
      <Header 
        title="İskonto Yönetimi" 
        subtitle="Müşteri bazlı plan iskontolarını tanımlayın ve yönetin" 
      />

      <div className="p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="İskonto ara..."
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
            <Button size="sm" onClick={() => handleOpenDiscountModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni İskonto
            </Button>
          </div>
        </div>

        {/* İskonto Tablosu */}
        <PlanDiscountTable />
      </div>

      {/* İskonto Modal */}
      <PlanDiscountModal
        open={discountModalOpen}
        onOpenChange={setDiscountModalOpen}
        customerId={selectedCustomerId}
        planId={selectedPlanId}
      />
    </MainLayout>
  );
}
