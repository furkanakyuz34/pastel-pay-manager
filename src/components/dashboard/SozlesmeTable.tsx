import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Eye, Package } from "lucide-react";
import { useGetSozlesmelerQuery, useGetFirmalarQuery, useGetProjelerQuery, useDeleteSozlesmeMutation } from "@/services/backendApi";
import { SozlesmeDto, FirmaDto, ProjeDto, SozlesmeUpdateRequest } from "@/types/backend";
import { useToast } from "@/hooks/use-toast";
import { SozlesmeFormModal } from "@/components/sozlesme/SozlesmeFormModal";
import { DeleteSozlesmeDialog } from "@/components/sozlesme/DeleteSozlesmeDialog";
import { SozlesmeModulModal } from "@/components/sozlesme/SozlesmeModulModal";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface SozlesmeTableProps {
  searchQuery?: string;
}

export function SozlesmeTable({ searchQuery = "" }: SozlesmeTableProps) {
  const { data: sozlesmeler = [], isLoading, error } = useGetSozlesmelerQuery();
  const { data: firmalar = [] } = useGetFirmalarQuery();
  const { data: projeler = [] } = useGetProjelerQuery();
  const [deleteSozlesme] = useDeleteSozlesmeMutation();
  const { toast } = useToast();

  const [editModal, setEditModal] = useState<{ open: boolean; sozlesme: SozlesmeDto | null }>({
    open: false,
    sozlesme: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; sozlesme: SozlesmeDto | null }>({
    open: false,
    sozlesme: null,
  });
  const [modulModal, setModulModal] = useState<{ open: boolean; sozlesme: SozlesmeDto | null }>({
    open: false,
    sozlesme: null,
  });

  const firmaMap = firmalar.reduce((acc, f) => ({ ...acc, [f.firmaId]: f }), {} as Record<number, FirmaDto>);
  const projeMap = projeler.reduce((acc, p) => ({ ...acc, [p.projeId]: p }), {} as Record<number, ProjeDto>);

  const filteredSozlesmeler = sozlesmeler.filter((s) => {
    const firma = firmaMap[s.firmaId];
    const proje = projeMap[s.projeId];
    const searchLower = searchQuery.toLowerCase();
    return (
      firma?.adi?.toLowerCase().includes(searchLower) ||
      proje?.adi?.toLowerCase().includes(searchLower) ||
      s.notu?.toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = async () => {
    if (!deleteDialog.sozlesme) return;
    try {
      await deleteSozlesme(deleteDialog.sozlesme.sozlesmeId).unwrap();
      toast({ title: "Sözleşme silindi", description: "Sözleşme başarıyla silindi." });
      setDeleteDialog({ open: false, sozlesme: null });
    } catch (err) {
      toast({ title: "Hata", description: "Sözleşme silinirken bir hata oluştu.", variant: "destructive" });
    }
  };

  const formatCurrency = (value?: number, currency?: string) => {
    if (value === undefined || value === null) return "-";
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency || "TRY",
    }).format(value);
  };

  if (isLoading) return <LoadingState message="Sözleşmeler yükleniyor..." />;
  if (error) return <EmptyState title="Hata" description="Sözleşmeler yüklenirken bir hata oluştu." />;
  if (filteredSozlesmeler.length === 0) {
    return <EmptyState title="Sözleşme bulunamadı" description="Henüz sözleşme eklenmemiş." />;
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>ID</TableHead>
              <TableHead>Firma</TableHead>
              <TableHead>Proje</TableHead>
              <TableHead>Kullanıcı Sayısı</TableHead>
              <TableHead>Satış Tarihi</TableHead>
              <TableHead>Satış Fiyatı</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSozlesmeler.map((sozlesme) => (
              <TableRow key={sozlesme.sozlesmeId} className="hover:bg-muted/30">
                <TableCell className="font-medium">{sozlesme.sozlesmeId}</TableCell>
                <TableCell>{firmaMap[sozlesme.firmaId]?.adi || "-"}</TableCell>
                <TableCell>{projeMap[sozlesme.projeId]?.adi || "-"}</TableCell>
                <TableCell>{sozlesme.kullaniciSayisi}</TableCell>
                <TableCell>
                  {sozlesme.satisTarihi
                    ? format(new Date(sozlesme.satisTarihi), "dd MMM yyyy", { locale: tr })
                    : "-"}
                </TableCell>
                <TableCell>{formatCurrency(sozlesme.satisFiyati, sozlesme.dovizId)}</TableCell>
                <TableCell>
                  <Badge variant={sozlesme.demo ? "secondary" : sozlesme.lisansVer ? "default" : "outline"}>
                    {sozlesme.demo ? "Demo" : sozlesme.lisansVer ? "Aktif" : "Pasif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setModulModal({ open: true, sozlesme })}
                      title="Modüller"
                    >
                      <Package className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditModal({ open: true, sozlesme })}
                      title="Düzenle"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteDialog({ open: true, sozlesme })}
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      <SozlesmeFormModal
        open={editModal.open}
        onOpenChange={(open) => setEditModal({ open, sozlesme: open ? editModal.sozlesme : null })}
        sozlesme={editModal.sozlesme}
        firmalar={firmalar}
        projeler={projeler}
      />

      {/* Delete Dialog */}
      <DeleteSozlesmeDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, sozlesme: open ? deleteDialog.sozlesme : null })}
        onConfirm={handleDelete}
        sozlesmeId={deleteDialog.sozlesme?.sozlesmeId}
      />

      {/* Modül Modal */}
      <SozlesmeModulModal
        open={modulModal.open}
        onOpenChange={(open) => setModulModal({ open, sozlesme: open ? modulModal.sozlesme : null })}
        sozlesme={modulModal.sozlesme}
      />
    </>
  );
}
