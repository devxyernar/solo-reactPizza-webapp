import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Pizzas {
  id: number;
  imageUrl: string;
  title: string;
  types: number[];
  sizes: number[];
  price: number;
  category: number;
  rating: number;
}

interface PizzasState {
  items: Pizzas[];
  status: 'idle' | 'pending' | 'fulfilled' | 'rejected';
  error: string | null;
}

export interface FetchPizzasArgs {
  sortBy: string;
  order: string;
  category: string;
  search: string;
  currentPage: number;
}

export const fetchPizzas = createAsyncThunk<Pizzas[], FetchPizzasArgs, { rejectValue: string }>(
  '/pizzas/fetchPizzas',
  async ({ sortBy, order, category, search, currentPage }, { rejectWithValue }) => {
    try {
      const response = await axios.get<Pizzas[]>(
        `https://699a19b6377ac05ce28d3cd2.mockapi.io/items?page=${currentPage}&limit=30${category}&sortBy=${sortBy}&order=${order}${search}`,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fecth status');
    }
  },
);

export const pizzasSlice = createSlice({
  name: 'items',
  initialState: {
    items: [],
    status: 'pending',
    error: null,
  } as PizzasState,
  extraReducers: (builder) => {
    builder.addCase(fetchPizzas.pending, (state) => {
      state.status = 'pending';
      state.items = [];
    });
    builder.addCase(fetchPizzas.fulfilled, (state, action) => {
      state.status = 'fulfilled';
      state.items = action.payload;
    });
    builder.addCase(fetchPizzas.rejected, (state, action) => {
      state.status = 'rejected';
      state.error = action.payload as string;
    });
  },
  reducers: {
    loadPizzas: (state, { payload }: PayloadAction<Pizzas>) => {},
  },
});

export default pizzasSlice.reducer;
