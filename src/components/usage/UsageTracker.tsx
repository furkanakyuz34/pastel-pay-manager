import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface UsageMetric {
  id: string;
  name: string;
  current: number;
  limit: number;
  unit: string;
  status: "ok" | "warning" | "critical";
  resetDate?: string;
}

export interface SubscriptionUsage {
  customerId: string;
  customerName: string;
  subscriptionId: string;
  planName: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  metrics: UsageMetric[];
  lastUpdated: string;
}

const mockUsageData: SubscriptionUsage = {
  customerId: "CUS-001",
  customerName: "ABC Teknoloji A.Ş.",
  subscriptionId: "SUB-001",
  planName: "Premium Plan",
  billingPeriodStart: "2024-12-01",
  billingPeriodEnd: "2024-12-31",
  metrics: [
    {
      id: "api-calls",
      name: "API Çağrıları",
      current: 45000,
      limit: 100000,
      unit: "çağrı/ay",
      status: "ok",
    },
    {
      id: "storage",
      name: "Depolama Alanı",
      current: 850,
      limit: 1000,
      unit: "GB",
      status: "warning",
    },
    {
      id: "users",
      name: "Aktif Kullanıcılar",
      current: 95,
      limit: 100,
      unit: "kullanıcı",
      status: "critical",
    },
    {
      id: "bandwidth",
      name: "Bant Genişliği",
      current: 2.4,
      limit: 5,
      unit: "TB/ay",
      status: "ok",
    },
  ],
  lastUpdated: new Date().toISOString(),
};

interface UsageTrackerProps {
  subscriptionId?: string;
  data?: SubscriptionUsage;
  onMetricClick?: (metric: UsageMetric) => void;
}

export function UsageTracker({
  subscriptionId,
  data = mockUsageData,
  onMetricClick,
}: UsageTrackerProps) {
  const [usage, setUsage] = useState<SubscriptionUsage>(data);

  const getPercentage = (metric: UsageMetric): number => {
    return (metric.current / metric.limit) * 100;
  };

  const getProgressColor = (status: string): string => {
    switch (status) {
      case "ok":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ok":
        return <Badge variant="success">Normalin Altında</Badge>;
      case "warning":
        return <Badge variant="warning">Uyarı</Badge>;
      case "critical":
        return <Badge variant="destructive">Kritik</Badge>;
      default:
        return <Badge variant="outline">Bilinmeyen</Badge>;
    }
  };

  const hasWarnings = usage.metrics.some((m) => m.status !== "ok");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{usage.planName}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Dönem: {new Date(usage.billingPeriodStart).toLocaleDateString("tr-TR")} -{" "}
              {new Date(usage.billingPeriodEnd).toLocaleDateString("tr-TR")}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Son güncelleme: {new Date(usage.lastUpdated).toLocaleTimeString("tr-TR")}
          </p>
        </div>
      </div>

      {/* Warning Alert */}
      {hasWarnings && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            Bazı kullanım limitlerininiz uyarı veya kritik seviyeye ulaşmıştır. Lütfen kontrol edin.
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {usage.metrics.map((metric) => {
          const percentage = getPercentage(metric);
          return (
            <Card
              key={metric.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onMetricClick?.(metric)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">{metric.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {metric.current} / {metric.limit} {metric.unit}
                    </CardDescription>
                  </div>
                  {getStatusBadge(metric.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress value={Math.min(percentage, 100)} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {percentage.toFixed(0)}% kullanıldı
                  </span>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed View */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detaylı Kullanım Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usage.metrics.map((metric) => {
              const percentage = getPercentage(metric);
              return (
                <div key={metric.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-foreground">{metric.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {metric.current.toLocaleString("tr-TR")} / {metric.limit.toLocaleString("tr-TR")} {metric.unit}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(metric.status)} transition-all duration-300`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  {metric.resetDate && (
                    <p className="text-xs text-muted-foreground">
                      Sıfırlama tarihi: {new Date(metric.resetDate).toLocaleDateString("tr-TR")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Alert className="border-blue-500/50 bg-blue-500/10">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <strong>İpucu:</strong> Limitlere yaklaştığınızda plana yükseltme yapabilir veya ek kaynaklar satın alabilirsiniz.
        </AlertDescription>
      </Alert>
    </div>
  );
}
