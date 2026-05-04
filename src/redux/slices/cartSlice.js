import { createSelector, createSlice } from '@reduxjs/toolkit';
const initialState = {
  items: [],
};
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItems: (state, action) => {
      const newItem = action.payload;
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

const selectCartItemData = (state) => state.cart.items;

export const selectTotalAmount = createSelector([selectCartItemData], (items) =>
  items.reduce((acc, item) => {
    return acc + item.price * item.count;
  }, 0),
);

export const selectTotalQuantity = createSelector([selectCartItemData], (items) =>
  items.reduce((acc, item) => {
    return acc + item.count;
  }, 0),
);

export const { addItems, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
