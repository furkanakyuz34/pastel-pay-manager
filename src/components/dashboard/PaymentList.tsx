import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, Clock, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaymentFormModal, Payment, PaymentFormData } from "@/components/payments/PaymentFormModal";
import { DeletePaymentDialog } from "@/components/payments/DeletePaymentDialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const initialPayments: Payment[] = [
  {
    id: "PAY-001",
    description: "Enterprise Pro Lisans Ödemesi",
    customer: "ABC Teknoloji A.Ş.",
    amount: "₺24.000",
    status: "completed",
    date: "2024-12-18",
    type: "incoming",
  },
  {
    id: "PAY-002",
    description: "Standard Lisans Yenileme",
    customer: "XYZ Yazılım Ltd.",
    amount: "₺2.500",
    status: "pending",
    date: "2024-12-17",
    type: "incoming",
  },
  {
    id: "PAY-003",
    description: "Professional Lisans",
    customer: "Startup Hub",
    amount: "₺4.500",
    status: "completed",
    date: "2024-12-15",
    type: "incoming",
  },
  {
    id: "PAY-004",
    description: "Paynet Komisyon Kesintisi",
    customer: "Paynet",
    amount: "₺850",
    status: "completed",
    date: "2024-12-14",
    type: "outgoing",
  },
  {
    id: "PAY-005",
    description: "Enterprise Lisans Ödemesi",
    customer: "Mega Corp",
    amount: "₺18.000",
    status: "failed",
    date: "2024-12-10",
    type: "incoming",
  },
];

const statusConfig = {
  completed: { label: "Tamamlandı", variant: "success" as const },
  pending: { label: "Beklemede", variant: "warning" as const },
  failed: { label: "Başarısız", variant: "destructive" as const },
};

interface PaymentListProps {
  showActions?: boolean;
}

export function PaymentList({ showActions = true }: PaymentListProps) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const { toast } = useToast();

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setEditModalOpen(true);
  };

  const handleDelete = (payment: Payment) => {
    setSelectedPayment(payment);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedPayment) {
      setPayments((prev) => prev.filter((p) => p.id !== selectedPayment.id));
      toast({
        title: "Ödeme Silindi",
        description: `${selectedPayment.description} işlemi başarıyla silindi.`,
      });
      setSelectedPayment(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleUpdatePayment = (data: PaymentFormData) => {
    if (selectedPayment) {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === selectedPayment.id
            ? {
                ...p,
                description: data.description,
                customer: data.customer,
                type: data.type,
                status: data.status,
                date: data.date.toISOString().split("T")[0],
                amount: `₺${data.amount}`,
              }
            : p
        )
      );
      setSelectedPayment(null);
    }
  };

  return (
    <>
      <div className="space-y-3 animate-slide-up max-w-full overflow-hidden" style={{ animationDelay: "300ms" }}>
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="group flex items-center gap-3 lg:gap-4 rounded-lg lg:rounded-xl border border-border bg-card p-3 lg:p-4 transition-all duration-200 hover:shadow-md"
          >
            {/* Icon */}
            <div
              className={cn(
                "flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-full shrink-0",
                payment.type === "incoming"
                  ? "bg-success/15 text-success"
                  : "bg-destructive/15 text-destructive"
              )}
            >
              {payment.status === "pending" ? (
                <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
              ) : payment.type === "incoming" ? (
                <ArrowDownRight className="h-4 w-4 lg:h-5 lg:w-5" />
              ) : (
                <ArrowUpRight className="h-4 w-4 lg:h-5 lg:w-5" />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs lg:text-sm text-foreground truncate" title={payment.description}>
                {payment.description}
              </p>
              <p className="text-xs text-muted-foreground truncate" title={payment.customer}>
                {payment.customer}
              </p>
            </div>

            {/* Amount & Status */}
            <div className="text-right shrink-0">
              <p
                className={cn(
                  "text-sm lg:text-base font-semibold",
                  payment.type === "incoming"
                    ? "text-success"
                    : "text-destructive"
                )}
              >
                {payment.type === "incoming" ? "+" : "-"}
                {payment.amount}
              </p>
              <Badge variant={statusConfig[payment.status].variant} className="mt-1 text-xs">
                {statusConfig[payment.status].label}
              </Badge>
            </div>

            {/* Actions */}
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    Görüntüle
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEdit(payment)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Düzenle
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => handleDelete(payment)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Sil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <PaymentFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        payment={selectedPayment}
        onSubmit={handleUpdatePayment}
      />

      {/* Delete Dialog */}
      <DeletePaymentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        paymentDescription={selectedPayment?.description || ""}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
