import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  DollarSign,
  Download,
  Eye
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface BillingHistoryRecord {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  subscriptionId: string;
  planName: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed" | "refunded";
  billingDate: string;
  paidAt?: string;
  paymentMethod?: string;
  transactionId?: string;
  description?: string;
}

const mockBillingHistory: BillingHistoryRecord[] = [
  {
    id: "BH-001",
    invoiceNumber: "2024-00001",
    customerId: "CUS-001",
    customerName: "ABC Teknoloji A.Ş.",
    subscriptionId: "SUB-001",
    planName: "Premium Plan - Yıllık",
    amount: 24000,
    currency: "TRY",
    status: "paid",
    billingDate: "2024-12-01",
    paidAt: "2024-12-01",
    paymentMethod: "credit_card",
    transactionId: "TXN-2024-001",
    description: "Premium Plan yıllık abonelik ödemesi",
  },
  {
    id: "BH-002",
    invoiceNumber: "2024-00002",
    customerId: "CUS-001",
    customerName: "ABC Teknoloji A.Ş.",
    subscriptionId: "SUB-001",
    planName: "Premium Plan - Aylık Ek",
    amount: 2500,
    currency: "TRY",
    status: "paid",
    billingDate: "2024-11-15",
    paidAt: "2024-11-15",
    paymentMethod: "credit_card",
    transactionId: "TXN-2024-002",
    description: "API çağrıları ek ödeme",
  },
  {
    id: "BH-003",
    invoiceNumber: "2024-00003",
    customerId: "CUS-002",
    customerName: "XYZ Yazılım Ltd.",
    subscriptionId: "SUB-002",
    planName: "Standard Plan - Aylık",
    amount: 1500,
    currency: "TRY",
    status: "pending",
    billingDate: "2024-12-10",
    paymentMethod: "bank_transfer",
    description: "Standard Plan aylık abonelik",
  },
  {
    id: "BH-004",
    invoiceNumber: "2024-00004",
    customerId: "CUS-001",
    customerName: "ABC Teknoloji A.Ş.",
    subscriptionId: "SUB-001",
    planName: "Premium Plan - Geri Ödeme",
    amount: -500,
    currency: "TRY",
    status: "refunded",
    billingDate: "2024-10-20",
    paidAt: "2024-10-22",
    paymentMethod: "credit_card",
    transactionId: "REF-2024-001",
    description: "İptal edilen hizmetler için geri ödeme",
  },
];

const statusConfig = {
  paid: { 
    label: "Ödendi", 
    variant: "success" as const, 
    icon: <CheckCircle className="h-4 w-4" /> 
  },
  pending: { 
    label: "Beklemede", 
    variant: "warning" as const, 
    icon: <Clock className="h-4 w-4" /> 
  },
  failed: { 
    label: "Başarısız", 
    variant: "destructive" as const, 
    icon: <AlertCircle className="h-4 w-4" /> 
  },
  refunded: { 
    label: "İade Edildi", 
    variant: "secondary" as const, 
    icon: <DollarSign className="h-4 w-4" /> 
  },
};

interface BillingHistoryProps {
  records?: BillingHistoryRecord[];
  customerId?: string;
  subscriptionId?: string;
  onDownloadInvoice?: (record: BillingHistoryRecord) => void;
}

