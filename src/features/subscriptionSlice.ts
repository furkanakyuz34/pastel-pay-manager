import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Subscription } from '../types';

interface SubscriptionState {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  subscriptions: [],
  loading: false,
  error: null,
};

const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    setSubscriptions: (state, action: PayloadAction<Subscription[]>) => {
      state.subscriptions = action.payload;
    },
    addSubscription: (state, action: PayloadAction<Subscription>) => {
      state.subscriptions.push(action.payload);
    },
    updateSubscription: (state, action: PayloadAction<Subscription>) => {
      const index = state.subscriptions.findIndex(sub => sub.id === action.payload.id);
      if (index !== -1) {
        state.subscriptions[index] = action.payload;
      }
    },
    deleteSubscription: (state, action: PayloadAction<string>) => {
      state.subscriptions = state.subscriptions.filter(sub => sub.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setSubscriptions,
  addSubscription,
  updateSubscription,
  deleteSubscription,
  setLoading,
  setError,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;