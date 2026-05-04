import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Categories } from '../../components/UI/Categories/Categories';
import { ContentItems } from '../../components/UI/ContentItems/ContentItems';
import { Pagination } from '../../components/UI/Pagination/Pagination';
import PizzasSkeleton from '../../components/UI/Skeleton/Skeleton';
import { Sort } from '../../components/UI/Sort/Sort';
import { setCategoryId, setCurrentPage, setSort } from '../../redux/slices/filterSlice';
export const Home = () => {
  const [items, setItems] = useState([]);
  const searchValue = useSelector((state) => state.filter.searchValue);
  const categoryId = useSelector((state) => state.filter.categoryId);
  const sortType = useSelector((state) => state.filter.sort);
  const currentPage = useSelector((state) => state.filter.currentPage);
  const dispatch = useDispatch();

  const onChangeCategory = (index) => {
    dispatch(setCategoryId(index));
  };
  const onChangeSortType = (obj) => {
    dispatch(setSort(obj));
  };
  const onChangePage = (page) => {
    dispatch(setCurrentPage(page));
  };
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    const sortBy = sortType.sortProperty.replace('-', '');
    const order = sortType.sortProperty.includes('-') ? 'asc' : 'desc';
    const category = categoryId > 0 ? `category=${categoryId}` : '';
    const search = searchValue ? `&search=${searchValue}` : '';

    const fetchPizzas = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const res = await fetch(
          `https://699a19b6377ac05ce28d3cd2.mockapi.io/items?page=${currentPage}&limit=4&${category}&sortBy=${sortBy}&order=${order}${search}`,
        );
        if (!res.ok) {
          throw new Error(`Ошибка сервера: ${res.status}`);
        }
        const result = await res.json();
        setItems(result);
      } catch (err) {
        setIsError(true);
        setItems([]);
        console.error('Ошибка при загрузке:', err.message);
      } finally {
        setIsLoading(false);
        window.scrollTo(0, 0);
      }
    };
    fetchPizzas();
  }, [categoryId, sortType, searchValue, currentPage]);

  const pizzas = Array.isArray(items)
    ? items.map((obj) => <ContentItems key={obj.id} {...obj} />)
    : [];
  const skeletons = [...new Array(6)].map((_, index) => <PizzasSkeleton key={index} />);

  return (
    <div className="container">
      <div className="content__top">
        <Categories value={categoryId} onClickCategory={onChangeCategory} />
        <Sort value={sortType} onChangeSort={onChangeSortType} />
      </div>
      <h2 className="content__title">Все пиццы</h2>
      {isError ? (
        <div style={{ display: 'flex', justifyContent: 'center', fontSize: '24px' }}>
          <strong>Произошла ошибка, пицц не будет😭</strong>
        </div>
      ) : (
        <div className="content__items">{isLoading ? skeletons : pizzas}</div>
      )}
      <Pagination onChangePage={onChangePage}></Pagination>
    </div>
  );
};
