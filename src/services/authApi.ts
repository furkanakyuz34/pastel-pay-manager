import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const AUTH_API_BASE_URL = import.meta.env.VITE_MANAGEMENT_API_URL || 'http://localhost:5000';

export interface LoginRequest {
  kullaniciId: number;
  sifre: string;
}

export interface LoginResponseData {
  accessToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error: string | null;
  traceId: string;
}

export type LoginResponse = ApiResponse<LoginResponseData>;

export interface MeResponse {
  kullaniciId: number;
  adi: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: AUTH_API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getMe: builder.query<MeResponse, void>({
      query: () => '/auth/me',
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery } = authApi;
