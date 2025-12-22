import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon, Plus, X } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const invoiceItemSchema = z.object({
  productId: z.string().min(1, "Ürün seçiniz"),
  productName: z.string(),
  quantity: z.number().min(1, "Miktar en az 1 olmalıdır"),
  unitPrice: z.number().min(0, "Birim fiyat geçerli olmalıdır"),
  discountType: z.enum(["none", "percentage", "amount"]).default("none"),
  discountValue: z.number().default(0),
});

const invoiceSchema = z.object({
  customerId: z.string().min(1, "Müşteri seçiniz"),
  subscriptionId: z.string().optional(),
  issueDate: z.date({ required_error: "Fatura tarihi seçiniz" }),
  dueDate: z.date({ required_error: "Ödeme tarihi seçiniz" }),
  taxRate: z.number().min(0).max(100).default(18),
  items: z.array(invoiceItemSchema).min(1, "En az bir ürün ekleyiniz"),
  notes: z.string().optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  subscriptionId?: string;
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  notes?: string;
}

interface InvoiceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice | null;
  customers: Array<{ id: string; name: string }>;
  subscriptions: Array<{ id: string; planName: string; amount: string }>;
  products: Array<{ id: string; name: string; price: string }>;
  onSubmit: (data: InvoiceFormData) => void;
}

export function InvoiceFormModal({
  open,
  onOpenChange,
  invoice,
  customers,
  subscriptions,
  products,
  onSubmit,
}: InvoiceFormModalProps) {
  const { toast } = useToast();
  const isEditing = !!invoice;

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerId: invoice?.customerId || "",
      subscriptionId: invoice?.subscriptionId || "",
      issueDate: invoice?.issueDate ? new Date(invoice.issueDate) : undefined,
      dueDate: invoice?.dueDate ? new Date(invoice.dueDate) : undefined,
      taxRate: invoice?.taxRate || 18,
      items: invoice?.items || [],
      notes: invoice?.notes || "",
    },
  });

  const { fields, append, remove } = useForm().watch();

  const calculateTotals = () => {
    const items = form.watch("items");
    let subtotal = 0;
    let discountTotal = 0;

    items.forEach((item) => {
      const itemTotal = item.quantity * item.unitPrice;
      subtotal += itemTotal;

      if (item.discountType === "percentage") {
        discountTotal += (itemTotal * item.discountValue) / 100;
      } else if (item.discountType === "amount") {
        discountTotal += item.discountValue;
      }
    });

    const taxRate = form.watch("taxRate");
    const taxAmount = ((subtotal - discountTotal) * taxRate) / 100;
    const total = subtotal - discountTotal + taxAmount;

    return { subtotal, discountTotal, taxAmount, total };
  };

  const totals = calculateTotals();

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      productId: "",
      productName: "",
      quantity: 1,
      unitPrice: 0,
      discountType: "none",
      discountValue: 0,
    };
    const items = form.getValues("items");
    form.setValue("items", [...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const items = form.getValues("items");
    form.setValue(
      "items",
      items.filter((_, i) => i !== index)
    );
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      const items = form.getValues("items");
      items[index].productId = productId;
      items[index].productName = product.name;
      const priceStr = product.price.replace("₺", "").replace(".", "").trim();
      items[index].unitPrice = parseFloat(priceStr) || 0;
      form.setValue("items", items);
    }
  };

  const handleSubmit = (data: InvoiceFormData) => {
    onSubmit(data);
    toast({
      title: isEditing ? "Fatura Güncellendi" : "Fatura Oluşturuldu",
      description: `Fatura başarıyla ${isEditing ? "güncellendi" : "oluşturuldu"}.`,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? "Faturayı Düzenle" : "Yeni Fatura Oluştur"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing ? "Fatura bilgilerini güncelleyin." : "Müşteri için yeni fatura oluşturun."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Customer & Subscription */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Müşteri</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Müşteri seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
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
                name="subscriptionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Abonelik (Opsiyonel)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Abonelik seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Seçmeyin</SelectItem>
                        {subscriptions.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.planName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fatura Tarihi</FormLabel>
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
                            {field.value
                              ? format(field.value, "dd MMM yyyy", { locale: tr })
                              : "Tarih seçin"}
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
                          className="p-3"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ödeme Tarihi</FormLabel>
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
                            {field.value
                              ? format(field.value, "dd MMM yyyy", { locale: tr })
                              : "Tarih seçin"}
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
                          className="p-3"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tax Rate */}
            <FormField
              control={form.control}
              name="taxRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vergi Oranı (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      className="bg-background border-border"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Items Section */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <FormLabel className="text-base font-semibold">Fatura Kalemleri</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Kalem Ekle
                </Button>
              </div>

              <div className="space-y-3 max-h-48 overflow-y-auto border border-border rounded-lg p-3 bg-background">
                {form.watch("items").map((item, index) => (
                  <div key={index} className="space-y-2 p-3 border border-border/50 rounded-lg bg-muted/30">
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-6">
                        <label className="text-xs font-medium text-muted-foreground">Ürün</label>
                        <Select
                          value={item.productId}
                          onValueChange={(val) => handleProductSelect(index, val)}
                        >
                          <SelectTrigger className="h-8 text-xs bg-background border-border">
                            <SelectValue placeholder="Ürün seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-3">
                        <label className="text-xs font-medium text-muted-foreground">Miktar</label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const items = form.getValues("items");
                            items[index].quantity = parseInt(e.target.value) || 1;
                            form.setValue("items", items);
                          }}
                          className="h-8 text-xs bg-background border-border"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="text-xs font-medium text-muted-foreground">Fiyat</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const items = form.getValues("items");
                            items[index].unitPrice = parseFloat(e.target.value) || 0;
                            form.setValue("items", items);
                          }}
                          className="h-8 text-xs bg-background border-border"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-xs text-destructive hover:text-destructive/80"
                    >
                      <X className="h-3 w-3" /> Sil
                    </button>
                  </div>
                ))}
              </div>
              <FormMessage />
            </div>

            {/* Totals Display */}
            <div className="border border-border rounded-lg p-4 bg-muted/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ara Toplam:</span>
                <span className="font-medium">₺{totals.subtotal.toFixed(2)}</span>
              </div>
              {totals.discountTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">İndirim:</span>
                  <span className="font-medium text-destructive">-₺{totals.discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vergi ({form.watch("taxRate")}%):</span>
                <span className="font-medium">₺{totals.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                <span>Toplam:</span>
                <span className="text-primary">₺{totals.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notlar</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Fatura notları..."
                      className="bg-background border-border"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                İptal
              </Button>
              <Button type="submit">{isEditing ? "Güncelle" : "Oluştur"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
