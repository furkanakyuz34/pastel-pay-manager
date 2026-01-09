import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { ProjeModulDto, ProjeDto, ProjeModulUpdateRequest } from "@/types/backend";
import {
  useGetProjeModullerQuery,
  useGetProjelerQuery,
  useDeleteProjeModulMutation,
  useUpdateProjeModulMutation,
} from "@/services/backendApi";
import { ProjeModulFormModal } from "@/components/projemodul/ProjeModulFormModal";
import { DeleteProjeModulDialog } from "@/components/projemodul/DeleteProjeModulDialog";

interface ProjeModulTableProps {
  searchQuery?: string;
  projeIdFilter?: number;
}

export function ProjeModulTable({ searchQuery = "", projeIdFilter }: ProjeModulTableProps) {
  const { data: moduller = [], isLoading, error } = useGetProjeModullerQuery(projeIdFilter);
  const { data: projeler = [] } = useGetProjelerQuery();
  const [deleteModul, { isLoading: isDeleting }] = useDeleteProjeModulMutation();
  const [updateModul] = useUpdateProjeModulMutation();
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedModul, setSelectedModul] = useState<ProjeModulDto | null>(null);
  const { toast } = useToast();

  // Proje adını bul
  const getProjeAdi = (projeId: number) => {
    const proje = projeler.find((p) => p.projeId === projeId);
    return proje?.adi || `Proje #${projeId}`;
  };

  const handleEdit = (modul: ProjeModulDto) => {
    setSelectedModul(modul);
    setEditModalOpen(true);
  };

  const handleDelete = (modul: ProjeModulDto) => {
    setSelectedModul(modul);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedModul) {
      try {
        await deleteModul(selectedModul.projeModulId).unwrap();
        toast({
          title: "Modül Silindi",
          description: `${selectedModul.adi} modülü başarıyla silindi.`,
        });
        setSelectedModul(null);
        setDeleteDialogOpen(false);
      } catch (err) {
        toast({
          title: "Hata",
          description: "Modül silinirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpdateModul = async (data: ProjeModulUpdateRequest) => {
    if (selectedModul) {
      try {
        // Anahtarları backend'in beklediği şekilde dönüştür
        const apiData: any = { ...data };
        if (Object.prototype.hasOwnProperty.call(apiData, "birimFiyat")) {
          apiData.BirimFiyat = apiData.birimFiyat;
          delete apiData.birimFiyat;
        }
        await updateModul({ projeModulId: selectedModul.projeModulId, data: apiData }).unwrap();
        toast({
          title: "Modül Güncellendi",
          description: `${data.Adi} modülü başarıyla güncellendi.`,
        });
        setEditModalOpen(false);
        setSelectedModul(null);
      } catch (err) {
        toast({
          title: "Hata",
          description: "Modül güncellenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    }
  };

  const normalizedQuery = searchQuery.toLowerCase().trim();
  const filteredModuller = normalizedQuery
    ? moduller.filter((m) => {
        const haystack = `${m.projeModulId} ${m.adi} ${getProjeAdi(m.projeId)}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : moduller;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Modüller yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-12 w-12" />}
        title="Hata oluştu"
        description="Modüller yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      />
    );
  }

  if (filteredModuller.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-12 w-12" />}
        title={moduller.length === 0 ? "Modül bulunamadı" : "Sonuç bulunamadı"}
        description={
          moduller.length === 0
            ? "Henüz hiç modül eklenmemiş. Yeni bir modül eklemek için yukarıdaki butona tıklayın."
            : "Arama kriterlerinizi değiştirerek tekrar deneyin."
        }
      />
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {filteredModuller.map((modul) => (
          <div
            key={modul.projeModulId}
            className="p-4 rounded-lg border border-border bg-card space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{modul.adi}</p>
                <p className="text-xs text-muted-foreground truncate">#{modul.projeModulId}</p>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Proje</p>
                <Badge variant="outline" className="text-xs mt-1">{getProjeAdi(modul.projeId)}</Badge>
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleEdit(modul)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(modul)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Modül ID
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Modül Adı
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Proje
                </th>
                <th className="px-4 xl:px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredModuller.map((modul) => (
                <tr
                  key={modul.projeModulId}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3">
                    <p className="font-medium text-sm text-foreground">#{modul.projeModulId}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3">
                    <p className="font-medium text-sm text-foreground">{modul.adi}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3">
                    <Badge variant="outline" className="text-xs">{getProjeAdi(modul.projeId)}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(modul)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(modul)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <ProjeModulFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        modul={selectedModul}
        projeler={projeler}
        onSubmit={handleUpdateModul}
      />

      {/* Delete Dialog */}
      <DeleteProjeModulDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        modulName={selectedModul?.adi || ""}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
