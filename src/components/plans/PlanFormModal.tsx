import { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCreatePlanTemplateMutation, useUpdatePlanTemplateMutation } from '@/services/backendApi';
import { SozlesmeSablonPlanDto, PlanTemplateCreateRequest, PlanTemplateUpdateRequest } from '@/types/backend';

const planSchema = z.object({
  adi: z.string().min(2, "Plan adı en az 2 karakter olmalıdır."),
  pesinatOrani: z.coerce.number().min(0, "Peşinat oranı 0'dan küçük olamaz.").max(100, "Peşinat oranı 100'den büyük olamaz."),
  abonelikHesaplamaKatsayisi: z.coerce.number().min(1, "Hesaplama katsayısı 1'den küçük olamaz."),
});

type PlanFormData = z.infer<typeof planSchema>;

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: SozlesmeSablonPlanDto | null;
}

export function PlanFormModal({ isOpen, onClose, plan }: PlanFormModalProps) {
  const { toast } = useToast();
  const isEditing = !!plan;

  const [createPlan, { isLoading: isCreating }] = useCreatePlanTemplateMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanTemplateMutation();

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      adi: "",
      pesinatOrani: 0,
      abonelikHesaplamaKatsayisi: 36,
    },
  });
  
  useEffect(() => {
    if (plan) {
      form.reset({
        adi: plan.adi,
        pesinatOrani: plan.pesinatOrani,
        abonelikHesaplamaKatsayisi: plan.abonelikHesaplamaKatsayisi,
      });
    } else {
      form.reset({
        adi: "",
        pesinatOrani: 0,
        abonelikHesaplamaKatsayisi: 36,
      });
    }
  }, [plan, form]);


  const handleSubmit = async (data: PlanFormData) => {
    try {
      if (isEditing && plan) {
        const updateData: PlanTemplateUpdateRequest = {
            PlanId: plan.planId,
            Adi: data.adi,
            PesinatOrani: data.pesinatOrani,
            AbonelikHesaplamaKatsayisi: data.abonelikHesaplamaKatsayisi,
        };
        await updatePlan(updateData).unwrap();
        toast({ title: "Başarılı", description: "Plan şablonu güncellendi." });
      } else {
        const createData: PlanTemplateCreateRequest = {
            Adi: data.adi,
            PesinatOrani: data.pesinatOrani,
            AbonelikHesaplamaKatsayisi: data.abonelikHesaplamaKatsayisi,
        };
        await createPlan(createData).unwrap();
        toast({ title: "Başarılı", description: "Yeni plan şablonu oluşturuldu." });
      }
      onClose();
    } catch (err) {
      toast({ title: "Hata", description: "İşlem sırasında bir hata oluştu.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Şablonu Düzenle" : "Yeni Şablon Oluştur"}</DialogTitle>
          <DialogDescription>
            Ödeme planı şablonu için gerekli bilgileri doldurun.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="adi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şablon Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: Kurumsal Yıllık" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pesinatOrani"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peşinat Oranı (%)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Örn: 50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="abonelikHesaplamaKatsayisi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Abonelik Hesaplama Katsayısı (Ay)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Örn: 36" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                İptal
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}