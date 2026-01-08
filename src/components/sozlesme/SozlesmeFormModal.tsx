import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SozlesmeDto, FirmaDto, ProjeDto, SozlesmeCreateRequest, SozlesmeUpdateRequest } from "@/types/backend";
import { useCreateSozlesmeMutation, useUpdateSozlesmeMutation } from "@/services/backendApi";
import { useToast } from "@/hooks/use-toast";

const sozlesmeSchema = z.object({
  firmaId: z.number().optional(),
  projeId: z.number().optional(),
  kullaniciSayisi: z.number().optional(),
  satisTarihi: z.string().optional(),
  satisFiyati: z.number().optional(),
  dovizId: z.string().optional(),
  lisansVer: z.boolean().optional(),
  otomatikInstall: z.boolean().optional(),
  demo: z.boolean().optional(),
  subeSayisi: z.number().optional(),
  iskonto: z.number().optional(),
  notu: z.string().optional(),
  dataServerIp: z.string().optional(),
  statikIp: z.string().optional(),
  klasor: z.string().optional(),
});

type SozlesmeFormData = z.infer<typeof sozlesmeSchema>;

interface SozlesmeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sozlesme?: SozlesmeDto | null;
  firmalar: FirmaDto[];
  projeler: ProjeDto[];
}

export function SozlesmeFormModal({
  open,
  onOpenChange,
  sozlesme,
  firmalar,
  projeler,
}: SozlesmeFormModalProps) {
  const { toast } = useToast();
  const [createSozlesme, { isLoading: isCreating }] = useCreateSozlesmeMutation();
  const [updateSozlesme, { isLoading: isUpdating }] = useUpdateSozlesmeMutation();
  const isLoading = isCreating || isUpdating;
  const isEdit = !!sozlesme;

  const form = useForm<SozlesmeFormData>({
    resolver: zodResolver(sozlesmeSchema),
    mode: "onSubmit",
    defaultValues: {
      firmaId: undefined,
      projeId: undefined,
      kullaniciSayisi: undefined,
      lisansVer: false,
      otomatikInstall: false,
      demo: false,
      dovizId: "TRY",
    },
  });

  useEffect(() => {
    if (sozlesme) {
      form.reset({
        firmaId: sozlesme.firmaId,
        projeId: sozlesme.projeId,
        kullaniciSayisi: sozlesme.kullaniciSayisi,
        satisTarihi: sozlesme.satisTarihi?.split("T")[0] || "",
        satisFiyati: sozlesme.satisFiyati,
        dovizId: sozlesme.dovizId || "TRY",
        lisansVer: sozlesme.lisansVer,
        otomatikInstall: sozlesme.otomatikInstall,
        demo: sozlesme.demo,
        subeSayisi: sozlesme.subeSayisi,
        iskonto: sozlesme.iskonto,
        notu: sozlesme.notu || "",
        dataServerIp: sozlesme.dataServerIp || "",
        statikIp: sozlesme.statikIp || "",
        klasor: sozlesme.klasor || "",
      }, { keepErrors: false });
    } else {
      form.reset({
        firmaId: undefined,
        projeId: undefined,
        kullaniciSayisi: undefined,
        lisansVer: false,
        otomatikInstall: false,
        demo: false,
        dovizId: "TRY",
      }, { keepErrors: false });
    }
  }, [sozlesme, form]);

  const onSubmit = async (data: SozlesmeFormData) => {
    try {
      if (isEdit && sozlesme) {
        const updateData: SozlesmeUpdateRequest = {
          SozlesmeId: sozlesme.sozlesmeId,
          FirmaId: data.firmaId,
          ProjeId: data.projeId,
          KullaniciSayisi: data.kullaniciSayisi,
          SatisTarihi: data.satisTarihi ? `${data.satisTarihi}T00:00:00` : undefined,
          SatisFiyati: data.satisFiyati,
          DovizId: data.dovizId === "TRY" ? "TL" : data.dovizId,
          LisansVer: data.lisansVer,
          OtomatikInstall: data.otomatikInstall,
          Demo: data.demo,
          SubeSayisi: data.subeSayisi,
          Iskonto: data.iskonto,
          Notu: data.notu,
          DataServerIp: data.dataServerIp,
          StatikIp: data.statikIp,
          Klasor: data.klasor,
          SatisKullaniciId: sozlesme.satisKullaniciId
          
        };
        await updateSozlesme({ sozlesmeId: sozlesme.sozlesmeId, data: updateData }).unwrap();
        toast({ title: "Başarılı", description: "Sözleşme güncellendi." });
      } else {
        const createData: SozlesmeCreateRequest = {
          FirmaId: data.firmaId,
          ProjeId: data.projeId,
          KullaniciSayisi: data.kullaniciSayisi,
          SatisTarihi: data.satisTarihi ? `${data.satisTarihi}T00:00:00` : undefined,
          SatisFiyati: data.satisFiyati,
          DovizId: data.dovizId === "TRY" ? "TL" : data.dovizId,
          LisansVer: data.lisansVer,
          OtomatikInstall: data.otomatikInstall,
          Demo: data.demo,
          SubeSayisi: data.subeSayisi,
          Iskonto: data.iskonto,
          Notu: data.notu,
          DataServerIp: data.dataServerIp,
          StatikIp: data.statikIp,
          Klasor: data.klasor,
          IlkSatisTarihi: data.satisTarihi ? `${data.satisTarihi}T00:00:00` : undefined,
          IlkSatisFiyati: data.satisFiyati,
          IlkDovizId: data.dovizId === "TRY" ? "TL" : data.dovizId,
          InsertKullaniciId: 20, // TODO: Get from auth context
          KullaniciId: 20,
          SatisKullaniciId: 20,
        };
        await createSozlesme(createData).unwrap();
        toast({ title: "Başarılı", description: "Sözleşme oluşturuldu." });
      }
      onOpenChange(false);
    } catch (err) {
      toast({ title: "Hata", description: "İşlem sırasında bir hata oluştu.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sözleşme Düzenle" : "Yeni Sözleşme"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firmaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firma</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Firma seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {firmalar.map((firma) => (
                          <SelectItem key={firma.firmaId} value={firma.firmaId.toString()}>
                            {firma.adi}
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
                name="projeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proje</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Proje seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projeler.map((proje) => (
                          <SelectItem key={proje.projeId} value={proje.projeId.toString()}>
                            {proje.adi}
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
                name="kullaniciSayisi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kullanıcı Sayısı</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subeSayisi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şube Sayısı</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="satisTarihi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Satış Tarihi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="satisFiyati"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Satış Fiyatı</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dovizId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Döviz</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Döviz seçiniz" />
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

              <FormField
                control={form.control}
                name="iskonto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İskonto (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        max={100}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="lisansVer"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <FormLabel htmlFor="lisansVer-switch" className="cursor-pointer">Lisans Ver</FormLabel>
                    <FormControl>
                      <Switch id="lisansVer-switch" checked={field.value ?? false} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="otomatikInstall"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <FormLabel htmlFor="otomatikInstall-switch" className="cursor-pointer">Otomatik Install</FormLabel>
                    <FormControl>
                      <Switch id="otomatikInstall-switch" checked={field.value ?? false} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="demo"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <FormLabel htmlFor="demo-switch" className="cursor-pointer">Demo</FormLabel>
                    <FormControl>
                      <Switch id="demo-switch" checked={field.value ?? false} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="dataServerIp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Server IP</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="192.168.1.1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="statikIp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statik IP</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="192.168.1.2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="klasor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Klasör</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="C:\Program Files\..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notlar</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Sözleşme notları..." rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Oluştur"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
