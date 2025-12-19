import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { LicenseTable } from "@/components/dashboard/LicenseTable";
import { PaymentList } from "@/components/dashboard/PaymentList";
import { Button } from "@/components/ui/button";
import { KeyRound, CreditCard, TrendingUp, Users, Plus, Download } from "lucide-react";

const Index = () => {
  return (
    <MainLayout>
      <Header title="Dashboard" subtitle="Lisans ve ödeme işlemlerinizi takip edin" />
      
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Aktif Lisanslar"
            value="128"
            change="+12 bu ay"
            changeType="positive"
            icon={<KeyRound className="h-6 w-6" />}
            delay={0}
          />
          <StatCard
            title="Toplam Gelir"
            value="₺284.500"
            change="+18.2% geçen aya göre"
            changeType="positive"
            icon={<TrendingUp className="h-6 w-6" />}
            delay={100}
          />
          <StatCard
            title="Bekleyen Ödemeler"
            value="₺12.800"
            change="3 işlem bekliyor"
            changeType="neutral"
            icon={<CreditCard className="h-6 w-6" />}
            delay={200}
          />
          <StatCard
            title="Toplam Müşteri"
            value="84"
            change="+5 yeni müşteri"
            changeType="positive"
            icon={<Users className="h-6 w-6" />}
            delay={300}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Licenses Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Son Lisanslar</h2>
                <p className="text-sm text-muted-foreground">Tüm lisanslarınızı yönetin</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Dışa Aktar
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Lisans
                </Button>
              </div>
            </div>
            <LicenseTable />
          </div>

          {/* Payments Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Son Ödemeler</h2>
                <p className="text-sm text-muted-foreground">Paynet işlemleri</p>
              </div>
              <Button variant="ghost" size="sm" className="text-primary">
                Tümünü Gör
              </Button>
            </div>
            <PaymentList />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
