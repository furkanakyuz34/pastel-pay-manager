import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const licenseSchema = z.object({
  name: z.string().min(2, "Lisans adı en az 2 karakter olmalıdır").max(100, "Lisans adı en fazla 100 karakter olabilir"),
  customer: z.string().min(2, "Müşteri adı en az 2 karakter olmalıdır").max(100, "Müşteri adı en fazla 100 karakter olabilir"),
  type: z.enum(["Yıllık", "Aylık", "Deneme"], { required_error: "Lisans tipi seçiniz" }),
  status: z.enum(["active", "expired", "pending"], { required_error: "Durum seçiniz" }),
  expiryDate: z.date({ required_error: "Bitiş tarihi seçiniz" }),
  amount: z.string().min(1, "Tutar giriniz").regex(/^[\d.,]+$/, "Geçerli bir tutar giriniz"),
});

export type LicenseFormData = z.infer<typeof licenseSchema>;

export interface License {
  id: string;
  name: string;
  customer: string;
  type: string;
  status: "active" | "expired" | "pending";
  expiryDate: string;
  amount: string;
}

interface LicenseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  license?: License | null;
  onSubmit: (data: LicenseFormData) => void;
}

export function LicenseFormModal({
  open,
  onOpenChange,
  license,
  onSubmit,
}: LicenseFormModalProps) {
  const { toast } = useToast();
  const isEditing = !!license;

  const form = useForm<LicenseFormData>({
    resolver: zodResolver(licenseSchema),
    defaultValues: {
      name: license?.name || "",
      customer: license?.customer || "",
      type: (license?.type as "Yıllık" | "Aylık" | "Deneme") || undefined,
      status: license?.status || undefined,
      expiryDate: license?.expiryDate ? new Date(license.expiryDate) : undefined,
      amount: license?.amount?.replace("₺", "").replace(".", "").trim() || "",
    },
  });

  const handleSubmit = (data: LicenseFormData) => {
    onSubmit(data);
    toast({
      title: isEditing ? "Lisans Güncellendi" : "Lisans Eklendi",
      description: `${data.name} lisansı başarıyla ${isEditing ? "güncellendi" : "eklendi"}.`,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? "Lisansı Düzenle" : "Yeni Lisans Ekle"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing
              ? "Lisans bilgilerini güncelleyin."
              : "Yeni bir lisans oluşturmak için formu doldurun."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* License Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lisans Adı</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enterprise Pro"
                      className="bg-background border-border"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Customer */}
            <FormField
              control={form.control}
              name="customer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Müşteri</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ABC Teknoloji A.Ş."
                      className="bg-background border-border"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type & Status Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lisans Tipi</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Tip seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Yıllık">Yıllık</SelectItem>
                        <SelectItem value="Aylık">Aylık</SelectItem>
                        <SelectItem value="Deneme">Deneme</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durum</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Durum seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="pending">Beklemede</SelectItem>
                        <SelectItem value="expired">Süresi Doldu</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Expiry Date & Amount Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Bitiş Tarihi</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal bg-background border-border",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd MMM yyyy", { locale: tr })
                            ) : (
                              <span>Tarih seçin</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tutar (₺)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="24.000"
                        className="bg-background border-border"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                İptal
              </Button>
              <Button type="submit">
                {isEditing ? "Güncelle" : "Ekle"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
