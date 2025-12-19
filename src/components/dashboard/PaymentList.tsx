import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Payment {
  id: string;
  description: string;
  customer: string;
  amount: string;
  status: "completed" | "pending" | "failed";
  date: string;
  type: "incoming" | "outgoing";
}

const payments: Payment[] = [
  {
    id: "PAY-001",
    description: "Enterprise Pro Lisans Ödemesi",
    customer: "ABC Teknoloji A.Ş.",
    amount: "₺24.000",
    status: "completed",
    date: "2024-12-18",
    type: "incoming",
  },
  {
    id: "PAY-002",
    description: "Standard Lisans Yenileme",
    customer: "XYZ Yazılım Ltd.",
    amount: "₺2.500",
    status: "pending",
    date: "2024-12-17",
    type: "incoming",
  },
  {
    id: "PAY-003",
    description: "Professional Lisans",
    customer: "Startup Hub",
    amount: "₺4.500",
    status: "completed",
    date: "2024-12-15",
    type: "incoming",
  },
  {
    id: "PAY-004",
    description: "Paynet Komisyon Kesintisi",
    customer: "Paynet",
    amount: "₺850",
    status: "completed",
    date: "2024-12-14",
    type: "outgoing",
  },
  {
    id: "PAY-005",
    description: "Enterprise Lisans Ödemesi",
    customer: "Mega Corp",
    amount: "₺18.000",
    status: "failed",
    date: "2024-12-10",
    type: "incoming",
  },
];

const statusConfig = {
  completed: { label: "Tamamlandı", variant: "success" as const },
  pending: { label: "Beklemede", variant: "warning" as const },
  failed: { label: "Başarısız", variant: "destructive" as const },
};

export function PaymentList() {
  return (
    <div className="space-y-3 animate-slide-up" style={{ animationDelay: "300ms" }}>
      {payments.map((payment) => (
        <div
          key={payment.id}
          className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-card-hover"
        >
          {/* Icon */}
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              payment.type === "incoming"
                ? "bg-success/15 text-success"
                : "bg-destructive/15 text-destructive"
            )}
          >
            {payment.status === "pending" ? (
              <Clock className="h-5 w-5" />
            ) : payment.type === "incoming" ? (
              <ArrowDownRight className="h-5 w-5" />
            ) : (
              <ArrowUpRight className="h-5 w-5" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {payment.description}
            </p>
            <p className="text-sm text-muted-foreground">{payment.customer}</p>
          </div>

          {/* Amount & Status */}
          <div className="text-right">
            <p
              className={cn(
                "font-semibold",
                payment.type === "incoming"
                  ? "text-success"
                  : "text-destructive"
              )}
            >
              {payment.type === "incoming" ? "+" : "-"}
              {payment.amount}
            </p>
            <Badge variant={statusConfig[payment.status].variant} className="mt-1">
              {statusConfig[payment.status].label}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
