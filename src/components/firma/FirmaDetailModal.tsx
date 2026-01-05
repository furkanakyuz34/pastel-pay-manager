import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FirmaDto } from "@/types/backend";

interface FirmaDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  firma: FirmaDto | null;
}

export function FirmaDetailModal({
  open,
  onOpenChange,
  firma,
}: FirmaDetailModalProps) {
  if (!firma) return null;

  const DetailRow = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="py-2 border-b border-border last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground mt-1">
        {value || "-"}
      </dd>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Firma Detayları</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Temel Bilgiler */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Temel Bilgiler</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <DetailRow label="Firma ID" value={`#${firma.firmaId}`} />
              <DetailRow label="Firma Adı" value={firma.adi} />
              <DetailRow label="Yetkili Adı" value={firma.yetkiliAdi} />
              <DetailRow label="E-posta" value={firma.email} />
              <DetailRow label="Telefon 1" value={firma.telefon1} />
              <DetailRow label="Telefon 2" value={firma.telefon2} />
              <DetailRow label="Fax" value={firma.fax} />
            </dl>
          </div>

          {/* Adres Bilgileri */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Adres Bilgileri</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <DetailRow label="Adres 1" value={firma.adres1} />
              <DetailRow label="Adres 2" value={firma.adres2} />
              <DetailRow label="Adres 3" value={firma.adres3} />
              <DetailRow label="Semt" value={firma.semt} />
              <DetailRow label="Şehir" value={firma.sehir} />
            </dl>
          </div>

          {/* Vergi Bilgileri */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Vergi Bilgileri</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <DetailRow label="Vergi Dairesi" value={firma.vergiDairesi} />
              <DetailRow label="Vergi Hesap No" value={firma.vergiHesapNo} />
            </dl>
          </div>

          {/* Notlar */}
          {firma.notu && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Notlar</h3>
              <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg">
                {firma.notu}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
