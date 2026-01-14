import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, CreditCard, FileText, RefreshCw } from "lucide-react";
import {
  SozlesmeDto,
  SozlesmePlaniDto,
  SozlesmeSablonPlanDto,
  SozlesmePlaniCreateRequest,
  SozlesmePlaniUpdateRequest,
  PLAN_STATUS,
} from "@/types/backend";
import {
  useGetSozlesmePlanlariQuery,
  useCreateSozlesmePlaniMutation,
  useUpdateSozlesmePlaniMutation,
  useGetPaymentPlansQuery,
  useLazyGetSozlesmePlaniHesaplaQuery,
} from "@/services/backendApi";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDoviz } from "@/hooks/useDovizKuru";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface SozlesmePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sozlesme: SozlesmeDto | null;
  toplamTutar: number;
}

export function SozlesmePlanModal({ open, onOpenChange, sozlesme, toplamTutar }: SozlesmePlanModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"plan" | "yeni">("plan");

  // Form state
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | undefined>();
  const [dovizId, setDovizId] = useState(sozlesme?.dovizId || 'EURO');
  const [genelIskonto, setGenelIskonto] = useState(0);
  const [abonelikIskonto, setAbonelikIskonto] = useState(0);
  const [abonelikBaslangicTarihi, setAbonelikBaslangicTarihi] = useState(format(new Date(), "yyyy-MM-dd"));

  const [triggerHesapla, { data: hesaplananUcretler, isFetching: isHesaplaLoading, error: hesaplaError }] = useLazyGetSozlesmePlaniHesaplaQuery();

  const { data: sablonPlanlar = [] } = useGetPaymentPlansQuery();

  // Tek plan - bir sözleşmede 1 plan olur
  const { data: mevcutPlan, isLoading: planLoading, refetch: refetchPlan } = useGetSozlesmePlanlariQuery(
    sozlesme?.sozlesmeId || 0,
    { skip: !sozlesme?.sozlesmeId, refetchOnMountOrArgChange: true }
  );

  const [createPlan, { isLoading: isCreating }] = useCreateSozlesmePlaniMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdateSozlesmePlaniMutation();

  const hasPlan = !!mevcutPlan;
  const isLoading = isCreating || isUpdating;

  // Plan varsa edit mode'da başla
  useEffect(() => {
    if (mevcutPlan) {
      setSelectedTemplateId(mevcutPlan.planId);
      setDovizId(mevcutPlan.dovizId || 'EURO');
      setGenelIskonto(mevcutPlan.genelIskonto || 0);
      setAbonelikIskonto(mevcutPlan.abonelikIskonto || 0);
      setAbonelikBaslangicTarihi(mevcutPlan.abonelikBaslangicTarihi ? format(new Date(mevcutPlan.abonelikBaslangicTarihi), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"));
      setActiveTab("plan");
    } else {
      // Reset form when no plan
      setSelectedTemplateId(undefined);
      setDovizId(sozlesme?.dovizId || 'EURO');
      setGenelIskonto(0);
      setAbonelikIskonto(0);
      setAbonelikBaslangicTarihi(format(new Date(), "yyyy-MM-dd"));
      setActiveTab("yeni");
    }
  }, [mevcutPlan, sozlesme?.dovizId]);

  // Hesapla tetikle
  useEffect(() => {
    if (selectedTemplateId && sozlesme && activeTab === "yeni") {
      triggerHesapla({
        sozlesmeId: sozlesme.sozlesmeId,
        planId: selectedTemplateId,
        genelIskonto: genelIskonto,
        abonelikIskonto: abonelikIskonto,
        dovizId: dovizId,
      });
    }
  }, [selectedTemplateId, genelIskonto, abonelikIskonto, dovizId, sozlesme, activeTab, triggerHesapla]);

  const handleSubmitPlan = async () => {
    if (!sozlesme || !selectedTemplateId) {
      toast({ title: "Hata", description: "Lütfen bir plan şablonu seçin.", variant: "destructive" });
      return;
    }

    const commonData = {
      SozlesmeId: sozlesme.sozlesmeId,
      PlanId: selectedTemplateId,
      GenelIskonto: genelIskonto,
      AbonelikIskonto: abonelikIskonto,
      AbonelikBaslangicTarihi: `${abonelikBaslangicTarihi}T00:00:00`,
      PesinatTutari: hesaplananUcretler?.pesinatTutari || 0,
      AbonelikUcreti: hesaplananUcretler?.abonelikUcreti || 0,
      DovizId: dovizId === 'TRY' ? 'TL' : dovizId,
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
  
  const formatCurrency = (value: number | undefined | null, currency: string) => {
    if (value === undefined || value === null || isNaN(value)) return "—";
    return formatDoviz(value, currency);
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
                        <TableCell>{sablonPlanlar.find(p => p.planId === mevcutPlan.planId)?.adi || `Plan #${mevcutPlan.planId}`}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Döviz</TableCell>
                        <TableCell>{mevcutPlan.dovizId}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Peşinat Tutarı</TableCell>
                        <TableCell className="font-semibold text-green-600">{formatCurrency(mevcutPlan.pesinatTutari, mevcutPlan.dovizId)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Aylık Abonelik Ücreti</TableCell>
                        <TableCell className="font-semibold text-blue-600">{formatCurrency(mevcutPlan.abonelikUcreti, mevcutPlan.dovizId)}</TableCell>
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
                            ? format(new Date(mevcutPlan.abonelikBaslangicTarihi), "dd MMMM yyyy", { locale: tr })
                            : "—"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Oluşturulma Tarihi</TableCell>
                        <TableCell>
                          {mevcutPlan.insertTarihi
                            ? format(new Date(mevcutPlan.insertTarihi), "dd.MM.yyyy HH:mm", { locale: tr })
                            : "—"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end">
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
                <Select onValueChange={(v) => setSelectedTemplateId(Number(v))} value={selectedTemplateId?.toString()}>
                  <SelectTrigger><SelectValue placeholder="Şablon seçin..." /></SelectTrigger>
                  <SelectContent>
                    {sablonPlanlar.map(p => (
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
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TL">TL</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="EURO">EURO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Abonelik Başlangıç Tarihi</Label>
                <Input type="date" value={abonelikBaslangicTarihi} onChange={(e) => setAbonelikBaslangicTarihi(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Genel İskonto (%)</Label>
                <Input type="number" min={0} max={100} value={genelIskonto} onChange={(e) => setGenelIskonto(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Abonelik İskonto (%)</Label>
                <Input type="number" min={0} max={100} value={abonelikIskonto} onChange={(e) => setAbonelikIskonto(Number(e.target.value))} />
              </div>
            </div>

            {/* Hesaplama Sonuçları */}
            {isHesaplaLoading ? (
              <LoadingState message="Ücretler hesaplanıyor..." />
            ) : hesaplaError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">Hesaplama hatası. Lütfen bir plan şablonu seçin ve sözleşme modüllerini kontrol edin.</p>
              </div>
            ) : hesaplananUcretler ? (
              <div className="rounded-lg border p-4 bg-muted/50">
                <h4 className="text-sm font-medium mb-3">Hesaplanan Ücretler ({dovizId})</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-background rounded border">
                    <p className="text-xs text-muted-foreground mb-1">Toplam Tutar</p>
                    <p className="text-lg font-bold">{formatCurrency(hesaplananUcretler.toplamTutar, dovizId)}</p>
                  </div>
                  <div className="text-center p-3 bg-background rounded border">
                    <p className="text-xs text-muted-foreground mb-1">Peşinat</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(hesaplananUcretler.pesinatTutari, dovizId)}</p>
                  </div>
                  <div className="text-center p-3 bg-background rounded border">
                    <p className="text-xs text-muted-foreground mb-1">Aylık Abonelik</p>
                    <p className="text-lg font-bold text-blue-600">{formatCurrency(hesaplananUcretler.abonelikUcreti, dovizId)}</p>
                  </div>
                </div>
              </div>
            ) : selectedTemplateId ? (
              <div className="rounded-lg border p-4 bg-yellow-50">
                <p className="text-sm text-yellow-700">Ücret hesaplaması bekleniyor...</p>
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => hasPlan ? setActiveTab("plan") : onOpenChange(false)}>
                İptal
              </Button>
              <Button onClick={handleSubmitPlan} disabled={isLoading || isHesaplaLoading || !selectedTemplateId}>
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
    </Dialog>
  );
}
