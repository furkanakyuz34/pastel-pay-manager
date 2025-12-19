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

const paymentSchema = z.object({
  description: z.string().min(3, "Açıklama en az 3 karakter olmalıdır").max(200, "Açıklama en fazla 200 karakter olabilir"),
  customer: z.string().min(2, "Müşteri adı en az 2 karakter olmalıdır").max(100, "Müşteri adı en fazla 100 karakter olabilir"),
  amount: z.string().min(1, "Tutar giriniz").regex(/^[\d.,]+$/, "Geçerli bir tutar giriniz"),
  type: z.enum(["incoming", "outgoing"], { required_error: "İşlem tipi seçiniz" }),
  status: z.enum(["completed", "pending", "failed"], { required_error: "Durum seçiniz" }),
  date: z.date({ required_error: "Tarih seçiniz" }),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

export interface Payment {
  id: string;
  description: string;
  customer: string;
  amount: string;
  status: "completed" | "pending" | "failed";
  date: string;
  type: "incoming" | "outgoing";
}

interface PaymentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: Payment | null;
  onSubmit: (data: PaymentFormData) => void;
}

export function PaymentFormModal({
  open,
  onOpenChange,
  payment,
  onSubmit,
}: PaymentFormModalProps) {
  const { toast } = useToast();
  const isEditing = !!payment;

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      description: payment?.description || "",
      customer: payment?.customer || "",
      amount: payment?.amount?.replace("₺", "").replace(".", "").trim() || "",
      type: payment?.type || undefined,
      status: payment?.status || undefined,
      date: payment?.date ? new Date(payment.date) : undefined,
    },
  });

  const handleSubmit = (data: PaymentFormData) => {
    onSubmit(data);
    toast({
      title: isEditing ? "Ödeme Güncellendi" : "Ödeme Eklendi",
      description: `${data.description} işlemi başarıyla ${isEditing ? "güncellendi" : "eklendi"}.`,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? "Ödemeyi Düzenle" : "Yeni Ödeme Ekle"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing
              ? "Ödeme bilgilerini güncelleyin."
              : "Yeni bir ödeme kaydı oluşturmak için formu doldurun."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enterprise Pro Lisans Ödemesi"
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
                  <FormLabel>Müşteri / Kaynak</FormLabel>
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
                    <FormLabel>İşlem Tipi</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Tip seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="incoming">Gelen Ödeme</SelectItem>
                        <SelectItem value="outgoing">Giden Ödeme</SelectItem>
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
                        <SelectItem value="completed">Tamamlandı</SelectItem>
                        <SelectItem value="pending">Beklemede</SelectItem>
                        <SelectItem value="failed">Başarısız</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date & Amount Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tarih</FormLabel>
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
