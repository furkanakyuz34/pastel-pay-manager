import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Trash2, Percent, Users, ShoppingBag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductFormModal, ProductFormData } from "@/components/products/ProductFormModal";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { Project, Product } from "@/types";
import { formatCurrency, calculateFinalPrice, formatDiscountDisplay } from "@/lib/pricing";

const initialProducts: Product[] = [
  {
    id: "PRD-001",
    name: "Premium Paket",
    description: "Tüm özellikler dahil",
    projectId: "PRJ-001",
    projectName: "E-Ticaret Platformu",
    basePrice: 5000,
    currency: "TRY",
    status: "active",
    discountType: "percentage",
    discountValue: 10,
    finalPrice: 4500,
    discountAmount: 500,
    billingType: "recurring",
    recurringInterval: "monthly",
    trialDays: 14,
  },
  {
    id: "PRD-002",
    name: "Standart Paket",
    description: "Temel özellikler",
    projectId: "PRJ-001",
    projectName: "E-Ticaret Platformu",
    basePrice: 2500,
    currency: "TRY",
    status: "active",
    discountType: "none",
    discountValue: 0,
    finalPrice: 2500,
    billingType: "recurring",
    recurringInterval: "monthly",
  },
  {
    id: "PRD-003",
    name: "Mobil Uygulama Lisansı",
    description: "iOS ve Android lisansı",
    projectId: "PRJ-002",
    projectName: "Mobil Uygulama",
    basePrice: 3000,
    currency: "TRY",
    status: "active",
    discountType: "amount",
    discountValue: 300,
    finalPrice: 2700,
    discountAmount: 300,
    billingType: "one_time",
  },
  {
    id: "PRD-004",
    name: "API Erişim Paketi",
    description: "API entegrasyon paketi",
    projectId: "PRJ-004",
    projectName: "API Entegrasyonu",
    basePrice: 1500,
    currency: "TRY",
    status: "inactive",
    discountType: "percentage",
    discountValue: 20,
    finalPrice: 1200,
    discountAmount: 300,
    billingType: "recurring",
    recurringInterval: "yearly",
  },
];

const statusConfig = {
  active: { label: "Aktif", variant: "success" as const },
  inactive: { label: "Pasif", variant: "secondary" as const },
  discontinued: { label: "Üretimden Kaldırıldı", variant: "destructive" as const },
};

const billingTypeConfig = {
  one_time: { label: "Tek Seferlik", variant: "outline" as const },
  recurring: { label: "Tekrarlayan", variant: "default" as const },
};

interface ProductTableProps {
  onAddClick?: () => void;
  showAddButton?: boolean;
  projects: Project[];
  onCustomerPricingClick?: (product: Product) => void;
}

export function ProductTable({ onAddClick, showAddButton = false, projects, onCustomerPricingClick }: ProductTableProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedProduct) {
      setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
      toast({
        title: "Ürün Silindi",
        description: `${selectedProduct.name} ürünü başarıyla silindi.`,
      });
      setSelectedProduct(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleUpdateProduct = (data: ProductFormData) => {
    if (selectedProduct) {
      const project = projects.find((p) => p.id === data.projectId);
      const finalPrice = calculateFinalPrice(data.basePrice, data.discountType, data.discountValue);
      const discountAmount = data.basePrice - finalPrice;
      
      setProducts((prev) =>
        prev.map((p) =>
          p.id === selectedProduct.id
            ? {
                ...p,
                name: data.name,
                description: data.description,
                projectId: data.projectId,
                projectName: project?.name,
                basePrice: data.basePrice,
                currency: data.currency,
                status: data.status,
                discountType: data.discountType,
                discountValue: data.discountValue,
                discountValidFrom: data.discountValidFrom,
                discountValidUntil: data.discountValidUntil,
                finalPrice,
                discountAmount,
                billingType: data.billingType,
                recurringInterval: data.recurringInterval,
                trialDays: data.trialDays,
              }
            : p
        )
      );
      setSelectedProduct(null);
    }
  };

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-12 w-12" />}
        title="Ürün bulunamadı"
        description="Henüz hiç ürün oluşturulmamış. Yeni bir ürün oluşturmak için yukarıdaki butona tıklayın."
      />
    );
  }

  const renderPriceCell = (product: Product) => (
    <div className="space-y-1">
      {product.discountType !== "none" && product.discountValue > 0 ? (
        <>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {formatCurrency(product.finalPrice, product.currency)}
            </span>
            <Badge variant="destructive" className="text-xs">
              <Percent className="h-3 w-3 mr-1" />
              {formatDiscountDisplay(product.discountType, product.discountValue, product.currency)}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground line-through">
            {formatCurrency(product.basePrice, product.currency)}
          </span>
        </>
      ) : (
        <span className="text-sm font-medium text-foreground">
          {formatCurrency(product.basePrice, product.currency)}
        </span>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="p-4 rounded-lg border border-border bg-card space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground truncate">{product.id}</p>
              </div>
              <div className="flex gap-1">
                <Badge variant={statusConfig[product.status].variant} className="text-xs">
                  {statusConfig[product.status].label}
                </Badge>
                <Badge variant={billingTypeConfig[product.billingType].variant} className="text-xs">
                  {billingTypeConfig[product.billingType].label}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Proje</p>
                <Badge variant="outline" className="text-xs mt-1">{product.projectName || "-"}</Badge>
              </div>
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
              )}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Fiyat</p>
                {renderPriceCell(product)}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                Detay
              </Button>
              {onCustomerPricingClick && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCustomerPricingClick(product)}
                >
                  <Users className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(product)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(product)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Ürün
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Proje
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Faturalama
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Fiyat
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  İskonto
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Durum
                </th>
                <th className="px-4 xl:px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 xl:px-6 py-3">
                    <div>
                      <p className="font-medium text-sm text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.id}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3">
                    <Badge variant="outline" className="text-xs">{product.projectName || "-"}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3">
                    <div className="space-y-1">
                      <Badge variant={billingTypeConfig[product.billingType].variant} className="text-xs">
                        {billingTypeConfig[product.billingType].label}
                      </Badge>
                      {product.billingType === "recurring" && product.recurringInterval && (
                        <p className="text-xs text-muted-foreground">
                          {product.recurringInterval === "monthly" && "Aylık"}
                          {product.recurringInterval === "yearly" && "Yıllık"}
                          {product.recurringInterval === "weekly" && "Haftalık"}
                          {product.recurringInterval === "daily" && "Günlük"}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3">
                    {renderPriceCell(product)}
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3">
                    {product.discountType !== "none" && product.discountValue > 0 ? (
                      <div className="flex items-center gap-1">
                        <Percent className="h-3 w-3 text-destructive" />
                        <span className="text-sm text-destructive font-medium">
                          {product.discountType === "percentage" 
                            ? `%${product.discountValue}` 
                            : formatCurrency(product.discountValue, product.currency)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3">
                    <Badge variant={statusConfig[product.status].variant} className="text-xs">
                      {statusConfig[product.status].label}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Görüntüle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </DropdownMenuItem>
                        {onCustomerPricingClick && (
                          <DropdownMenuItem onClick={() => onCustomerPricingClick(product)}>
                            <Users className="mr-2 h-4 w-4" />
                            Müşteri Özel Fiyat
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(product)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <ProductFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        product={selectedProduct}
        projects={projects}
        onSubmit={handleUpdateProduct}
      />

      {/* Delete Dialog */}
      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        productName={selectedProduct?.name || ""}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
