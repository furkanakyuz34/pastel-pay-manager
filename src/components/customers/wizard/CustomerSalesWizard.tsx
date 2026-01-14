import { useState, useMemo } from "react";
import {
  useGetCustomersQuery,
  useGetPlansQuery,
  useGetProjectsQuery,
  useGetProductsQuery,
  useCreateCustomerMutation,
} from "@/services/managementApi";
import { Customer, Plan, Project, Product, Subscription } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCustomerCards } from "@/hooks/useCustomerCards";
import { CustomerCardsModal } from "@/components/customers/CustomerCardsModal";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon, CheckCircle2, Users, Package, Repeat, Tag, CreditCard } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;

interface CustomerSalesWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerSalesWizard({ open, onOpenChange }: CustomerSalesWizardProps) {
  const { toast } = useToast();

  // Data
  const { data: customers = [] } = useGetCustomersQuery();
  const { data: plans = [] } = useGetPlansQuery();
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: products = [] } = useGetProductsQuery();

  const [createCustomer, { isLoading: createCustomerLoading }] = useCreateCustomerMutation();

  // Wizard state
  const [step, setStep] = useState<Step>(1);

  // Step 1 - Customer
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    status: "active",
  });

  // Step 2 - Project & Products
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Step 3 - Plan & Pricing
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly" | "trial">("monthly");
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Step 4 - Subscription details
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [autoRenew, setAutoRenew] = useState(true);
  const [notes, setNotes] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [showCardsModal, setShowCardsModal] = useState(false);

  // Customer cards management
  const { cards: customerCards, loading: cardsLoading } = useCustomerCards(selectedCustomerId);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId]
  );

  const availableProjects = projects as Project[];
  const availableProducts = useMemo(
    () => (products as Product[]).filter((p) => p.projectId === selectedProjectId),
    [products, selectedProjectId]
  );

  const selectedPlan = useMemo(
    () => (plans as Plan[]).find((p) => p.id === selectedPlanId),
    [plans, selectedPlanId]
  );

  const originalPrice = useMemo(() => {
    if (!selectedPlan) return 0;
    return billingCycle === "yearly" ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice;
  }, [selectedPlan, billingCycle]);

  const finalPrice = useMemo(() => {
    if (!originalPrice) return 0;
    if (!discountPercent || discountPercent <= 0) return originalPrice;
    return Math.max(0, originalPrice - (originalPrice * discountPercent) / 100);
  }, [originalPrice, discountPercent]);

  const resetState = () => {
    setStep(1);
    setSelectedCustomerId("");
    setNewCustomer({
      name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      status: "active",
    });
    setSelectedProjectId("");
    setSelectedProductIds([]);
    setSelectedPlanId("");
    setBillingCycle("monthly");
    setDiscountPercent(0);
    setStartDate(new Date());
    setAutoRenew(true);
    setNotes("");
    setSelectedCardId("");
    setShowCardsModal(false);
  };

  const handleClose = (value: boolean) => {
    if (!value) {
      resetState();
    }
    onOpenChange(value);
  };

  const handleToggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const canGoNext = () => {
    if (step === 1) {
      return !!selectedCustomerId || !!newCustomer.name;
    }
    if (step === 2) {
      return !!selectedProjectId && selectedProductIds.length > 0;
    }
    if (step === 3) {
      return !!selectedPlanId && !!billingCycle;
    }
    if (step === 4) {
      return (!!selectedCustomer || !!newCustomer.name) && !!selectedPlan && !!startDate;
    }
    return true;
  };

  const handleFinish = async () => {
    if ((!selectedCustomer && !newCustomer.name) || !selectedPlan || !startDate) {
      toast({
        title: "Eksik bilgi",
        description: "Lütfen zorunlu alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    // Ensure we have a customer in backend: use selected or create new
    let customerToUse: Customer | undefined = selectedCustomer;

    if (!customerToUse && newCustomer.name) {
      try {
        const created = await createCustomer({
          name: newCustomer.name,
          email: newCustomer.email || "",
          phone: newCustomer.phone || "",
          company: newCustomer.company || "",
          address: newCustomer.address || "",
          status: "active",
        }).unwrap();
        customerToUse = created;
      } catch (error) {
        toast({
          title: "Müşteri oluşturulamadı",
          description: "Müşteri kaydı yapılırken bir hata oluştu.",
          variant: "destructive",
        });
        return;
      }
    }

    if (!customerToUse) {
      toast({
        title: "Müşteri bulunamadı",
        description: "Lütfen bir müşteri seçin veya yeni müşteri bilgilerini doldurun.",
        variant: "destructive",
      });
      return;
    }

    const startDateStr = startDate.toISOString().split("T")[0];
    const nextBillingDateStr =
      billingCycle === "trial"
        ? undefined
        : (() => {
            const next = new Date(startDate);
            if (billingCycle === "monthly") next.setMonth(next.getMonth() + 1);
            if (billingCycle === "yearly") next.setFullYear(next.getFullYear() + 1);
            return next.toISOString().split("T")[0];
          })();

    const trialEndDateStr =
      billingCycle === "trial"
        ? (() => {
            const trialEnd = new Date(startDate);
            trialEnd.setDate(trialEnd.getDate() + (selectedPlan.trialDays || 14));
            return trialEnd.toISOString().split("T")[0];
          })()
        : undefined;

    const baseAmount = originalPrice;
    const discountAmount = discountPercent > 0 ? (baseAmount * discountPercent) / 100 : 0;
    const finalAmount = baseAmount - discountAmount;

    const subscriptionData: Omit<Subscription, "id"> = {
      customerId: customerToUse.id,
      customerName: customerToUse.name,
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      billingCycle,
      status: "active",
      startDate: startDateStr,
      nextBillingDate: nextBillingDateStr,
      trialEndDate: trialEndDateStr,
      planPrice: baseAmount.toString(),
      discountAmount: discountAmount > 0 ? discountAmount.toFixed(2) : undefined,
      discountPercent: discountPercent || undefined,
      finalAmount: finalAmount.toFixed(2),
      autoRenew,
      end_user_desc: notes || `Müşteri satış sihirbazı ile oluşturulan abonelik`,
    };
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle>Yeni Müşteri Satış Sihirbazı</DialogTitle>
          <DialogDescription>
            Adım adım ilerleyerek müşteri, proje, plan ve aboneliği tek ekrandan oluşturun.
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-between gap-2 border-b border-border pb-3 mb-4">
          <WizardStep
            step={1}
            current={step}
            icon={<Users className="h-4 w-4" />}
            label="Müşteri"
          />
          <WizardStep
            step={2}
            current={step}
            icon={<Package className="h-4 w-4" />}
            label="Proje & Ürünler"
          />
          <WizardStep
            step={3}
            current={step}
            icon={<Tag className="h-4 w-4" />}
            label="Plan & Fiyat"
          />
          <WizardStep
            step={4}
            current={step}
            icon={<Repeat className="h-4 w-4" />}
            label="Abonelik"
          />
        </div>

        {/* Step content */}
        <div className="space-y-6">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Existing customer */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <span className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                    1A
                  </span>
                  Mevcut müşteri seç
                </h3>
                <p className="text-xs text-muted-foreground">
                  Var olan bir müşteri için yeni satış / abonelik oluşturmak için listeden seçim yapın.
                </p>
                <Select
                  value={selectedCustomerId}
                  onValueChange={(value) => setSelectedCustomerId(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Müşteri seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} {c.email && `(${c.email})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* New customer */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <span className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                    1B
                  </span>
                  Yeni müşteri oluştur
                </h3>
                <p className="text-xs text-muted-foreground">
                  Aynı ekrandan hem yeni müşteri kaydı hem de abonelik oluşturabilirsiniz.
                </p>
                <div className="space-y-2">
                  <Input
                    placeholder="Müşteri adı"
                    value={newCustomer.name || ""}
                    onChange={(e) => setNewCustomer((prev) => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder="E-posta"
                    type="email"
                    value={newCustomer.email || ""}
                    onChange={(e) => setNewCustomer((prev) => ({ ...prev, email: e.target.value }))}
                  />
                  <Input
                    placeholder="Telefon"
                    value={newCustomer.phone || ""}
                    onChange={(e) => setNewCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                  <Input
                    placeholder="Şirket adı (isteğe bağlı)"
                    value={newCustomer.company || ""}
                    onChange={(e) =>
                      setNewCustomer((prev) => ({ ...prev, company: e.target.value }))
                    }
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Not: Bu sihirbaz şu an sadece abonelik kaydı oluşturur; müşteri kartı kaydetme entegrasyonu
                  backend tarafına bağlandığında eklenebilir.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Proje seç</h3>
                  <Select
                    value={selectedProjectId}
                    onValueChange={(value) => {
                      setSelectedProjectId(value);
                      setSelectedProductIds([]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Proje seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProjects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProjectId && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Ürünler</h3>
                    <p className="text-xs text-muted-foreground">
                      Bu satış kapsamında lisanslanacak ürünleri seçin.
                    </p>
                    <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-3 space-y-2">
                      {availableProducts.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          Bu projeye ait ürün bulunmuyor.
                        </p>
                      )}
                      {availableProducts.map((product) => (
                        <label
                          key={product.id}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedProductIds.includes(product.id)}
                            onCheckedChange={() => handleToggleProduct(product.id)}
                          />
                          <span className="flex-1">
                            {product.name}
                            {product.price && (
                              <span className="ml-1 text-xs text-muted-foreground">
                                ({product.price})
                              </span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Plan seç</h3>
                <p className="text-xs text-muted-foreground">
                  Bu müşteriye atanacak abonelik planını seçin. İleride plan detaylarını Planlar ekranından
                  detaylı yönetebilirsiniz.
                </p>
                <Select
                  value={selectedPlanId}
                  onValueChange={(value) => setSelectedPlanId(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Plan seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {(plans as Plan[]).map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}{" "}
                        <span className="text-xs text-muted-foreground">
                          (₺{plan.monthlyPrice}/ay - ₺{plan.yearlyPrice}/yıl)
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPlan && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-xs text-muted-foreground uppercase">
                      Faturalama döngüsü
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={billingCycle === "monthly" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setBillingCycle("monthly")}
                      >
                        Aylık
                      </Button>
                      <Button
                        type="button"
                        variant={billingCycle === "yearly" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setBillingCycle("yearly")}
                      >
                        Yıllık
                      </Button>
                      <Button
                        type="button"
                        variant={billingCycle === "trial" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setBillingCycle("trial")}
                      >
                        Deneme
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-xs text-muted-foreground uppercase">
                      Müşteri özel iskonto (%)
                    </h4>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                      placeholder="Örn: 10"
                    />
                  </div>

                  <div className="md:col-span-2 flex flex-wrap items-center gap-3 text-sm">
                    <Badge variant="outline">
                      Orijinal fiyat: ₺{originalPrice.toFixed(2)}
                    </Badge>
                    {discountPercent > 0 && (
                      <>
                        <Badge variant="outline" className="text-red-600 border-red-300">
                          İskonto: %{discountPercent}
                        </Badge>
                        <Badge variant="outline" className="text-green-600 border-green-300">
                          Müşteri öder: ₺{finalPrice.toFixed(2)}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              {/* Card Selection */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Ödeme Kartı
                </h3>
                {customerCards.length > 0 ? (
                  <div className="space-y-2">
                    <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kartlardan birini seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {customerCards.map((card) => (
                          <SelectItem key={card.id} value={card.id}>
                            <div className="flex items-center gap-2">
                              <span>{card.cardholderName}</span>
                              {card.bankName && (
                                <Badge variant="outline" className="text-xs">
                                  {card.bankName}
                                </Badge>
                              )}
                              <span className="text-muted-foreground">•••• {card.cardNumber.slice(-4)}</span>
                              {card.isDefault && (
                                <Badge className="text-xs">Varsayılan</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCardsModal(true)}
                      className="w-full"
                    >
                      Yeni Kart Ekle
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-border bg-muted/30 p-3 text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Müşteriye henüz kart eklenmemiş</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCardsModal(true)}
                      className="w-full"
                    >
                      İlk Kartı Ekle
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Başlangıç tarihi</h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        {startDate ? (
                          format(startDate, "dd MMM yyyy", { locale: tr })
                        ) : (
                          <span>Tarih seçin</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => setStartDate(date || undefined)}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Otomatik yenileme</h3>
                  <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                    <Checkbox checked={autoRenew} onCheckedChange={(v) => setAutoRenew(!!v)} />
                    <div className="text-xs">
                      <p className="font-medium">Süre sonunda otomatik yenile</p>
                      <p className="text-muted-foreground">
                        Müşteri iptal edene kadar abonelik devam eder.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">İç not (isteğe bağlı)</h3>
                <Textarea
                  rows={3}
                  placeholder="Örn: 3 aylık kampanya kapsamında %10 indirim uygulandı..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="rounded-md border border-border bg-muted/40 p-3 text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <p className="font-semibold">Özet</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <p>
                    <span className="text-muted-foreground">Müşteri: </span>
                    <span>{selectedCustomer?.name || newCustomer.name || "-"}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Plan: </span>
                    <span>{selectedPlan?.name || "-"}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Döngü: </span>
                    <span>
                      {billingCycle === "monthly"
                        ? "Aylık"
                        : billingCycle === "yearly"
                        ? "Yıllık"
                        : "Deneme"}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Fiyat: </span>
                    <span>
                      ₺{finalPrice.toFixed(2)}
                      {discountPercent > 0 && (
                        <span className="text-muted-foreground">
                          {" "}
                          (orijinal ₺{originalPrice.toFixed(2)}, %{discountPercent} iskonto)
                        </span>
                      )}
                    </span>
                  </p>
                  {selectedCardId && (
                    <p>
                      <span className="text-muted-foreground">Kart: </span>
                      <span>
                        {customerCards.find((c) => c.id === selectedCardId)?.cardholderName || "-"}
                        {customerCards.find((c) => c.id === selectedCardId)?.bankName && (
                          <span className="text-muted-foreground ml-2">
                            ({customerCards.find((c) => c.id === selectedCardId)?.bankName})
                          </span>
                        )}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
          <div className="text-xs text-muted-foreground">
            Adım {step} / 4
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (step === 1) {
                  handleClose(false);
                } else {
                  setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));
                }
              }}
            >
              {step === 1 ? "Vazgeç" : "Geri"}
            </Button>
            {step < 4 && (
              <Button
                type="button"
                onClick={() => setStep((prev) => (prev < 4 ? ((prev + 1) as Step) : prev))}
                disabled={!canGoNext()}
              >
                Devam
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Customer Cards Modal */}
    {selectedCustomerId && (
      <CustomerCardsModal
        open={showCardsModal}
        onOpenChange={setShowCardsModal}
        customerId={selectedCustomerId}
        customerName={selectedCustomer?.name || newCustomer.name || ""}
        onCardAdded={() => {
          // Auto-select the newly added card if no card is selected
          if (!selectedCardId && customerCards.length > 0) {
            setSelectedCardId(customerCards[0].id);
          }
        }}
      />
    )}
    </>
  );
}

interface WizardStepProps {
  step: Step;
  current: Step;
  icon: React.ReactNode;
  label: string;
}

function WizardStep({ step, current, icon, label }: WizardStepProps) {
  const isActive = current === step;
  const isCompleted = current > step;

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full border text-xs",
          isActive && "border-primary bg-primary text-primary-foreground",
          !isActive && !isCompleted && "border-border bg-background text-muted-foreground",
          isCompleted && "border-green-500 bg-green-500 text-white"
        )}
      >
        {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : step}
      </div>
      <div className="hidden sm:flex flex-col">
        <span
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            isActive ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {icon}
          {label}
        </span>
      </div>
    </div>
  );
}


