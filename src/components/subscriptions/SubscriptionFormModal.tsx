import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Subscription, Customer, Plan } from "@/types";

const subscriptionSchema = z.object({
  customerId: z.string().min(1, "Müşteri seçiniz"),
  planId: z.string().min(1, "Abonelik planı seçiniz"),
  billingCycle: z.enum(["monthly", "yearly", "trial"], { required_error: "Faturalama döngüsü seçiniz" }),
  status: z.enum(["active", "cancelled", "expired", "trial", "pending"], { required_error: "Durum seçiniz" }),
  startDate: z.date({ required_error: "Başlangıç tarihi seçiniz" }),
  nextBillingDate: z.date().optional(),
  trialEndDate: z.date().optional(),
  autoRenew: z.boolean().default(true),

  // iyzico/Paynet API fields
  name_surname: z.string().min(2, "İsim ve soyisim giriniz"),
  amount: z.string().min(1, "Tutar giriniz").regex(/^[\d.,]+$/, "Geçerli bir tutar giriniz"),
  interval: z.number().min(0).max(3, "Geçersiz interval").default(2),
  interval_count: z.number().min(1, "En az 1 olmalıdır"),
  begin_date: z.date({ required_error: "Başlangıç tarihi seçiniz" }),
  reference_no: z.string().min(1, "Referans numarası giriniz"),
  end_user_email: z.string().email("Geçerli bir email giriniz"),
  end_user_gsm: z.string().min(10, "Geçerli bir GSM numarası giriniz"),
  agent_id: z.string().optional(),
  agent_amount: z.string().optional(),
  company_amount: z.string().optional(),
  end_user_desc: z.string().min(1, "Açıklama giriniz"),
  add_comission_to_amount: z.boolean().default(false),
  currency: z.string().default("TRY"),
  period: z.number().optional(),
  user_name: z.string().optional(),
  agent_note: z.string().optional(),
  confirmation_webhook: z.string().url().optional().or(z.literal("")),
  suceed_webhook: z.string().url().optional().or(z.literal("")),
  error_webhook: z.string().url().optional().or(z.literal("")),
  confirmation_redirect_url: z.string().url().optional().or(z.literal("")),
  send_mail: z.boolean().default(false),
  send_sms: z.boolean().default(false),
  is_fixed_price: z.boolean().default(true),
  agent_logo: z.string().optional(),
  attempt_day_count: z.number().min(1).max(30).default(3),
  daily_attempt_count: z.number().min(1).max(10).default(3),
  is_charge_on_card_confirmation: z.boolean().default(false),
  group_reference_no: z.string().max(50).optional(),
  otp_control: z.boolean().default(false),
});

export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

interface SubscriptionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: Subscription | null;
  customers: Customer[];
  plans: Plan[];
  onSubmit: (data: SubscriptionFormData) => void;
}

