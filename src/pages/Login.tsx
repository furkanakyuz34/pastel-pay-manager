import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Zap } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real app, this would be an API call
      console.log("Login attempt:", data);
      
      // Mock successful login
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", data.email);
      
      toast({
        title: "Giriş Başarılı",
        description: "Hoş geldiniz!",
      });
      
      setIsLoading(false);
      navigate("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4 lg:p-6">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-6 lg:mb-8">
          <div className="flex justify-center mb-3 lg:mb-4">
            <div className="flex h-14 w-14 lg:h-16 lg:w-16 items-center justify-center rounded-xl lg:rounded-2xl bg-primary shadow-md lg:shadow-lg shadow-primary/20">
              <Zap className="h-7 w-7 lg:h-8 lg:w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1 lg:mb-2">
            Egemen Yazılım
          </h1>
          <p className="text-base lg:text-lg font-semibold text-primary mb-1">
            License Manager
          </p>
          <p className="text-xs lg:text-sm text-muted-foreground">
            Abonelik ve lisans yönetim sistemi
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-lg lg:rounded-xl shadow-md lg:shadow-lg p-6 lg:p-8 space-y-4 lg:space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Hoş Geldiniz
            </h2>
            <p className="text-sm text-muted-foreground">
              Devam etmek için hesabınıza giriş yapın
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="ornek@email.com"
                          className="pl-10 bg-background border-border"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 bg-background border-border"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  Beni hatırla
                </label>
                <a
                  href="#"
                  className="text-sm text-primary hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    toast({
                      title: "Şifre Sıfırlama",
                      description: "Şifre sıfırlama özelliği yakında eklenecek.",
                    });
                  }}
                >
                  Şifremi unuttum
                </a>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>
          </Form>

          {/* Demo Credentials */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              Demo için herhangi bir e-posta ve şifre kullanabilirsiniz
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>© 2024 Egemen Yazılım. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

