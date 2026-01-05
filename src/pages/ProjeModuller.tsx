import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { ProjeModulTable } from "@/components/dashboard/ProjeModulTable";
import { ProjeModulFormModal } from "@/components/projemodul/ProjeModulFormModal";
import { Button } from "@/components/ui/button";
import { Plus, Download, Filter, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProjeModulCreateRequest } from "@/types/backend";
import { useCreateProjeModulMutation, useGetProjelerQuery } from "@/services/backendApi";

const ProjeModullerPage = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const [createModul, { isLoading }] = useCreateProjeModulMutation();
  const { data: projeler = [] } = useGetProjelerQuery();

  const handleAddModul = async (data: ProjeModulCreateRequest) => {
    try {
      await createModul(data).unwrap();
      toast({
        title: "Modül Eklendi",
        description: `${data.adi} modülü başarıyla oluşturuldu.`,
      });
      setAddModalOpen(false);
    } catch (err) {
      toast({
        title: "Hata",
        description: "Modül eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <Header title="Proje Modülleri" subtitle="Tüm proje modüllerini görüntüleyin ve yönetin" />
      
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Modül ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              Yeni Modül
            </Button>
          </div>
        </div>

        {/* ProjeModul Table */}
        <ProjeModulTable searchQuery={search} />
      </div>

      {/* Add Modül Modal */}
      <ProjeModulFormModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        projeler={projeler}
        onSubmit={handleAddModul}
        isLoading={isLoading}
      />
    </MainLayout>
  );
};

export default ProjeModullerPage;
