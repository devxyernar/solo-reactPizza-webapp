import { useState } from 'react';
import { AppRouter } from '@/app/router/AppRouter';
import { SearchContext } from '@/app/providers/SearchContext';
import { Header } from '@/widgets/Header/Header';

function App() {
  const [searchQuerry, setSearchQuerry] = useState('');
  return (
    <div className="wrapper">
      <SearchContext.Provider value={{ searchQuerry, setSearchQuerry }}>
        <Header />
        <div className="content">
          <AppRouter />
        </div>
      </SearchContext.Provider>
    </div>
  );
}

export default App;
