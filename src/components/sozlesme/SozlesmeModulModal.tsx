import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Save } from "lucide-react";
import { SozlesmeDto, SozlesmeModulDto, ProjeModulDto, SozlesmeModulCreateRequest } from "@/types/backend";
import {
  useGetSozlesmeModullerQuery,
  useGetProjeModullerQuery,
  useCreateSozlesmeModulMutation,
  useDeleteSozlesmeModulMutation,
} from "@/services/backendApi";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";

interface SozlesmeModulModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sozlesme: SozlesmeDto | null;
}

interface NewModul {
  projeModulId: number;
  adet: number;
  iskonto?: number;
}

export function SozlesmeModulModal({ open, onOpenChange, sozlesme }: SozlesmeModulModalProps) {
  const { toast } = useToast();
  const [newModul, setNewModul] = useState<NewModul>({ projeModulId: 0, adet: 1 });

  const { data: moduller = [], isLoading: modullerLoading } = useGetSozlesmeModullerQuery(
    sozlesme?.sozlesmeId || 0,
    { skip: !sozlesme?.sozlesmeId }
  );

  const { data: projeModuller = [] } = useGetProjeModullerQuery(sozlesme?.projeId, {
    skip: !sozlesme?.projeId,
  });

  const [createModul, { isLoading: isCreating }] = useCreateSozlesmeModulMutation();
  const [deleteModul] = useDeleteSozlesmeModulMutation();

  const modulMap = projeModuller.reduce(
    (acc, m) => ({ ...acc, [m.projeModulId]: m }),
    {} as Record<number, ProjeModulDto>
  );

  // Filter out already added modules
  const availableModuller = projeModuller.filter(
    (pm) => !moduller.some((m) => m.projeModulId === pm.projeModulId)
  );

  const handleAddModul = async () => {
    if (!sozlesme || !newModul.projeModulId) {
      toast({ title: "Hata", description: "Modül seçiniz.", variant: "destructive" });
      return;
    }

    try {
      const request: SozlesmeModulCreateRequest = {
        sozlesmeId: sozlesme.sozlesmeId,
        projeId: sozlesme.projeId,
        projeModulId: newModul.projeModulId,
        adet: newModul.adet,
        iskonto: newModul.iskonto,
        insertKullaniciId: 1, // TODO: Get from auth context
        kullaniciId: 1,
      };
      await createModul(request).unwrap();
      toast({ title: "Başarılı", description: "Modül eklendi." });
      setNewModul({ projeModulId: 0, adet: 1 });
    } catch (err: any) {
      toast({
        title: "Hata",
        description: err?.data?.error?.detail || "Modül eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteModul = async (modul: SozlesmeModulDto) => {
    if (!sozlesme) return;
    try {
      await deleteModul({
        sozlesmeId: sozlesme.sozlesmeId,
        projeId: modul.projeId,
        projeModulId: modul.projeModulId,
      }).unwrap();
      toast({ title: "Başarılı", description: "Modül silindi." });
    } catch (err: any) {
      toast({
        title: "Hata",
        description: err?.data?.error?.detail || "Modül silinirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  if (!sozlesme) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Sözleşme #{sozlesme.sozlesmeId} - Modüller
          </DialogTitle>
        </DialogHeader>

        {/* Add New Modul */}
        <div className="rounded-lg border border-border p-4 bg-muted/30">
          <h4 className="text-sm font-medium mb-3">Yeni Modül Ekle</h4>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Modül</label>
              <Select
                onValueChange={(value) => setNewModul((prev) => ({ ...prev, projeModulId: Number(value) }))}
                value={newModul.projeModulId?.toString() || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Modül seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {availableModuller.map((modul) => (
                    <SelectItem key={modul.projeModulId} value={modul.projeModulId.toString()}>
                      {modul.adi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24">
              <label className="text-xs text-muted-foreground">Adet</label>
              <Input
                type="number"
                min={1}
                value={newModul.adet}
                onChange={(e) => setNewModul((prev) => ({ ...prev, adet: Number(e.target.value) }))}
              />
            </div>
            <div className="w-24">
              <label className="text-xs text-muted-foreground">İskonto %</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={newModul.iskonto || ""}
                onChange={(e) =>
                  setNewModul((prev) => ({
                    ...prev,
                    iskonto: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
            </div>
            <Button onClick={handleAddModul} disabled={isCreating || !newModul.projeModulId}>
              <Plus className="h-4 w-4 mr-1" />
              Ekle
            </Button>
          </div>
        </div>

        {/* Existing Modules */}
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-3">Mevcut Modüller</h4>
          {modullerLoading ? (
            <LoadingState message="Modüller yükleniyor..." />
          ) : moduller.length === 0 ? (
            <EmptyState title="Modül yok" description="Sözleşmeye henüz modül eklenmemiş." />
          ) : (
            <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Modül Adı</TableHead>
                    <TableHead>Adet</TableHead>
                    <TableHead>İskonto</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moduller.map((modul) => (
                    <TableRow key={`${modul.sozlesmeId}-${modul.projeModulId}`}>
                      <TableCell>{modulMap[modul.projeModulId]?.adi || `Modül #${modul.projeModulId}`}</TableCell>
                      <TableCell>{modul.adet}</TableCell>
                      <TableCell>{modul.iskonto ? `%${modul.iskonto}` : "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteModul(modul)}
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
