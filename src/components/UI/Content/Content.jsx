import { Categories } from '../Categories/Categories';
import { Sort } from '../Sort/Sort';
import { ContentItems } from '../ContentItems/ContentItems';


export const Content = () => {
  return (
    <div className="content">
      <div className="container">
        <div className="content__top">
          <Categories/>
          <Sort />
        </div>
        <h2 className="content__title">Все пиццы</h2>
        <div className="content__items">
          <ContentItems title='мексиканская' price='500'/>
        </div>
      </div>
    </div>
  );
};