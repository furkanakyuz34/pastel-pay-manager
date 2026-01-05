import { configureStore } from '@reduxjs/toolkit';
import { subscriptionApi } from '../services/subscriptionApi';
import { managementApi } from '../services/managementApi';
import { backendApi } from '../services/backendApi';
import { authApi } from '../services/authApi';
import subscriptionSlice from '../features/subscriptionSlice';
import customerSlice from '../features/customerSlice';
import projectSlice from '../features/projectSlice';
import productSlice from '../features/productSlice';
import paymentSlice from '../features/paymentSlice';
import planSlice from '../features/planSlice';
import licenseSlice from '../features/licenseSlice';
import discountSlice from '../features/discountSlice';
import customerCardSlice from '../features/customerCardSlice';

export const store = configureStore({
  reducer: {
    // RTK Query APIs
    [subscriptionApi.reducerPath]: subscriptionApi.reducer,
    [managementApi.reducerPath]: managementApi.reducer,
    [backendApi.reducerPath]: backendApi.reducer,
    [authApi.reducerPath]: authApi.reducer,

    // Slices
    subscriptions: subscriptionSlice,
    customers: customerSlice,
    customerCards: customerCardSlice,
    projects: projectSlice,
    products: productSlice,
    payments: paymentSlice,
    plans: planSlice,
    licenses: licenseSlice,
    discounts: discountSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      subscriptionApi.middleware,
      managementApi.middleware,
      backendApi.middleware,
      authApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;