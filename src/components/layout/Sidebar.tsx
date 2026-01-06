import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Repeat,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Package,
  Users,
  FolderKanban,
  ShoppingBag,
  FileText,
  BarChart3,
  Receipt,
  Tag,
  X,
  FileSignature,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Firmalar", path: "/firmalar" },
  { icon: FolderKanban, label: "Projeler", path: "/projeler" },
  { icon: ShoppingBag, label: "Proje Modülleri", path: "/proje-moduller" },
  { icon: FileSignature, label: "Sözleşmeler", path: "/sozlesmeler" },
  { icon: Repeat, label: "Abonelikler", path: "/subscriptions" },
  { icon: CreditCard, label: "Ödemeler", path: "/payments" },
  { icon: FileText, label: "Faturalar", path: "/invoices" },
  { icon: BarChart3, label: "Kullanım Takibi", path: "/usage" },
  { icon: Receipt, label: "Ödeme Geçmişi", path: "/billing-history" },
  { icon: Tag, label: "İskonto Yönetimi", path: "/discounts" },
  { icon: Package, label: "Abonelik Planları", path: "/plans" },
  { icon: Settings, label: "Ayarlar", path: "/settings" },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "h-screen w-64 bg-sidebar transition-all duration-300 ease-in-out lg:relative lg:z-40",
        collapsed && "lg:w-20"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link to="/" className="flex items-center gap-3" onClick={onClose}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-sidebar-foreground leading-tight">
                  Egemen Yazılım
                </span>
                <span className="text-xs text-sidebar-foreground/80 leading-tight">
                  License Manager
                </span>
              </div>
            )}
          </Link>
          {/* Mobile Close Button */}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Button - Desktop Only */}
        <div className="hidden lg:block border-t border-sidebar-border p-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Daralt</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
