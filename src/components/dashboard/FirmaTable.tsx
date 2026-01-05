import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Trash2, Users, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { FirmaDto, FirmaUpdateRequest } from "@/types/backend";
import {
  useGetFirmalarQuery,
  useDeleteFirmaMutation,
  useUpdateFirmaMutation,
} from "@/services/backendApi";
import { FirmaFormModal } from "@/components/firma/FirmaFormModal";
import { DeleteFirmaDialog } from "@/components/firma/DeleteFirmaDialog";
import { FirmaDetailModal } from "@/components/firma/FirmaDetailModal";

interface FirmaTableProps {
  searchQuery?: string;
}

export function FirmaTable({ searchQuery = "" }: FirmaTableProps) {
  const { data: firmalar = [], isLoading, error } = useGetFirmalarQuery();
  const [deleteFirma, { isLoading: isDeleting }] = useDeleteFirmaMutation();
  const [updateFirma] = useUpdateFirmaMutation();
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedFirma, setSelectedFirma] = useState<FirmaDto | null>(null);
  const { toast } = useToast();

  const handleView = (firma: FirmaDto) => {
    setSelectedFirma(firma);
    setDetailModalOpen(true);
  };

  const handleEdit = (firma: FirmaDto) => {
    setSelectedFirma(firma);
    setEditModalOpen(true);
  };

  const handleDelete = (firma: FirmaDto) => {
    setSelectedFirma(firma);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedFirma) {
      try {
        await deleteFirma(selectedFirma.firmaId).unwrap();
        toast({
          title: "Firma Silindi",
          description: `${selectedFirma.adi} firması başarıyla silindi.`,
        });
        setSelectedFirma(null);
        setDeleteDialogOpen(false);
      } catch (err) {
        toast({
          title: "Hata",
          description: "Firma silinirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpdateFirma = async (data: FirmaUpdateRequest) => {
    if (selectedFirma) {
      try {
        await updateFirma({ firmaId: selectedFirma.firmaId, data }).unwrap();
        toast({
          title: "Firma Güncellendi",
          description: `${data.adi} firması başarıyla güncellendi.`,
        });
        setEditModalOpen(false);
        setSelectedFirma(null);
      } catch (err) {
        toast({
          title: "Hata",
          description: "Firma güncellenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    }
  };

  const normalizedQuery = searchQuery.toLowerCase().trim();
  const filteredFirmalar = normalizedQuery
    ? firmalar.filter((f) => {
        const haystack = `${f.firmaId} ${f.adi} ${f.yetkiliAdi ?? ""} ${f.email ?? ""} ${f.telefon1 ?? ""}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : firmalar;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Firmalar yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<Users className="h-12 w-12" />}
        title="Hata oluştu"
        description="Firmalar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      />
    );
  }

  if (filteredFirmalar.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-12 w-12" />}
        title={firmalar.length === 0 ? "Firma bulunamadı" : "Sonuç bulunamadı"}
        description={
          firmalar.length === 0
            ? "Henüz hiç firma eklenmemiş. Yeni bir firma eklemek için yukarıdaki butona tıklayın."
            : "Arama kriterlerinizi değiştirerek tekrar deneyin."
        }
      />
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {filteredFirmalar.map((firma) => (
          <div
            key={firma.firmaId}
            className="p-4 rounded-lg border border-border bg-card space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{firma.adi}</p>
                <p className="text-xs text-muted-foreground truncate">#{firma.firmaId}</p>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              {firma.yetkiliAdi && (
                <p className="text-foreground">
                  <span className="text-muted-foreground">Yetkili: </span>
                  {firma.yetkiliAdi}
                </p>
              )}
              {firma.email && (
                <p className="text-foreground truncate">
                  <span className="text-muted-foreground">E-posta: </span>
                  {firma.email}
                </p>
              )}
              {firma.telefon1 && (
                <p className="text-foreground">
                  <span className="text-muted-foreground">Telefon: </span>
                  {firma.telefon1}
                </p>
              )}
              {firma.sehir && (
                <p className="text-foreground">
                  <span className="text-muted-foreground">Şehir: </span>
                  {firma.sehir}
                </p>
              )}
            </div>
            <div className="flex gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleView(firma)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Detay
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(firma)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(firma)}
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
                  Firma ID
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Firma Adı
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Yetkili
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  İletişim
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Şehir
                </th>
                <th className="px-4 xl:px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredFirmalar.map((firma) => (
                <tr
                  key={firma.firmaId}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3">
                    <p className="font-medium text-sm text-foreground">#{firma.firmaId}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3">
                    <p className="font-medium text-sm text-foreground">{firma.adi}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3 text-sm text-foreground">
                    {firma.yetkiliAdi || "-"}
                  </td>
                  <td className="px-4 xl:px-6 py-3">
                    <div className="text-xs lg:text-sm text-foreground">
                      {firma.email && <p className="truncate max-w-[200px]">{firma.email}</p>}
                      {firma.telefon1 && (
                        <p className="text-muted-foreground">{firma.telefon1}</p>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3 text-sm text-foreground">
                    {firma.sehir || "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(firma)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Detayları Görüntüle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(firma)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(firma)}
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
      <FirmaFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        firma={selectedFirma}
        onSubmit={handleUpdateFirma}
      />

      {/* Delete Dialog */}
      <DeleteFirmaDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        firmaName={selectedFirma?.adi || ""}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      {/* Detail Modal */}
      <FirmaDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        firma={selectedFirma}
      />
    </>
  );
}
