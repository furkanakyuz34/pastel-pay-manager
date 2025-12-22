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
import { Customer, Product, CustomerPricing, DiscountType } from "@/types";
import { calculateFinalPrice, formatCurrency, formatDiscountDisplay } from "@/lib/pricing";
import { Users, Tag, Calculator } from "lucide-react";

const customerPricingSchema = z.object({
  customerId: z.string().min(1, "Müşteri seçiniz"),
  productId: z.string().min(1, "Ürün seçiniz"),
  discountType: z.enum(["none", "percentage", "amount"]),
  discountValue: z.number().min(0),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerPricingFormData = z.infer<typeof customerPricingSchema>;

interface CustomerPricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pricing?: CustomerPricing | null;
  customers: Customer[];
  products: Product[];
  onSubmit: (data: CustomerPricingFormData) => void;
}

export function CustomerPricingModal({
  open,
  onOpenChange,
  pricing,
  customers,
  products,
  onSubmit,
}: CustomerPricingModalProps) {
  const { toast } = useToast();
  const isEditing = !!pricing;

  const form = useForm<CustomerPricingFormData>({
    resolver: zodResolver(customerPricingSchema),
    defaultValues: {
      customerId: pricing?.customerId || "",
      productId: pricing?.productId || "",
      discountType: pricing?.discountType || "none",
      discountValue: pricing?.discountValue || 0,
      validFrom: pricing?.validFrom || "",
      validUntil: pricing?.validUntil || "",
      notes: pricing?.notes || "",
    },
  });

  const productId = useWatch({ control: form.control, name: "productId" });
  const discountType = useWatch({ control: form.control, name: "discountType" });
  const discountValue = useWatch({ control: form.control, name: "discountValue" });

  const selectedProduct = products.find((p) => p.id === productId);
  const basePrice = selectedProduct?.basePrice || 0;
  const currency = selectedProduct?.currency || "TRY";

  const finalPrice = calculateFinalPrice(basePrice, discountType || "none", discountValue || 0);
  const discountAmount = basePrice - finalPrice;
  const discountDisplay = formatDiscountDisplay(discountType || "none", discountValue || 0, currency);

  useEffect(() => {
    if (pricing) {
      form.reset({
        customerId: pricing.customerId,
        productId: pricing.productId,
        discountType: pricing.discountType,
        discountValue: pricing.discountValue,
        validFrom: pricing.validFrom || "",
        validUntil: pricing.validUntil || "",
        notes: pricing.notes || "",
      });
    } else {
      form.reset({
        customerId: "",
        productId: "",
        discountType: "none",
        discountValue: 0,
        validFrom: "",
        validUntil: "",
        notes: "",
      });
    }
  }, [pricing, form]);

  const handleSubmit = (data: CustomerPricingFormData) => {
    onSubmit(data);
    const customer = customers.find((c) => c.id === data.customerId);
    const product = products.find((p) => p.id === data.productId);
    toast({
      title: isEditing ? "Özel Fiyat Güncellendi" : "Özel Fiyat Oluşturuldu",
      description: `${customer?.name} için ${product?.name} ürününe özel fiyat ${isEditing ? "güncellendi" : "oluşturuldu"}.`,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Users className="h-5 w-5" />
            {isEditing ? "Özel Fiyatı Düzenle" : "Müşteriye Özel Fiyat"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Belirli bir müşteri için ürün bazında özel fiyatlandırma tanımlayın.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Müşteri</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Müşteri seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          <div className="flex items-center gap-2">
                            <span>{customer.name}</span>
                            {customer.discountTier && customer.discountTier !== "standard" && (
                              <Badge variant="outline" className="text-xs">
                                {customer.discountTier}
                              </Badge>
                            )}
                          </div>
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
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ürün</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Ürün seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center justify-between gap-4 w-full">
                            <span>{product.name}</span>
                            <span className="text-muted-foreground text-sm">
                              {formatCurrency(product.basePrice, product.currency)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedProduct && (
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Ürün Temel Fiyatı:</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(selectedProduct.basePrice, selectedProduct.currency)}
                  </span>
                  {selectedProduct.discountType !== "none" && (
                    <Badge variant="secondary" className="text-xs">
                      {formatDiscountDisplay(selectedProduct.discountType, selectedProduct.discountValue, selectedProduct.currency)}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <Separator />

            <FormField
              control={form.control}
              name="discountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Özel İskonto Tipi</FormLabel>
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
                    Bu iskonto ürünün kendi iskontosunu geçersiz kılar.
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
                          placeholder={discountType === "percentage" ? "15" : "200"}
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
                    name="validFrom"
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
                    name="validUntil"
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

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notlar</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Özel fiyat hakkında notlar..."
                      className="bg-background border-border"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedProduct && (
              <>
                <Separator />
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Müşteri Özel Fiyat Önizlemesi
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ürün Temel Fiyatı:</span>
                      <span className="text-foreground">{formatCurrency(basePrice, currency)}</span>
                    </div>
                    
                    {discountType !== "none" && discountValue > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Müşteri İskontosu:</span>
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
                      <span className="text-foreground">Müşteriye Özel Fiyat:</span>
                      <span className="text-primary text-lg">{formatCurrency(finalPrice, currency)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                İptal
              </Button>
              <Button type="submit">
                {isEditing ? "Güncelle" : "Oluştur"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
