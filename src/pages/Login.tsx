import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Lock, User, Zap } from "lucide-react";
import { useLoginMutation } from "@/services/authApi";
import { useToast as useCustomToast } from "@/hooks/use-toast";
import { getNameFromToken } from "@/lib/jwt";
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

const loginSchema = z.object({
  kullaniciId: z.string().pipe(z.coerce.number().int("Kullanıcı ID sayı olmalıdır").positive("Geçerli bir kullanıcı ID giriniz")),
  sifre: z.string().min(1, "Şifre gerekli"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useCustomToast();
  const [login, { isLoading }] = useLoginMutation();

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
      kullaniciId: 0,
      sifre: "",
    },
  });

  const handleSubmit = async (data: LoginFormData) => {
    try {
      const response = await login({
        kullaniciId: data.kullaniciId,
        sifre: data.sifre,
      }).unwrap();

      // Başarılı login - response.data içinde accessToken var
      const token = response.data.accessToken;
      
      // Token'dan kullanıcı bilgilerini al
      const kullaniciAdi = getNameFromToken(token);
      
      // localStorage'a kaydet
      localStorage.setItem("authToken", token);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("kullaniciId", data.kullaniciId.toString());
      if (kullaniciAdi) {
        localStorage.setItem("kullaniciAdi", kullaniciAdi);
      }

      toast({
        title: "Giriş Başarılı",
        description: response.message,
      });

      navigate("/", { replace: true });
    } catch (error: any) {
      let errorMessage = "Giriş başarısız";
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
    }
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
              {/* Kullanıcı ID */}
              <FormField
                control={form.control}
                name="kullaniciId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kullanıcı ID</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="1"
                          className="pl-10 bg-background border-border"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Şifre */}
              <FormField
                control={form.control}
                name="sifre"
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
              Demo kullanıcı için kullanıcı ID'sini ve şifresini giriniz
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

