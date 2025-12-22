import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Subscription } from '../types';

const SUBSCRIPTION_API_BASE_URL = import.meta.env.VITE_SUBSCRIPTION_API_URL || 'https://api.subscription-service.com';

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
  }),
});

export const {
  useGetSubscriptionsQuery,
  useGetSubscriptionQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useDeleteSubscriptionMutation,
} = subscriptionApi;