import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  total: number;
}

interface DeleteInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  onConfirm: () => void;
}

export function DeleteInvoiceDialog({
  open,
  onOpenChange,
  invoice,
  onConfirm,
}: DeleteInvoiceDialogProps) {
  if (!invoice) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">
            Faturayı Sil
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            <div className="space-y-2">
              <p>
                <strong>{invoice.invoiceNumber}</strong> numaralı faturayı silmek istediğinizden emin misiniz?
              </p>
              <p className="text-sm">
                Müşteri: <strong>{invoice.customerName}</strong>
              </p>
              <p className="text-sm">
                Tutar: <strong>₺{invoice.total.toFixed(2)}</strong>
              </p>
              <p className="text-xs pt-2 text-red-600 dark:text-red-400">
                Bu işlem geri alınamaz.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end gap-3">
          <AlertDialogCancel className="border-border bg-background">
            İptal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Sil
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
