// Backend API Types - Backend DTO'larına tam uyumlu tipler

// ==================== API Response Wrapper ====================
export interface BackendApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: BackendApiError;
  traceId?: string;
}

export interface BackendApiError {
  code: string;
  detail?: string;
}

// ==================== Firma (Müşteri) DTO ====================
export interface FirmaDto {
  firmaId: number;
  adi: string;
  yetkiliAdi?: string;
  adres1?: string;
  adres2?: string;
  adres3?: string;
  semt?: string;
  sehir?: string;
  vergiDairesi?: string;
  vergiHesapNo?: string;
  telefon1?: string;
  telefon2?: string;
  fax?: string;
  email?: string;
  notu?: string;
}

// Backend beklediği PascalCase formatı
export interface FirmaCreateRequest {
  FirmaId: number;
  Adi: string;
  YetkiliAdi?: string;
  Adres1?: string;
  Adres2?: string;
  Adres3?: string;
  Semt?: string;
  Sehir?: string;
  VergiDairesi?: string;
  VergiHesapNo?: string;
  Telefon1?: string;
  Telefon2?: string;
  Fax?: string;
  Email?: string;
  Notu?: string;
}

export interface FirmaUpdateRequest {
  Adi: string;
  YetkiliAdi?: string;
  Adres1?: string;
  Adres2?: string;
  Adres3?: string;
  Semt?: string;
  Sehir?: string;
  VergiDairesi?: string;
  VergiHesapNo?: string;
  Telefon1?: string;
  Telefon2?: string;
  Fax?: string;
  Email?: string;
  Notu?: string;
}

// ==================== Proje DTO ====================
export interface ProjeDto {
  projeId: number;
  adi: string;
}

// Backend beklediği PascalCase formatı
export interface ProjeCreateRequest {
  Adi: string;
}

export interface ProjeUpdateRequest {
  Adi: string;
}

// ==================== Proje Modül (Ürün) DTO ====================
export interface ProjeModulDto {
  projeModulId: number;
  projeId: number;
  adi: string;
  birimFiyat?: number;
  dovizId?: string;
  modulTipi?: number;
}

// Backend beklediği PascalCase formatı
export interface ProjeModulCreateRequest {
  ProjeId: number;
  Adi: string;
  BirimFiyat: number;
  DovizId: string;
  ModulTipi: number;
}

export interface ProjeModulUpdateRequest {
  Adi: string;
  BirimFiyat: number;
  DovizId: string;
  ModulTipi: number;
}

// ==================== Sözleşme (Abonelik) DTO ====================
export interface SozlesmeDto {
  sozlesmeId: number;
  firmaId?: number;
  projeId?: number;
  kullaniciSayisi?: number;
  satisTarihi?: string;
  satisFiyati?: number;
  dovizId?: string;
  lisansVer?: boolean;
  otomatikInstall?: boolean;
  satisKullaniciId?: number;
  dataServerIp?: string;
  statikIp?: string;
  klasor?: string;
  notu?: string;
  ilkSatisTarihi?: string;
  ilkSatisFiyati?: number;
  ilkDovizId?: string;
  demo: boolean;
  insertTarihi?: string;
  insertKullaniciId?: number;
  kullaniciId?: number;
  degisimTarihi?: string;
  subeSayisi?: number;
  iskonto?: number;
  // UI için ekstra alanlar (join ile gelecek)
  firmaAdi?: string;
  projeAdi?: string;
}

export interface SozlesmeCreateRequest {
  FirmaId?: number;
  ProjeId?: number;
  KullaniciSayisi?: number;
  SatisTarihi?: string;
  SatisFiyati?: number;
  DovizId?: string;
  LisansVer?: boolean;
  OtomatikInstall?: boolean;
  SatisKullaniciId?: number;
  DataServerIp?: string;
  StatikIp?: string;
  Klasor?: string;
  Notu?: string;
  IlkSatisTarihi?: string;
  IlkSatisFiyati?: number;
  IlkDovizId?: string;
  Demo?: boolean;
  InsertKullaniciId?: number;
  KullaniciId?: number;
  DegisimTarihi?: string;
  SubeSayisi?: number;
  Iskonto?: number;
}

