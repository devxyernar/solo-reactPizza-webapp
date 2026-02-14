import './styles/app.scss';
import { Content } from './components/UI/Content/Content';
import { Header } from './components/UI/Header/Header';

function App() {
  return (
    <div className="wrapper">
      <Header />
      <Content/>
    </div>
  );
}


export default App;
