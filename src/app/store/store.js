import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '@/app/store/rootReducer'

export const store = configureStore({
  reducer: rootReducer,
})
store.subscribe(() => {
  const cart = store.getState().cart
  localStorage.setItem('items', JSON.stringify(cart))
})
