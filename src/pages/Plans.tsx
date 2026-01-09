import { useState } from 'react';
import { useGetPaymentPlansQuery, useDeletePlanTemplateMutation } from '@/services/backendApi';
import { SozlesmeSablonPlanDto } from '@/types/backend';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { PlanFormModal } from '@/components/plans/PlanFormModal';
import { DeletePlanDialog } from '@/components/plans/DeletePlanDialog';

export default function PlansPage() {
  const { toast } = useToast();
  const { data: plans = [], isLoading, isError, error } = useGetPaymentPlansQuery();
  const [deletePlanTemplate, { isLoading: isDeleting }] = useDeletePlanTemplateMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SozlesmeSablonPlanDto | null>(null);

  const handleAddNew = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  const handleEdit = (plan: SozlesmeSablonPlanDto) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleDelete = (plan: SozlesmeSablonPlanDto) => {
    setSelectedPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPlan) return;
    try {
      await deletePlanTemplate(selectedPlan.planId).unwrap();
      toast({ title: 'Başarılı', description: 'Plan şablonu silindi.' });
      setIsDeleteDialogOpen(false);
      setSelectedPlan(null);
    } catch (err) {
      toast({ title: 'Hata', description: 'Plan silinirken bir hata oluştu.', variant: 'destructive' });
    }
  };
  
  const renderContent = () => {
    if (isLoading) {
      return <LoadingState message="Plan şablonları yükleniyor..." />;
    }
  
    if (isError) {
      return <div className="text-red-500">Hata: {JSON.stringify(error)}</div>;
    }

    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold sr-only">Ödeme Planı Şablonları</h1>
          <div />
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Şablon Ekle
          </Button>
        </div>
  
        {plans.length === 0 ? (
          <EmptyState
            title="Hiç şablon bulunamadı."
            description="Başlamak için yeni bir ödeme planı şablonu ekleyin."
            action={<Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Yeni Şablon Ekle</Button>}
          />
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan ID</TableHead>
                  <TableHead>Adı</TableHead>
                  <TableHead>Peşinat Oranı (%)</TableHead>
                  <TableHead>Abonelik Katsayısı</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.planId}>
                    <TableCell>{plan.planId}</TableCell>
                    <TableCell className="font-medium">{plan.adi}</TableCell>
                    <TableCell>{plan.pesinatOrani}%</TableCell>
                    <TableCell>{plan.abonelikHesaplamaKatsayisi}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(plan)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(plan)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </>
    )
  }

  return (
    <MainLayout>
      <Header title="Ödeme Planı Şablonları" subtitle="Otomatik ödeme planları için şablonları yönetin." />
      <div className="p-4">
        {renderContent()}
      </div>

      <PlanFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
      />

      <DeletePlanDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Şablonu Sil"
        description={`'${selectedPlan?.adi}' adlı şablonu kalıcı olarak silmek istediğinizden emin misiniz?`}
      />
    </MainLayout>
  );
}
