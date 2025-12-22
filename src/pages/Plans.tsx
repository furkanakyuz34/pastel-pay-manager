import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { PlanTable } from "@/components/dashboard/PlanTable";
import { PlanFormModal, PlanFormData } from "@/components/plans/PlanFormModal";
import { Customer } from "@/components/customers/CustomerFormModal";
import { Project } from "@/components/projects/ProjectFormModal";
import { Product } from "@/components/products/ProductFormModal";
import { Button } from "@/components/ui/button";
import { Plus, Download, Filter, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data - In a real app, this would come from an API or context
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

const mockProjects: Project[] = [
  {
    id: "PRJ-001",
    name: "E-Ticaret Platformu",
    description: "Modern e-ticaret çözümü",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-12-31",
  },
  {
    id: "PRJ-002",
    name: "Mobil Uygulama",
    description: "iOS ve Android mobil uygulama geliştirme",
    status: "active",
    startDate: "2024-03-01",
  },
];

const mockProducts: Product[] = [
  {
    id: "PRD-001",
    name: "Premium Paket",
    description: "Tüm özellikler dahil",
    projectId: "PRJ-001",
    projectName: "E-Ticaret Platformu",
    price: "₺5.000",
    status: "active",
  },
  {
    id: "PRD-002",
    name: "Standart Paket",
    description: "Temel özellikler",
    projectId: "PRJ-001",
    projectName: "E-Ticaret Platformu",
    price: "₺2.500",
    status: "active",
  },
  {
    id: "PRD-003",
    name: "Mobil Uygulama Lisansı",
    description: "iOS ve Android lisansı",
    projectId: "PRJ-002",
    projectName: "Mobil Uygulama",
    price: "₺3.000",
    status: "active",
  },
];

const PlansPage = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { toast } = useToast();

  const handleAddPlan = (data: PlanFormData) => {
    console.log("New plan:", data);
    toast({
      title: "Plan Oluşturuldu",
      description: `${data.name} planı başarıyla oluşturuldu.`,
    });
  };

  return (
    <MainLayout>
      <Header title="Abonelik Planları" subtitle="Tüm abonelik planlarınızı görüntüleyin ve yönetin" />
      
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Plan ara..."
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
              Yeni Plan
            </Button>
          </div>
        </div>

        {/* Plan Table */}
        <PlanTable 
          customers={mockCustomers}
          projects={mockProjects}
          products={mockProducts}
        />
      </div>

      {/* Add Plan Modal */}
      <PlanFormModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        customers={mockCustomers}
        projects={mockProjects}
        products={mockProducts}
        onSubmit={handleAddPlan}
      />
    </MainLayout>
  );
};

export default PlansPage;

