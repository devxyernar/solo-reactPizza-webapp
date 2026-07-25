import { Route, Routes } from 'react-router';
import { Cart } from '@/pages/Cart/Cart';
import { Home } from '@/pages/Home/Home';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';

export const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);
