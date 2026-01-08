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
  birimFiyat: z.number().min(0, "Birim fiyat negatif olamaz").optional(),
  dovizId: z.string().optional(),
  modulTipi: z.number().min(0, "Modül tipi seçimi gerekli").max(3, "Geçersiz modül tipi"),
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

const dovizOptions = [
  { value: "TRY", label: "Türk Lirası (TRY)" },
  { value: "USD", label: "Amerikan Doları (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "İngiliz Sterlini (GBP)" },
];

const modulTipiOptions = [
  { value: 0, label: "Yazılım" },
  { value: 1, label: "Kullanıcı" },
  { value: 2, label: "Mobil Kullanıcı" },
  { value: 3, label: "Bakım" },
];

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
      birimFiyat: undefined,
      dovizId: "TRY",
      modulTipi: 0,
    },
  });

  useEffect(() => {
    if (modul) {
      // Map legacy currency codes to valid ISO codes
      const currencyMap: Record<string, string> = {
        "TL": "TRY",
        "EURO": "EUR",
      };
      const validDovizId = modul.dovizId ? (currencyMap[modul.dovizId] || modul.dovizId) : "TRY";

      form.reset({
        projeId: modul.projeId,
        adi: modul.adi || "",
        birimFiyat: modul.birimFiyat,
        dovizId: validDovizId,
        modulTipi: modul.modulTipi || 0,
      });
    } else {
      form.reset({
        projeId: projeler[0]?.projeId || 0,
        adi: "",
        birimFiyat: undefined,
        dovizId: "TRY",
        modulTipi: 0,
      });
    }
  }, [modul, projeler, form]);

  const handleSubmit = (data: ProjeModulFormData) => {
    if (isEditing) {
      onSubmit({ adi: data.adi, BirimFiyat: data.birimFiyat, DovizId: data.dovizId, ModulTipi: data.modulTipi } as ProjeModulUpdateRequest);
    } else {
      onSubmit({ projeId: data.projeId, adi: data.adi, birimFiyat: data.birimFiyat, dovizId: data.dovizId, modulTipi: data.modulTipi } as ProjeModulCreateRequest);
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
            <FormField
              control={form.control}
              name="birimFiyat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birim Fiyat (₺)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      min={0}
                      placeholder="0.00" 
                      {...field} 
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dovizId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Döviz *</FormLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Döviz seçiniz" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dovizOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="modulTipi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modül Tipi *</FormLabel>
                  <Select
                    value={field.value?.toString() || ""}
                    onValueChange={(val) => field.onChange(parseInt(val))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Modül tipi seçiniz" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {modulTipiOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
