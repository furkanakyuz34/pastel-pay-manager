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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plus, Trash2, CreditCard, FileText } from "lucide-react";
import {
  SozlesmeDto,
  SozlesmePlanDto,
  SozlesmePlanDetayDto,
  SozlesmePlanItemRequest,
  PLAN_STATUS,
} from "@/types/backend";
import {
  useGetSozlesmePlanlarQuery,
  useGetSozlesmePlanDetaylarQuery,
  useCreateSozlesmePlanMutation,
  useUpdateSozlesmePlanDetayStatusMutation,
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

export function SozlesmePlanModal({ open, onOpenChange, sozlesme, toplamTutar }: SozlesmePlanModalProps) {
  const { toast } = useToast();
  const kurlar = useDovizKuru();
  const [activeTab, setActiveTab] = useState<"planlar" | "yeni">("planlar");
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  // Form state
  const [usePaynet, setUsePaynet] = useState(false);
  const [nameSurname, setNameSurname] = useState("");
  const [taksitSayisi, setTaksitSayisi] = useState(1);
  const [baslangicTarihi, setBaslangicTarihi] = useState(format(new Date(), "yyyy-MM-dd"));
  const [taksitler, setTaksitler] = useState<SozlesmePlanItemRequest[]>([]);

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

  // Döviz hesaplamaları
  const dovizId = sozlesme?.dovizId || 'TL';
  const toplamTL = useMemo(() => convertToTL(toplamTutar, dovizId, kurlar), [toplamTutar, dovizId, kurlar]);
  const toplamDoviz = useMemo(() => {
    if (dovizId === 'TL' || dovizId === 'TRY') {
      return { USD: convertFromTL(toplamTL, 'USD', kurlar), EUR: convertFromTL(toplamTL, 'EURO', kurlar) };
    }
    return null;
  }, [toplamTL, dovizId, kurlar]);

  // Taksit oluştur
  const generateTaksitler = () => {
    if (taksitSayisi < 1 || !toplamTL) return;
    
    const taksitTutari = Math.round((toplamTL / taksitSayisi) * 100) / 100;
    const yeniTaksitler: SozlesmePlanItemRequest[] = [];
    let kalanTutar = toplamTL;

    for (let i = 0; i < taksitSayisi; i++) {
      const tutar = i === taksitSayisi - 1 ? kalanTutar : taksitTutari;
      kalanTutar -= tutar;
      
      yeniTaksitler.push({
        Sira: i + 1,
        ValDate: format(addMonths(new Date(baslangicTarihi), i), "yyyy-MM-dd"),
        Amount: tutar,
        InvoiceId: `INV-${sozlesme?.sozlesmeId}-${i + 1}`,
      });
    }
    
    setTaksitler(yeniTaksitler);
  };

  const handleCreatePlan = async () => {
    if (!sozlesme || taksitler.length === 0) {
      toast({ title: "Hata", description: "Lütfen taksitleri oluşturun.", variant: "destructive" });
      return;
    }

    if (usePaynet && !nameSurname) {
      toast({ title: "Hata", description: "Paynet kullanımı için isim soyisim gerekli.", variant: "destructive" });
      return;
    }

    try {
      await createPlan({
        SozlesmeId: sozlesme.sozlesmeId,
        UsePaynet: usePaynet,
        NameSurname: nameSurname || `Müşteri ${sozlesme.firmaId}`,
        TotalAmount: toplamTL,
        BeginDate: baslangicTarihi,
        ReferenceNo: `REF-${sozlesme.sozlesmeId}-${Date.now()}`,
        EndUserEmail: "",
        EndUserGsm: "",
        EndUserDesc: `Sözleşme #${sozlesme.sozlesmeId} Ödeme Planı`,
        Items: taksitler,
      }).unwrap();

      toast({ title: "Başarılı", description: "Ödeme planı oluşturuldu." });
      setActiveTab("planlar");
      setTaksitler([]);
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Sözleşme Tutarı ({dovizId}):</span>
              <p className="font-semibold text-lg">{formatDoviz(toplamTutar, dovizId)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">TL Karşılığı:</span>
              <p className="font-semibold text-lg">{formatCurrency(toplamTL)}</p>
            </div>
            {toplamDoviz && (
              <>
                <div>
                  <span className="text-muted-foreground">USD Karşılığı:</span>
                  <p className="font-medium">{formatDoviz(toplamDoviz.USD, 'USD')}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">EUR Karşılığı:</span>
                  <p className="font-medium">{formatDoviz(toplamDoviz.EUR, 'EURO')}</p>
                </div>
              </>
            )}
          </div>
          {kurlar.isLoading && <p className="text-xs text-muted-foreground mt-2">Döviz kurları yükleniyor...</p>}
          {kurlar.error && <p className="text-xs text-destructive mt-2">Döviz kurları alınamadı</p>}
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
                          <TableCell className="text-right font-medium">{formatCurrency(plan.amount)}</TableCell>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Taksit Sayısı</Label>
                  <Input
                    type="number"
                    min={1}
                    max={36}
                    value={taksitSayisi}
                    onChange={(e) => setTaksitSayisi(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Başlangıç Tarihi</Label>
                  <Input
                    type="date"
                    value={baslangicTarihi}
                    onChange={(e) => setBaslangicTarihi(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <Switch checked={usePaynet} onCheckedChange={setUsePaynet} />
                    <Label>Paynet Kullan</Label>
                  </div>
                </div>
                <div className="flex items-end">
                  <Button onClick={generateTaksitler} variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Taksitleri Oluştur
                  </Button>
                </div>
              </div>

              {usePaynet && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <Label>Müşteri Adı Soyadı (Paynet için)</Label>
                  <Input
                    value={nameSurname}
                    onChange={(e) => setNameSurname(e.target.value)}
                    placeholder="Örn: Ahmet Yılmaz"
                    className="mt-2 max-w-md"
                  />
                </div>
              )}
            </div>

            {/* Taksit Tablosu */}
            {taksitler.length > 0 && (
              <div className="rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Sıra</TableHead>
                      <TableHead>Vade Tarihi</TableHead>
                      <TableHead className="text-right">Tutar (TL)</TableHead>
                      <TableHead>Fatura No</TableHead>
                      <TableHead className="text-right">Sil</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taksitler.map((taksit, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{taksit.Sira}</TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={taksit.ValDate || ""}
                            onChange={(e) => {
                              const updated = [...taksitler];
                              updated[idx].ValDate = e.target.value;
                              setTaksitler(updated);
                            }}
                            className="w-40"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            step="0.01"
                            value={taksit.Amount}
                            onChange={(e) => {
                              const updated = [...taksitler];
                              updated[idx].Amount = Number(e.target.value);
                              setTaksitler(updated);
                            }}
                            className="w-32 text-right"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={taksit.InvoiceId || ""}
                            onChange={(e) => {
                              const updated = [...taksitler];
                              updated[idx].InvoiceId = e.target.value;
                              setTaksitler(updated);
                            }}
                            className="w-40"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTaksitler(taksitler.filter((_, i) => i !== idx))}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="p-4 bg-muted/30 border-t border-border flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Toplam:</span>{" "}
                    <span className="font-bold text-lg">
                      {formatCurrency(taksitler.reduce((sum, t) => sum + t.Amount, 0))}
                    </span>
                  </div>
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
