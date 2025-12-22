/**
 * Plan Details Modal
 * Plana müşteri-spesifik iskontolar göstermek ve yönetmek için
 */

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PlanDiscountModal } from "@/components/discounts/PlanDiscountModal";
import { PlanPriceDisplay } from "./PlanPriceDisplay";
import { deletePlanDiscount } from "@/features/discountSlice";
import { Plan } from "@/types";
import { Tag, Trash2, Edit2, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PlanDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan | null;
}

export function PlanDetailsModal({ open, onOpenChange, plan }: PlanDetailsModalProps) {
  const dispatch = useAppDispatch();
  const discounts = useAppSelector((state) => state.discounts.planDiscounts);
  const customers = useAppSelector((state) => state.customers.customers);
  
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!plan) return null;

  // Bu plan için tüm müşteri iskontolarını bul
  const planDiscounts = discounts.filter((d) => d.planId === plan.id);

  const getCustomerName = (customerId: string) => {
    return customers.find((c) => c.id === customerId)?.name || customerId;
  };

  const handleDeleteDiscount = () => {
    if (deleteId) {
      dispatch(deletePlanDiscount(deleteId));
      setDeleteId(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{plan.name}</DialogTitle>
            <DialogDescription>
              {plan.description && <p>{plan.description}</p>}
              <div className="mt-2 flex gap-2">
                <Badge variant="outline">
                  ₺{plan.monthlyPrice}/aylık
                </Badge>
                <Badge variant="outline">
                  ₺{plan.yearlyPrice}/yıllık
                </Badge>
              </div>
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Plan Özeti</TabsTrigger>
              <TabsTrigger value="discounts">
                Müşteri İskontouları ({planDiscounts.length})
              </TabsTrigger>
            </TabsList>

            {/* Plan Özeti */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Aylık Fiyat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">₺{plan.monthlyPrice}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Yıllık Fiyat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">₺{plan.yearlyPrice}</p>
                  </CardContent>
                </Card>
              </div>

              {plan.productNames && plan.productNames.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Ürünler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {plan.productNames.map((name) => (
                        <Badge key={name} variant="secondary">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {plan.featuresList && plan.featuresList.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Özellikler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.featuresList.map((feature, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Müşteri İskontouları */}
            <TabsContent value="discounts" className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {planDiscounts.length === 0
                    ? "Bu plan için henüz iskonto tanımlanmamış"
                    : `${planDiscounts.length} müşteri için iskonto tanımlı`}
                </p>
                <Button
                  size="sm"
                  onClick={() => setDiscountModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Tag className="h-4 w-4" />
                  İskonto Ekle
                </Button>
              </div>

              {planDiscounts.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Bu plan için henüz iskonto tanımlanmamış. Müşteriye özel iskonto eklemek için yukarıdaki butonu tıklayın.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {planDiscounts.map((discount) => (
                    <Card key={discount.id} className="border-border">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">
                              {getCustomerName(discount.customerId)}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary">
                                {discount.discountType === "percentage"
                                  ? `%${discount.discountValue}`
                                  : `₺${discount.discountValue}`}
                              </Badge>
                              {discount.validUntil && (
                                <span className="text-xs text-gray-500">
                                  {new Date(discount.validUntil).toLocaleDateString(
                                    "tr-TR"
                                  )}{" "}
                                  kadar
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteId(discount.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* İskonto Modal */}
      <PlanDiscountModal
        open={discountModalOpen}
        onOpenChange={setDiscountModalOpen}
        planId={plan.id}
        plan={plan}
      />

      {/* Silme Onayı */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>İskontouyu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. İskonto silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteDiscount}
            className="bg-red-600 hover:bg-red-700"
          >
            Sil
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
