import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ProjeDto, ProjeCreateRequest, ProjeUpdateRequest } from "@/types/backend";

const projeSchema = z.object({
  adi: z.string().min(1, "Proje adı gerekli").max(100, "Proje adı çok uzun"),
});

type ProjeFormData = z.infer<typeof projeSchema>;

interface ProjeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proje?: ProjeDto | null;
  onSubmit: (data: ProjeUpdateRequest | ProjeCreateRequest) => void;
  isLoading?: boolean;
}

export function ProjeFormModal({
  open,
  onOpenChange,
  proje,
  onSubmit,
  isLoading = false,
}: ProjeFormModalProps) {
  const isEditing = !!proje;

  const form = useForm<ProjeFormData>({
    resolver: zodResolver(projeSchema),
    defaultValues: {
      adi: "",
    },
  });

  useEffect(() => {
    if (proje) {
      form.reset({
        adi: proje.adi || "",
      });
    } else {
      form.reset({
        adi: "",
      });
    }
  }, [proje, form]);

  const handleSubmit = (data: ProjeFormData) => {
    // Convert to PascalCase for backend
    onSubmit({ Adi: data.adi });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Proje Düzenle" : "Yeni Proje Ekle"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="adi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proje Adı *</FormLabel>
                  <FormControl>
                    <Input placeholder="Proje adını giriniz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Kaydediliyor..." : isEditing ? "Güncelle" : "Ekle"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
