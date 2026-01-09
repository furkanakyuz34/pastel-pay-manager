import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Project, Product } from "@/types";
import { calculateFinalPrice, formatCurrency, formatDiscountDisplay } from "@/lib/pricing";
import { Percent, CircleDollarSign, Tag, Calculator } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(2, "Ürün adı en az 2 karakter olmalıdır").max(100, "Ürün adı en fazla 100 karakter olabilir"),
  description: z.string().optional(),
  projectId: z.string().min(1, "Proje seçiniz"),
  basePrice: z.number().min(0, "Fiyat 0 veya daha büyük olmalıdır"),
  currency: z.string().default("TRY"),
  status: z.enum(["active", "inactive", "discontinued"], { required_error: "Durum seçiniz" }),
  discountType: z.enum(["none", "percentage", "amount"]).default("none"),
  discountValue: z.number().min(0).default(0),
  discountValidFrom: z.string().optional(),
  discountValidUntil: z.string().optional(),
  billingType: z.enum(["one_time", "recurring"]).default("one_time"),
  recurringInterval: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
  trialDays: z.number().min(0).max(365).optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  projects: Project[];
  onSubmit: (data: ProductFormData) => void;
}

export function ProductFormModal({
  open,
  onOpenChange,
  product,
  projects,
  onSubmit,
}: ProductFormModalProps) {
  const { toast } = useToast();
  const isEditing = !!product;

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      projectId: product?.projectId || "",
      basePrice: product?.basePrice || 0,
      currency: product?.currency || "TRY",
      status: product?.status || undefined,
      discountType: product?.discountType || "none",
      discountValue: product?.discountValue || 0,
      discountValidFrom: product?.discountValidFrom || "",
      discountValidUntil: product?.discountValidUntil || "",
      billingType: product?.billingType || "one_time",
      recurringInterval: product?.recurringInterval,
      trialDays: product?.trialDays || 0,
    },
  });

  // Watch values for live price calculation
  const basePrice = useWatch({ control: form.control, name: "basePrice" });
  const discountType = useWatch({ control: form.control, name: "discountType" });
  const discountValue = useWatch({ control: form.control, name: "discountValue" });
  const billingType = useWatch({ control: form.control, name: "billingType" });
  const currency = useWatch({ control: form.control, name: "currency" });

  // Calculate live preview
  const finalPrice = calculateFinalPrice(basePrice || 0, discountType || "none", discountValue || 0);
  const discountAmount = (basePrice || 0) - finalPrice;
  const discountDisplay = formatDiscountDisplay(discountType || "none", discountValue || 0, currency);

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || "",
        projectId: product.projectId,
        basePrice: product.basePrice,
        currency: product.currency || "TRY",
        status: product.status,
        discountType: product.discountType || "none",
        discountValue: product.discountValue || 0,
        discountValidFrom: product.discountValidFrom || "",
        discountValidUntil: product.discountValidUntil || "",
        billingType: product.billingType || "one_time",
        recurringInterval: product.recurringInterval,
        trialDays: product.trialDays || 0,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        projectId: "",
        basePrice: 0,
        currency: "TRY",
        status: undefined,
        discountType: "none",
        discountValue: 0,
        discountValidFrom: "",
        discountValidUntil: "",
        billingType: "one_time",
        recurringInterval: undefined,
        trialDays: 0,
      });
    }
  }, [product, form]);

  const handleSubmit = (data: ProductFormData) => {
    onSubmit(data);
    toast({
      title: isEditing ? "Ürün Güncellendi" : "Ürün Eklendi",
      description: `${data.name} ürünü başarıyla ${isEditing ? "güncellendi" : "eklendi"}.`,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing
              ? "Ürün bilgilerini ve iskonto ayarlarını güncelleyin."
              : "Yeni bir ürün oluşturun ve iskonto ayarlarını yapılandırın."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Temel Bilgiler
              </h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ürün Adı</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Premium Paket"
                        className="bg-background border-border"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proje</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Proje seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Açıklama</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ürün hakkında açıklama..."
                        className="bg-background border-border"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="billingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faturalama Tipi</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-border">
                            <SelectValue placeholder="Tip seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="one_time">Tek Seferlik</SelectItem>
                          <SelectItem value="recurring">Tekrarlayan</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {billingType === "recurring" && (
                  <FormField
                    control={form.control}
                    name="recurringInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tekrarlama Periyodu</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background border-border">
                              <SelectValue placeholder="Periyot seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Günlük</SelectItem>
                            <SelectItem value="weekly">Haftalık</SelectItem>
                            <SelectItem value="monthly">Aylık</SelectItem>
                            <SelectItem value="yearly">Yıllık</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durum</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-border">
                            <SelectValue placeholder="Durum seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Aktif</SelectItem>
                          <SelectItem value="inactive">Pasif</SelectItem>
                          <SelectItem value="discontinued">Üretimden Kaldırıldı</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {billingType === "recurring" && (
                  <FormField
                    control={form.control}
                    name="trialDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deneme Süresi (Gün)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={365}
                            placeholder="14"
                            className="bg-background border-border"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            <Separator />

            {/* Pricing Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4" />
                Fiyatlandırma
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temel Fiyat</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          placeholder="1000"
                          className="bg-background border-border"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Para Birimi</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-border">
                            <SelectValue placeholder="Para birimi" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TRY">₺ TRY</SelectItem>
                          <SelectItem value="USD">$ USD</SelectItem>
                          <SelectItem value="EURO">€ EUR</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Discount Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Percent className="h-4 w-4" />
                İskonto Ayarları
              </h3>

              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İskonto Tipi</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="İskonto tipi seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">İskonto Yok</SelectItem>
                        <SelectItem value="percentage">Yüzde Bazlı (%)</SelectItem>
                        <SelectItem value="amount">Tutar Bazlı (₺)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Yüzde bazlı: Fiyatın belirli bir yüzdesi kadar indirim. Tutar bazlı: Sabit tutar indirimi.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {discountType !== "none" && (
                <>
                  <FormField
                    control={form.control}
                    name="discountValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          İskonto Değeri {discountType === "percentage" ? "(%)" : "(₺)"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={discountType === "percentage" ? 100 : undefined}
                            step={discountType === "percentage" ? 1 : 0.01}
                            placeholder={discountType === "percentage" ? "10" : "100"}
                            className="bg-background border-border"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="discountValidFrom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Geçerlilik Başlangıç</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="bg-background border-border"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discountValidUntil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Geçerlilik Bitiş</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="bg-background border-border"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
            </div>

            <Separator />

            {/* Price Preview */}
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Fiyat Önizlemesi
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Temel Fiyat:</span>
                  <span className="text-foreground">{formatCurrency(basePrice || 0, currency)}</span>
                </div>
                
                {discountType !== "none" && discountValue > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">İskonto:</span>
                    <span className="text-destructive">
                      -{formatCurrency(discountAmount, currency)} 
                      <Badge variant="outline" className="ml-2 text-xs">
                        {discountDisplay}
                      </Badge>
                    </span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between font-medium">
                  <span className="text-foreground">Son Fiyat:</span>
                  <span className="text-primary text-lg">{formatCurrency(finalPrice, currency)}</span>
                </div>
              </div>
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
