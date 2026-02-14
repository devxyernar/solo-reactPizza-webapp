import Categories from '../components/UI/Categories/Categories';
import PizzaBlock from '../components/UI/PizzaBlock/PizzaBlock';
import Sort from '../components/UI/Sort/Sort';
import pizzas from '../pizzas.json';

const Home = () => {
  console.log('Мои пиццы:', pizzas); // или как называется твоя переменная стейта

  return (
    <div className="container">
      <div className="content__top">
        <Categories />
        <Sort />
      </div>
      <h2 className="content__title">Все пиццы</h2>
      <div className="content__items">
        {pizzas.map((obj) => (
          <PizzaBlock key={obj.id} {...obj} />
        ))}
      </div>
    </div>
  );
};

export default Home;
