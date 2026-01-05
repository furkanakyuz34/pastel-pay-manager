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
}

export interface ProjeModulCreateRequest {
  projeId: number;
  adi: string;
}

export interface ProjeModulUpdateRequest {
  adi: string;
}

// ==================== Form Data Types ====================
export type FirmaFormData = Omit<FirmaCreateRequest, 'firmaId'>;
export type ProjeFormData = ProjeCreateRequest;
export type ProjeModulFormData = ProjeModulCreateRequest;