export function BillingHistory({
  records = mockBillingHistory,
  customerId,
  subscriptionId,
  onDownloadInvoice,
}: BillingHistoryProps) {
  const [selectedRecord, setSelectedRecord] = useState<BillingHistoryRecord | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const filteredRecords = records.filter((record) => {
    if (customerId && record.customerId !== customerId) return false;
    if (subscriptionId && record.subscriptionId !== subscriptionId) return false;
    return true;
  });

  const totalAmount = filteredRecords.reduce((sum, r) => sum + r.amount, 0);
  const paidAmount = filteredRecords
    .filter((r) => r.status === "paid" || r.status === "refunded")
    .reduce((sum, r) => sum + r.amount, 0);
  const pendingAmount = filteredRecords
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + r.amount, 0);

  const handleViewDetails = (record: BillingHistoryRecord) => {
    setSelectedRecord(record);
    setDetailModalOpen(true);
  };

  const handleDownload = (record: BillingHistoryRecord) => {
    onDownloadInvoice?.(record);
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Tutar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalAmount.toLocaleString("tr-TR", {
                style: "currency",
                currency: "TRY",
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredRecords.length} işlem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ödenmiş Tutar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {paidAmount.toLocaleString("tr-TR", {
                style: "currency",
                currency: "TRY",
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredRecords.filter((r) => r.status === "paid").length} ödeme
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bekleyen Tutar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingAmount.toLocaleString("tr-TR", {
                style: "currency",
                currency: "TRY",
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredRecords.filter((r) => r.status === "pending").length} bekleyen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ödeme Geçmişi</CardTitle>
          <CardDescription>
            Son ödeme işlemleriniz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Fatura No
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Açıklama
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Tarih
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                    Tutar
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Durum
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      Ödeme geçmişi bulunmamaktadır.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => {
                    const config = statusConfig[record.status];
                    return (
                      <tr key={record.id} className="hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-medium text-foreground">
                          {record.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          <div>
                            <p className="font-medium text-foreground text-xs">
                              {record.planName}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {record.description}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(record.billingDate).toLocaleDateString("tr-TR")}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">
                          <span
                            className={
                              record.amount < 0 ? "text-red-600" : "text-foreground"
                            }
                          >
                            {record.amount < 0 ? "-" : "+"}
                            {Math.abs(record.amount).toLocaleString("tr-TR", {
                              style: "currency",
                              currency: "TRY",
                            })}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {config.icon}
                            <Badge variant={config.variant}>{config.label}</Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(record)}
                              title="Detayları Görüntüle"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(record)}
                              title="PDF İndir"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedRecord && (
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
          <DialogContent className="w-[95vw] max-w-[500px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Fatura Detayları - {selectedRecord.invoiceNumber}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="space-y-3 pb-4 border-b border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Müşteri:</span>
                  <span className="font-medium text-foreground">
                    {selectedRecord.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-medium text-foreground">
                    {selectedRecord.planName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tarih:</span>
                  <span className="font-medium text-foreground">
                    {new Date(selectedRecord.billingDate).toLocaleDateString("tr-TR")}
                  </span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-3 pb-4 border-b border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tutar:</span>
                  <span className="text-xl font-bold text-foreground">
                    {Math.abs(selectedRecord.amount).toLocaleString("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Durum:</span>
                  <Badge variant={statusConfig[selectedRecord.status].variant}>
                    {statusConfig[selectedRecord.status].label}
                  </Badge>
                </div>
                {selectedRecord.paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ödeme Yöntemi:</span>
                    <span className="font-medium text-foreground">
                      {selectedRecord.paymentMethod === "credit_card"
                        ? "Kredi Kartı"
                        : selectedRecord.paymentMethod === "bank_transfer"
                        ? "Banka Transferi"
                        : selectedRecord.paymentMethod}
                    </span>
                  </div>
                )}
                {selectedRecord.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">İşlem ID:</span>
                    <span className="font-mono text-sm text-muted-foreground">
                      {selectedRecord.transactionId}
                    </span>
                  </div>
                )}
                {selectedRecord.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ödeme Tarihi:</span>
                    <span className="font-medium text-foreground">
                      {new Date(selectedRecord.paidAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedRecord.description && (
                <div className="space-y-2 pb-4 border-b border-border">
                  <span className="text-muted-foreground text-sm">Açıklama:</span>
                  <p className="text-sm text-foreground">{selectedRecord.description}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDetailModalOpen(false)}
                >
                  Kapat
                </Button>
                <Button onClick={() => handleDownload(selectedRecord)}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF İndir
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
