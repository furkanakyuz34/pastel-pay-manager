import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { InvoiceFormModal, InvoiceFormData } from "@/components/invoices/InvoiceFormModal";
import { DeleteInvoiceDialog } from "@/components/invoices/DeleteInvoiceDialog";
import { Button } from "@/components/ui/button";
import { Plus, Download, Filter, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockCustomers = [
  { id: "CUS-001", name: "ABC Teknoloji A.Ş." },
  { id: "CUS-002", name: "XYZ Yazılım Ltd." },
];

const mockSubscriptions = [
  { id: "SUB-001", planName: "Premium Plan", amount: "₺2.000" },
  { id: "SUB-002", planName: "Standard Plan", amount: "₺1.000" },
];

const mockProducts = [
  { id: "PRD-001", name: "Premium Paket", price: "₺5.000" },
  { id: "PRD-002", name: "Standart Paket", price: "₺2.500" },
  { id: "PRD-003", name: "Mobil Uygulama Lisansı", price: "₺3.000" },
];

const InvoicesPage = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const { toast } = useToast();

  const handleAddInvoice = (data: InvoiceFormData) => {
    console.log("New invoice:", data);
    toast({
      title: "Fatura Oluşturuldu",
      description: "Fatura başarıyla oluşturuldu.",
    });
    setAddModalOpen(false);
  };

  const handleDeleteInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedInvoice) {
      toast({
        title: "Fatura Silindi",
        description: `${selectedInvoice.invoiceNumber} faturası silindi.`,
      });
      setDeleteDialogOpen(false);
      setSelectedInvoice(null);
    }
  };

  return (
    <MainLayout>
      <Header 
        title="Faturalar" 
        subtitle="Müşteri faturalarını oluşturun ve yönetin" 
      />

      <div className="p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Fatura ara..."
              className="h-10 w-full sm:w-80 rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrele
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
            <Button size="sm" onClick={() => setAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Fatura
            </Button>
          </div>
        </div>

        {/* Invoice Table */}
        <InvoiceTable 
          onAddClick={() => setAddModalOpen(true)}
          onDelete={handleDeleteInvoice}
        />
      </div>

      {/* Add Invoice Modal */}
      <InvoiceFormModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        customers={mockCustomers}
        subscriptions={mockSubscriptions}
        products={mockProducts}
        onSubmit={handleAddInvoice}
      />

      {/* Delete Dialog */}
      <DeleteInvoiceDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        invoice={selectedInvoice}
        onConfirm={handleConfirmDelete}
      />
    </MainLayout>
  );
};

export default InvoicesPage;
