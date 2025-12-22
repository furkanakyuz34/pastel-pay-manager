import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { ProductTable } from "@/components/dashboard/ProductTable";
import { ProductFormModal, ProductFormData } from "@/components/products/ProductFormModal";
import { Project } from "@/components/projects/ProjectFormModal";
import { Button } from "@/components/ui/button";
import { Plus, Download, Filter, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock projects data - In a real app, this would come from an API or context
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
  {
    id: "PRJ-003",
    name: "Web Portal",
    description: "Kurumsal web portal projesi",
    status: "inactive",
    startDate: "2023-06-01",
    endDate: "2024-01-31",
  },
  {
    id: "PRJ-004",
    name: "API Entegrasyonu",
    description: "Üçüncü parti API entegrasyonları",
    status: "archived",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
  },
];

const ProductsPage = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { toast } = useToast();

  const handleAddProduct = (data: ProductFormData) => {
    console.log("New product:", data);
    toast({
      title: "Ürün Eklendi",
      description: `${data.name} ürünü başarıyla oluşturuldu.`,
    });
  };

  return (
    <MainLayout>
      <Header title="Ürünler" subtitle="Tüm ürünlerinizi görüntüleyin ve yönetin" />
      
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Ürün ara..."
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
              Yeni Ürün
            </Button>
          </div>
        </div>

        {/* Product Table */}
        <ProductTable projects={mockProjects} />
      </div>

      {/* Add Product Modal */}
      <ProductFormModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        projects={mockProjects}
        onSubmit={handleAddProduct}
      />
    </MainLayout>
  );
};

export default ProductsPage;

