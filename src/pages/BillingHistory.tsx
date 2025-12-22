import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { BillingHistory } from "@/components/billing/BillingHistory";
import { Button } from "@/components/ui/button";
import { Filter, Download, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockCustomers = [
  { id: "ALL", name: "Tüm Müşteriler" },
  { id: "CUS-001", name: "ABC Teknoloji A.Ş." },
  { id: "CUS-002", name: "XYZ Yazılım Ltd." },
  { id: "CUS-003", name: "Demo Şirketi" },
  { id: "CUS-004", name: "Mega Corp" },
  { id: "CUS-005", name: "Startup Hub" },
];

const BillingHistoryPage = () => {
  const [selectedCustomer, setSelectedCustomer] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const handleDownloadInvoice = (record: any) => {
    console.log("Downloading invoice:", record.invoiceNumber);
  };

  const handleExportCSV = () => {
    console.log("Exporting to CSV...");
  };

  return (
    <MainLayout>
      <Header 
        title="Ödeme Geçmişi" 
        subtitle="Tüm ödemeleri ve fatura geçmişini inceleyin" 
      />

      <div className="p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-1">
            <div className="w-full sm:w-80">
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Müşteri seçin" />
                </SelectTrigger>
                <SelectContent>
                  {mockCustomers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Fatura no, açıklama ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrele
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              CSV İndir
            </Button>
          </div>
        </div>

        {/* Billing History Component */}
        <BillingHistory 
          customerId={selectedCustomer === "ALL" ? undefined : selectedCustomer}
          onDownloadInvoice={handleDownloadInvoice}
        />

        {/* Info Card */}
        <div className="rounded-lg border border-border bg-card p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Ödeme Geçmişi Hakkında</h3>
          <p className="text-sm text-muted-foreground">
            Burada tüm ödeme işlemleriniz, faturalarınız ve ödeme durum bilgileriniz yer almaktadır. 
            Her faturayı detaylı olarak görüntüleyebilir, PDF olarak indirebilir veya CSV formatında 
            dışa aktarabilirsiniz.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default BillingHistoryPage;
