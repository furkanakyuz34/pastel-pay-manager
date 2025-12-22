import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomerFormModal, Customer, CustomerFormData } from "@/components/customers/CustomerFormModal";
import { DeleteCustomerDialog } from "@/components/customers/DeleteCustomerDialog";
import { CustomerDetailModal } from "@/components/customers/CustomerDetailModal";
import { Subscription } from "@/components/subscriptions/SubscriptionFormModal";
import { Payment } from "@/components/payments/PaymentFormModal";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { Users } from "lucide-react";

const initialCustomers: Customer[] = [
  {
    id: "CUS-001",
    name: "ABC Teknoloji A.Ş.",
    email: "info@abcteknoloji.com",
    phone: "+90 212 555 1234",
    company: "ABC Teknoloji",
    address: "İstanbul, Türkiye",
    status: "active",
  },
  {
    id: "CUS-002",
    name: "XYZ Yazılım Ltd.",
    email: "iletisim@xyzyazilim.com",
    phone: "+90 312 555 5678",
    company: "XYZ Yazılım",
    address: "Ankara, Türkiye",
    status: "active",
  },
  {
    id: "CUS-003",
    name: "Demo Şirketi",
    email: "demo@demo.com",
    phone: "+90 555 123 45 67",
    company: "Demo",
    status: "active",
  },
  {
    id: "CUS-004",
    name: "Mega Corp",
    email: "contact@megacorp.com",
    phone: "+90 216 555 9876",
    company: "Mega Corp",
    address: "İstanbul, Türkiye",
    status: "inactive",
  },
  {
    id: "CUS-005",
    name: "Startup Hub",
    email: "hello@startuphub.com",
    phone: "+90 232 555 4321",
    company: "Startup Hub",
    address: "İzmir, Türkiye",
    status: "active",
  },
];

const statusConfig = {
  active: { label: "Aktif", variant: "success" as const },
  inactive: { label: "Pasif", variant: "secondary" as const },
};

interface CustomerTableProps {
  onAddClick?: () => void;
  showAddButton?: boolean;
  subscriptions?: Subscription[];
  payments?: Payment[];
}

export function CustomerTable({ 
  onAddClick, 
  showAddButton = false,
  subscriptions = [],
  payments = [],
}: CustomerTableProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditModalOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCustomer) {
      setCustomers((prev) => prev.filter((c) => c.id !== selectedCustomer.id));
      toast({
        title: "Müşteri Silindi",
        description: `${selectedCustomer.name} müşterisi başarıyla silindi.`,
      });
      setSelectedCustomer(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleUpdateCustomer = (data: CustomerFormData) => {
    if (selectedCustomer) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === selectedCustomer.id
            ? {
                ...c,
                name: data.name,
                email: data.email,
                phone: data.phone,
                company: data.company,
                address: data.address,
                status: data.status,
              }
            : c
        )
      );
      setSelectedCustomer(null);
    }
  };

  if (customers.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-12 w-12" />}
        title="Müşteri bulunamadı"
        description="Henüz hiç müşteri eklenmemiş. Yeni bir müşteri eklemek için yukarıdaki butona tıklayın."
      />
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="p-4 rounded-lg border border-border bg-card space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{customer.name}</p>
                <p className="text-xs text-muted-foreground truncate">{customer.id}</p>
              </div>
              <Badge variant={statusConfig[customer.status].variant} className="text-xs">
                {statusConfig[customer.status].label}
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              {customer.company && (
                <p className="text-foreground">
                  <span className="text-muted-foreground">Şirket: </span>
                  {customer.company}
                </p>
              )}
              {customer.email && (
                <p className="text-foreground truncate">
                  <span className="text-muted-foreground">E-posta: </span>
                  {customer.email}
                </p>
              )}
              {customer.phone && (
                <p className="text-foreground">
                  <span className="text-muted-foreground">Telefon: </span>
                  {customer.phone}
                </p>
              )}
            </div>
            <div className="flex gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleView(customer)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Detay
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(customer)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(customer)}
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
                  Müşteri ID
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Müşteri Adı
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Şirket
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  İletişim
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
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3">
                    <p className="font-medium text-sm text-foreground">{customer.id}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3">
                    <p className="font-medium text-sm text-foreground">{customer.name}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3 text-sm text-foreground">
                    {customer.company || "-"}
                  </td>
                  <td className="px-4 xl:px-6 py-3">
                    <div className="text-xs lg:text-sm text-foreground">
                      {customer.email && <p className="truncate max-w-[200px]">{customer.email}</p>}
                      {customer.phone && (
                        <p className="text-muted-foreground">{customer.phone}</p>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3">
                    <Badge variant={statusConfig[customer.status].variant} className="text-xs">
                      {statusConfig[customer.status].label}
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
                        <DropdownMenuItem onClick={() => handleView(customer)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Detayları Görüntüle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(customer)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(customer)}
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
      <CustomerFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        customer={selectedCustomer}
        onSubmit={handleUpdateCustomer}
      />

      {/* Delete Dialog */}
      <DeleteCustomerDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        customerName={selectedCustomer?.name || ""}
        onConfirm={handleConfirmDelete}
      />

      {/* Detail Modal */}
      <CustomerDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        customer={selectedCustomer}
        subscriptions={subscriptions}
        payments={payments}
      />
    </>
  );
}

