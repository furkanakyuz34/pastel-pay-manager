import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, FileText, Plus, RefreshCw, Trash2 } from "lucide-react";

import {
  SozlesmeDto,
  SozlesmePlaniCreateRequest,
  SozlesmePlaniUpdateRequest,
  PLAN_STATUS,
} from "@/types/backend";
import {
  useCreateSozlesmePlaniMutation,
  useDeleteSozlesmePlaniMutation,
  useGetPaymentPlansQuery,
  useGetSozlesmePlanlariQuery,
  useLazyGetSozlesmePlaniHesaplaQuery,
  useUpdateSozlesmePlaniMutation,
} from "@/services/backendApi";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDoviz } from "@/hooks/useDovizKuru";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { DeletePlanDialog } from "./DeletePlanDialog";

// A custom hook to debounce any fast-changing value
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function that runs on every render before the effect runs, or on unmount
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-call effect if value or delay changes

  return debouncedValue;
}

interface SozlesmePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sozlesme: SozlesmeDto | null;
  toplamTutar: number;
  genelIskonto: number;
}

export function SozlesmePlanModal({
  open,
  onOpenChange,
  sozlesme,
  toplamTutar,
  genelIskonto: genelIskontoProp,
}: SozlesmePlanModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"plan" | "yeni">("plan");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);


  const [selectedTemplateId, setSelectedTemplateId] = useState<number | undefined>();
  const [dovizId, setDovizId] = useState(sozlesme?.dovizId || "EURO");
  const [genelIskonto, setGenelIskonto] = useState(genelIskontoProp || 0);
  const [abonelikIskonto, setAbonelikIskonto] = useState(0);
  const [abonelikBaslangicTarihi, setAbonelikBaslangicTarihi] = useState(
    format(new Date(), "yyyy-MM-dd")
  );

  const [manuelAbonelikUcreti, setManuelAbonelikUcreti] = useState<number | null>(null);
  const [originalAbonelikUcreti, setOriginalAbonelikUcreti] = useState<number | null>(null);

  const debouncedGenelIskonto = useDebounce(genelIskonto, 750);
  const debouncedAbonelikIskonto = useDebounce(abonelikIskonto, 750);
  const debouncedManuelAbonelikUcreti = useDebounce(manuelAbonelikUcreti, 250);

  // ✅ RACE FIX: sadece en son hesap sonucu UI’a yazılır
  const [calc, setCalc] = useState<any | null>(null);
  const lastCalcKeyRef = useRef<string>("");

  const { data: sablonPlanlar = [] } = useGetPaymentPlansQuery();

  const [
    triggerHesapla,
    { isFetching: isHesaplaLoading, error: hesaplaError },
  ] = useLazyGetSozlesmePlaniHesaplaQuery();

  const {
    data: mevcutPlan,
    isLoading: planLoading,
    refetch: refetchPlan,
  } = useGetSozlesmePlanlariQuery(sozlesme?.sozlesmeId || 0, {
    skip: !sozlesme?.sozlesmeId,
    refetchOnMountOrArgChange: true,
  });

  const [createPlan, { isLoading: isCreating }] = useCreateSozlesmePlaniMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdateSozlesmePlaniMutation();
  const [deletePlan, { isLoading: isDeleting }] = useDeleteSozlesmePlaniMutation();


  const hasPlan = !!mevcutPlan;
  const isLoading = isCreating || isUpdating || isDeleting;

  const handleDeleteConfirm = async () => {
    if (!mevcutPlan) return;
    try {
      await deletePlan(mevcutPlan.sozlesmePlanId).unwrap();
      toast({
        title: "Başarılı",
        description: "Ödeme planı başarıyla silindi.",
      });
      setIsDeleteDialogOpen(false);
      setActiveTab("yeni"); // Switch to the create tab
    } catch (err) {
      toast({
        title: "Hata",
        description: "Plan silinirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };


  const formatCurrency = (value: number | undefined | null, currency: string) => {
    if (value === undefined || value === null || Number.isNaN(value)) return "—";
    return formatDoviz(value, currency);
  };

  // plan varsa formu doldur, modal açıldığında sıfırla
  useEffect(() => {
    if (open) {
      refetchPlan();
    }
  }, [open, refetchPlan]);

  useEffect(() => {
    if (open) {
      if (mevcutPlan) {
        setSelectedTemplateId(mevcutPlan.planId);
        setDovizId(mevcutPlan.dovizId || "EURO");
        setGenelIskonto(mevcutPlan.genelIskonto || 0);
        setAbonelikIskonto(mevcutPlan.abonelikIskonto || 0);
        setAbonelikBaslangicTarihi(
          mevcutPlan.abonelikBaslangicTarihi
            ? format(new Date(mevcutPlan.abonelikBaslangicTarihi), "yyyy-MM-dd")
            : format(new Date(), "yyyy-MM-dd")
        );
        // Only set the initial tab to "plan"; don't switch the user away from the "yeni" tab
        // if they are actively editing. This prevents focus loss and unexpected tab changes.
        if (activeTab !== "yeni") {
          setActiveTab("plan");
        }
      } else {
        setSelectedTemplateId(undefined);
        setDovizId(sozlesme?.dovizId || "EURO");
        setGenelIskonto(genelIskontoProp || 0);
        setAbonelikIskonto(0);
        setAbonelikBaslangicTarihi(format(new Date(), "yyyy-MM-dd"));
        setActiveTab("yeni");
      }
      setManuelAbonelikUcreti(null);
      setOriginalAbonelikUcreti(null);

      // ✅ modal açılınca eski hesap sonucu kalmasın
      setCalc(null);
      lastCalcKeyRef.current = "";
    }
  }, [open, mevcutPlan, sozlesme?.dovizId, genelIskontoProp]);

  useEffect(() => {
    if (!calc) {
      setOriginalAbonelikUcreti(null);
      return;
    }
    
    // Manuel düzenleme sırasında orijinal fiyatı güncelleme (bounce önleme)
    if (manuelAbonelikUcreti !== null) return;

    const { abonelikUcreti, inputs } = calc;
    if (!inputs || typeof abonelikUcreti === 'undefined') return;

    const { genelIskonto: genelIskontoUsed, abonelikIskonto: abonelikIskontoUsed } = inputs;
    
    if (abonelikIskontoUsed < 100 && genelIskontoUsed < 100) {
      const afterAbonelik = abonelikUcreti / (1 - abonelikIskontoUsed / 100);
      const gross = abonelikUcreti / (1 - abonelikIskontoUsed / 100);
      setOriginalAbonelikUcreti(gross);
    } else {
      setOriginalAbonelikUcreti(0);
    }
  }, [calc, manuelAbonelikUcreti]);

  // şablon/döviz değişince manuel fiyat sıfırla
  useEffect(() => {
    setManuelAbonelikUcreti(null);
    setOriginalAbonelikUcreti(null);

    // ✅ seçime bağlı eski hesap sonucu kalmasın
    setCalc(null);
    lastCalcKeyRef.current = "";
  }, [selectedTemplateId, dovizId]);

  // ✅ Hesapla tetikle (DEBOUNCED)
  useEffect(() => {
    if (selectedTemplateId && sozlesme && activeTab === "yeni") {
      const requestInputs = { genelIskonto: debouncedGenelIskonto, abonelikIskonto: debouncedAbonelikIskonto };
      const key = [
        sozlesme.sozlesmeId,
        selectedTemplateId,
        dovizId,
        requestInputs.genelIskonto,
        requestInputs.abonelikIskonto,
      ].join("|");

      lastCalcKeyRef.current = key;

      triggerHesapla(
        {
          sozlesmeId: sozlesme.sozlesmeId,
          planId: selectedTemplateId,
          genelIskonto: requestInputs.genelIskonto,
          abonelikIskonto: requestInputs.abonelikIskonto,
          dovizId: dovizId,
        },
        false
      )
        .unwrap()
        .then((res) => {
          if (lastCalcKeyRef.current === key) {
            setCalc({ ...res, inputs: requestInputs });
          }
        })
        .catch(() => {
          if (lastCalcKeyRef.current === key) {
            setCalc(null);
          }
        });
    }
  }, [
    selectedTemplateId,
    sozlesme,
    activeTab,
    debouncedGenelIskonto,
    debouncedAbonelikIskonto,
    dovizId,
    triggerHesapla,
  ]);

  const handleAbonelikIskontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManuelAbonelikUcreti(null); // De-sync from manual price
    setAbonelikIskonto(parseFloat(e.target.value.replace(",", ".")) || 0);
  };

  const handleManuelAbonelikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setManuelAbonelikUcreti(null);
      return;
    }
    const parsedPrice = parseFloat(val.replace(",", "."));
    if (!Number.isNaN(parsedPrice)) {
      setManuelAbonelikUcreti(parsedPrice);
    }
  };

  useEffect(() => {
    if (debouncedManuelAbonelikUcreti === null) return;

    if (originalAbonelikUcreti && originalAbonelikUcreti > 0) {
      const newDiscount = 100 * (1 - debouncedManuelAbonelikUcreti / originalAbonelikUcreti);
      const finalNewDiscount = Math.max(0, Math.min(100, Math.round(newDiscount * 10000) / 10000));
      
      setAbonelikIskonto((prev) => {
        if (Math.abs(prev - finalNewDiscount) < 0.0001) return prev;
        return finalNewDiscount;
      });
    }
  }, [debouncedManuelAbonelikUcreti, originalAbonelikUcreti]);

  const handleSubmitPlan = async () => {
    if (!sozlesme || !selectedTemplateId) {
      toast({
        title: "Hata",
        description: "Lütfen bir plan şablonu seçin.",
        variant: "destructive",
      });
      return;
    }

    const commonData = {
      SozlesmeId: sozlesme.sozlesmeId,
      PlanId: selectedTemplateId,
      GenelIskonto: genelIskonto,
      AbonelikIskonto: abonelikIskonto,
      AbonelikBaslangicTarihi: `${abonelikBaslangicTarihi}T00:00:00`,
      PesinatTutari: calc?.pesinatTutari || 0,
      AbonelikUcreti: (manuelAbonelikUcreti ?? calc?.abonelikUcreti) || 0,
      DovizId: dovizId,
      KullaniciId: 1,
    };

    try {
      if (hasPlan && mevcutPlan) {
        const updateData: SozlesmePlaniUpdateRequest = {
          ...commonData,
          SozlesmePlanId: mevcutPlan.sozlesmePlanId,
        };
        await updatePlan(updateData).unwrap();
        toast({ title: "Başarılı", description: "Ödeme planı güncellendi." });
      } else {
        const createData: SozlesmePlaniCreateRequest = {
          ...commonData,
          InsertKullaniciId: 1,
        };
        await createPlan(createData).unwrap();
        toast({ title: "Başarılı", description: "Ödeme planı oluşturuldu." });
      }

      refetchPlan();
      setActiveTab("plan");
    } catch (err: any) {
      toast({
        title: "Hata",
        description: err?.data?.error?.detail || "İşlem sırasında bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: number) => {
    const statusInfo = PLAN_STATUS[status as keyof typeof PLAN_STATUS] || PLAN_STATUS[0];
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  if (!sozlesme) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Sözleşme #{sozlesme.sozlesmeId} - Ödeme Planı
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plan" disabled={!hasPlan}>
              Mevcut Plan {hasPlan ? "" : "(Yok)"}
            </TabsTrigger>
            <TabsTrigger value="yeni">
              {hasPlan ? "Planı Düzenle" : "Yeni Plan Oluştur"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plan" className="mt-4">
            {planLoading ? (
              <LoadingState message="Plan yükleniyor..." />
            ) : !mevcutPlan ? (
              <EmptyState title="Plan yok" description="Sözleşmeye henüz ödeme planı oluşturulmamış." />
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border p-4 bg-muted/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Plan #{mevcutPlan.sozlesmePlanId}</h3>
                    <Button variant="ghost" size="sm" onClick={() => refetchPlan()}>
                      <RefreshCw className="h-4 w-4 mr-1" /> Yenile
                    </Button>
                  </div>

                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Şablon</TableCell>
                        <TableCell>
                          {sablonPlanlar.find((p) => p.planId === mevcutPlan.planId)?.adi ||
                            `Plan #${mevcutPlan.planId}`}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Döviz</TableCell>
                        <TableCell>{mevcutPlan.dovizId}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Peşinat Tutarı</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(mevcutPlan.pesinatTutari, mevcutPlan.dovizId)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Aylık Abonelik Ücreti</TableCell>
                        <TableCell className="font-semibold text-blue-600">
                          {formatCurrency(mevcutPlan.abonelikUcreti, mevcutPlan.dovizId)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Genel İskonto</TableCell>
                        <TableCell>%{mevcutPlan.genelIskonto || 0}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Abonelik İskonto</TableCell>
                        <TableCell>%{mevcutPlan.abonelikIskonto || 0}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Başlangıç Tarihi</TableCell>
                        <TableCell>
                          {mevcutPlan.abonelikBaslangicTarihi
                            ? format(new Date(mevcutPlan.abonelikBaslangicTarihi), "dd MMMM yyyy", {
                                locale: tr,
                              })
                            : "—"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Durum</TableCell>
                        <TableCell>{getStatusBadge(mevcutPlan.status ?? 0)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Planı Sil
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("yeni")}>
                    <FileText className="h-4 w-4 mr-2" /> Planı Düzenle
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="yeni" className="mt-4 space-y-4">
            <div className="rounded-lg border p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Plan Şablonu *</Label>
                <Select
                  onValueChange={(v) => setSelectedTemplateId(Number(v))}
                  value={selectedTemplateId?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Şablon seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sablonPlanlar.map((p) => (
                      <SelectItem key={p.planId} value={p.planId.toString()}>
                        {p.adi} (Peşinat: %{p.pesinatOrani})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Döviz</Label>
                <Select onValueChange={(v) => setDovizId(v)} value={dovizId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TL">TL</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EURO">EURO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Abonelik Başlangıç Tarihi</Label>
                <Input
                  type="date"
                  value={abonelikBaslangicTarihi}
                  onChange={(e) => setAbonelikBaslangicTarihi(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Genel İskonto (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step="0.0001"
                  value={genelIskonto}
                  onChange={(e) =>
                    setGenelIskonto(parseFloat(e.target.value.replace(",", ".")) || 0)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Abonelik İskonto (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step="0.0001"
                  value={abonelikIskonto}
                  onChange={handleAbonelikIskontoChange}
                />
              </div>
            </div>

            {isHesaplaLoading ? (
              <LoadingState message="Ücretler hesaplanıyor..." />
            ) : hesaplaError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">
                  Hesaplama hatası. Lütfen bir plan şablonu seçin ve sözleşme modüllerini kontrol edin.
                </p>
              </div>
            ) : calc && selectedTemplateId ? (
              <div className="rounded-lg border p-4 bg-muted/50">
                <h4 className="text-sm font-medium mb-3">Hesaplanan Ücretler ({dovizId})</h4>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-background rounded border">
                    <p className="text-xs text-muted-foreground mb-1">Toplam Tutar</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(calc.toplamTutar, dovizId)}
                    </p>
                  </div>

                  <div className="text-center p-3 bg-background rounded border">
                    <p className="text-xs text-muted-foreground mb-1">Peşinat</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(calc.pesinatTutari, dovizId)}
                    </p>
                  </div>

                  <div className="text-center p-3 bg-background rounded border">
                    <label
                      htmlFor="manuel-abonelik"
                      className="text-xs text-muted-foreground mb-1 block"
                    >
                      Aylık Abonelik
                    </label>
                    <Input
                      id="manuel-abonelik"
                      type="number"
                      value={manuelAbonelikUcreti ?? (calc.abonelikUcreti ?? "")}
                      onChange={handleManuelAbonelikChange}
                      className="text-lg font-bold text-blue-600 text-center"
                      placeholder="Fiyat girin"
                    />
                  </div>
                </div>
              </div>
            ) : selectedTemplateId ? (
              <div className="rounded-lg border p-4 bg-yellow-50">
                <p className="text-sm text-yellow-700">Ücret hesaplaması bekleniyor...</p>
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => (hasPlan ? setActiveTab("plan") : onOpenChange(false))}
              >
                İptal
              </Button>
              <Button
                onClick={handleSubmitPlan}
                disabled={isLoading || isHesaplaLoading || !selectedTemplateId}
              >
                <Plus className="h-4 w-4 mr-2" />
                {hasPlan ? "Planı Güncelle" : "Planı Kaydet"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
        </div>
      </DialogContent>
      <DeletePlanDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </Dialog>
  );
}
