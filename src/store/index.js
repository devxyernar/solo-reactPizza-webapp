import { configureStore } from '@reduxjs/toolkit';
import cart from '@/store/slices/cartSlice';
import filter from '@/store/slices/filterSlice';

export const store = configureStore({
  reducer: {
    filter,
    cart,
  },
});
