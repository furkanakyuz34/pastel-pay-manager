import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plan } from "@/types";
import { User, FolderKanban, ShoppingBag, CheckCircle2, XCircle } from "lucide-react";

interface PlanDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan | null;
}

export function PlanDetailModal({
  open,
  onOpenChange,
  plan,
}: PlanDetailModalProps) {
  if (!plan) return null;

  const features = plan.features?.split("\n").filter((f) => f.trim()) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center justify-between">
            <span>{plan.name}</span>
            <Badge variant={plan.status === "active" ? "success" : "secondary"}>
              {plan.status === "active" ? "Aktif" : "Pasif"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Info */}
          {plan.description && (
            <div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>
          )}

          {/* Customer, Project, Products */}
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Proje</span>
              </div>
              <p className="text-sm text-muted-foreground">{plan.projectName || "-"}</p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Proje Detayı</span>
              </div>
              <p className="text-sm text-muted-foreground">{plan.projectName || "-"}</p>
            </div>

            {plan.productNames && plan.productNames.length > 0 && (
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Ürünler</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {plan.productNames.map((name, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="text-sm text-muted-foreground mb-1">Aylık Fiyat</p>
              <p className="text-2xl font-bold text-foreground">{plan.monthlyPrice}</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="text-sm text-muted-foreground mb-1">Yıllık Fiyat</p>
              <p className="text-2xl font-bold text-foreground">{plan.yearlyPrice}</p>
            </div>
          </div>

          {/* Trial Days */}
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="text-sm text-muted-foreground mb-1">Deneme Süresi</p>
            <p className="text-lg font-semibold text-foreground">{plan.trialDays} gün</p>
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Özellikler</p>
              <div className="space-y-2">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span className="text-sm text-foreground">{feature.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Kapat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

