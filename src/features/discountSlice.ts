import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PlanDiscount, PlanCustomerPricing } from "@/types";

interface DiscountState {
  planDiscounts: PlanDiscount[];
  customerPricings: PlanCustomerPricing[];
  loading: boolean;
  error: string | null;
  selectedDiscount: PlanDiscount | null;
}

const initialState: DiscountState = {
  planDiscounts: [],
  customerPricings: [],
  loading: false,
  error: null,
  selectedDiscount: null,
};

const discountSlice = createSlice({
  name: "discount",
  initialState,
  reducers: {
    // Plan Discounts
    setPlanDiscounts: (state, action: PayloadAction<PlanDiscount[]>) => {
      state.planDiscounts = action.payload;
    },

    addPlanDiscount: (state, action: PayloadAction<PlanDiscount>) => {
      state.planDiscounts.push(action.payload);
    },

    updatePlanDiscount: (state, action: PayloadAction<PlanDiscount>) => {
      const index = state.planDiscounts.findIndex(
        (d) => d.id === action.payload.id
      );
      if (index !== -1) {
        state.planDiscounts[index] = action.payload;
      }
    },

    deletePlanDiscount: (state, action: PayloadAction<string>) => {
      state.planDiscounts = state.planDiscounts.filter(
        (d) => d.id !== action.payload
      );
    },

    // Customer Pricings
    setPlanCustomerPricings: (state, action: PayloadAction<PlanCustomerPricing[]>) => {
      state.customerPricings = action.payload;
    },

    addPlanCustomerPricing: (state, action: PayloadAction<PlanCustomerPricing>) => {
      state.customerPricings.push(action.payload);
    },

    updatePlanCustomerPricing: (state, action: PayloadAction<PlanCustomerPricing>) => {
      const index = state.customerPricings.findIndex(
        (p) => p.id === action.payload.id
      );
      if (index !== -1) {
        state.customerPricings[index] = action.payload;
      }
    },

    deletePlanCustomerPricing: (state, action: PayloadAction<string>) => {
      state.customerPricings = state.customerPricings.filter(
        (p) => p.id !== action.payload
      );
    },

    // UI State
    setSelectedDiscount: (state, action: PayloadAction<PlanDiscount | null>) => {
      state.selectedDiscount = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setPlanDiscounts,
  addPlanDiscount,
  updatePlanDiscount,
  deletePlanDiscount,
  setPlanCustomerPricings,
  addPlanCustomerPricing,
  updatePlanCustomerPricing,
  deletePlanCustomerPricing,
  setSelectedDiscount,
  setLoading,
  setError,
  clearError,
} = discountSlice.actions;

export default discountSlice.reducer;
