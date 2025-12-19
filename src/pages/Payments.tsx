import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { PaymentList } from "@/components/dashboard/PaymentList";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Download, 
  Filter, 
  CreditCard, 
  TrendingUp, 
  Clock, 
  AlertCircle 
} from "lucide-react";

const PaymentsPage = () => {
  return (
    <MainLayout>
      <Header title="Ödemeler" subtitle="Paynet ödeme işlemlerini takip edin" />
      
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Toplam Gelir"
            value="₺284.500"
            change="Bu ay"
            changeType="neutral"
            icon={<TrendingUp className="h-6 w-6" />}
            delay={0}
          />
          <StatCard
            title="Bekleyen"
            value="₺12.800"
            change="3 işlem"
            changeType="neutral"
            icon={<Clock className="h-6 w-6" />}
            delay={100}
          />
          <StatCard
            title="Başarılı İşlem"
            value="156"
            change="+24 bu hafta"
            changeType="positive"
            icon={<CreditCard className="h-6 w-6" />}
            delay={200}
          />
          <StatCard
            title="Başarısız"
            value="3"
            change="Son 30 gün"
            changeType="negative"
            icon={<AlertCircle className="h-6 w-6" />}
            delay={300}
          />
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-foreground">Ödeme Geçmişi</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrele
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Rapor İndir
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Manuel Ödeme
            </Button>
          </div>
        </div>

        {/* Payment List */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <PaymentList />
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentsPage;
