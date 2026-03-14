import { useContext, useEffect, useState } from 'react';
import { SearchContext } from '../../App';
import { Categories } from '../../components/UI/Categories/Categories';
import { ContentItems } from '../../components/UI/ContentItems/ContentItems';
import { Pagination } from '../../components/UI/Pagination/Pagination';
import PizzasSkeleton from '../../components/UI/Skeleton/Skeleton';
import { Sort } from '../../components/UI/Sort/Sort';

export const Home = () => {
  const { searchQuerry } = useContext(SearchContext);

  const [items, setItems] = useState([]);
  const [categoryId, setCategoryId] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortType, setSortType] = useState({
    name: 'популярности',
    sortProperty: 'rating',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const sortBy = sortType.sortProperty.replace('-', '');
    const order = sortType.sortProperty.includes('-') ? 'asc' : 'desc';
    const category = categoryId > 0 ? `category=${categoryId}` : '';
    const search = searchQuerry ? `&search=${searchQuerry}` : 0;
    fetch(
      `https://699a19b6377ac05ce28d3cd2.mockapi.io/items?page=${currentPage}&limit=4&${category}&sortBy=${sortBy}&order=${order}${search}`,
    )
      .then((res) => {
        return res.json();
      })
      .then((arr) => {
        setItems(arr);
        setIsLoading(false);
      });
    window.scrollTo(0, 0);
  }, [categoryId, sortType, searchQuerry, currentPage]);

  const pizzas = items.map((obj) => <ContentItems key={obj.id} {...obj} />);
  const skeletons = [...new Array(6)].map((_, index) => <PizzasSkeleton key={index} />);
  return (
    <div className="container">
      <div className="content__top">
        <Categories value={categoryId} onClickCategory={(i) => setCategoryId(i)} />
        <Sort value={sortType} onChangeSort={(i) => setSortType(i)} />
      </div>
      <h2 className="content__title">Все пиццы</h2>
      <div className="content__items">{isLoading ? skeletons : pizzas}</div>
      <Pagination onChangePage={(number) => setCurrentPage(number)}></Pagination>
    </div>
  );
};
