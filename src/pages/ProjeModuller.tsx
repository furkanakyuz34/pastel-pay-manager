import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { ProjeModulFormModal } from "@/components/projemodul/ProjeModulFormModal";
import { DeleteProjeModulDialog } from "@/components/projemodul/DeleteProjeModulDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Filter, Search, Pencil, Trash2, ChevronDown, ChevronRight, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProjeModulCreateRequest, ProjeModulDto, ProjeDto } from "@/types/backend";
import {
  useCreateProjeModulMutation,
  useGetProjelerQuery,
  useGetProjeModullerQuery,
  useDeleteProjeModulMutation,
} from "@/services/backendApi";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const ProjeModullerPage = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModal, setEditModal] = useState<{ open: boolean; modul: ProjeModulDto | null }>({
    open: false,
    modul: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; modul: ProjeModulDto | null }>({
    open: false,
    modul: null,
  });
  const [search, setSearch] = useState("");
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const [createModul, { isLoading: isCreating }] = useCreateProjeModulMutation();
  const [deleteModul] = useDeleteProjeModulMutation();
  const { data: projeler = [], isLoading: projelerLoading } = useGetProjelerQuery();
  const { data: moduller = [], isLoading: modullerLoading } = useGetProjeModullerQuery(undefined);

  // Group modules by project
  const groupedModuller = useMemo(() => {
    const projeMap = projeler.reduce((acc, p) => ({ ...acc, [p.projeId]: p }), {} as Record<number, ProjeDto>);
    
    const groups: Record<number, { proje: ProjeDto; moduller: ProjeModulDto[] }> = {};
    
    moduller.forEach((modul) => {
      const proje = projeMap[modul.projeId];
      if (proje) {
        if (!groups[modul.projeId]) {
          groups[modul.projeId] = { proje, moduller: [] };
        }
        // Filter by search
        if (
          modul.adi.toLowerCase().includes(search.toLowerCase()) ||
          proje.adi.toLowerCase().includes(search.toLowerCase())
        ) {
          groups[modul.projeId].moduller.push(modul);
        }
      }
    });

    // Filter out empty groups
    return Object.values(groups).filter((g) => g.moduller.length > 0);
  }, [projeler, moduller, search]);

  const toggleProject = (projeId: number) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projeId)) {
        newSet.delete(projeId);
      } else {
        newSet.add(projeId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedProjects(new Set(groupedModuller.map((g) => g.proje.projeId)));
  };

  const collapseAll = () => {
    setExpandedProjects(new Set());
  };

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

  const handleDelete = async () => {
    if (!deleteDialog.modul) return;
    try {
      await deleteModul(deleteDialog.modul.projeModulId).unwrap();
      toast({ title: "Modül silindi", description: "Modül başarıyla silindi." });
      setDeleteDialog({ open: false, modul: null });
    } catch (err) {
      toast({ title: "Hata", description: "Modül silinirken bir hata oluştu.", variant: "destructive" });
    }
  };

  const isLoading = projelerLoading || modullerLoading;

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
            <Button variant="outline" size="sm" onClick={expandAll}>
              Tümünü Aç
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Tümünü Kapat
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

        {/* Section List - Grouped by Project */}
        {isLoading ? (
          <LoadingState message="Modüller yükleniyor..." />
        ) : groupedModuller.length === 0 ? (
          <EmptyState title="Modül bulunamadı" description="Henüz modül eklenmemiş veya arama kriterine uygun modül yok." />
        ) : (
          <div className="space-y-3">
            {groupedModuller.map(({ proje, moduller: projeModuller }) => {
              const isExpanded = expandedProjects.has(proje.projeId);
              return (
                <Collapsible
                  key={proje.projeId}
                  open={isExpanded}
                  onOpenChange={() => toggleProject(proje.projeId)}
                >
                  <div className="rounded-lg border border-border bg-card overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                          <Package className="h-5 w-5 text-primary" />
                          <span className="font-medium">{proje.adi}</span>
                          <Badge variant="secondary">{projeModuller.length} Modül</Badge>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t border-border">
                        {projeModuller.map((modul) => (
                          <div
                            key={modul.projeModulId}
                            className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 border-b border-border last:border-b-0"
                          >
                            <div className="flex items-center gap-3 pl-8 flex-1">
                              <span className="text-sm text-muted-foreground">#{modul.projeModulId}</span>
                              <span className="text-sm flex-1">{modul.adi}</span>
                              {modul.birimFiyat !== undefined && modul.birimFiyat !== null && (
                                <span className="text-sm font-medium text-primary">
                                  {new Intl.NumberFormat("tr-TR", {
                                    style: "currency",
                                    currency: "TRY",
                                  }).format(modul.birimFiyat)}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditModal({ open: true, modul })}
                                title="Düzenle"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteDialog({ open: true, modul })}
                                title="Sil"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Modül Modal */}
      <ProjeModulFormModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        projeler={projeler}
        onSubmit={handleAddModul}
        isLoading={isCreating}
      />

      {/* Edit Modül Modal */}
      <ProjeModulFormModal
        open={editModal.open}
        onOpenChange={(open) => setEditModal({ open, modul: open ? editModal.modul : null })}
        projeler={projeler}
        modul={editModal.modul}
        onSubmit={handleAddModul}
        isLoading={isCreating}
      />

      {/* Delete Dialog */}
      <DeleteProjeModulDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, modul: open ? deleteDialog.modul : null })}
        onConfirm={handleDelete}
        modulName={deleteDialog.modul?.adi || ""}
      />
    </MainLayout>
  );
};

export default ProjeModullerPage;
