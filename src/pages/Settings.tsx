import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Building, 
  CreditCard, 
  Bell, 
  Shield, 
  Palette,
  Save
} from "lucide-react";

const SettingsPage = () => {
  return (
    <MainLayout>
      <Header title="Ayarlar" subtitle="Hesap ve uygulama ayarlarınızı yönetin" />
      
      <div className="p-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sidebar Navigation */}
          <div className="space-y-2">
            <SettingsNavItem icon={User} label="Profil" active />
            <SettingsNavItem icon={Building} label="Şirket Bilgileri" />
            <SettingsNavItem icon={CreditCard} label="Ödeme Ayarları" />
            <SettingsNavItem icon={Bell} label="Bildirimler" />
            <SettingsNavItem icon={Shield} label="Güvenlik" />
            <SettingsNavItem icon={Palette} label="Görünüm" />
          </div>

          {/* Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Section */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-card animate-slide-up">
              <h3 className="text-lg font-semibold text-foreground mb-4">Profil Bilgileri</h3>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Ad Soyad
                    </label>
                    <input
                      type="text"
                      defaultValue="Ahmet Yılmaz"
                      className="h-10 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      E-posta
                    </label>
                    <input
                      type="email"
                      defaultValue="ahmet@lisanspro.com"
                      className="h-10 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    defaultValue="+90 532 123 45 67"
                    className="h-10 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Paynet Integration */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: "100ms" }}>
              <h3 className="text-lg font-semibold text-foreground mb-4">Paynet Entegrasyonu</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Merchant ID
                  </label>
                  <input
                    type="text"
                    placeholder="Paynet Merchant ID'nizi girin"
                    className="h-10 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    API Anahtarı
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••"
                    className="h-10 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/10 p-3">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-sm text-success font-medium">Paynet bağlantısı aktif</span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Değişiklikleri Kaydet
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

interface SettingsNavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

function SettingsNavItem({ icon: Icon, label, active }: SettingsNavItemProps) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-primary text-primary-foreground shadow-orange"
          : "text-foreground hover:bg-secondary"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

export default SettingsPage;
