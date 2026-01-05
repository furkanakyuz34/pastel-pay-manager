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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjeModulDto, ProjeDto, ProjeModulCreateRequest, ProjeModulUpdateRequest } from "@/types/backend";

const projeModulSchema = z.object({
  projeId: z.number().min(1, "Proje seçimi gerekli"),
  adi: z.string().min(1, "Modül adı gerekli").max(100, "Modül adı çok uzun"),
});

type ProjeModulFormData = z.infer<typeof projeModulSchema>;

interface ProjeModulFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modul?: ProjeModulDto | null;
  projeler: ProjeDto[];
  onSubmit: (data: ProjeModulUpdateRequest | ProjeModulCreateRequest) => void;
  isLoading?: boolean;
}

export function ProjeModulFormModal({
  open,
  onOpenChange,
  modul,
  projeler,
  onSubmit,
  isLoading = false,
}: ProjeModulFormModalProps) {
  const isEditing = !!modul;

  const form = useForm<ProjeModulFormData>({
    resolver: zodResolver(projeModulSchema),
    defaultValues: {
      projeId: 0,
      adi: "",
    },
  });

  useEffect(() => {
    if (modul) {
      form.reset({
        projeId: modul.projeId,
        adi: modul.adi || "",
      });
    } else {
      form.reset({
        projeId: projeler[0]?.projeId || 0,
        adi: "",
      });
    }
  }, [modul, projeler, form]);

  const handleSubmit = (data: ProjeModulFormData) => {
    if (isEditing) {
      // Update sadece adi alır
      onSubmit({ adi: data.adi } as ProjeModulUpdateRequest);
    } else {
      onSubmit(data as ProjeModulCreateRequest);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modül Düzenle" : "Yeni Modül Ekle"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {!isEditing && (
              <FormField
                control={form.control}
                name="projeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proje *</FormLabel>
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={(val) => field.onChange(parseInt(val))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Proje seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projeler.map((proje) => (
                          <SelectItem key={proje.projeId} value={proje.projeId.toString()}>
                            {proje.adi}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="adi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modül Adı *</FormLabel>
                  <FormControl>
                    <Input placeholder="Modül adını giriniz" {...field} />
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
