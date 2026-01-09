import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Trash2, FolderKanban, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { ProjeDto, ProjeUpdateRequest } from "@/types/backend";
import {
  useGetProjelerQuery,
  useDeleteProjeMutation,
  useUpdateProjeMutation,
} from "@/services/backendApi";
import { ProjeFormModal } from "@/components/proje/ProjeFormModal";
import { DeleteProjeDialog } from "@/components/proje/DeleteProjeDialog";

interface ProjeTableProps {
  searchQuery?: string;
}

export function ProjeTable({ searchQuery = "" }: ProjeTableProps) {
  const { data: projeler = [], isLoading, error } = useGetProjelerQuery();
  const [deleteProje, { isLoading: isDeleting }] = useDeleteProjeMutation();
  const [updateProje] = useUpdateProjeMutation();
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProje, setSelectedProje] = useState<ProjeDto | null>(null);
  const { toast } = useToast();

  const handleEdit = (proje: ProjeDto) => {
    setSelectedProje(proje);
    setEditModalOpen(true);
  };

  const handleDelete = (proje: ProjeDto) => {
    setSelectedProje(proje);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedProje) {
      try {
        await deleteProje(selectedProje.projeId).unwrap();
        toast({
          title: "Proje Silindi",
          description: `${selectedProje.adi} projesi başarıyla silindi.`,
        });
        setSelectedProje(null);
        setDeleteDialogOpen(false);
      } catch (err) {
        toast({
          title: "Hata",
          description: "Proje silinirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpdateProje = async (data: ProjeUpdateRequest) => {
    if (selectedProje) {
      try {
        await updateProje({ projeId: selectedProje.projeId, data }).unwrap();
        toast({
          title: "Proje Güncellendi",
          description: `${data.Adi} projesi başarıyla güncellendi.`,
        });
        setEditModalOpen(false);
        setSelectedProje(null);
      } catch (err) {
        toast({
          title: "Hata",
          description: "Proje güncellenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    }
  };

  const normalizedQuery = searchQuery.toLowerCase().trim();
  const filteredProjeler = normalizedQuery
    ? projeler.filter((p) => {
        const haystack = `${p.projeId} ${p.adi}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : projeler;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Projeler yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<FolderKanban className="h-12 w-12" />}
        title="Hata oluştu"
        description="Projeler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      />
    );
  }

  if (filteredProjeler.length === 0) {
    return (
      <EmptyState
        icon={<FolderKanban className="h-12 w-12" />}
        title={projeler.length === 0 ? "Proje bulunamadı" : "Sonuç bulunamadı"}
        description={
          projeler.length === 0
            ? "Henüz hiç proje eklenmemiş. Yeni bir proje eklemek için yukarıdaki butona tıklayın."
            : "Arama kriterlerinizi değiştirerek tekrar deneyin."
        }
      />
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {filteredProjeler.map((proje) => (
          <div
            key={proje.projeId}
            className="p-4 rounded-lg border border-border bg-card space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{proje.adi}</p>
                <p className="text-xs text-muted-foreground truncate">#{proje.projeId}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleEdit(proje)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(proje)}
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
                  Proje ID
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Proje Adı
                </th>
                <th className="px-4 xl:px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProjeler.map((proje) => (
                <tr
                  key={proje.projeId}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3">
                    <p className="font-medium text-sm text-foreground">#{proje.projeId}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3">
                    <p className="font-medium text-sm text-foreground">{proje.adi}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(proje)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(proje)}
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
      <ProjeFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        proje={selectedProje}
        onSubmit={handleUpdateProje}
      />

      {/* Delete Dialog */}
      <DeleteProjeDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        projeName={selectedProje?.adi || ""}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
