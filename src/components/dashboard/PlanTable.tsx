import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Trash2, Package } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlanFormModal, Plan, PlanFormData } from "@/components/plans/PlanFormModal";
import { DeletePlanDialog } from "@/components/plans/DeletePlanDialog";
import { PlanDetailModal } from "@/components/plans/PlanDetailModal";
import { Customer } from "@/components/customers/CustomerFormModal";
import { Project } from "@/components/projects/ProjectFormModal";
import { Product } from "@/components/products/ProductFormModal";
import { useToast } from "@/hooks/use-toast";

const initialPlans: Plan[] = [
  {
    id: "PLAN-001",
    name: "Premium Plan",
    description: "Tüm özellikler dahil, en gelişmiş plan",
    customerId: "CUS-001",
    customerName: "ABC Teknoloji A.Ş.",
    projectId: "PRJ-001",
    projectName: "E-Ticaret Platformu",
    productIds: ["PRD-001", "PRD-002"],
    productNames: ["Premium Paket", "Standart Paket"],
    monthlyPrice: "₺2.000",
    yearlyPrice: "₺20.000",
    features: "Sınırsız kullanıcı\nÖncelikli destek\nGelişmiş analitik\nAPI erişimi",
    status: "active",
    trialDays: 14,
  },
  {
    id: "PLAN-002",
    name: "Standard Plan",
    description: "Orta ölçekli işletmeler için",
    customerId: "CUS-002",
    customerName: "XYZ Yazılım Ltd.",
    projectId: "PRJ-002",
    projectName: "Mobil Uygulama",
    productIds: ["PRD-003"],
    productNames: ["Mobil Uygulama Lisansı"],
    monthlyPrice: "₺1.000",
    yearlyPrice: "₺10.000",
    features: "50 kullanıcı\nStandart destek\nTemel analitik",
    status: "active",
    trialDays: 14,
  },
];

const statusConfig = {
  active: { label: "Aktif", variant: "success" as const },
  inactive: { label: "Pasif", variant: "secondary" as const },
};

interface PlanTableProps {
  onAddClick?: () => void;
  showAddButton?: boolean;
  customers?: Customer[];
  projects?: Project[];
  products?: Product[];
}

export function PlanTable({ 
  onAddClick, 
  showAddButton = false,
  customers = [],
  projects = [],
  products = [],
}: PlanTableProps) {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const { toast } = useToast();

  const handleView = (plan: Plan) => {
    setSelectedPlan(plan);
    setDetailModalOpen(true);
  };

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setEditModalOpen(true);
  };

  const handleDelete = (plan: Plan) => {
    setSelectedPlan(plan);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedPlan) {
      setPlans((prev) => prev.filter((p) => p.id !== selectedPlan.id));
      toast({
        title: "Plan Silindi",
        description: `${selectedPlan.name} planı başarıyla silindi.`,
      });
      setSelectedPlan(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleUpdatePlan = (data: PlanFormData) => {
    if (selectedPlan) {
      const customer = customers.find((c) => c.id === data.customerId);
      const project = projects.find((p) => p.id === data.projectId);
      const selectedProducts = products.filter((prod) => data.productIds.includes(prod.id));

      setPlans((prev) =>
        prev.map((p) =>
          p.id === selectedPlan.id
            ? {
                ...p,
                name: data.name,
                description: data.description,
                customerId: data.customerId,
                customerName: customer?.name,
                projectId: data.projectId,
                projectName: project?.name,
                productIds: data.productIds,
                productNames: selectedProducts.map((prod) => prod.name),
                monthlyPrice: `₺${data.monthlyPrice}`,
                yearlyPrice: `₺${data.yearlyPrice}`,
                features: data.features,
                status: data.status,
                trialDays: data.trialDays,
              }
            : p
        )
      );
      setSelectedPlan(null);
    }
  };

  if (plans.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-12 w-12" />}
        title="Plan bulunamadı"
        description="Henüz hiç plan oluşturulmamış. Yeni bir plan oluşturmak için yukarıdaki butona tıklayın."
      />
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="p-4 rounded-lg border border-border bg-card space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{plan.name}</p>
                <p className="text-xs text-muted-foreground truncate">{plan.customerName || "-"}</p>
              </div>
              <Badge variant={statusConfig[plan.status].variant} className="text-xs">
                {statusConfig[plan.status].label}
              </Badge>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Proje</p>
                <Badge variant="outline" className="text-xs mt-1">{plan.projectName || "-"}</Badge>
              </div>
              {plan.productNames && plan.productNames.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ürünler</p>
                  <div className="flex flex-wrap gap-1">
                    {plan.productNames.map((name, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Aylık</p>
                <p className="text-sm font-semibold text-foreground">{plan.monthlyPrice}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Yıllık</p>
                <p className="text-sm font-semibold text-foreground">{plan.yearlyPrice}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleView(plan)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Detay
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(plan)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(plan)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Plan ID
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Plan Adı
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Müşteri
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Proje
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Ürünler
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Aylık Fiyat
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Yıllık Fiyat
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Durum
                </th>
                <th className="px-4 xl:px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {plans.map((plan) => (
                <tr
                  key={plan.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3">
                    <p className="font-medium text-sm text-foreground">{plan.id}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3">
                    <p className="font-medium text-sm text-foreground">{plan.name}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3 text-sm text-foreground">
                    {plan.customerName || "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3">
                    <Badge variant="outline" className="text-xs">{plan.projectName || "-"}</Badge>
                  </td>
                  <td className="px-4 xl:px-6 py-3">
                    <div className="flex flex-wrap gap-1">
                      {plan.productNames && plan.productNames.length > 0 ? (
                        plan.productNames.map((name, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3 text-sm font-medium text-foreground">
                    {plan.monthlyPrice}
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3 text-sm font-medium text-foreground">
                    {plan.yearlyPrice}
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3">
                    <Badge variant={statusConfig[plan.status].variant} className="text-xs">
                      {statusConfig[plan.status].label}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(plan)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Detayları Görüntüle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(plan)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(plan)}
                        >
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

      {/* Edit Modal */}
      <PlanFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        plan={selectedPlan}
        customers={customers}
        projects={projects}
        products={products}
        onSubmit={handleUpdatePlan}
      />

      {/* Delete Dialog */}
      <DeletePlanDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        planName={selectedPlan?.name || ""}
        onConfirm={handleConfirmDelete}
      />

      {/* Detail Modal */}
      <PlanDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        plan={selectedPlan}
      />
    </>
  );
}

