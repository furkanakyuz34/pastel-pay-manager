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

export interface FirmaCreateRequest {
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

export interface FirmaUpdateRequest {
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

// ==================== Proje DTO ====================
export interface ProjeDto {
  projeId: number;
  adi: string;
}

export interface ProjeCreateRequest {
  adi: string;
}

export interface ProjeUpdateRequest {
  adi: string;
}

// ==================== Proje Modül (Ürün) DTO ====================
export interface ProjeModulDto {
  projeModulId: number;
  projeId: number;
  adi: string;
  birimFiyat?: number;
}

export interface ProjeModulCreateRequest {
  projeId: number;
  adi: string;
  birimFiyat?: number;
}

export interface ProjeModulUpdateRequest {
  adi: string;
  birimFiyat?: number;
}

// ==================== Sözleşme (Abonelik) DTO ====================
export interface SozlesmeDto {
  sozlesmeId: number;
  firmaId: number;
  projeId: number;
  kullaniciSayisi: number;
  satisTarihi?: string;
  satisFiyati?: number;
  dovizId?: string;
  lisansVer: boolean;
  otomatikInstall: boolean;
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
  FirmaId: number;
  ProjeId: number;
  KullaniciSayisi: number;
  SatisTarihi?: string;
  SatisFiyati?: number;
  DovizId?: string;
  LisansVer: boolean;
  OtomatikInstall: boolean;
  SatisKullaniciId?: number;
  DataServerIp?: string;
  StatikIp?: string;
  Klasor?: string;
  Notu?: string;
  IlkSatisTarihi?: string;
  IlkSatisFiyati?: number;
  IlkDovizId?: string;
  Demo: boolean;
  InsertKullaniciId: number;
  KullaniciId: number;
  DegisimTarihi?: string;
  SubeSayisi?: number;
  Iskonto?: number;
}

export interface SozlesmeUpdateRequest {
  SozlesmeId: number;
  FirmaId: number;
  ProjeId: number;
  KullaniciSayisi: number;
  SatisTarihi?: string;
  SatisFiyati?: number;
  DovizId?: string;
  LisansVer: boolean;
  OtomatikInstall: boolean;
  SatisKullaniciId?: number;
  DataServerIp?: string;
  StatikIp?: string;
  Klasor?: string;
  Notu?: string;
  IlkSatisTarihi?: string;
  IlkSatisFiyati?: number;
  IlkDovizId?: string;
  Demo: boolean;
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

// ==================== Form Data Types ====================
export type FirmaFormData = Omit<FirmaCreateRequest, 'firmaId'>;
export type ProjeFormData = ProjeCreateRequest;
export type ProjeModulFormData = ProjeModulCreateRequest;
export type SozlesmeFormData = Omit<SozlesmeCreateRequest, 'insertKullaniciId' | 'kullaniciId'>;
export type SozlesmeModulFormData = Omit<SozlesmeModulCreateRequest, 'insertKullaniciId' | 'kullaniciId' | 'sozlesmeId'>;
