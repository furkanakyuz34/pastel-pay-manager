import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Customer, Project, Product, Plan } from "@/types";

const planSchema = z.object({
  name: z.string().min(2, "Plan adı en az 2 karakter olmalıdır").max(100, "Plan adı en fazla 100 karakter olabilir"),
  description: z.string().optional(),
  projectId: z.string().min(1, "Proje seçiniz"),
  productIds: z.array(z.string()).min(1, "En az bir ürün seçiniz"),
  monthlyPrice: z.string().min(1, "Aylık fiyat giriniz").regex(/^[\d.,]+$/, "Geçerli bir fiyat giriniz"),
  yearlyPrice: z.string().min(1, "Yıllık fiyat giriniz").regex(/^[\d.,]+$/, "Geçerli bir fiyat giriniz"),
  features: z.string().optional(),
  status: z.enum(["active", "inactive"], { required_error: "Durum seçiniz" }),
  trialDays: z.number().min(0).max(30).default(14),
});

export type PlanFormData = z.infer<typeof planSchema>;

interface PlanFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: Plan | null;
  customers: Customer[];
  projects: Project[];
  products: Product[];
  onSubmit: (data: PlanFormData) => void;
}

export function PlanFormModal({
  open,
  onOpenChange,
  plan,
  customers,
  projects,
  products,
  onSubmit,
}: PlanFormModalProps) {
  const { toast } = useToast();
  const isEditing = !!plan;

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: plan?.name || "",
      description: plan?.description || "",
      projectId: plan?.projectId || "",
      productIds: plan?.productIds || [],
      monthlyPrice: plan?.monthlyPrice ? String(plan.monthlyPrice) : "",
      yearlyPrice: plan?.yearlyPrice ? String(plan.yearlyPrice) : "",
      features: plan?.features || "",
      status: plan?.status || undefined,
      trialDays: plan?.trialDays || 14,
    },
  });

  const selectedProjectId = form.watch("projectId");
  const availableProducts = products.filter((p) => p.projectId === selectedProjectId);
  const selectedProductIds = form.watch("productIds");

  const handleProductToggle = (productId: string) => {
    const currentIds = form.getValues("productIds");
    const newIds = currentIds.includes(productId)
      ? currentIds.filter((id) => id !== productId)
      : [...currentIds, productId];
    form.setValue("productIds", newIds);
  };

  const handleSubmit = (data: PlanFormData) => {
    onSubmit(data);
    toast({
      title: isEditing ? "Plan Güncellendi" : "Plan Oluşturuldu",
      description: `${data.name} planı başarıyla ${isEditing ? "güncellendi" : "oluşturuldu"}.`,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? "Planı Düzenle" : "Yeni Plan Oluştur"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing
              ? "Plan bilgilerini güncelleyin."
              : "Proje bazlı bir abonelik planı oluşturmak için formu doldurun."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

            {/* Project Selection */}
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proje</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            {/* Product Selection */}
            <FormField
              control={form.control}
              name="productIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Ürünler</FormLabel>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedProjectId
                        ? "Bu projeye ait ürünleri seçin"
                        : "Önce bir proje seçin"}
                    </p>
                  </div>
                  {selectedProjectId ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3 bg-background">
                      {availableProducts.length > 0 ? (
                        availableProducts.map((product) => (
                          <div key={product.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={product.id}
                              checked={selectedProductIds.includes(product.id)}
                              onCheckedChange={() => handleProductToggle(product.id)}
                            />
                            <label
                              htmlFor={product.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                            >
                              {product.name} - {product.price || `₺${product.basePrice?.toLocaleString("tr-TR")}`}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Bu projeye ait ürün bulunmamaktadır.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="border border-border rounded-lg p-3 bg-muted/30">
                      <p className="text-sm text-muted-foreground">
                        Ürün seçmek için önce bir proje seçin.
                      </p>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Plan Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Adı</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Premium Plan"
                      className="bg-background border-border"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Plan hakkında açıklama..."
                      className="bg-background border-border"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Monthly & Yearly Price Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monthlyPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aylık Fiyat (₺)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="1.000"
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
                name="yearlyPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yıllık Fiyat (₺)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="10.000"
                        className="bg-background border-border"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Trial Days */}
            <FormField
              control={form.control}
              name="trialDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deneme Süresi (Gün)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="30"
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

            {/* Features */}
            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Özellikler (Her satıra bir özellik)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Özellik 1&#10;Özellik 2&#10;Özellik 3"
                      className="bg-background border-border"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
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
                      <SelectItem value="inactive">Pasif</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isEditing ? "Güncelle" : "Oluştur"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

