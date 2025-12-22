import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Subscription } from '../types';
import {
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  ActivateSubscriptionResponse,
  CancelSubscriptionResponse,
  GetSubscriptionDetailResponse,
  SearchSubscriptionResponse,
} from './iyzico';

const SUBSCRIPTION_API_BASE_URL = import.meta.env.VITE_SUBSCRIPTION_API_URL || 'https://api.subscription-service.com';
const IYZICO_API_BASE_URL = import.meta.env.VITE_IYZICO_API_URL || 'https://api.iyzipay.com';

export const subscriptionApi = createApi({
  reducerPath: 'subscriptionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: SUBSCRIPTION_API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Subscription'],
  endpoints: (builder) => ({
    // Local subscription endpoints
    getSubscriptions: builder.query<Subscription[], void>({
      query: () => '/subscriptions',
      providesTags: ['Subscription'],
    }),
    getSubscription: builder.query<Subscription, string>({
      query: (id) => `/subscriptions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Subscription', id }],
    }),
    createSubscription: builder.mutation<Subscription, Omit<Subscription, 'id'>>({
      query: (subscription) => ({
        url: '/subscriptions',
        method: 'POST',
        body: subscription,
      }),
      invalidatesTags: ['Subscription'],
    }),
    updateSubscription: builder.mutation<Subscription, { id: string; data: Partial<Subscription> }>({
      query: ({ id, data }) => ({
        url: `/subscriptions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Subscription', id }, 'Subscription'],
    }),
    deleteSubscription: builder.mutation<void, string>({
      query: (id) => ({
        url: `/subscriptions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subscription'],
    }),

    // iyzico subscription endpoints
    createIyzCoSubscription: builder.mutation<CreateSubscriptionResponse, CreateSubscriptionRequest>({
      query: (payload) => ({
        url: '/v2/subscription/initialize',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Subscription'],
    }),

    activateIyzCoSubscription: builder.mutation<ActivateSubscriptionResponse, string>({
      query: (subscriptionReferenceCode) => ({
        url: `/v2/subscription/subscriptions/${subscriptionReferenceCode}/activate`,
        method: 'POST',
      }),
      invalidatesTags: ['Subscription'],
    }),

    cancelIyzCoSubscription: builder.mutation<CancelSubscriptionResponse, string>({
      query: (subscriptionReferenceCode) => ({
        url: `/v2/subscription/subscriptions/${subscriptionReferenceCode}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Subscription'],
    }),

    getIyzCoSubscriptionDetail: builder.query<GetSubscriptionDetailResponse, string>({
      query: (subscriptionReferenceCode) =>
        `/v2/subscription/subscriptions/${subscriptionReferenceCode}`,
      providesTags: (result, error, subscriptionReferenceCode) => [
        { type: 'Subscription', id: subscriptionReferenceCode },
      ],
    }),

    searchIyzCoSubscriptions: builder.query<
      SearchSubscriptionResponse,
      { subscriptionReferenceCode?: string; customerReferenceCode?: string; limit?: number; offset?: number }
    >({
      query: ({ subscriptionReferenceCode, customerReferenceCode, limit, offset }) => {
        const params = new URLSearchParams();
        if (subscriptionReferenceCode) params.append('subscriptionReferenceCode', subscriptionReferenceCode);
        if (customerReferenceCode) params.append('customerReferenceCode', customerReferenceCode);
        if (limit) params.append('limit', limit.toString());
        if (offset) params.append('offset', offset.toString());
        return `/v2/subscription/subscriptions?${params}`;
      },
      providesTags: ['Subscription'],
    }),
  }),
});

export const {
  useGetSubscriptionsQuery,
  useGetSubscriptionQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useDeleteSubscriptionMutation,
  useCreateIyzCoSubscriptionMutation,
  useActivateIyzCoSubscriptionMutation,
  useCancelIyzCoSubscriptionMutation,
  useGetIyzCoSubscriptionDetailQuery,
  useSearchIyzCoSubscriptionsQuery,
} = subscriptionApi;