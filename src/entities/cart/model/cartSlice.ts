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
interface PlusItemPayload {
  id: number;
  size: string;
  type: string;
}
interface MinusItemPayload {
  id: number;
  size: string;
  type: string;
}

interface RemoveItemPayload {
  id: number;
  title: string;
  size: string;
  type: string;
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
    plusItem: (state, action: PayloadAction<PlusItemPayload>) => {
      const findItem = state.items.find(
        (obj) =>
          obj.id === action.payload.id &&
          obj.size === action.payload.size &&
          obj.type === action.payload.type,
      );
      if (findItem) {
        findItem.count++;

        if (findItem.count === 0) {
          state.items = state.items.filter(
            (obj) =>
              !(
                obj.id === action.payload.id &&
                obj.size === action.payload.size &&
                obj.type === action.payload.type
              ),
          );
        }
      }
    },
    minusItem(state, action: PayloadAction<MinusItemPayload>) {
      const findItem = state.items.find(
        (obj) =>
          obj.id === action.payload.id &&
          obj.size === action.payload.size &&
          obj.type === action.payload.type,
      );
      if (findItem) {
        findItem.count--;

        if (findItem.count === 0) {
          state.items = state.items.filter(
            (obj) =>
              !(
                obj.id === action.payload.id &&
                obj.size === action.payload.size &&
                obj.type === action.payload.type
              ),
          );
        }
      }
    },
    // we can the specify payload action as number or just specify the comparing obj.id to payload.id i'd prefer the second one
    removeItem(state, action: PayloadAction<RemoveItemPayload>) {
      state.items = state.items.filter((obj) => {
        obj.id !== action.payload.id;
      });
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

export const { addItems, clearCart, minusItem, plusItem, removeItem } = cartSlice.actions;

export default cartSlice.reducer;
