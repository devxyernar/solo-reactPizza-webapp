import Header from './components/UI/Header/Header';
import Home from './pages/Home';
import './styles/app.scss';

function App() {
  return (
    <div className="wrapper">
      <Header />
      <div className="content">
        <Home />
      </div>
    </div>
  );
}

export default App;
