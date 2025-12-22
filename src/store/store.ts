import { configureStore } from '@reduxjs/toolkit';
import { subscriptionApi } from '../services/subscriptionApi';
import { managementApi } from '../services/managementApi';
import subscriptionSlice from '../features/subscriptionSlice';
import customerSlice from '../features/customerSlice';
import projectSlice from '../features/projectSlice';
import productSlice from '../features/productSlice';
import paymentSlice from '../features/paymentSlice';
import planSlice from '../features/planSlice';
import licenseSlice from '../features/licenseSlice';

export const store = configureStore({
  reducer: {
    // RTK Query APIs
    [subscriptionApi.reducerPath]: subscriptionApi.reducer,
    [managementApi.reducerPath]: managementApi.reducer,

    // Slices
    subscriptions: subscriptionSlice,
    customers: customerSlice,
    projects: projectSlice,
    products: productSlice,
    payments: paymentSlice,
    plans: planSlice,
    licenses: licenseSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      subscriptionApi.middleware,
      managementApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;