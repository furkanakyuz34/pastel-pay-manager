import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { UsageTracker } from "@/components/usage/UsageTracker";
import { Button } from "@/components/ui/button";
import { Filter, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockSubscriptions = [
  { id: "SUB-001", name: "ABC Teknoloji - Premium Plan" },
  { id: "SUB-002", name: "XYZ Yazılım - Standard Plan" },
  { id: "SUB-003", name: "Demo Şirketi - Starter Plan" },
];

const UsagePage = () => {
  const [selectedSubscription, setSelectedSubscription] = useState("SUB-001");

  const handleRefresh = () => {
    // Refresh usage data
    console.log("Refreshing usage data...");
  };

  return (
    <MainLayout>
      <Header 
        title="Kullanım Takibi" 
        subtitle="Abonelikler için kullanım metriklerini ve limitlerini izleyin" 
      />

      <div className="p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-80">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Abonelik Seçin
            </label>
            <Select value={selectedSubscription} onValueChange={setSelectedSubscription}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Abonelik seçin" />
              </SelectTrigger>
              <SelectContent>
                {mockSubscriptions.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrele
            </Button>
          </div>
        </div>

        {/* Usage Tracker */}
        <UsageTracker 
          subscriptionId={selectedSubscription}
          onMetricClick={(metric) => {
            console.log("Clicked metric:", metric);
          }}
        />

        {/* Additional Info Card */}
        <div className="rounded-lg border border-border bg-card p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Kullanım Hakkında</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-foreground mb-2">Limitleri Aşma</h4>
              <p className="text-sm text-muted-foreground">
                Herhangi bir limiti aşarsanız, hizmetiniz otomatik olarak durdurulabilir veya 
                ek ücret talep edilebilir. Lütfen limitleri düzenli olarak kontrol edin.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Plana Yükseltme</h4>
              <p className="text-sm text-muted-foreground">
                Mevcut planınız yetersiz geliyorsa, daha yüksek bir plana yükseltebilir veya 
                ek kaynaklar satın alabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UsagePage;
