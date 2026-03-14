import { createContext, useState } from 'react';
import { Route, Routes } from 'react-router';
import { Header } from './components/UI/Header/Header';
import { Cart } from './pages/Cart/';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import './styles/app.scss';

export const SearchContext = createContext();

function App() {
  const [searchQuerry, setSearchQuerry] = useState('');
  return (
    <div className="wrapper">
      <SearchContext.Provider value={{ searchQuerry, setSearchQuerry }}>
        <Header />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </SearchContext.Provider>
    </div>
  );
}

export default App;
