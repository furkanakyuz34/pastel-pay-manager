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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Plus, Trash2, CreditCard, FileText, TrendingDown } from "lucide-react";
import {
  SozlesmeDto,
  SozlesmePlanDto,
  SozlesmePlanDetayDto,
  SozlesmePlanItemRequest,
  SozlesmeSablonPlanDto,
  PLAN_STATUS,
} from "@/types/backend";
import {
  useGetSozlesmePlanlarQuery,
  useGetSozlesmePlanDetaylarQuery,
  useCreateSozlesmePlanMutation,
  useUpdateSozlesmePlanDetayStatusMutation,
  useGetPaymentPlansQuery,
} from "@/services/backendApi";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useDovizKuru, formatDoviz, convertToTL, convertFromTL } from "@/hooks/useDovizKuru";
import { format, addMonths } from "date-fns";
import { tr } from "date-fns/locale";

interface SozlesmePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sozlesme: SozlesmeDto | null;
  toplamTutar: number; // İskontolu toplam tutar
}

// Taksit tablosu için genişletilmiş tip
interface TaksitUIState extends SozlesmePlanItemRequest {
  originalAmount: number;
  iskontoOrani: number;
}

export function SozlesmePlanModal({ open, onOpenChange, sozlesme, toplamTutar }: SozlesmePlanModalProps) {
  const { toast } = useToast();
  const kurlar = useDovizKuru();
  const [activeTab, setActiveTab] = useState<"planlar" | "yeni">("planlar");
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  // Form state
  const [usePaynet, setUsePaynet] = useState(false);
  const [nameSurname, setNameSurname] = useState("");
  const [pesinatTarihi, setPesinatTarihi] = useState(format(new Date(), "yyyy-MM-dd"));
  const [abonelikBaslangicTarihi, setAbonelikBaslangicTarihi] = useState(format(addMonths(new Date(), 1), "yyyy-MM-dd"));
  const [taksitler, setTaksitler] = useState<TaksitUIState[]>([]);
  const [planIskontoOrani, setPlanIskontoOrani] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<SozlesmeSablonPlanDto | null>(null);
  const [pesinatDovizId, setPesinatDovizId] = useState('TL');
  const [aylikUcretIskontoOrani, setAylikUcretIskontoOrani] = useState(0);

  // API Verileri
  const { data: sablonPlanlar = [], isLoading: sablonPlanlarLoading, isError, error } = useGetPaymentPlansQuery();
  
  // Döviz ve İskonto Hesaplamaları
  const dovizId = sozlesme?.dovizId || 'TL';
  const toplamTL = useMemo(() => convertToTL(toplamTutar, dovizId, kurlar), [toplamTutar, dovizId, kurlar]);
  
  const planIskontoTutari = useMemo(() => (toplamTL * planIskontoOrani) / 100, [toplamTL, planIskontoOrani]);
  const iskontoluToplamTL = useMemo(() => toplamTL - planIskontoTutari, [toplamTL, planIskontoTutari]);

  const { pesinatTutarTL, pesinatDovizTutar } = useMemo(() => {
    if (!selectedPlan) return { pesinatTutarTL: 0, pesinatDovizTutar: 0 };
    const downPaymentPercentage = selectedPlan.pesinatOrani / 100;
    const pesinatTL = iskontoluToplamTL * downPaymentPercentage;
    const pesinatDoviz = convertFromTL(pesinatTL, pesinatDovizId, kurlar);
    return { pesinatTutarTL: pesinatTL, pesinatDovizTutar: pesinatDoviz };
  }, [selectedPlan, iskontoluToplamTL, pesinatDovizId, kurlar]);

  const aylikUcretIskontoTutari = useMemo(() => {
    const aylikUcretItem = taksitler.find(t => t.Sira === 2);
    if (!aylikUcretItem) return 0;
    const fark = aylikUcretItem.originalAmount - aylikUcretItem.Amount;
    return fark > 0.01 ? fark : 0;
  }, [taksitler]);

  const netToplamTL = useMemo(() => iskontoluToplamTL - (aylikUcretIskontoTutari * (selectedPlan?.abonelikHesaplamaKatsayisi || 0)), [iskontoluToplamTL, aylikUcretIskontoTutari, selectedPlan]);
  const netToplamDoviz = useMemo(() => convertFromTL(netToplamTL, dovizId, kurlar), [netToplamTL, dovizId, kurlar]);

  const planToplami = useMemo(() => taksitler.reduce((sum, t) => sum + t.Amount, 0), [taksitler]);


  const { data: planlar = [], isLoading: planlarLoading } = useGetSozlesmePlanlarQuery(
    sozlesme?.sozlesmeId || 0,
    { skip: !sozlesme?.sozlesmeId }
  );

  const { data: planDetaylar = [], isLoading: detaylarLoading } = useGetSozlesmePlanDetaylarQuery(
    selectedPlanId || 0,
    { skip: !selectedPlanId }
  );

  const [createPlan, { isLoading: isCreating }] = useCreateSozlesmePlanMutation();
  const [updateStatus] = useUpdateSozlesmePlanDetayStatusMutation();

  const generatePlan = (plan: SozlesmeSablonPlanDto) => {
    const downPaymentPercentage = plan.pesinatOrani / 100;
    
    const pesinatTutar = iskontoluToplamTL * downPaymentPercentage;
    const kalanTutar = iskontoluToplamTL - pesinatTutar;
    const aylikUcret = kalanTutar / (plan.abonelikHesaplamaKatsayisi || 36); // Fallback to 36

    const yeniTaksitler: TaksitUIState[] = [];
    let sira = 1;

    // 1. Peşinatı ekle
    if (pesinatTutar > 0) {
      const roundedPesinat = Math.round(pesinatTutar * 100) / 100;
      yeniTaksitler.push({
        Sira: sira++,
        ValDate: pesinatTarihi,
        Amount: roundedPesinat,
        originalAmount: roundedPesinat,
        iskontoOrani: 0,
        InvoiceId: `INV-${sozlesme?.sozlesmeId}-PESINAT`,
      });
    }

    // 2. Aylık abonelik ücretini ekle
    if (aylikUcret > 0) {
      const roundedAylik = Math.round(aylikUcret * 100) / 100;
      yeniTaksitler.push({
        Sira: sira++,
        ValDate: abonelikBaslangicTarihi,
        Amount: roundedAylik,
        originalAmount: roundedAylik,
        iskontoOrani: 0,
        InvoiceId: `INV-${sozlesme?.sozlesmeId}-AYLIK`,
      });
    }
    
    setTaksitler(yeniTaksitler);
    setAylikUcretIskontoOrani(0); // İskonto oranını sıfırla
    toast({ title: "Başarılı", description: `${plan.adi} şablonu uygulandı.`});
  };

  useEffect(() => {
    if (selectedPlan) {
      generatePlan(selectedPlan);
    } else {
      setTaksitler([]);
    }
  }, [selectedPlan, iskontoluToplamTL, pesinatTarihi, abonelikBaslangicTarihi]);

  const applyAylikUcretIskonto = () => {
    if (aylikUcretIskontoOrani <= 0 || aylikUcretIskontoOrani > 100) {
      toast({ title: "Hata", description: "Geçerli bir iskonto oranı girin (%0-%100).", variant: "destructive" });
      return;
    }
    
    setTaksitler(prevTaksitler => {
      const aylikUcretIndex = prevTaksitler.findIndex(t => t.Sira === 2);
      if (aylikUcretIndex === -1) return prevTaksitler;

      const updatedTaksitler = [...prevTaksitler];
      const taksit = updatedTaksitler[aylikUcretIndex];
      
      taksit.iskontoOrani = aylikUcretIskontoOrani;
      const discountedAmount = taksit.originalAmount * (1 - aylikUcretIskontoOrani / 100);
      taksit.Amount = Math.round(discountedAmount * 100) / 100;
      
      return updatedTaksitler;
    });

    toast({ title: "Başarılı", description: `Abonelik ücretine %${aylikUcretIskontoOrani} iskonto uygulandı.`});
  };

  const handleCreatePlan = async () => {
    if (!sozlesme || taksitler.length === 0) {
      toast({ title: "Hata", description: "Lütfen bir plan seçerek taksitleri oluşturun.", variant: "destructive" });
      return;
    }

    if (usePaynet && !nameSurname) {
      toast({ title: "Hata", description: "Paynet kullanımı için isim soyisim gerekli.", variant: "destructive" });
      return;
    }

    try {
      const itemsForApi: SozlesmePlanItemRequest[] = taksitler.map(t => ({
        Sira: t.Sira,
        ValDate: t.ValDate,
        Amount: t.Amount,
        InvoiceId: t.InvoiceId,
      }));
      
      let kur = 1;
      if (pesinatDovizId === 'USD' && kurlar.USD) kur = kurlar.USD;
      if (pesinatDovizId === 'EUR' && kurlar.EUR) kur = kurlar.EUR;

      await createPlan({
        SozlesmeId: sozlesme.sozlesmeId,
        UsePaynet: usePaynet,
        NameSurname: nameSurname || `Müşteri ${sozlesme.firmaId}`,
        TotalAmount: iskontoluToplamTL,
        BeginDate: abonelikBaslangicTarihi,
        ReferenceNo: `REF-${sozlesme.sozlesmeId}-${Date.now()}`,
        EndUserEmail: "",
        EndUserGsm: "",
        EndUserDesc: `Sözleşme #${sozlesme.sozlesmeId} Ödeme Planı`,
        Items: itemsForApi,
        PesinatDovizId: pesinatDovizId,
        PesinatDovizTutar: pesinatDovizTutar,
        PesinatDovizKur: kur,
      }).unwrap();

      toast({ title: "Başarılı", description: "Ödeme planı oluşturuldu." });
      setActiveTab("planlar");
      setTaksitler([]);
      setPlanIskontoOrani(0);
      setSelectedPlan(null);
      setAylikUcretIskontoOrani(0);
      setPesinatDovizId('TL');
    } catch (err: any) {
      toast({
        title: "Hata",
        description: err?.data?.error?.detail || "Ödeme planı oluşturulurken bir hata oluştu.",
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

  const formatCurrency = (value: number) => formatDoviz(value, 'TL');

  if (!sozlesme) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Sözleşme #{sozlesme.sozlesmeId} - Ödeme Planı
          </DialogTitle>
        </DialogHeader>

        {/* Toplam Tutar Özeti */}
        <div className="rounded-lg border border-border p-4 bg-muted/30">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Sözleşme Tutarı ({dovizId}):</span>
              <p className="font-semibold text-lg">{formatDoviz(toplamTutar, dovizId)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">TL Karşılığı:</span>
              <p className="font-semibold text-lg">{formatCurrency(toplamTL)}</p>
            </div>
            {planIskontoTutari > 0 && (
              <div>
                <span className="text-muted-foreground">Genel İskonto ({planIskontoOrani}%):</span>
                <p className="font-semibold text-lg text-destructive">-{formatCurrency(planIskontoTutari)}</p>
              </div>
            )}
            {aylikUcretIskontoTutari > 0 && (
               <div>
                <span className="text-muted-foreground">Aylık Ücret İskontosu:</span>
                <p className="font-semibold text-lg text-destructive">
                  -{formatCurrency(aylikUcretIskontoTutari * (selectedPlan?.abonelikHesaplamaKatsayisi || 36))} 
                  <span className="text-xs">({selectedPlan?.abonelikHesaplamaKatsayisi || 36} Ay)</span>
                </p>
              </div>
            )}
             <div>
              <span className="text-muted-foreground">Net Toplam:</span>
              <p className="font-semibold text-lg text-primary">{formatCurrency(netToplamTL)}</p>
              {dovizId !== 'TL' && <p className="text-sm text-muted-foreground">({formatDoviz(netToplamDoviz, dovizId)})</p>}
            </div>
          </div>
          {pesinatDovizId !== 'TL' && pesinatDovizTutar > 0 && (
             <p className="text-sm text-muted-foreground mt-2">
                Peşinat: <span className="font-semibold">{formatDoviz(pesinatDovizTutar, pesinatDovizId)}</span> ({formatCurrency(pesinatTutarTL)} karşılığı)
            </p>
          )}
          {kurlar.isLoading && <p className="text-xs text-muted-foreground mt-2">Döviz kurları yükleniyor...</p>}
          {!kurlar.isLoading && !kurlar.error && (
            <p className="text-xs text-muted-foreground mt-2">
              Kurlar: 1 USD = {kurlar.USD.toFixed(4)} TL | 1 EUR = {kurlar.EUR.toFixed(4)} TL
            </p>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="planlar">Mevcut Planlar ({planlar.length})</TabsTrigger>
            <TabsTrigger value="yeni">Yeni Plan Oluştur</TabsTrigger>
          </TabsList>

          <TabsContent value="planlar" className="mt-4">
            {planlarLoading ? (
              <LoadingState message="Planlar yükleniyor..." />
            ) : planlar.length === 0 ? (
              <EmptyState 
                title="Plan yok" 
                description="Sözleşmeye henüz ödeme planı oluşturulmamış."
                action={
                  <Button onClick={() => setActiveTab("yeni")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Plan Oluştur
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                {/* Plan Listesi */}
                <div className="rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Plan ID</TableHead>
                        <TableHead>İsim</TableHead>
                        <TableHead className="text-right">Tutar</TableHead>
                        <TableHead className="text-center">Paynet</TableHead>
                        <TableHead className="text-center">Durum</TableHead>
                        <TableHead className="text-right">İşlem</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {planlar.map((plan) => (
                        <TableRow 
                          key={plan.sozlesmePlanId}
                          className={selectedPlanId === plan.sozlesmePlanId ? "bg-primary/5" : ""}
                        >
                          <TableCell>#{plan.sozlesmePlanId}</TableCell>
                          <TableCell>{plan.nameSurname || "-"}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(plan.amount)}
                            {plan.pesinatDovizId && plan.pesinatDovizId !== 'TL' && plan.pesinatDovizTutar && (
                              <p className="text-xs text-muted-foreground">
                                Peşinat: {formatDoviz(plan.pesinatDovizTutar, plan.pesinatDovizId)}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {plan.usePaynet ? (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-500">Paynet</Badge>
                            ) : (
                              <Badge variant="outline">Manuel</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">{getStatusBadge(plan.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPlanId(
                                selectedPlanId === plan.sozlesmePlanId ? null : plan.sozlesmePlanId
                              )}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Detaylar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Plan Detayları */}
                {selectedPlanId && (
                  <div className="rounded-lg border border-border p-4">
                    <h4 className="text-sm font-medium mb-3">Plan #{selectedPlanId} Taksitleri</h4>
                    {detaylarLoading ? (
                      <LoadingState message="Taksitler yükleniyor..." />
                    ) : planDetaylar.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Taksit bulunamadı.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead>Sıra</TableHead>
                            <TableHead>Vade Tarihi</TableHead>
                            <TableHead className="text-right">Tutar</TableHead>
                            <TableHead>Fatura No</TableHead>
                            <TableHead className="text-center">Durum</TableHead>
                            <TableHead className="text-right">İşlem</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {planDetaylar.map((detay) => (
                            <TableRow key={detay.sozlesmePlanDetayId}>
                              <TableCell>{detay.sira}</TableCell>
                              <TableCell>
                                {detay.valDate 
                                  ? format(new Date(detay.valDate), "dd MMM yyyy", { locale: tr })
                                  : "-"
                                }
                              </TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(detay.amount)}</TableCell>
                              <TableCell>{detay.invoiceId || "-"}</TableCell>
                              <TableCell className="text-center">{getStatusBadge(detay.status)}</TableCell>
                              <TableCell className="text-right">
                                {detay.status !== 11 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUpdateStatus(detay.sozlesmePlanDetayId!, 11)}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    Ödendi
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="yeni" className="mt-4 space-y-4">
            {/* Plan Ayarları */}
            <div className="rounded-lg border border-border p-4 bg-muted/30">
              <h4 className="text-sm font-medium mb-4">Plan Ayarları</h4>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                <div className="space-y-2">
                    <Label htmlFor="planIskonto">Genel İskonto (%)</Label>
                    <Input
                      id="planIskonto"
                      type="number" min={0} max={100}
                      value={planIskontoOrani}
                      onChange={(e) => setPlanIskontoOrani(Number(e.target.value))}
                    />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="pesinatDoviz">Peşinat Döviz</Label>
                  <Select value={pesinatDovizId} onValueChange={setPesinatDovizId}>
                    <SelectTrigger id="pesinatDoviz">
                      <SelectValue placeholder="Döviz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TL">TL</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EURO">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pesinatTarihi">Peşinat Tarihi</Label>
                  <Input
                    id="pesinatTarihi"
                    type="date"
                    value={pesinatTarihi}
                    onChange={(e) => setPesinatTarihi(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="abonelikTarihi">Abonelik Başlangıç</Label>
                  <Input
                    id="abonelikTarihi"
                    type="date"
                    value={abonelikBaslangicTarihi}
                    onChange={(e) => setAbonelikBaslangicTarihi(e.target.value)}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label>Plan Tipi Seçin</Label>
                    {sablonPlanlarLoading ? (
                      <p className="text-sm text-muted-foreground">Planlar yükleniyor...</p>
                    ) : isError ? (
                      <p className="text-sm text-destructive">Planlar yüklenemedi. Hata: {JSON.stringify(error)}</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                          {sablonPlanlar.map((plan) => (
                            <Button 
                                key={plan.planId}
                                onClick={() => setSelectedPlan(plan)}
                                variant={selectedPlan?.planId === plan.planId ? 'default' : 'outline'}
                                className="w-full"
                            >
                                {plan.adi} (%{plan.pesinatOrani} Peşinat)
                            </Button>
                          ))}
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Aylık Ücret İskonto */}
            {taksitler.length > 1 && (
               <div className="rounded-lg border border-border p-4 bg-muted/30">
                 <h4 className="text-sm font-medium mb-4">Abonelik Ücreti İskontosu</h4>
                 <div className="flex items-end gap-4">
                   <div className="space-y-2 flex-grow">
                     <Label htmlFor="aylikUcretIskonto">İskonto Oranı (%)</Label>
                     <Input
                       id="aylikUcretIskonto"
                       type="number" min={0} max={100}
                       value={aylikUcretIskontoOrani}
                       onChange={(e) => setAylikUcretIskontoOrani(Number(e.target.value))}
                       placeholder="Örn: 10"
                     />
                   </div>
                   <Button onClick={applyAylikUcretIskonto} variant="secondary">
                      <TrendingDown className="h-4 w-4 mr-2" />
                      Ücrete Uygula
                   </Button>
                 </div>
              </div>
            )}

            {/* Taksit Tablosu */}
            {taksitler.length > 0 && (
              <div className="rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Sıra</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>Vade Tarihi</TableHead>
                      <TableHead className="text-right">Tutar (TL)</TableHead>
                      <TableHead>Fatura No</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taksitler.map((taksit, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{taksit.Sira}</TableCell>
                        <TableCell>
                            {idx === 0 ? <Badge variant="secondary">Peşinat</Badge> : <Badge variant="outline">Aylık Ücret</Badge>}
                        </TableCell>
                        <TableCell>{format(new Date(taksit.ValDate!), "dd MMM yyyy", { locale: tr })}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(taksit.Amount)}
                          {pesinatDovizId !== 'TL' && (
                            <p className="text-xs text-muted-foreground">
                              ({formatDoviz(convertFromTL(taksit.Amount, pesinatDovizId, kurlar), pesinatDovizId)})
                            </p>
                          )}
                        </TableCell>
                        <TableCell>{taksit.InvoiceId}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="p-4 bg-muted/30 border-t border-border flex justify-end items-center">
                  <Button onClick={handleCreatePlan} disabled={isCreating}>
                    <Plus className="h-4 w-4 mr-2" />
                    Planı Kaydet
                  </Button>
                </div>
              </div>
            )}
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
