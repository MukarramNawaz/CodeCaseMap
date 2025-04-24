// src/features/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserInfo } from '../services/api';
import { supabase } from '../services/supabaseClient';

// Async thunk to fetch user info
export const fetchUserInfo = createAsyncThunk(
  'user/fetchUserInfo',
  async (_, { rejectWithValue }) => {
    try {
      const { data: authData, error: authError } = await getUserInfo();
      if (authError) throw authError;
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.id)
        .single();
        
      if (userError) throw userError;
      
      return {
        ...authData,
        ...userData
      };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Initial state
const initialState = {
  userInfo: null,
  loading: false,
  error: null,
};

// Create slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUserInfo: (state, action) => {
      state.userInfo = {
        ...state.userInfo,
        ...action.payload
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { updateUserInfo } = userSlice.actions;
export default userSlice.reducer;