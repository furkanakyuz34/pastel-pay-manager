import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { LicenseTable } from "@/components/dashboard/LicenseTable";
import { LicenseFormModal, LicenseFormData } from "@/components/licenses/LicenseFormModal";
import { Button } from "@/components/ui/button";
import { Plus, Download, Filter, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LicensesPage = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { toast } = useToast();

  const handleAddLicense = (data: LicenseFormData) => {
    console.log("New license:", data);
    toast({
      title: "Lisans Eklendi",
      description: `${data.name} lisansı başarıyla oluşturuldu.`,
    });
  };

  return (
    <MainLayout>
      <Header title="Lisanslar" subtitle="Tüm lisanslarınızı görüntüleyin ve yönetin" />
      
      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Lisans ara..."
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
              Yeni Lisans
            </Button>
          </div>
        </div>

        {/* License Table */}
        <LicenseTable />
      </div>

      {/* Add License Modal */}
      <LicenseFormModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSubmit={handleAddLicense}
      />
    </MainLayout>
  );
};

export default LicensesPage;
