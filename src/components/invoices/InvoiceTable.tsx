import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Trash2, FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InvoiceFormModal } from "./InvoiceFormModal";
import { useToast } from "@/hooks/use-toast";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  subscriptionId?: string;
  items: Array<any>;
  subtotal: number;
  discountTotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  notes?: string;
}

const initialInvoices: Invoice[] = [
  {
    id: "INV-001",
    invoiceNumber: "2024-00001",
    customerId: "CUS-001",
    customerName: "ABC Teknoloji A.Ş.",
    issueDate: "2024-12-01",
    dueDate: "2024-12-15",
    status: "paid",
    items: [],
    subtotal: 5000,
    discountTotal: 0,
    taxRate: 18,
    taxAmount: 900,
    total: 5900,
    paidAt: "2024-12-10",
  },
  {
    id: "INV-002",
    invoiceNumber: "2024-00002",
    customerId: "CUS-002",
    customerName: "XYZ Yazılım Ltd.",
    issueDate: "2024-12-05",
    dueDate: "2024-12-20",
    status: "sent",
    items: [],
    subtotal: 2500,
    discountTotal: 0,
    taxRate: 18,
    taxAmount: 450,
    total: 2950,
  },
];

const statusConfig = {
  draft: { label: "Taslak", variant: "secondary" as const },
  sent: { label: "Gönderildi", variant: "pending" as const },
  paid: { label: "Ödendi", variant: "success" as const },
  overdue: { label: "Vadesi Geçti", variant: "destructive" as const },
  cancelled: { label: "İptal", variant: "secondary" as const },
};

interface InvoiceTableProps {
  invoices?: Invoice[];
  onAddClick?: () => void;
  onView?: (invoice: Invoice) => void;
  onEdit?: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
}

export function InvoiceTable({
  invoices = initialInvoices,
  onAddClick,
  onView,
  onEdit,
  onDelete,
}: InvoiceTableProps) {
  const [localInvoices, setLocalInvoices] = useState<Invoice[]>(invoices);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    onView?.(invoice);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setEditModalOpen(true);
  };

  const handleDelete = (invoice: Invoice) => {
    setLocalInvoices((prev) => prev.filter((i) => i.id !== invoice.id));
    toast({
      title: "Fatura Silindi",
      description: `${invoice.invoiceNumber} numaralı fatura silindi.`,
    });
    onDelete?.(invoice);
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    toast({
      title: "İndir",
      description: `${invoice.invoiceNumber} PDF olarak indirildi.`,
    });
  };

  return (
    <>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {localInvoices.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-12 w-12" />}
            title="Fatura Bulunmadı"
            description="Henüz fatura oluşturulmadı. Yeni bir fatura eklemek için butona tıklayın."
            action={onAddClick ? <Button onClick={onAddClick}>Yeni Fatura Oluştur</Button> : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Fatura No
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Müşteri
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Tarih
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                    Tutar
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Durum
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {localInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {invoice.customerName}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(invoice.issueDate).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground text-right">
                      ₺{invoice.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={statusConfig[invoice.status].variant}>
                        {statusConfig[invoice.status].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(invoice)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Görüntüle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(invoice)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
                            <FileText className="h-4 w-4 mr-2" />
                            PDF İndir
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(invoice)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedInvoice && (
        <InvoiceFormModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          invoice={selectedInvoice}
          customers={[]}
          subscriptions={[]}
          products={[]}
          onSubmit={(data) => {
            toast({
              title: "Fatura Güncellendi",
              description: "Fatura başarıyla güncellendi.",
            });
            setEditModalOpen(false);
          }}
        />
      )}
    </>
  );
}
