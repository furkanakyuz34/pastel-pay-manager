import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { FirmaTable } from "@/components/dashboard/FirmaTable";
import { FirmaFormModal } from "@/components/firma/FirmaFormModal";
import { Button } from "@/components/ui/button";
import { Plus, Download, Filter, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FirmaCreateRequest } from "@/types/backend";
import { useCreateFirmaMutation } from "@/services/backendApi";

const FirmalarPage = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const [createFirma, { isLoading }] = useCreateFirmaMutation();

  const handleAddFirma = async (data: FirmaCreateRequest) => {
    try {
      await createFirma(data).unwrap();
      toast({
        title: "Firma Eklendi",
        description: `${data.Adi} firması başarıyla oluşturuldu.`,
      });
      setAddModalOpen(false);
    } catch (err: any) {
      console.error("Firma ekleme hatası:", err);
      const errorMessage = err?.data?.error?.detail 
        || err?.data?.message 
        || err?.message 
        || "Firma eklenirken bir hata oluştu.";
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <Header title="Firmalar" subtitle="Tüm firmalarınızı görüntüleyin ve yönetin" />
      
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Firma ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full sm:w-80 rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
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
              Yeni Firma
            </Button>
          </div>
        </div>

        {/* Firma Table */}
        <FirmaTable searchQuery={search} />
      </div>

      {/* Add Firma Modal */}
      <FirmaFormModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSubmit={handleAddFirma}
        isLoading={isLoading}
      />
    </MainLayout>
  );
};

export default FirmalarPage;
