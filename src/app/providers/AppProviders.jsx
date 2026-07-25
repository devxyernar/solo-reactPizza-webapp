import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router';
import { store } from '@/app/store/store';

export const AppProviders = ({ children }) => (
  <BrowserRouter>
    <Provider store={store}>{children}</Provider>
  </BrowserRouter>
);
