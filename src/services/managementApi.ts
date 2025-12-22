import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Customer, Project, Product, Payment, Plan, License } from '../types';

const MANAGEMENT_API_BASE_URL = import.meta.env.VITE_MANAGEMENT_API_URL || 'https://api.management-service.com';

export const managementApi = createApi({
  reducerPath: 'managementApi',
  baseQuery: fetchBaseQuery({
    baseUrl: MANAGEMENT_API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Customer', 'Project', 'Product', 'Payment', 'Plan', 'License'],
  endpoints: (builder) => ({
    // Customer endpoints
    getCustomers: builder.query<Customer[], void>({
      query: () => '/customers',
      providesTags: ['Customer'],
    }),
    getCustomer: builder.query<Customer, string>({
      query: (id) => `/customers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Customer', id }],
    }),
    createCustomer: builder.mutation<Customer, Omit<Customer, 'id'>>({
      query: (customer) => ({
        url: '/customers',
        method: 'POST',
        body: customer,
      }),
      invalidatesTags: ['Customer'],
    }),
    updateCustomer: builder.mutation<Customer, { id: string; data: Partial<Customer> }>({
      query: ({ id, data }) => ({
        url: `/customers/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Customer', id }, 'Customer'],
    }),
    deleteCustomer: builder.mutation<void, string>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Customer'],
    }),

    // Project endpoints
    getProjects: builder.query<Project[], void>({
      query: () => '/projects',
      providesTags: ['Project'],
    }),
    getProject: builder.query<Project, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation<Project, Omit<Project, 'id'>>({
      query: (project) => ({
        url: '/projects',
        method: 'POST',
        body: project,
      }),
      invalidatesTags: ['Project'],
    }),
    updateProject: builder.mutation<Project, { id: string; data: Partial<Project> }>({
      query: ({ id, data }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Project', id }, 'Project'],
    }),
    deleteProject: builder.mutation<void, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),

    // Product endpoints
    getProducts: builder.query<Product[], void>({
      query: () => '/products',
      providesTags: ['Product'],
    }),
    getProduct: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    createProduct: builder.mutation<Product, Omit<Product, 'id'>>({
      query: (product) => ({
        url: '/products',
        method: 'POST',
        body: product,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation<Product, { id: string; data: Partial<Product> }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }, 'Product'],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),

    // Payment endpoints
    getPayments: builder.query<Payment[], void>({
      query: () => '/payments',
      providesTags: ['Payment'],
    }),
    getPayment: builder.query<Payment, string>({
      query: (id) => `/payments/${id}`,
      providesTags: (result, error, id) => [{ type: 'Payment', id }],
    }),
    createPayment: builder.mutation<Payment, Omit<Payment, 'id'>>({
      query: (payment) => ({
        url: '/payments',
        method: 'POST',
        body: payment,
      }),
      invalidatesTags: ['Payment'],
    }),
    updatePayment: builder.mutation<Payment, { id: string; data: Partial<Payment> }>({
      query: ({ id, data }) => ({
        url: `/payments/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Payment', id }, 'Payment'],
    }),
    deletePayment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/payments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Payment'],
    }),

    // Plan endpoints
    getPlans: builder.query<Plan[], void>({
      query: () => '/plans',
      providesTags: ['Plan'],
    }),
    getPlan: builder.query<Plan, string>({
      query: (id) => `/plans/${id}`,
      providesTags: (result, error, id) => [{ type: 'Plan', id }],
    }),
    createPlan: builder.mutation<Plan, Omit<Plan, 'id'>>({
      query: (plan) => ({
        url: '/plans',
        method: 'POST',
        body: plan,
      }),
      invalidatesTags: ['Plan'],
    }),
    updatePlan: builder.mutation<Plan, { id: string; data: Partial<Plan> }>({
      query: ({ id, data }) => ({
        url: `/plans/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Plan', id }, 'Plan'],
    }),
    deletePlan: builder.mutation<void, string>({
      query: (id) => ({
        url: `/plans/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Plan'],
    }),

    // License endpoints
    getLicenses: builder.query<License[], void>({
      query: () => '/licenses',
      providesTags: ['License'],
    }),
    getLicense: builder.query<License, string>({
      query: (id) => `/licenses/${id}`,
      providesTags: (result, error, id) => [{ type: 'License', id }],
    }),
    createLicense: builder.mutation<License, Omit<License, 'id'>>({
      query: (license) => ({
        url: '/licenses',
        method: 'POST',
        body: license,
      }),
      invalidatesTags: ['License'],
    }),
    updateLicense: builder.mutation<License, { id: string; data: Partial<License> }>({
      query: ({ id, data }) => ({
        url: `/licenses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'License', id }, 'License'],
    }),
    deleteLicense: builder.mutation<void, string>({
      query: (id) => ({
        url: `/licenses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['License'],
    }),
  }),
});

export const {
  // Customer hooks
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,

  // Project hooks
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,

  // Product hooks
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,

  // Payment hooks
  useGetPaymentsQuery,
  useGetPaymentQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,

  // Plan hooks
  useGetPlansQuery,
  useGetPlanQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,

  // License hooks
  useGetLicensesQuery,
  useGetLicenseQuery,
  useCreateLicenseMutation,
  useUpdateLicenseMutation,
  useDeleteLicenseMutation,
} = managementApi;