import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItems {
  id: number;
  imageUrl: string;
  title: string;
  type: string;
  size: string;
  price: number;
  count: number;
}
interface CartState {
  items: CartItems[];
}

export interface RootState {
  cart: CartState;
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
  } as CartState,
  reducers: {
    addItems: (state, { payload }: PayloadAction<CartItems>) => {
      const newItem = payload;
      const findItem = state.items.find((obj) => {
        return obj.id === newItem.id && obj.type === newItem.type && obj.size === newItem.size;
      });
      if (findItem) {
        findItem.count++;
      } else {
        state.items.push({
          ...newItem,
          count: 1,
        });
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const selectCartState = (state: RootState): CartState => state.cart;
export const selectCartItems = createSelector([selectCartState], (cart) => cart.items);

export const selectTotalAmount = createSelector([selectCartItems], (items): number =>
  items.reduce((acc, item) => {
    return acc + item.price * item.count;
  }, 0),
);

export const selectTotalQuantity = createSelector([selectCartItems], (items): number =>
  items.reduce((acc, item) => {
    return acc + item.count;
  }, 0),
);

export const { addItems, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
