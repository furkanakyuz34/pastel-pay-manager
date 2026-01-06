import { useState, useMemo } from "react";
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
import { Plus, Trash2 } from "lucide-react";
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

  // Selected module for new entry
  const selectedModul = newModul.projeModulId ? modulMap[newModul.projeModulId] : null;

  // Calculate prices for new module
  const newModulPricing = useMemo(() => {
    if (!selectedModul) return null;
    const birimFiyat = selectedModul.birimFiyat || 0;
    const toplamFiyat = birimFiyat * newModul.adet;
    const iskontoOrani = newModul.iskonto || 0;
    const iskontoluFiyat = toplamFiyat - (toplamFiyat * iskontoOrani / 100);
    return { birimFiyat, toplamFiyat, iskontoluFiyat };
  }, [selectedModul, newModul.adet, newModul.iskonto]);

  const handleAddModul = async () => {
    if (!sozlesme || !newModul.projeModulId) {
      toast({ title: "Hata", description: "Modül seçiniz.", variant: "destructive" });
      return;
    }

    try {
      const request: SozlesmeModulCreateRequest = {
        SozlesmeId: sozlesme.sozlesmeId,
        ProjeId: sozlesme.projeId,
        ProjeModulId: newModul.projeModulId,
        Adet: newModul.adet,
        Iskonto: newModul.iskonto,
        InsertKullaniciId: 1, // TODO: Get from auth context
        KullaniciId: 1,
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

  // Calculate pricing for existing modules
  const getModulPricing = (modul: SozlesmeModulDto) => {
    const projeModul = modulMap[modul.projeModulId];
    const birimFiyat = modul.birimFiyat || projeModul?.birimFiyat || 0;
    const toplamFiyat = birimFiyat * modul.adet;
    const iskontoOrani = modul.iskonto || 0;
    const iskontoluFiyat = toplamFiyat - (toplamFiyat * iskontoOrani / 100);
    return { birimFiyat, toplamFiyat, iskontoluFiyat };
  };

  // Calculate grand totals
  const grandTotals = useMemo(() => {
    let toplamFiyat = 0;
    let iskontoluFiyat = 0;
    moduller.forEach((modul) => {
      const pricing = getModulPricing(modul);
      toplamFiyat += pricing.toplamFiyat;
      iskontoluFiyat += pricing.iskontoluFiyat;
    });
    return { toplamFiyat, iskontoluFiyat };
  }, [moduller, modulMap]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(value);
  };

  if (!sozlesme) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Sözleşme #{sozlesme.sozlesmeId} - Modüller
          </DialogTitle>
        </DialogHeader>

        {/* Add New Modul */}
        <div className="rounded-lg border border-border p-4 bg-muted/30">
          <h4 className="text-sm font-medium mb-3">Yeni Modül Ekle</h4>
          <div className="grid grid-cols-5 gap-3 items-end">
            <div className="col-span-2">
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
                      {modul.adi} {modul.birimFiyat ? `(${formatCurrency(modul.birimFiyat)})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Adet</label>
              <Input
                type="number"
                min={1}
                value={newModul.adet}
                onChange={(e) => setNewModul((prev) => ({ ...prev, adet: Number(e.target.value) }))}
              />
            </div>
            <div>
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
          
          {/* Price Preview */}
          {newModulPricing && (
            <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Birim Fiyat:</span>{" "}
                <span className="font-medium">{formatCurrency(newModulPricing.birimFiyat)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Toplam:</span>{" "}
                <span className="font-medium">{formatCurrency(newModulPricing.toplamFiyat)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">İskontolu:</span>{" "}
                <span className="font-medium text-primary">{formatCurrency(newModulPricing.iskontoluFiyat)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Existing Modules */}
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-3">Mevcut Modüller</h4>
          {modullerLoading ? (
            <LoadingState message="Modüller yükleniyor..." />
          ) : moduller.length === 0 ? (
            <EmptyState title="Modül yok" description="Sözleşmeye henüz modül eklenmemiş." />
          ) : (
            <>
              <div className="rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Modül Adı</TableHead>
                      <TableHead className="text-right">Birim Fiyat</TableHead>
                      <TableHead className="text-center">Adet</TableHead>
                      <TableHead className="text-right">Toplam</TableHead>
                      <TableHead className="text-center">İskonto</TableHead>
                      <TableHead className="text-right">İskontolu Fiyat</TableHead>
                      <TableHead className="text-right">İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {moduller.map((modul) => {
                      const pricing = getModulPricing(modul);
                      return (
                        <TableRow key={`${modul.sozlesmeId}-${modul.projeModulId}`}>
                          <TableCell>{modulMap[modul.projeModulId]?.adi || `Modül #${modul.projeModulId}`}</TableCell>
                          <TableCell className="text-right">{formatCurrency(pricing.birimFiyat)}</TableCell>
                          <TableCell className="text-center">{modul.adet}</TableCell>
                          <TableCell className="text-right">{formatCurrency(pricing.toplamFiyat)}</TableCell>
                          <TableCell className="text-center">{modul.iskonto ? `%${modul.iskonto}` : "-"}</TableCell>
                          <TableCell className="text-right font-medium text-primary">
                            {formatCurrency(pricing.iskontoluFiyat)}
                          </TableCell>
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
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Grand Totals */}
              <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex justify-end gap-8 text-sm">
                  <div>
                    <span className="text-muted-foreground">Genel Toplam:</span>{" "}
                    <span className="font-semibold">{formatCurrency(grandTotals.toplamFiyat)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">İskontolu Toplam:</span>{" "}
                    <span className="font-bold text-primary text-base">{formatCurrency(grandTotals.iskontoluFiyat)}</span>
                  </div>
                </div>
              </div>
            </>
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
