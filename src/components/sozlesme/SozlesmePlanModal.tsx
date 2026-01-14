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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, CreditCard, FileText } from "lucide-react";
import {
  SozlesmeDto,
  SozlesmePlaniDto,
  SozlesmePlanDetayDto,
  SozlesmeSablonPlanDto,
  SozlesmePlaniCreateRequest,
  SozlesmePlaniUpdateRequest,
  PLAN_STATUS,
} from "@/types/backend";
import {
  useGetSozlesmePlanlariQuery,
  useGetSozlesmePlaniDetaylarQuery,
  useCreateSozlesmePlaniMutation,
  useUpdateSozlesmePlaniMutation,
  useUpdateSozlesmePlanDetayStatusMutation,
  useGetPaymentPlansQuery,
  useLazyGetSozlesmePlaniHesaplaQuery,
} from "@/services/backendApi";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useDovizKuru, formatDoviz } from "@/hooks/useDovizKuru";
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
  const kurlar = useDovizKuru();
  const [activeTab, setActiveTab] = useState<"planlar" | "yeni">("planlar");
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [editingPlan, setEditingPlan] = useState<SozlesmePlaniDto | null>(null);

  // Form state
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | undefined>();
  const [dovizId, setDovizId] = useState(sozlesme?.dovizId || 'TL');
  const [genelIskonto, setGenelIskonto] = useState(0);
  const [abonelikIskonto, setAbonelikIskonto] = useState(0);
  const [abonelikBaslangicTarihi, setAbonelikBaslangicTarihi] = useState(format(new Date(), "yyyy-MM-dd"));

  const [triggerHesapla, { data: hesaplananUcretler, isFetching: isHesaplaLoading }] = useLazyGetSozlesmePlaniHesaplaQuery();

  const { data: sablonPlanlar = [] } = useGetPaymentPlansQuery();

  const { data: planlar = [], isLoading: planlarLoading } = useGetSozlesmePlanlariQuery(
    sozlesme?.sozlesmeId || 0,
    { skip: !sozlesme?.sozlesmeId, refetchOnMountOrArgChange: true }
  );

  const { data: planDetaylar = [], isLoading: detaylarLoading } = useGetSozlesmePlaniDetaylarQuery(
    selectedPlanId || 0,
    { skip: !selectedPlanId }
  );

  const [createPlan, { isLoading: isCreating }] = useCreateSozlesmePlaniMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdateSozlesmePlaniMutation();
  const [updateStatus] = useUpdateSozlesmePlanDetayStatusMutation();

  const isEditMode = !!editingPlan;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (isEditMode) {
      setSelectedTemplateId(editingPlan.planId);
      setDovizId(editingPlan.dovizId || 'TL');
      setGenelIskonto(editingPlan.genelIskonto || 0);
      setAbonelikIskonto(editingPlan.abonelikIskonto || 0);
      setAbonelikBaslangicTarihi(editingPlan.abonelikBaslangicTarihi ? format(new Date(editingPlan.abonelikBaslangicTarihi), "yyyy-MM-dd") : "");
      setActiveTab("yeni");
    } else {
      // Reset form when not in edit mode
      setSelectedTemplateId(undefined);
      setDovizId(sozlesme?.dovizId || 'TL');
      setGenelIskonto(0);
      setAbonelikIskonto(0);
      setAbonelikBaslangicTarihi(format(new Date(), "yyyy-MM-dd"));
    }
  }, [editingPlan, isEditMode, sozlesme?.dovizId]);

  useEffect(() => {
    if (selectedTemplateId && sozlesme) {
      triggerHesapla({
        sozlesmeId: sozlesme.sozlesmeId,
        planId: selectedTemplateId,
        genelIskonto: genelIskonto,
        abonelikIskonto: abonelikIskonto,
        dovizId: dovizId,
      });
    }
  }, [selectedTemplateId, genelIskonto, abonelikIskonto, dovizId, sozlesme, triggerHesapla]);

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
      PesinatTutari: hesaplananUcretler?.PesinatTutari || 0,
      AbonelikUcreti: hesaplananUcretler?.AbonelikUcreti || 0,
      DovizId: dovizId === 'TRY' ? 'TL' : dovizId,
      KullaniciId: 1, // TODO: Get from auth
    };

    try {
      if (isEditMode) {
        const updateData: SozlesmePlaniUpdateRequest = {
          ...commonData,
          SozlesmePlanId: editingPlan.sozlesmePlanId,
        };
        await updatePlan(updateData).unwrap();
        toast({ title: "Başarılı", description: "Ödeme planı güncellendi." });
      } else {
        const createData: SozlesmePlaniCreateRequest = {
          ...commonData,
          InsertKullaniciId: 1, // TODO: Get from auth
        };
        await createPlan(createData).unwrap();
        toast({ title: "Başarılı", description: "Ödeme planı oluşturuldu." });
      }
      setEditingPlan(null);
      setActiveTab("planlar");
    } catch (err: any) {
      toast({
        title: "Hata",
        description: err?.data?.error?.detail || "İşlem sırasında bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (detayId: number, newStatus: number) => {
    try {
      await updateStatus({ sozlesmePlanDetayId: detayId, status: newStatus }).unwrap();
      toast({ title: "Başarılı", description: "Ödeme durumu güncellendi." });
    } catch (err) {
      toast({ title: "Hata", description: "Durum güncellenemedi.", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: number) => {
    const statusInfo = PLAN_STATUS[status as keyof typeof PLAN_STATUS] || PLAN_STATUS[0];
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };
  
  const formatCurrency = (value: number, currency: string) => formatDoviz(value, currency);

  if (!sozlesme) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) setEditingPlan(null); onOpenChange(isOpen); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Sözleşme #{sozlesme.sozlesmeId} - Ödeme Planı
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => { if (v === 'planlar') setEditingPlan(null); setActiveTab(v as any); }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="planlar">Mevcut Planlar ({planlar.length})</TabsTrigger>
            <TabsTrigger value="yeni">{isEditMode ? "Planı Düzenle" : "Yeni Plan Oluştur"}</TabsTrigger>
          </TabsList>

          <TabsContent value="planlar" className="mt-4">
            {planlarLoading ? (
              <LoadingState message="Planlar yükleniyor..." />
            ) : planlar.length === 0 ? (
              <EmptyState title="Plan yok" description="Sözleşmeye henüz ödeme planı oluşturulmamış." />
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Plan ID</TableHead>
                    <TableHead>Şablon</TableHead>
                    <TableHead>Doviz</TableHead>
                    <TableHead>Peşinat</TableHead>
                    <TableHead>Aylık Ücret</TableHead>
                    <TableHead>Başlangıç</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>{planlar.map((plan) => (
                    <TableRow key={plan.sozlesmePlanId}>
                      <TableCell>#{plan.sozlesmePlanId}</TableCell>
                      <TableCell>{sablonPlanlar.find(p => p.planId === plan.planId)?.adi || 'Bilinmiyor'}</TableCell>
                      <TableCell>{plan.dovizId}</TableCell>
                      <TableCell>{formatCurrency(plan.pesinatTutari || 0, plan.dovizId || 'TL')}</TableCell>
                      <TableCell>{formatCurrency(plan.abonelikUcreti || 0, plan.dovizId || 'TL')}</TableCell>
                      <TableCell>{plan.abonelikBaslangicTarihi ? format(new Date(plan.abonelikBaslangicTarihi), "dd MMM yyyy", { locale: tr }) : "-"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setEditingPlan(plan)}><FileText className="h-4 w-4 mr-1" />Düzenle</Button>
                      </TableCell>
                    </TableRow>
                  ))}</TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="yeni" className="mt-4 space-y-4">
            <div className="rounded-lg border p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Plan Şablonu</Label>
                <Select onValueChange={(v) => setSelectedTemplateId(Number(v))} value={selectedTemplateId?.toString()}>
                  <SelectTrigger><SelectValue placeholder="Şablon seçin..." /></SelectTrigger>
                  <SelectContent>
                    {sablonPlanlar.map(p => <SelectItem key={p.planId} value={p.planId.toString()}>{p.adi}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Doviz</Label>
                <Select onValueChange={(v) => setDovizId(v)} value={dovizId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="TL">TL</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
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
            {isHesaplaLoading ? (
                <LoadingState message="Ücretler hesaplanıyor..."/>
            ) : hesaplananUcretler && (
                <div className="rounded-lg border p-4 bg-muted/50">
                    <h4 className="text-sm font-medium mb-2">Hesaplanan Ücretler</h4>
                    <div className="flex gap-4">
                        <p className="text-sm"><span className="text-muted-foreground">Peşinat:</span> <span className="font-semibold">{formatCurrency(hesaplananUcretler.PesinatTutari, dovizId)}</span></p>
                        <p className="text-sm"><span className="text-muted-foreground">Aylık Abonelik:</span> <span className="font-semibold">{formatCurrency(hesaplananUcretler.AbonelikUcreti, dovizId)}</span></p>
                    </div>
                </div>
            )}
            <div className="flex justify-end pt-4">
                <Button onClick={handleSubmitPlan} disabled={isLoading || isHesaplaLoading}>
                    <Plus className="h-4 w-4 mr-2" />
                    {isEditMode ? "Planı Güncelle" : "Planı Kaydet"}
                </Button>
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
