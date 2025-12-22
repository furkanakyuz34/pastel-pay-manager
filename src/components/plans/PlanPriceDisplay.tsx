/**
 * Plan Price Display Component
 * Müşteri bazlı plan fiyatlandırması göstermek için
 */

import { useAppSelector } from "@/hooks/redux";
import { Plan } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Tag } from "lucide-react";
import { calculatePlanPrice } from "@/services/discountService";

interface PlanPriceDisplayProps {
  plan: Plan;
  customerId?: string;
  billingCycle?: "monthly" | "yearly";
  onManageDiscount?: () => void;
}

export function PlanPriceDisplay({
  plan,
  customerId,
  billingCycle = "monthly",
  onManageDiscount,
}: PlanPriceDisplayProps) {
  const discounts = useAppSelector((state) => state.discounts.planDiscounts);
  
  // Müşteri için aktif iskontouyu bul
  const customerDiscount = customerId
    ? discounts.find(
        (d) =>
          d.customerId === customerId &&
          d.planId === plan.id &&
          d.isActive
      )
    : null;

  const priceInfo = calculatePlanPrice(plan, billingCycle, customerDiscount || undefined);

  return (
    <div className="space-y-3">
      {/* Fiyat Kartı */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>{billingCycle === "monthly" ? "Aylık Fiyat" : "Yıllık Fiyat"}</span>
            {customerDiscount && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                İskonto Uygulanıyor
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Orijinal Fiyat */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Orijinal Fiyat</span>
            <span className="font-semibold">
              ₺{priceInfo.basePrice.toLocaleString("tr-TR")}
            </span>
          </div>

          {/* İskonto (varsa) */}
          {customerDiscount && priceInfo.discountAmount > 0 && (
            <div className="flex items-center justify-between border-t pt-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-red-600" />
                <span className="text-sm text-gray-600">
                  {priceInfo.discountType === "percentage"
                    ? `İskonto (${priceInfo.discountValue}%)`
                    : "İskonto"}
                </span>
              </div>
              <span className="font-semibold text-red-600">
                -₺{priceInfo.discountAmount.toLocaleString("tr-TR")}
              </span>
            </div>
          )}

          {/* Final Fiyat */}
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-sm font-semibold">Müşteri Ödeyecek</span>
            <span className="text-lg font-bold text-green-600">
              ₺{priceInfo.finalPrice.toLocaleString("tr-TR")}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* İskonto Yönetim Buttonu */}
      {customerId && onManageDiscount && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onManageDiscount}
        >
          <Tag className="h-4 w-4 mr-2" />
          {customerDiscount ? "İskontouyu Değiştir" : "İskonto Ekle"}
        </Button>
      )}

      {/* Uyarı: İskonto uygulanmamışsa */}
      {customerId && !customerDiscount && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-sm">
            Bu müşteri için şu anda iskonto tanımlı değil. İskonto eklemek için yukarıdaki butonu tıklayın.
          </AlertDescription>
        </Alert>
      )}

      {/* İskonto Detayları */}
      {customerDiscount && (
        <Alert className="bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 text-sm">
            <strong>Aktif İskonto:</strong>{" "}
            {customerDiscount.discountType === "percentage"
              ? `%${customerDiscount.discountValue}`
              : `₺${customerDiscount.discountValue}`}
            {customerDiscount.validUntil &&
              ` (${new Date(customerDiscount.validUntil).toLocaleDateString("tr-TR")} kadar)`}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
