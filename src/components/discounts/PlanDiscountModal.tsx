import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addPlanDiscount, addPlanCustomerPricing } from "@/features/discountSlice";
import {
  calculateDiscount,
  createPlanCustomerPricing,
  formatDiscountDescription,
} from "@/services/discountService";
import { Plan, DiscountType } from "@/types";
import { AlertCircle, Check } from "lucide-react";

interface PlanDiscountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId?: string;
  customerName?: string;
  planId?: string;
  plan?: Plan;
}

export function PlanDiscountModal({
  open,
  onOpenChange,
  customerId: initialCustomerId,
  customerName,
  planId: initialPlanId,
  plan: initialPlan,
}: PlanDiscountModalProps) {
  const dispatch = useAppDispatch();
  const plans = useAppSelector((state) => state.plans.plans);
  const customers = useAppSelector((state) => state.customers.customers);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    initialCustomerId || ""
  );
  const [selectedPlan, setSelectedPlan] = useState<Plan | undefined>(
    initialPlan
  );
  const [discountType, setDiscountType] = useState<DiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [validFrom, setValidFrom] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [validUntil, setValidUntil] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("discount");
  const [success, setSuccess] = useState(false);

  const getPreview = () => {
    if (!selectedPlan) return null;

    const monthlyCalc = calculateDiscount(
      Number(selectedPlan.monthlyPrice),
      discountType,
      discountValue
    );

    const yearlyCalc = calculateDiscount(
      Number(selectedPlan.yearlyPrice),
      discountType,
      discountValue
    );

    return { monthlyCalc, yearlyCalc };
  };

  const preview = getPreview();

  const handleApplyDiscount = () => {
    if (!selectedCustomerId) {
      alert("Lütfen müşteri seçiniz");
      return;
    }

    if (!selectedPlan) {
      alert("Lütfen plan seçiniz");
      return;
    }

    if (discountValue <= 0) {
      alert("İskonto değeri 0'dan büyük olmalı");
      return;
    }

    if (validUntil && validUntil < validFrom) {
      alert("Bitiş tarihi başlangıç tarihinden sonra olmalı");
      return;
    }

    const monthlyDiscountObj = {
      id: `discount-monthly-${selectedCustomerId}-${selectedPlan.id}-${Date.now()}`,
      planId: selectedPlan.id,
      customerId: selectedCustomerId,
      discountType,
      discountValue,
      isActive: true,
      validFrom,
      validUntil: validUntil || undefined,
      createdAt: new Date().toISOString(),
      notes:
        notes ||
        `Aylık ${formatDiscountDescription({ discountType, discountValue })}`,
    };

    dispatch(addPlanDiscount(monthlyDiscountObj));

    const pricing = createPlanCustomerPricing(
      selectedPlan,
      selectedCustomerId,
      monthlyDiscountObj,
      undefined,
      validFrom,
      validUntil || undefined
    );

    dispatch(addPlanCustomerPricing(pricing));

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onOpenChange(false);
      resetForm();
    }, 1500);
  };

  const resetForm = () => {
    setSelectedCustomerId(initialCustomerId || "");
    setSelectedPlan(initialPlan);
    setDiscountType("percentage");
    setDiscountValue(0);
    setValidFrom(new Date().toISOString().split("T")[0]);
    setValidUntil("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Müşteriye Plan İskontousu Ata</DialogTitle>
          <DialogDescription>
            {customerName && `Müşteri: ${customerName}`}
            {selectedPlan && ` | Plan: ${selectedPlan.name}`}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="discount">İskonto Detayları</TabsTrigger>
            <TabsTrigger value="preview">Fiyat Önizlemesi</TabsTrigger>
          </TabsList>

          <TabsContent value="discount" className="space-y-4">
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  İskonto başarıyla uygulandı!
                </AlertDescription>
              </Alert>
            )}

            {!initialCustomerId && (
              <div className="space-y-2">
                <Label>
                  Müşteri <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedCustomerId}
                  onValueChange={setSelectedCustomerId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Müşteri seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}{" "}
                        {customer.email && `(${customer.email})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {!initialPlanId && (
              <div className="space-y-2">
                <Label>
                  Plan <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedPlan?.id || ""}
                  onValueChange={(id) => {
                    const p = plans.find((pl) => pl.id === id);
                    setSelectedPlan(p);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Plan seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} - ₺{p.monthlyPrice}/aylık
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>
                İskonto Tipi <span className="text-red-500">*</span>
              </Label>
              <Select
                value={discountType}
                onValueChange={(value) =>
                  setDiscountType(value as DiscountType)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Yüzde (%)</SelectItem>
                  <SelectItem value="amount">Sabit Tutar (₺)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                İskonto Değeri{" "}
                {discountType === "percentage" && "(0-100)"}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min="0"
                max={discountType === "percentage" ? "100" : undefined}
                value={discountValue}
                onChange={(e) =>
                  setDiscountValue(parseFloat(e.target.value) || 0)
                }
                placeholder={
                  discountType === "percentage" ? "Örn: 10" : "Örn: 500"
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Geçerlilik Başlangıcı{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Geçerlilik Sonu (İsteğe Bağlı)</Label>
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notlar (İsteğe Bağlı)</Label>
              <Input
                placeholder="İskonto nedeni veya açıklaması..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {validUntil && validUntil < validFrom && (
              <Alert className="bg-orange-50 border-orange-200">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  Bitiş tarihi başlangıç tarihinden sonra olmalı
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {!selectedPlan ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Fiyat önizlemesini görmek için plan seçiniz
                </AlertDescription>
              </Alert>
            ) : preview ? (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg space-y-2">
                  <h3 className="font-semibold text-sm">Aylık Fiyat</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Orijinal Fiyat</p>
                      <p className="text-lg font-semibold">
                        ₺{selectedPlan.monthlyPrice}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">İskonto</p>
                      <p className="text-lg font-semibold text-red-600">
                        -₺{preview.monthlyCalc.discountAmount}
                      </p>
                    </div>
                  </div>
                  <div className="border-t pt-2">
                    <p className="text-gray-600 text-sm">Müşteri Ödeyecek</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₺{preview.monthlyCalc.finalPrice}
                    </p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-2">
                  <h3 className="font-semibold text-sm">Yıllık Fiyat</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Orijinal Fiyat</p>
                      <p className="text-lg font-semibold">
                        ₺{selectedPlan.yearlyPrice}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">İskonto</p>
                      <p className="text-lg font-semibold text-red-600">
                        -₺{preview.yearlyCalc.discountAmount}
                      </p>
                    </div>
                  </div>
                  <div className="border-t pt-2">
                    <p className="text-gray-600 text-sm">Müşteri Ödeyecek</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₺{preview.yearlyCalc.finalPrice}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Toplam Yıllık Tasarruf:</strong> ₺
                    {(
                      preview.monthlyCalc.discountAmount * 12 +
                      preview.yearlyCalc.discountAmount
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button
            onClick={handleApplyDiscount}
            disabled={!selectedPlan || discountValue === 0}
          >
            İskontouyu Uygula
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