export interface SozlesmeUpdateRequest {
  SozlesmeId: number;
  FirmaId?: number;
  ProjeId?: number;
  KullaniciSayisi?: number;
  SatisTarihi?: string;
  SatisFiyati?: number;
  DovizId?: string;
  LisansVer?: boolean;
  OtomatikInstall?: boolean;
  SatisKullaniciId?: number;
  DataServerIp?: string;
  StatikIp?: string;
  Klasor?: string;
  Notu?: string;
  IlkSatisTarihi?: string;
  IlkSatisFiyati?: number;
  IlkDovizId?: string;
  Demo?: boolean;
  SubeSayisi?: number;
  Iskonto?: number;
}

// ==================== Sözleşme Modül DTO ====================
export interface SozlesmeModulDto {
  sozlesmeId: number;
  projeId: number;
  projeModulId: number;
  adet: number;
  iskonto?: number;
  // UI için ekstra alanlar
  projeModulAdi?: string;
  birimFiyat?: number;
}

export interface SozlesmeModulCreateRequest {
  SozlesmeId: number;
  ProjeId: number;
  ProjeModulId: number;
  Adet: number;
  Iskonto?: number;
  InsertKullaniciId: number;
  KullaniciId: number;
}

export interface SozlesmeModulUpdateRequest {
  SozlesmeId: number;
  ProjeId: number;
  ProjeModulId: number;
  Adet: number;
  Iskonto?: number;
}

// ==================== Döviz Kuru DTO ====================
export interface DovizKuruResponse {
  kur: number;
}

// ==================== Sözleşme Ödeme Planı DTO ====================
export interface SozlesmePlanDto {
  sozlesmePlanId: number;
  sozlesmeId: number;
  subscriptionId?: string;
  nameSurname?: string;
  amount: number;
  usePaynet: boolean;
  status: number; // 0: Beklemede, 1: Onaylandı, 10: Confirmation, 11: Ödendi, 12: Hata
  insertTarihi?: string;
  pesinatDovizId?: string;
  pesinatDovizTutar?: number;
  pesinatDovizKur?: number;
}

export interface SozlesmePlanDetayDto {
  sozlesmePlanDetayId?: number;
  sozlesmePlanId: number;
  sira: number;
  invoiceId?: string;
  valDate?: string;
  amount: number;
  status: number; // 0: Beklemede, 10: Confirmation, 11: Ödendi, 12: Hata/Gecikmiş
  insertTarihi?: string;
}

export interface SozlesmePlanCreateRequest {
  SozlesmeId: number;
  UsePaynet: boolean;
  NameSurname: string;
  TotalAmount: number;
  Interval?: number;
  IntervalCount?: number;
  BeginDate?: string;
  ReferenceNo?: string;
  EndUserEmail?: string;
  EndUserGsm?: string;
  EndUserDesc?: string;
  AgentId?: string;
  AgentAmount?: number;
  CompanyAmount?: number;
  AddComissionToAmount?: boolean;
  Currency?: string;
  Period?: number;
  UserName?: string;
  AgentNote?: string;
  ConfirmationWebhook?: string;
  SuceedWebhook?: string;
  ErrorWebhook?: string;
  ConfirmationRedirectUrl?: string;
  SendMail?: boolean;
  SendSms?: boolean;
  IsFixedPrice?: boolean;
  AutoRenew?: boolean;
  AgentLogo?: string;
  AttemptDayCount?: number;
  DailyAttemptCount?: number;
  IsChargeOnCardConfirmation?: boolean;
  GroupReferenceNo?: string;
  OtpControl?: boolean;
  Items: SozlesmePlanItemRequest[];
  // Peşinat için doviz bilgileri
  PesinatDovizId?: string;
  PesinatDovizTutar?: number;
  PesinatDovizKur?: number;
}

export interface SozlesmePlanItemRequest {
  Sira: number;
  ValDate?: string;
  Amount: number;
  InvoiceId?: string;
}

