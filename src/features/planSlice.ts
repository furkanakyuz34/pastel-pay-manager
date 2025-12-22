import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Plan } from '../types';

interface PlanState {
  plans: Plan[];
  loading: boolean;
  error: string | null;
}

const initialState: PlanState = {
  plans: [],
  loading: false,
  error: null,
};

const planSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    setPlans: (state, action: PayloadAction<Plan[]>) => {
      state.plans = action.payload;
    },
    addPlan: (state, action: PayloadAction<Plan>) => {
      state.plans.push(action.payload);
    },
    updatePlan: (state, action: PayloadAction<Plan>) => {
      const index = state.plans.findIndex(plan => plan.id === action.payload.id);
      if (index !== -1) {
        state.plans[index] = action.payload;
      }
    },
    deletePlan: (state, action: PayloadAction<string>) => {
      state.plans = state.plans.filter(plan => plan.id !== action.payload);
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
  setPlans,
  addPlan,
  updatePlan,
  deletePlan,
  setLoading,
  setError,
} = planSlice.actions;

export default planSlice.reducer;