export function SubscriptionFormModal({
  open,
  onOpenChange,
  subscription,
  customers,
  plans,
  onSubmit,
}: SubscriptionFormModalProps) {
  const { toast } = useToast();
  const isEditing = !!subscription;

  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      customerId: subscription?.customerId || "",
      planId: subscription?.planId || "",
      billingCycle: subscription?.billingCycle || undefined,
      status: subscription?.status || undefined,
      startDate: subscription?.startDate ? new Date(subscription.startDate) : undefined,
      nextBillingDate: subscription?.nextBillingDate ? new Date(subscription.nextBillingDate) : undefined,
      trialEndDate: subscription?.trialEndDate ? new Date(subscription.trialEndDate) : undefined,
      autoRenew: subscription?.autoRenew ?? true,

      // iyzico/Paynet API defaults
      name_surname: subscription?.name_surname || "",
      amount: subscription?.amount || "",
      interval: subscription?.interval ?? 2,
      interval_count: subscription?.interval_count || 12,
      begin_date: subscription?.begin_date ? new Date(subscription.begin_date) : undefined,
      reference_no: subscription?.reference_no || "",
      end_user_email: subscription?.end_user_email || "",
      end_user_gsm: subscription?.end_user_gsm || "",
      agent_id: subscription?.agent_id || "",
      agent_amount: subscription?.agent_amount || "",
      company_amount: subscription?.company_amount || "",
      end_user_desc: subscription?.end_user_desc || "",
      add_comission_to_amount: subscription?.add_comission_to_amount ?? false,
      currency: subscription?.currency || "TRY",
      period: subscription?.period || 0,
      user_name: subscription?.user_name || "",
      agent_note: subscription?.agent_note || "",
      confirmation_webhook: subscription?.confirmation_webhook || "",
      suceed_webhook: subscription?.suceed_webhook || "",
      error_webhook: subscription?.error_webhook || "",
      confirmation_redirect_url: subscription?.confirmation_redirect_url || "",
      send_mail: subscription?.send_mail ?? false,
      send_sms: subscription?.send_sms ?? false,
      is_fixed_price: subscription?.is_fixed_price ?? true,
      agent_logo: subscription?.agent_logo || "",
      attempt_day_count: subscription?.attempt_day_count ?? 3,
      daily_attempt_count: subscription?.daily_attempt_count ?? 3,
      is_charge_on_card_confirmation: subscription?.is_charge_on_card_confirmation ?? false,
      group_reference_no: subscription?.group_reference_no || "",
      otp_control: subscription?.otp_control ?? false,
    },
  });

  const selectedBillingCycle = form.watch("billingCycle");
  const selectedPlanId = form.watch("planId");
  const selectedCustomerId = form.watch("customerId");
  
  // Filter plans by selected customer
  const availablePlans = plans.filter((p) => p.customerId === selectedCustomerId);
  
  // Reset plan selection when customer changes
  React.useEffect(() => {
    if (selectedCustomerId && form.getValues("planId")) {
      const currentPlanId = form.getValues("planId");
      const planStillAvailable = availablePlans.some((p) => p.id === currentPlanId);
      if (!planStillAvailable) {
        form.setValue("planId", "");
      }
    }
  }, [selectedCustomerId, availablePlans, form]);

  const calculateNextBillingDate = (startDate: Date, billingCycle: "monthly" | "yearly" | "trial") => {
    const nextDate = new Date(startDate);
    if (billingCycle === "monthly") {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (billingCycle === "yearly") {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }
    return nextDate;
  };

  const handleBillingCycleChange = (value: "monthly" | "yearly" | "trial") => {
    form.setValue("billingCycle", value);
    const startDate = form.getValues("startDate");
    if (startDate && value !== "trial") {
      const nextBilling = calculateNextBillingDate(startDate, value);
      form.setValue("nextBillingDate", nextBilling);
    } else if (value === "trial") {
      const trialEnd = startDate ? new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000) : undefined;
      form.setValue("trialEndDate", trialEnd);
    }
  };

  const handleStartDateChange = (date: Date | undefined) => {
    form.setValue("startDate", date);
    if (date && selectedBillingCycle) {
      if (selectedBillingCycle === "trial") {
        const trialEnd = new Date(date.getTime() + 14 * 24 * 60 * 60 * 1000);
        form.setValue("trialEndDate", trialEnd);
      } else {
        const nextBilling = calculateNextBillingDate(date, selectedBillingCycle);
        form.setValue("nextBillingDate", nextBilling);
      }
    }
  };

  const handleSubmit = (data: SubscriptionFormData) => {
    onSubmit(data);
    toast({
      title: isEditing ? "Abonelik Güncellendi" : "Abonelik Oluşturuldu",
      description: `Abonelik başarıyla ${isEditing ? "güncellendi" : "oluşturuldu"}.`,
    });
    form.reset();
    onOpenChange(false);
  };

  const selectedPlan = availablePlans.find((p) => p.id === selectedPlanId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[700px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? "Aboneliği Düzenle" : "Yeni Abonelik Oluştur"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing
              ? "Abonelik bilgilerini güncelleyin."
              : "Yeni bir abonelik oluşturmak için formu doldurun."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Temel Bilgiler</TabsTrigger>
                <TabsTrigger value="payment">Ödeme Ayarları</TabsTrigger>
                <TabsTrigger value="advanced">Gelişmiş</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                {/* Customer Selection */}
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

                {/* Plan Selection */}
                <FormField
                  control={form.control}
                  name="planId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Abonelik Planı</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={!selectedCustomerId}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background border-border">
                            <SelectValue placeholder={selectedCustomerId ? "Plan seçin" : "Önce müşteri seçin"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availablePlans.length > 0 ? (
                            availablePlans.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id}>
                                {plan.name} - {plan.monthlyPrice}/ay
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                              {selectedCustomerId ? "Bu müşteriye ait plan bulunmamaktadır" : "Önce müşteri seçin"}
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      {selectedPlan && (
                        <div className="text-xs text-muted-foreground mt-1 space-y-1">
                          {selectedPlan.description && <p>{selectedPlan.description}</p>}
                          {selectedPlan.projectName && <p>Proje: {selectedPlan.projectName}</p>}
                          {selectedPlan.productNames && selectedPlan.productNames.length > 0 && (
                            <p>Ürünler: {selectedPlan.productNames.join(", ")}</p>
                          )}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Billing Cycle & Status Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="billingCycle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Faturalama Döngüsü</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleBillingCycleChange(value as "monthly" | "yearly" | "trial");
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background border-border">
                              <SelectValue placeholder="Döngü seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="monthly">Aylık</SelectItem>
                            <SelectItem value="yearly">Yıllık</SelectItem>
                            <SelectItem value="trial">Deneme (14 gün)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            <SelectItem value="trial">Deneme</SelectItem>
                            <SelectItem value="pending">Beklemede</SelectItem>
                            <SelectItem value="cancelled">İptal Edildi</SelectItem>
                            <SelectItem value="expired">Süresi Doldu</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Start Date */}
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Başlangıç Tarihi</FormLabel>
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
                              {field.value ? (
                                format(field.value, "dd MMM yyyy", { locale: tr })
                              ) : (
                                <span>Tarih seçin</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              if (date) handleStartDateChange(date);
                            }}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Auto Renew */}
                <FormField
                  control={form.control}
                  name="autoRenew"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Otomatik Yenileme</FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Abonelik süresi dolduğunda otomatik olarak yenilensin
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="payment" className="space-y-4 mt-4">
                {/* Name Surname */}
                <FormField
                  control={form.control}
                  name="name_surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad Soyad</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Müşteri adı soyadı" className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Amount & Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tutar</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="0.00" className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Para Birimi</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Para birimi" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="TRY">TRY</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Email & GSM */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="end_user_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-posta</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="ornek@email.com" className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end_user_gsm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GSM</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="5XXXXXXXXX" className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Reference No & Description */}
                <FormField
                  control={form.control}
                  name="reference_no"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referans No</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Benzersiz referans numarası" className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_user_desc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Açıklama</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ödeme açıklaması" className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Interval Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="interval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Periyot Tipi</FormLabel>
                        <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Periyot tipi" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">Günlük</SelectItem>
                            <SelectItem value="1">Haftalık</SelectItem>
                            <SelectItem value="2">Aylık</SelectItem>
                            <SelectItem value="3">Yıllık</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="interval_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Periyot Sayısı</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className="bg-background" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Notification Options */}
                <div className="flex gap-6">
                  <FormField
                    control={form.control}
                    name="send_mail"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal">E-posta Gönder</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="send_sms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal">SMS Gönder</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 mt-4">
                {/* Agent Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="agent_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bayi ID</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Bayi ID" className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="agent_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bayi Tutarı</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="0.00" className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Webhooks */}
                <FormField
                  control={form.control}
                  name="confirmation_webhook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Onay Webhook URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="suceed_webhook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Başarı Webhook URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="error_webhook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hata Webhook URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Retry Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="attempt_day_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deneme Gün Sayısı</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className="bg-background" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="daily_attempt_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Günlük Deneme Sayısı</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className="bg-background" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Additional Options */}
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="is_fixed_price"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal">Sabit Fiyat</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="add_comission_to_amount"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal">Komisyonu Tutara Ekle</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is_charge_on_card_confirmation"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal">Kart Onayında Çekim Yap</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="otp_control"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal">OTP Kontrolü</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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