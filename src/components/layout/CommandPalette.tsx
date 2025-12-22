import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Repeat,
  CreditCard,
  Users,
  Package,
  FolderKanban,
  ShoppingBag,
  Settings,
  FileText,
  BarChart3,
  Receipt,
  Tag,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Komut veya sayfa ara..." />
      <CommandList>
        <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>

        <CommandGroup heading="Gezinme">
          <CommandItem onSelect={() => handleNavigate("/")}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
            <CommandShortcut>G</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/subscriptions")}>
            <Repeat className="mr-2 h-4 w-4" />
            <span>Abonelikler</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/payments")}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Ödemeler</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/invoices")}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Faturalar</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/usage")}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Kullanım Takibi</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/billing-history")}>
            <Receipt className="mr-2 h-4 w-4" />
            <span>Ödeme Geçmişi</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/discounts")}>
            <Tag className="mr-2 h-4 w-4" />
            <span>İskonto Yönetimi</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/customers")}>
            <Users className="mr-2 h-4 w-4" />
            <span>Müşteriler</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/plans")}>
            <Package className="mr-2 h-4 w-4" />
            <span>Abonelik Planları</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/projects")}>
            <FolderKanban className="mr-2 h-4 w-4" />
            <span>Projeler</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/products")}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span>Ürünler</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Ayarlar</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Kısayollar">
          <CommandItem onSelect={() => handleNavigate("/customers")}>
            <Search className="mr-2 h-4 w-4" />
            <span>Müşteri Ara / Yönet</span>
            <CommandShortcut>Ctrl+M</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/plans")}>
            <Package className="mr-2 h-4 w-4" />
            <span>Planları Düzenle</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/subscriptions")}>
            <Repeat className="mr-2 h-4 w-4" />
            <span>Yeni Abonelik Oluştur</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}


