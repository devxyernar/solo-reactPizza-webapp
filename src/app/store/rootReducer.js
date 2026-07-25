import cart from '@/entities/cart/model/cartSlice';
import pizzas from '@/entities/pizza/model/pizzaSlice';
import filter from '@/features/filter-pizzas/model/filterSlice';

export const rootReducer = {
  filter,
  cart,
  pizzas,
};
