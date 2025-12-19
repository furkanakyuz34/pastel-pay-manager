import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface License {
  id: string;
  name: string;
  customer: string;
  type: string;
  status: "active" | "expired" | "pending";
  expiryDate: string;
  amount: string;
}

const licenses: License[] = [
  {
    id: "LIC-001",
    name: "Enterprise Pro",
    customer: "ABC Teknoloji A.Ş.",
    type: "Yıllık",
    status: "active",
    expiryDate: "2025-12-31",
    amount: "₺24.000",
  },
  {
    id: "LIC-002",
    name: "Standard",
    customer: "XYZ Yazılım Ltd.",
    type: "Aylık",
    status: "active",
    expiryDate: "2025-01-15",
    amount: "₺2.500",
  },
  {
    id: "LIC-003",
    name: "Starter",
    customer: "Demo Şirketi",
    type: "Deneme",
    status: "pending",
    expiryDate: "2025-01-05",
    amount: "₺0",
  },
  {
    id: "LIC-004",
    name: "Enterprise",
    customer: "Mega Corp",
    type: "Yıllık",
    status: "expired",
    expiryDate: "2024-11-30",
    amount: "₺18.000",
  },
  {
    id: "LIC-005",
    name: "Professional",
    customer: "Startup Hub",
    type: "Aylık",
    status: "active",
    expiryDate: "2025-02-01",
    amount: "₺4.500",
  },
];

const statusConfig = {
  active: { label: "Aktif", variant: "success" as const },
  expired: { label: "Süresi Doldu", variant: "destructive" as const },
  pending: { label: "Beklemede", variant: "pending" as const },
};

export function LicenseTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card animate-slide-up" style={{ animationDelay: "200ms" }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Lisans ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Müşteri
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tip
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Durum
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Bitiş Tarihi
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tutar
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                İşlem
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {licenses.map((license) => (
              <tr
                key={license.id}
                className="transition-colors hover:bg-muted/30"
              >
                <td className="whitespace-nowrap px-6 py-4">
                  <div>
                    <p className="font-medium text-foreground">{license.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {license.name}
                    </p>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-foreground">
                  {license.customer}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <Badge variant="secondary">{license.type}</Badge>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <Badge variant={statusConfig[license.status].variant}>
                    {statusConfig[license.status].label}
                  </Badge>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-foreground">
                  {new Date(license.expiryDate).toLocaleDateString("tr-TR")}
                </td>
                <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">
                  {license.amount}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Görüntüle
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Düzenle
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
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
    </div>
  );
}
