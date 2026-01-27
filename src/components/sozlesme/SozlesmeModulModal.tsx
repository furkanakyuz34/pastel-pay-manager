import { useState, useMemo, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, CreditCard } from "lucide-react";

import {
  SozlesmeDto,
  SozlesmeModulDto,
  ProjeModulDto,
  SozlesmeModulCreateRequest,
} from "@/types/backend";
import {
  useGetSozlesmeModullerQuery,
  useGetProjeModullerQuery,
  useCreateSozlesmeModulMutation,
  useDeleteSozlesmeModulMutation,
} from "@/services/backendApi";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useDovizKuru,
  formatDoviz,
  convertToTL,
  convertFromTL,
} from "@/hooks/useDovizKuru";
import { SozlesmePlanModal } from "./SozlesmePlanModal";

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

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function SozlesmeModulModal({
  open,
  onOpenChange,
  sozlesme,
}: SozlesmeModulModalProps) {
  const { toast } = useToast();
  const kurlar = useDovizKuru();

  const [newModul, setNewModul] = useState<NewModul>({
    projeModulId: 0,
    adet: 1,
  });

  const [genelIskonto, setGenelIskonto] = useState<number>(0);
  const [planModalOpen, setPlanModalOpen] = useState(false);

  const [manuelDovizTutar, setManuelDovizTutar] = useState<{
    value: number;
    dovizId: string;
  } | null>(null);
  const debouncedManuelDovizTutar = useDebounce(manuelDovizTutar, 750);

  const { data: moduller = [], isLoading: modullerLoading } =
    useGetSozlesmeModullerQuery(sozlesme?.sozlesmeId || 0, {
      skip: !sozlesme?.sozlesmeId,
    });

  const { data: projeModuller = [] } = useGetProjeModullerQuery(
    sozlesme?.projeId,
    {
      skip: !sozlesme?.projeId,
    }
  );

  const [createModul, { isLoading: isCreating }] =
    useCreateSozlesmeModulMutation();
  const [deleteModul] = useDeleteSozlesmeModulMutation();

  const modulMap = useMemo(() => {
    return projeModuller.reduce(
      (acc, m) => ({ ...acc, [m.projeModulId]: m }),
      {} as Record<number, ProjeModulDto>
    );
  }, [projeModuller]);

  const availableModuller = useMemo(() => {
    return projeModuller.filter(
      (pm) => !moduller.some((m) => m.projeModulId === pm.projeModulId)
    );
  }, [projeModuller, moduller]);

  const selectedModul = newModul.projeModulId
    ? modulMap[newModul.projeModulId]
    : null;

  const newModulPricing = useMemo(() => {
    if (!selectedModul) return null;
    const birimFiyat = selectedModul.birimFiyat || 0;
    const dovizId = selectedModul.dovizId || "TL";
    const toplamFiyat = birimFiyat * newModul.adet;
    const iskontoOrani = newModul.iskonto || 0;
    const iskontoluFiyat = toplamFiyat - (toplamFiyat * iskontoOrani) / 100;
    const toplamTL = convertToTL(iskontoluFiyat, dovizId, kurlar);
    return { birimFiyat, toplamFiyat, iskontoluFiyat, dovizId, toplamTL };
  }, [selectedModul, newModul.adet, newModul.iskonto, kurlar]);

  const handleAddModul = async () => {
    if (!sozlesme || !newModul.projeModulId) {
      toast({
        title: "Hata",
        description: "Modül seçiniz.",
        variant: "destructive",
      });
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
        description:
          err?.data?.error?.detail || "Modül eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteModul = async (modul: SozlesmeModulDto) => {
    if (!sozlesme) return;
    try {
      await deleteModul({
        sozlesmeId: sozlesme.sozlesmeId,
        projeId: sozlesme.projeId,
        projeModulId: modul.projeModulId,
      }).unwrap();
      toast({ title: "Başarılı", description: "Modül silindi." });
    } catch (err: any) {
      toast({
        title: "Hata",
        description:
          err?.data?.error?.detail || "Modül silinirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const getModulPricing = (modul: SozlesmeModulDto) => {
    const projeModul = modulMap[modul.projeModulId];
    const birimFiyat = modul.birimFiyat || projeModul?.birimFiyat || 0;
    const dovizId = projeModul?.dovizId || "TL";
    const toplamFiyat = birimFiyat * modul.adet;
    const iskontoOrani = modul.iskonto || 0;
    const iskontoluFiyat = toplamFiyat - (toplamFiyat * iskontoOrani) / 100;
    const iskontoluTL = convertToTL(iskontoluFiyat, dovizId, kurlar);
    return { birimFiyat, toplamFiyat, iskontoluFiyat, dovizId, iskontoluTL };
  };

  const grandTotals = useMemo(() => {
    let toplamTL = 0;
    const details: { dovizId: string; toplam: number; iskontolu: number }[] =
      [];

    moduller.forEach((modul) => {
      const pricing = getModulPricing(modul);
      toplamTL += pricing.iskontoluTL;

      const existing = details.find((d) => d.dovizId === pricing.dovizId);
      if (existing) {
        existing.toplam += pricing.toplamFiyat;
        existing.iskontolu += pricing.iskontoluFiyat;
      } else {
        details.push({
          dovizId: pricing.dovizId,
          toplam: pricing.toplamFiyat,
          iskontolu: pricing.iskontoluFiyat,
        });
      }
    });

    return { toplamTL, details };
  }, [moduller, modulMap, kurlar]);

  useEffect(() => {
    setManuelDovizTutar(null);
  }, [grandTotals.toplamTL]);

  useEffect(() => {
    if (debouncedManuelDovizTutar === null) return;

    const originalTotal = grandTotals.details.find(
      (d) => d.dovizId === debouncedManuelDovizTutar.dovizId
    )?.iskontolu;

    if (!originalTotal || originalTotal <= 0) return;

    const newIskonto =
      100 * (1 - debouncedManuelDovizTutar.value / originalTotal);
    const finalIskonto = Math.max(
      0,
      Math.min(100, Math.round(newIskonto * 10000) / 10000)
    );

    setGenelIskonto(finalIskonto);
  }, [debouncedManuelDovizTutar, grandTotals.details]);

  const grandTotalsAfterGeneralDiscount = useMemo(() => {
    const rate = Math.min(Math.max(genelIskonto || 0, 0), 100);

    const toplamTLGenelIskontolu =
      grandTotals.toplamTL - (grandTotals.toplamTL * rate) / 100;

    const detailsGenel = grandTotals.details.map((d) => ({
      ...d,
      genelIskontolu: d.iskontolu - (d.iskontolu * rate) / 100,
    }));

    const discountTL = grandTotals.toplamTL - toplamTLGenelIskontolu;

    return {
      rate,
      toplamTL: toplamTLGenelIskontolu,
      discountTL,
      details: detailsGenel,
    };
  }, [grandTotals, genelIskonto]);

  const toplamSozlesmeDovizi = useMemo(() => {
    if (!sozlesme?.dovizId || kurlar.isLoading || kurlar.error) {
      return grandTotalsAfterGeneralDiscount.toplamTL;
    }
    return convertFromTL(
      grandTotalsAfterGeneralDiscount.toplamTL,
      sozlesme.dovizId,
      kurlar
    );
  }, [grandTotalsAfterGeneralDiscount.toplamTL, sozlesme?.dovizId, kurlar]);

  const formatTL = (value: number) => {
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
          <DialogTitle>Sözleşme #{sozlesme.sozlesmeId} - Modüller</DialogTitle>
        </DialogHeader>

        <div className="rounded-lg border border-border p-4 bg-muted/30">
          <h4 className="text-sm font-medium mb-3">Yeni Modül Ekle</h4>
          <div className="grid grid-cols-5 gap-3 items-end">
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground">Modül</label>
              <Select
                onValueChange={(value) =>
                  setNewModul((prev) => ({
                    ...prev,
                    projeModulId: Number(value),
                  }))
                }
                value={newModul.projeModulId?.toString() || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Modül seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {availableModuller.map((modul) => (
                    <SelectItem
                      key={modul.projeModulId}
                      value={modul.projeModulId.toString()}
                    >
                      {modul.adi}{" "}
                      {modul.birimFiyat
                        ? `(${formatDoviz(
                            modul.birimFiyat,
                            modul.dovizId || "TL"
                          )})`
                        : ""}
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
                onChange={(e) =>
                  setNewModul((prev) => ({
                    ...prev,
                    adet: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">İskonto %</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={newModul.iskonto ?? ""}
                onChange={(e) =>
                  setNewModul((prev) => ({
                    ...prev,
                    iskonto: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
              />
            </div>

            <Button
              onClick={handleAddModul}
              disabled={isCreating || !newModul.projeModulId}
            >
              <Plus className="h-4 w-4 mr-1" />
              Ekle
            </Button>
          </div>

          {newModulPricing && (
            <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Birim Fiyat:</span>{" "}
                <span className="font-medium">
                  {formatDoviz(
                    newModulPricing.birimFiyat,
                    newModulPricing.dovizId
                  )}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Toplam:</span>{" "}
                <span className="font-medium">
                  {formatDoviz(
                    newModulPricing.toplamFiyat,
                    newModulPricing.dovizId
                  )}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">İskontolu:</span>{" "}
                <span className="font-medium text-primary">
                  {formatDoviz(
                    newModulPricing.iskontoluFiyat,
                    newModulPricing.dovizId
                  )}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">TL Karşılığı:</span>{" "}
                <span className="font-bold text-green-600">
                  {formatTL(newModulPricing.toplamTL)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-3">Mevcut Modüller</h4>

          {modullerLoading ? (
            <LoadingState message="Modüller yükleniyor..." />
          ) : moduller.length === 0 ? (
            <EmptyState
              title="Modül yok"
              description="Sözleşmeye henüz modül eklenmemiş."
            />
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
                      <TableHead className="text-right">
                        İskontolu Fiyat
                      </TableHead>
                      <TableHead className="text-right">TL Karşılığı</TableHead>
                      <TableHead className="text-right">İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {moduller.map((modul) => {
                      const pricing = getModulPricing(modul);
                      return (
                        <TableRow
                          key={`${modul.sozlesmeId}-${modul.projeModulId}`}
                        >
                          <TableCell>
                            {modulMap[modul.projeModulId]?.adi ||
                              `Modül #${modul.projeModulId}`}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatDoviz(pricing.birimFiyat, pricing.dovizId)}
                          </TableCell>
                          <TableCell className="text-center">
                            {modul.adet}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatDoviz(pricing.toplamFiyat, pricing.dovizId)}
                          </TableCell>
                          <TableCell className="text-center">
                            {modul.iskonto ? `%${modul.iskonto}` : "-"}
                          </TableCell>
                          <TableCell className="text-right font-medium text-primary">
                            {formatDoviz(
                              pricing.iskontoluFiyat,
                              pricing.dovizId
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            {pricing.dovizId !== "TL" &&
                            pricing.dovizId !== "TRY"
                              ? formatTL(pricing.iskontoluTL)
                              : "-"}
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

              <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex flex-col gap-3 w-full">
                    <div className="flex flex-wrap items-end gap-6 text-sm">
                      <div className="w-44">
                        <Label
                          htmlFor="genel-iskonto"
                          className="text-xs text-muted-foreground"
                        >
                          Genel İskonto %
                        </Label>
                        <Input
                          id="genel-iskonto"
                          type="number"
                          min={0}
                          max={100}
                          step="0.0001"
                          value={genelIskonto}
                          onChange={(e) => {
                            setManuelDovizTutar(null);
                            setGenelIskonto(
                              parseFloat(e.target.value.replace(",", ".")) || 0
                            );
                          }}
                        />
                      </div>

                      {grandTotalsAfterGeneralDiscount.details.map((d) => (
                        <div key={d.dovizId} className="w-44">
                          <Label
                            htmlFor={`genel-toplam-${d.dovizId}`}
                            className="text-xs text-muted-foreground"
                          >
                            {d.dovizId} Toplam{" "}
                            {grandTotalsAfterGeneralDiscount.rate
                              ? `(%${grandTotalsAfterGeneralDiscount.rate.toFixed(
                                  2
                                )})`
                              : ""}
                          </Label>
                          <Input
                            id={`genel-toplam-${d.dovizId}`}
                            type="number"
                            value={
                              manuelDovizTutar?.dovizId === d.dovizId
                                ? manuelDovizTutar.value
                                : d.genelIskontolu.toFixed(2)
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              const parsed = parseFloat(val.replace(",", "."));
                              if (!Number.isNaN(parsed)) {
                                setManuelDovizTutar({
                                  value: parsed,
                                  dovizId: d.dovizId,
                                });
                              } else {
                                setManuelDovizTutar(null)
                              }
                            }}
                            className="font-semibold"
                          />
                        </div>
                      ))}

                      <div>
                        <span className="text-muted-foreground">
                          TL Toplam:
                        </span>{" "}
                        <span className="font-bold text-primary text-base">
                          {formatTL(grandTotalsAfterGeneralDiscount.toplamTL)}
                        </span>
                      </div>
                    </div>

                    {grandTotalsAfterGeneralDiscount.rate > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Genel iskonto tutarı:{" "}
                        <span className="font-medium">
                          {formatTL(grandTotalsAfterGeneralDiscount.discountTL)}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => setPlanModalOpen(true)}
                    variant="default"
                    size="sm"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Ödeme Planı
                  </Button>
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

        <SozlesmePlanModal
          open={planModalOpen}
          onOpenChange={setPlanModalOpen}
          sozlesme={sozlesme}
          toplamTutar={toplamSozlesmeDovizi}
          genelIskonto={genelIskonto}
        />
      </DialogContent>
    </Dialog>
  );
}