export interface SozlesmePlanCreateResponse {
  sozlesmePlanId: number;
  usePaynet: boolean;
  paynetCode?: number;
  paynetMessage?: string;
  subscriptionId?: string;
  url?: string;
}

// ==================== Sözleşme Plan Ücret Hesaplama DTO ====================
// Backend SOZLESMEPLANUCRETHESAPLA procedure sonucu
export interface SozlesmePlanHesaplaRequest {
  sozlesmeId: number;
  planId: number;
  genelIskonto?: number;
  abonelikIskonto?: number;
  dovizId?: string;
}

export interface SozlesmePlanHesaplaResponse {
  ToplamTutar?: number;
  PesinatTutari?: number;
  AbonelikUcreti?: number;
}

// ==================== Sözleşme Planı CRUD DTO (Backend SozlesmePlani) ====================
export interface SozlesmePlaniDto {
  sozlesmePlanId: number;
  sozlesmeId: number;
  planId: number;
  genelIskonto?: number;
  abonelikIskonto?: number;
  abonelikBaslangicTarihi?: string;
  pesinatTutari?: number;
  abonelikUcreti?: number;
  dovizId: string;
  insertTarihi?: string;
  insertKullaniciId?: number;
  kullaniciId?: number;
  degisimTarihi?: string;
}

export interface SozlesmePlaniCreateRequest {
  SozlesmeId: number;
  PlanId: number;
  GenelIskonto?: number;
  AbonelikIskonto?: number;
  AbonelikBaslangicTarihi?: string;
  PesinatTutari?: number;
  AbonelikUcreti?: number;
  DovizId?: string;
  InsertKullaniciId?: number;
  KullaniciId?: number;
}

export interface SozlesmePlaniUpdateRequest {
  SozlesmePlanId: number;
  SozlesmeId?: number;
  PlanId?: number;
  GenelIskonto?: number;
  AbonelikIskonto?: number;
  AbonelikBaslangicTarihi?: string;
  PesinatTutari?: number;
  AbonelikUcreti?: number;
  DovizId?: string;
}

// ==================== Sözleşme Ödeme Planı Şablon DTO ====================
export interface SozlesmeSablonPlanDto {
  planId: number;
  adi: string;
  pesinatOrani: number;
  abonelikHesaplamaKatsayisi: number;
}

export interface PlanTemplateCreateRequest {
  Adi: string;
  PesinatOrani: number;
  AbonelikHesaplamaKatsayisi: number;
}

export interface PlanTemplateUpdateRequest {
  PlanId: number;
  Adi: string;
  PesinatOrani: number;
  AbonelikHesaplamaKatsayisi: number;
}

// Plan status helper
export const PLAN_STATUS = {
  0: { label: 'Beklemede', color: 'bg-yellow-500/10 text-yellow-500' },
  1: { label: 'Onaylandı', color: 'bg-blue-500/10 text-blue-500' },
  10: { label: 'Onay Bekleniyor', color: 'bg-orange-500/10 text-orange-500' },
  11: { label: 'Ödendi', color: 'bg-green-500/10 text-green-500' },
  12: { label: 'Hata/Gecikmiş', color: 'bg-red-500/10 text-red-500' },
} as const;

// ==================== Form Data Types ====================
export type FirmaFormData = {
  adi: string;
  yetkiliAdi?: string;
  adres1?: string;
  adres2?: string;
  adres3?: string;
  semt?: string;
  sehir?: string;
  vergiDairesi?: string;
  vergiHesapNo?: string;
  telefon1?: string;
  telefon2?: string;
  fax?: string;
  email?: string;
  notu?: string;
};

export type ProjeFormData = {
  adi: string;
};

export type ProjeModulFormData = {
  projeId: number;
  adi: string;
  birimFiyat: number;
  dovizId: string;
  modulTipi: number;
};

export type SozlesmeFormData = Omit<SozlesmeCreateRequest, 'InsertKullaniciId' | 'KullaniciId'>;
export type SozlesmeModulFormData = Omit<SozlesmeModulCreateRequest, 'InsertKullaniciId' | 'KullaniciId' | 'SozlesmeId'>;
