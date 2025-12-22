import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CustomerCard } from '@/types';

interface CustomerCardState {
  cards: CustomerCard[];
  loading: boolean;
  error: string | null;
  selectedCardId: string | null;
}

const initialState: CustomerCardState = {
  cards: [],
  loading: false,
  error: null,
  selectedCardId: null,
};

export const customerCardSlice = createSlice({
  name: 'customerCard',
  initialState,
  reducers: {
    // Set cards for a customer
    setCards: (state, action: PayloadAction<CustomerCard[]>) => {
      state.cards = action.payload;
      state.error = null;
    },

    // Add a new card
    addCard: (state, action: PayloadAction<CustomerCard>) => {
      state.cards.push(action.payload);
      state.error = null;
    },

    // Update existing card
    updateCard: (state, action: PayloadAction<CustomerCard>) => {
      const index = state.cards.findIndex((card) => card.id === action.payload.id);
      if (index !== -1) {
        state.cards[index] = action.payload;
      }
      state.error = null;
    },

    // Delete a card
    deleteCard: (state, action: PayloadAction<string>) => {
      state.cards = state.cards.filter((card) => card.id !== action.payload);
      if (state.selectedCardId === action.payload) {
        state.selectedCardId = null;
      }
      state.error = null;
    },

    // Set default card
    setDefaultCard: (state, action: PayloadAction<string>) => {
      state.cards = state.cards.map((card) => ({
        ...card,
        isDefault: card.id === action.payload,
      }));
      state.selectedCardId = action.payload;
      state.error = null;
    },

    // Select card
    selectCard: (state, action: PayloadAction<string | null>) => {
      state.selectedCardId = action.payload;
    },

    // Set loading
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Clear all cards (when switching customers)
    clearCards: (state) => {
      state.cards = [];
      state.selectedCardId = null;
      state.error = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCards,
  addCard,
  updateCard,
  deleteCard,
  setDefaultCard,
  selectCard,
  setLoading,
  setError,
  clearCards,
  clearError,
} = customerCardSlice.actions;

export default customerCardSlice.reducer;
