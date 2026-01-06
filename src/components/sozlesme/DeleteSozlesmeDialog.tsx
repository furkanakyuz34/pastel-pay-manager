import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteSozlesmeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  sozlesmeId?: number;
}

export function DeleteSozlesmeDialog({
  open,
  onOpenChange,
  onConfirm,
  sozlesmeId,
}: DeleteSozlesmeDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sözleşmeyi Sil</AlertDialogTitle>
          <AlertDialogDescription>
            {sozlesmeId} numaralı sözleşmeyi silmek istediğinizden emin misiniz?
            Bu işlem geri alınamaz ve sözleşmeye bağlı tüm modüller de silinecektir.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Sil
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
