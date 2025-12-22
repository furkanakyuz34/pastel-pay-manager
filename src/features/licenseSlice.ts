import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { License } from '../types';

interface LicenseState {
  licenses: License[];
  loading: boolean;
  error: string | null;
}

const initialState: LicenseState = {
  licenses: [],
  loading: false,
  error: null,
};

const licenseSlice = createSlice({
  name: 'licenses',
  initialState,
  reducers: {
    setLicenses: (state, action: PayloadAction<License[]>) => {
      state.licenses = action.payload;
    },
    addLicense: (state, action: PayloadAction<License>) => {
      state.licenses.push(action.payload);
    },
    updateLicense: (state, action: PayloadAction<License>) => {
      const index = state.licenses.findIndex(license => license.id === action.payload.id);
      if (index !== -1) {
        state.licenses[index] = action.payload;
      }
    },
    deleteLicense: (state, action: PayloadAction<string>) => {
      state.licenses = state.licenses.filter(license => license.id !== action.payload);
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
  setLicenses,
  addLicense,
  updateLicense,
  deleteLicense,
  setLoading,
  setError,
} = licenseSlice.actions;

export default licenseSlice.reducer;