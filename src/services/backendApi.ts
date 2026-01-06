import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  BackendApiResponse,
  FirmaDto,
  FirmaCreateRequest,
  FirmaUpdateRequest,
  ProjeDto,
  ProjeCreateRequest,
  ProjeUpdateRequest,
  ProjeModulDto,
  ProjeModulCreateRequest,
  ProjeModulUpdateRequest,
  SozlesmeDto,
  SozlesmeCreateRequest,
  SozlesmeUpdateRequest,
  SozlesmeModulDto,
  SozlesmeModulCreateRequest,
  SozlesmeModulUpdateRequest,
} from '../types/backend';

const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'https://localhost:7001';

// Response'dan data çıkarma helper
const extractData = <T>(response: BackendApiResponse<T>): T => {
  if (!response.success || !response.data) {
    throw new Error(response.error?.detail || response.message || 'API error');
  }
  return response.data;
};

export const backendApi = createApi({
  reducerPath: 'backendApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BACKEND_API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Firma', 'Proje', 'ProjeModul', 'Sozlesme', 'SozlesmeModul'],
  endpoints: (builder) => ({
    // ==================== Firma (Müşteri) Endpoints ====================
    getFirmalar: builder.query<FirmaDto[], void>({
      query: () => '/api/firma',
      transformResponse: (response: BackendApiResponse<FirmaDto[]>) => extractData(response),
      providesTags: ['Firma'],
    }),
    
    getFirma: builder.query<FirmaDto, number>({
      query: (firmaId) => `/api/firma/${firmaId}`,
      transformResponse: (response: BackendApiResponse<FirmaDto>) => extractData(response),
      providesTags: (result, error, firmaId) => [{ type: 'Firma', id: firmaId }],
    }),
    
    createFirma: builder.mutation<number, FirmaCreateRequest>({
      query: (firma) => ({
        url: '/api/firma',
        method: 'POST',
        body: firma,
      }),
      transformResponse: (response: BackendApiResponse<number>) => extractData(response),
      invalidatesTags: ['Firma'],
    }),
    
    updateFirma: builder.mutation<void, { firmaId: number; data: FirmaUpdateRequest }>({
      query: ({ firmaId, data }) => ({
        url: `/api/firma/${firmaId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { firmaId }) => [{ type: 'Firma', id: firmaId }, 'Firma'],
    }),
    
    deleteFirma: builder.mutation<void, number>({
      query: (firmaId) => ({
        url: `/api/firma/${firmaId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Firma'],
    }),

    // ==================== Proje Endpoints ====================
    getProjeler: builder.query<ProjeDto[], void>({
      query: () => '/api/proje',
      transformResponse: (response: BackendApiResponse<ProjeDto[]>) => extractData(response),
      providesTags: ['Proje'],
    }),
    
    getProje: builder.query<ProjeDto, number>({
      query: (projeId) => `/api/proje/${projeId}`,
      transformResponse: (response: BackendApiResponse<ProjeDto>) => extractData(response),
      providesTags: (result, error, projeId) => [{ type: 'Proje', id: projeId }],
    }),
    
    createProje: builder.mutation<number, ProjeCreateRequest>({
      query: (proje) => ({
        url: '/api/proje',
        method: 'POST',
        body: proje,
      }),
      transformResponse: (response: BackendApiResponse<number>) => extractData(response),
      invalidatesTags: ['Proje'],
    }),
    
    updateProje: builder.mutation<void, { projeId: number; data: ProjeUpdateRequest }>({
      query: ({ projeId, data }) => ({
        url: `/api/proje/${projeId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { projeId }) => [{ type: 'Proje', id: projeId }, 'Proje'],
    }),
    
    deleteProje: builder.mutation<void, number>({
      query: (projeId) => ({
        url: `/api/proje/${projeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Proje'],
    }),

    // ==================== Proje Modül (Ürün) Endpoints ====================
    getProjeModuller: builder.query<ProjeModulDto[], number | undefined>({
      query: (projeId) => ({
        url: '/api/projemodul',
        params: projeId ? { projeId } : undefined,
      }),
      transformResponse: (response: BackendApiResponse<ProjeModulDto[]>) => extractData(response),
      providesTags: ['ProjeModul'],
    }),
    
    getProjeModul: builder.query<ProjeModulDto, number>({
      query: (projeModulId) => `/api/projemodul/${projeModulId}`,
      transformResponse: (response: BackendApiResponse<ProjeModulDto>) => extractData(response),
      providesTags: (result, error, projeModulId) => [{ type: 'ProjeModul', id: projeModulId }],
    }),
    
    createProjeModul: builder.mutation<number, ProjeModulCreateRequest>({
      query: (modul) => ({
        url: '/api/projemodul',
        method: 'POST',
        body: modul,
      }),
      transformResponse: (response: BackendApiResponse<number>) => extractData(response),
      invalidatesTags: ['ProjeModul'],
    }),
    
    updateProjeModul: builder.mutation<void, { projeModulId: number; data: ProjeModulUpdateRequest }>({
      query: ({ projeModulId, data }) => ({
        url: `/api/projemodul/${projeModulId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { projeModulId }) => [{ type: 'ProjeModul', id: projeModulId }, 'ProjeModul'],
    }),
    
    deleteProjeModul: builder.mutation<void, number>({
      query: (projeModulId) => ({
        url: `/api/projemodul/${projeModulId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ProjeModul'],
    }),

    // ==================== Sözleşme (Abonelik) Endpoints ====================
    getSozlesmeler: builder.query<SozlesmeDto[], void>({
      query: () => '/api/sozlesme',
      transformResponse: (response: BackendApiResponse<SozlesmeDto[]>) => extractData(response),
      providesTags: ['Sozlesme'],
    }),
    
    getSozlesme: builder.query<SozlesmeDto, number>({
      query: (sozlesmeId) => `/api/sozlesme/${sozlesmeId}`,
      transformResponse: (response: BackendApiResponse<SozlesmeDto>) => extractData(response),
      providesTags: (result, error, sozlesmeId) => [{ type: 'Sozlesme', id: sozlesmeId }],
    }),
    
    createSozlesme: builder.mutation<number, SozlesmeCreateRequest>({
      query: (sozlesme) => ({
        url: '/api/sozlesme',
        method: 'POST',
        body: sozlesme,
      }),
      transformResponse: (response: BackendApiResponse<number>) => extractData(response),
      invalidatesTags: ['Sozlesme'],
    }),
    
    updateSozlesme: builder.mutation<void, { sozlesmeId: number; data: SozlesmeUpdateRequest }>({
      query: ({ sozlesmeId, data }) => ({
        url: `/api/sozlesme/${sozlesmeId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { sozlesmeId }) => [{ type: 'Sozlesme', id: sozlesmeId }, 'Sozlesme'],
    }),
    
    deleteSozlesme: builder.mutation<void, number>({
      query: (sozlesmeId) => ({
        url: `/api/sozlesme/${sozlesmeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sozlesme'],
    }),

    // ==================== Sözleşme Modül Endpoints ====================
    getSozlesmeModuller: builder.query<SozlesmeModulDto[], number>({
      query: (sozlesmeId) => `/api/sozlesme/${sozlesmeId}/modul`,
      transformResponse: (response: BackendApiResponse<SozlesmeModulDto[]>) => extractData(response),
      providesTags: (result, error, sozlesmeId) => [{ type: 'SozlesmeModul', id: sozlesmeId }],
    }),
    
    getSozlesmeModul: builder.query<SozlesmeModulDto, { sozlesmeId: number; projeId: number; projeModulId: number }>({
      query: ({ sozlesmeId, projeId, projeModulId }) => 
        `/api/sozlesme/${sozlesmeId}/modul/${projeId}/${projeModulId}`,
      transformResponse: (response: BackendApiResponse<SozlesmeModulDto>) => extractData(response),
    }),
    
    createSozlesmeModul: builder.mutation<void, SozlesmeModulCreateRequest>({
      query: (modul) => ({
        url: `/api/sozlesme/${modul.sozlesmeId}/modul`,
        method: 'POST',
        body: modul,
      }),
      invalidatesTags: (result, error, modul) => [{ type: 'SozlesmeModul', id: modul.sozlesmeId }, 'SozlesmeModul'],
    }),
    
    updateSozlesmeModul: builder.mutation<void, SozlesmeModulUpdateRequest>({
      query: (modul) => ({
        url: `/api/sozlesme/${modul.sozlesmeId}/modul/${modul.projeId}/${modul.projeModulId}`,
        method: 'PUT',
        body: modul,
      }),
      invalidatesTags: (result, error, modul) => [{ type: 'SozlesmeModul', id: modul.sozlesmeId }, 'SozlesmeModul'],
    }),
    
    deleteSozlesmeModul: builder.mutation<void, { sozlesmeId: number; projeId: number; projeModulId: number }>({
      query: ({ sozlesmeId, projeId, projeModulId }) => ({
        url: `/api/sozlesme/${sozlesmeId}/modul/${projeId}/${projeModulId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { sozlesmeId }) => [{ type: 'SozlesmeModul', id: sozlesmeId }, 'SozlesmeModul'],
    }),
  }),
});

export const {
  // Firma (Müşteri) hooks
  useGetFirmalarQuery,
  useGetFirmaQuery,
  useCreateFirmaMutation,
  useUpdateFirmaMutation,
  useDeleteFirmaMutation,

  // Proje hooks
  useGetProjelerQuery,
  useGetProjeQuery,
  useCreateProjeMutation,
  useUpdateProjeMutation,
  useDeleteProjeMutation,

  // Proje Modül (Ürün) hooks
  useGetProjeModullerQuery,
  useGetProjeModulQuery,
  useCreateProjeModulMutation,
  useUpdateProjeModulMutation,
  useDeleteProjeModulMutation,

  // Sözleşme (Abonelik) hooks
  useGetSozlesmelerQuery,
  useGetSozlesmeQuery,
  useCreateSozlesmeMutation,
  useUpdateSozlesmeMutation,
  useDeleteSozlesmeMutation,

  // Sözleşme Modül hooks
  useGetSozlesmeModullerQuery,
  useGetSozlesmeModulQuery,
  useCreateSozlesmeModulMutation,
  useUpdateSozlesmeModulMutation,
  useDeleteSozlesmeModulMutation,
} = backendApi;
