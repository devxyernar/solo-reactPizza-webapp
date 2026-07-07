import cart from '@/store/slices/cartSlice';
import filter from '@/store/slices/filterSlice';
import { configureStore } from '@reduxjs/toolkit';
import pizzas from './slices/pizzaSlice';

export const store = configureStore({
  reducer: {
    filter,
    cart,
    pizzas,
  },
});
