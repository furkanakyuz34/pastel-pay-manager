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
import { PlanFormModal } from "@/components/plans/PlanFormModal";
import { DeletePlanDialog } from "@/components/plans/DeletePlanDialog";
import { SozlesmeSablonPlanDto } from "@/types/backend";
import { useToast } from "@/hooks/use-toast";
import { useGetPaymentPlansQuery, useDeletePlanTemplateMutation } from "@/services/backendApi";
import { LoadingState } from "@/components/ui/loading-state";

interface PlanTableProps {
  onAddClick?: () => void;
  showAddButton?: boolean;
}

export function PlanTable({ 
  onAddClick, 
  showAddButton = false,
}: PlanTableProps) {
  const { data: plans = [], isLoading } = useGetPaymentPlansQuery();
  const [deletePlanTemplate, { isLoading: isDeleting }] = useDeletePlanTemplateMutation();
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SozlesmeSablonPlanDto | null>(null);
  const { toast } = useToast();

  const handleEdit = (plan: SozlesmeSablonPlanDto) => {
    setSelectedPlan(plan);
    setEditModalOpen(true);
  };

  const handleDelete = (plan: SozlesmeSablonPlanDto) => {
    setSelectedPlan(plan);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedPlan) {
      try {
        await deletePlanTemplate(selectedPlan.planId).unwrap();
        toast({
          title: "Plan Silindi",
          description: `${selectedPlan.adi} planı başarıyla silindi.`,
        });
        setSelectedPlan(null);
        setDeleteDialogOpen(false);
      } catch (err) {
        toast({
          title: "Hata",
          description: "Plan silinirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return <LoadingState message="Planlar yükleniyor..." />;
  }

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
            key={plan.planId}
            className="p-4 rounded-lg border border-border bg-card space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{plan.adi}</p>
                <p className="text-xs text-muted-foreground">ID: {plan.planId}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Peşinat Oranı</p>
                <p className="text-sm font-semibold text-foreground">%{plan.pesinatOrani}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hesaplama Katsayısı</p>
                <p className="text-sm font-semibold text-foreground">{plan.abonelikHesaplamaKatsayisi} Ay</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(plan)}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
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
                  Peşinat Oranı
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Hesaplama Katsayısı
                </th>
                <th className="px-4 xl:px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {plans.map((plan) => (
                <tr
                  key={plan.planId}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3">
                    <p className="font-medium text-sm text-foreground">{plan.planId}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3">
                    <p className="font-medium text-sm text-foreground">{plan.adi}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3 text-sm text-foreground">
                    %{plan.pesinatOrani}
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3 text-sm text-foreground">
                    {plan.abonelikHesaplamaKatsayisi} Ay
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        plan={selectedPlan}
      />

      {/* Delete Dialog */}
      <DeletePlanDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Planı Sil"
        description={`'${selectedPlan?.adi}' adlı planı kalıcı olarak silmek istediğinizden emin misiniz?`}
      />
    </>
  );
}
