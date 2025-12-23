import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  Plus,
  Trash2,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { CustomerCard } from "@/types";

const cardSchema = z.object({
  cardholderName: z.string().min(2, "Kart sahibi adı gereklidir"),
  bankName: z.string().optional(), // Banka adı (Garanti, TEB, Akbank, vb.)
  cardNumber: z
    .string()
    .regex(/^\d{13,19}$/, "Geçerli bir kart numarası giriniz")
    .or(z.literal("")),
  expiryMonth: z.number().min(1).max(12, "Ay 1-12 arasında olmalıdır"),
  expiryYear: z.number().min(new Date().getFullYear(), "Geçmiş yıl girilemez"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV 3-4 haneli olmalıdır").optional(),
});

export type CardFormData = z.infer<typeof cardSchema>;

export interface CustomerCardsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerName: string;
  cards?: CustomerCard[];
  defaultCardId?: string;
  onAddCard?: (card: CustomerCard) => void;
  onDeleteCard?: (cardId: string) => void;
  onSetDefault?: (cardId: string) => void;
  onCardAdded?: () => void;
}

export function CustomerCardsModal({
  open,
  onOpenChange,
  customerId,
  customerName,
  cards = [],
  defaultCardId,
  onAddCard,
  onDeleteCard,
  onSetDefault,
  onCardAdded,
}: CustomerCardsModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCVV, setShowCVV] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const form = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cardholderName: "",
      cardNumber: "",
      expiryMonth: 1,
      expiryYear: new Date().getFullYear(),
      cvv: "",
    },
  });

  const onSubmit = (data: CardFormData) => {
    // Maskelenmiş kart numarası (son 4 hane)
    const cardNumberLast4 = data.cardNumber
      .slice(-4)
      .padStart(data.cardNumber.length, "*");

    // Kart markasını belirle
    let cardBrand: "visa" | "mastercard" | "amex" | "other" = "other";
    const firstDigit = data.cardNumber.charAt(0);
    if (firstDigit === "4") {
      cardBrand = "visa";
    } else if (firstDigit === "5") {
      cardBrand = "mastercard";
    } else if (firstDigit === "3") {
      cardBrand = "amex";
    }

    const newCard: CustomerCard = {
      id: `CARD-${Date.now()}`,
      customerId,
      cardholderName: data.cardholderName,
      bankName: data.bankName, // Banka adı (Garanti, TEB, Akbank vb.)
      cardNumber: cardNumberLast4,
      cardNumberFull: data.cardNumber, // In real app, encrypt this on server
      expiryMonth: data.expiryMonth,
      expiryYear: data.expiryYear,
      cardBrand,
      cvv: data.cvv, // In real app, handle on server only
      isDefault: cards.length === 0, // First card is default
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddCard(newCard);
    form.reset();
    setShowAddForm(false);
    toast({
      title: "Başarılı",
      description: "Kart başarıyla eklendi",
    });
  };

  const handleDelete = (cardId: string) => {
    if (confirm("Bu kartı silmek istediğinizden emin misiniz?")) {
      onDeleteCard(cardId);
      toast({
        title: "Başarılı",
        description: "Kart silindi",
      });
    }
  };

  const handleSetDefault = (cardId: string) => {
    onSetDefault(cardId);
    toast({
      title: "Başarılı",
      description: "Varsayılan kart güncellendi",
    });
  };

  const getCardBrandColor = (brand: string) => {
    switch (brand) {
      case "visa":
        return "bg-blue-100 text-blue-800";
      case "mastercard":
        return "bg-red-100 text-red-800";
      case "amex":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCardBrandLabel = (brand: string) => {
    switch (brand) {
      case "visa":
        return "Visa";
      case "mastercard":
        return "Mastercard";
      case "amex":
        return "American Express";
      default:
        return "Diğer";
    }
  };

  const isCardExpired = (month: number, year: number) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    return year < currentYear || (year === currentYear && month < currentMonth);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {customerName} - Ödeme Kartları
          </DialogTitle>
          <DialogDescription>
            Müşterinin kayıtlı kredi/debit kartlarını yönetin
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cards">Kartlar ({cards.length})</TabsTrigger>
            <TabsTrigger value="add">Yeni Kart Ekle</TabsTrigger>
          </TabsList>

          {/* Cards List Tab */}
          <TabsContent value="cards" className="space-y-4">
            {cards.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Henüz kart eklenmemiş</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cards.map((card) => {
                  const isExpired = isCardExpired(card.expiryMonth, card.expiryYear);
                  const isDefault = card.id === defaultCardId;

                  return (
                    <div
                      key={card.id}
                      className={`p-4 rounded-lg border ${
                        isDefault
                          ? "border-primary bg-primary/5"
                          : "border-border bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              {card.cardholderName}
                            </span>
                            {card.bankName && (
                              <Badge variant="outline">
                                {card.bankName}
                              </Badge>
                            )}
                            {isDefault && (
                              <Badge className="bg-primary text-primary-foreground">
                                <Check className="h-3 w-3 mr-1" />
                                Varsayılan
                              </Badge>
                            )}
                            <Badge className={getCardBrandColor(card.cardBrand)}>
                              {getCardBrandLabel(card.cardBrand)}
                            </Badge>
                            {isExpired && (
                              <Badge variant="destructive">Süresi Dolmuş</Badge>
                            )}
                          </div>

                          <div className="space-y-1 text-sm">
                            <p className="text-muted-foreground">
                              Kart Numarası: {card.cardNumber}
                            </p>
                            <p className="text-muted-foreground">
                              Son Kullanma: {card.expiryMonth}/{card.expiryYear}
                            </p>
                            {card.binNumber && (
                              <p className="text-xs text-muted-foreground">
                                BIN: {card.binNumber}
                              </p>
                            )}
                            {card.lastUsedAt && (
                              <p className="text-xs text-muted-foreground">
                                Son Kullanım:{" "}
                                {new Date(card.lastUsedAt).toLocaleDateString(
                                  "tr-TR"
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {!isDefault && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSetDefault(card.id)}
                              disabled={isExpired}
                              title={
                                isExpired
                                  ? "Süresi dolmuş kart varsayılan yapılamaz"
                                  : "Varsayılan kart yap"
                              }
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(card.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Add Card Tab */}
          <TabsContent value="add" className="space-y-4">
            {!showAddForm ? (
              <Button
                className="w-full"
                onClick={() => setShowAddForm(true)}
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Kart Ekle
              </Button>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cardholderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kart Sahibi Adı</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Adı Soyadı"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banka Adı (İsteğe Bağlı)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Garanti, TEB, Akbank vb."
                              {...field}
                              value={field.value || ""}
                              list="bank-names"
                            />
                            <datalist id="bank-names">
                              <option value="Garanti BBVA" />
                              <option value="TEB" />
                              <option value="Akbank" />
                              <option value="Halkbank" />
                              <option value="İş Bankası" />
                              <option value="Ziraat Bankası" />
                              <option value="DenizBank" />
                              <option value="Yapi Kredi" />
                              <option value="ING Bank" />
                              <option value="Santander" />
                              <option value="Albaraka" />
                              <option value="ICBC Turkey" />
                            </datalist>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kart Numarası</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="1234 5678 9012 3456"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              field.onChange(value);
                            }}
                            inputMode="numeric"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="expiryMonth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ay</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="12"
                              placeholder="MM"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expiryYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Yıl</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={new Date().getFullYear()}
                              placeholder="YYYY"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="cvv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showCVV["cvv"] ? "text" : "password"}
                              placeholder="123"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                field.onChange(value);
                              }}
                              inputMode="numeric"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowCVV({
                                  ...showCVV,
                                  cvv: !showCVV["cvv"],
                                })
                              }
                              className="absolute right-2 top-1/2 -translate-y-1/2"
                            >
                              {showCVV["cvv"] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      Kartı Kaydet
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false);
                        form.reset();
                      }}
                    >
                      İptal
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
