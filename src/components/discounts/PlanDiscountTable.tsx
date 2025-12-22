import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { deletePlanDiscount, setSelectedDiscount } from "@/features/discountSlice";
import { formatDiscountDescription, isDiscountValid } from "@/services/discountService";
import { PlanDiscount } from "@/types";
import { useState } from "react";
import { Trash2, Edit2, Eye } from "lucide-react";

interface PlanDiscountTableProps {
  onEdit?: (discount: PlanDiscount) => void;
}

export function PlanDiscountTable({ onEdit }: PlanDiscountTableProps) {
  const dispatch = useAppDispatch();
  const discounts = useAppSelector((state) => state.discounts.planDiscounts);
  const plans = useAppSelector((state) => state.plans.plans);
  const customers = useAppSelector((state) => state.customers.customers);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getPlanName = (planId: string) => {
    return plans.find((p) => p.id === planId)?.name || planId;
  };

  const getCustomerName = (customerId: string) => {
    return customers.find((c) => c.id === customerId)?.name || customerId;
  };

  const handleDelete = () => {
    if (deleteId) {
      dispatch(deletePlanDiscount(deleteId));
      setDeleteId(null);
    }
  };

  if (discounts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Henüz plan iskontousu tanımlanmamış
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Müşteri</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>İskonto</TableHead>
              <TableHead>Geçerlilik</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discounts.map((discount) => {
              const isValid = isDiscountValid(discount);
              const description = formatDiscountDescription(discount);

              return (
                <TableRow key={discount.id}>
                  <TableCell>
                    <span className="font-medium">
                      {getCustomerName(discount.customerId)}
                    </span>
                  </TableCell>
                  <TableCell>{getPlanName(discount.planId)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{description}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    <div>
                      {discount.validFrom && (
                        <>
                          {new Date(discount.validFrom).toLocaleDateString("tr-TR")}
                        </>
                      )}
                      {discount.validUntil && (
                        <>
                          {" - "}
                          {new Date(discount.validUntil).toLocaleDateString("tr-TR")}
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        isValid && discount.isActive
                          ? "default"
                          : "secondary"
                      }
                      className={
                        isValid && discount.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {isValid && discount.isActive ? "Aktif" : "İnaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        dispatch(setSelectedDiscount(discount));
                        onEdit?.(discount);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteId(discount.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

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
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Sil
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
