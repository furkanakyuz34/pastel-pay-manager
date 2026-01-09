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
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FirmaDto, FirmaCreateRequest, FirmaUpdateRequest } from "@/types/backend";

const firmaSchema = z.object({
  adi: z.string().min(1, "Firma adı gerekli").max(100, "Firma adı çok uzun"),
  yetkiliAdi: z.string().optional(),
  adres1: z.string().optional(),
  adres2: z.string().optional(),
  adres3: z.string().optional(),
  semt: z.string().optional(),
  sehir: z.string().optional(),
  vergiDairesi: z.string().optional(),
  vergiHesapNo: z.string().optional(),
  telefon1: z.string().optional(),
  telefon2: z.string().optional(),
  fax: z.string().optional(),
  email: z.string().email("Geçerli bir e-posta adresi giriniz").optional().or(z.literal("")),
  notu: z.string().optional(),
});

type FirmaFormData = z.infer<typeof firmaSchema>;

interface FirmaFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  firma?: FirmaDto | null;
  onSubmit: (data: FirmaUpdateRequest | FirmaCreateRequest) => void;
  isLoading?: boolean;
}

export function FirmaFormModal({
  open,
  onOpenChange,
  firma,
  onSubmit,
  isLoading = false,
}: FirmaFormModalProps) {
  const isEditing = !!firma;

  const form = useForm<FirmaFormData>({
    resolver: zodResolver(firmaSchema),
    defaultValues: {
      adi: "",
      yetkiliAdi: "",
      adres1: "",
      sehir: "",
      vergiDairesi: "",
      vergiHesapNo: "",
      telefon1: "",
      email: "",
      notu: "",
    },
  });

  useEffect(() => {
    if (firma) {
      form.reset({
        adi: firma.adi || "",
        yetkiliAdi: firma.yetkiliAdi || "",
        adres1: firma.adres1 || "",
        adres2: firma.adres2 || "",
        adres3: firma.adres3 || "",
        semt: firma.semt || "",
        sehir: firma.sehir || "",
        vergiDairesi: firma.vergiDairesi || "",
        vergiHesapNo: firma.vergiHesapNo || "",
        telefon1: firma.telefon1 || "",
        telefon2: firma.telefon2 || "",
        fax: firma.fax || "",
        email: firma.email || "",
        notu: firma.notu || "",
      });
    } else {
      form.reset({
        adi: "",
        yetkiliAdi: "",
        adres1: "",
        sehir: "",
        telefon1: "",
        email: "",
        notu: "",
      });
    }
  }, [firma, form]);

  const handleSubmit = (data: FirmaFormData) => {
    // Convert to PascalCase for backend
    const request: FirmaUpdateRequest | FirmaCreateRequest = {
      Adi: data.adi,
      YetkiliAdi: data.yetkiliAdi,
      Adres1: data.adres1,
      Adres2: data.adres2,
      Adres3: data.adres3,
      Semt: data.semt,
      Sehir: data.sehir,
      VergiDairesi: data.vergiDairesi,
      VergiHesapNo: data.vergiHesapNo,
      Telefon1: data.telefon1,
      Telefon2: data.telefon2,
      Fax: data.fax,
      Email: data.email || undefined,
      Notu: data.notu,
    };
    
    // Add FirmaId for create request
    if (!isEditing) {
      (request as FirmaCreateRequest).FirmaId = 0;
    }
    
    onSubmit(request);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Firma Düzenle" : "Yeni Firma Ekle"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="adi"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Firma Adı *</FormLabel>
                    <FormControl>
                      <Input placeholder="Firma adını giriniz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yetkiliAdi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yetkili Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="Yetkili kişi adı" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ornek@firma.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefon1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon 1</FormLabel>
                    <FormControl>
                      <Input placeholder="+90 xxx xxx xx xx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefon2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon 2</FormLabel>
                    <FormControl>
                      <Input placeholder="+90 xxx xxx xx xx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adres1"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Adres</FormLabel>
                    <FormControl>
                      <Input placeholder="Adres satırı" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="semt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semt</FormLabel>
                    <FormControl>
                      <Input placeholder="Semt" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sehir"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şehir</FormLabel>
                    <FormControl>
                      <Input placeholder="Şehir" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vergiDairesi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vergi Dairesi</FormLabel>
                    <FormControl>
                      <Input placeholder="Vergi dairesi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vergiHesapNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vergi Hesap No</FormLabel>
                    <FormControl>
                      <Input placeholder="Vergi numarası" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notu"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Not</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ek notlar..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
