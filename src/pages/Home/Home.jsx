import qs from 'qs';
import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { PizzaCard } from '@/entities/pizza/ui/PizzaCard';
import PizzasSkeleton from '@/entities/pizza/ui/PizzaSkeleton';
import { Categories } from '@/features/filter-pizzas/ui/Categories';
import { Sort, sortList } from '@/features/filter-pizzas/ui/Sort';
import { Pagination } from '@/shared/ui/Pagination/Pagination';

import { fetchPizzas } from '@/entities/pizza/model/pizzaSlice';
import {
  setCategoryId,
  setCurrentPage,
  setFilters,
  setSort,
} from '@/features/filter-pizzas/model/filterSlice';

export const Home = () => {
  // React Router
  const navigate = useNavigate();

  // Redux
  const dispatch = useDispatch();

  const isMounted = useRef(false);

  const searchValue = useSelector((state) => state.filter.searchValue);
  const categoryId = useSelector((state) => state.filter.categoryId);
  const sortType = useSelector((state) => state.filter.sort);
  const currentPage = useSelector((state) => state.filter.currentPage);
  const pageItems = useSelector((state) => state.pizzas.items);
  const status = useSelector((state) => state.pizzas.status);
  const isError = useSelector((state) => state.pizzas.status === 'rejected');

  const onChangeCategory = useCallback(
    (index) => {
      dispatch(setCategoryId(index));
    },
    [dispatch],
  );

  const onChangeSortType = useCallback(
    (obj) => {
      dispatch(setSort(obj));
    },
    [dispatch],
  );

  const onChangePage = useCallback(
    (page) => {
      dispatch(setCurrentPage(page));
    },
    [dispatch],
  );

  const getPizzas = useCallback(() => {
    const sortBy = sortType.sortProperty.replace('-', '');
    const order = sortType.sortProperty.includes('-') ? 'asc' : 'desc';
    const category = categoryId > 0 ? `&category=${categoryId}` : '';
    const search = searchValue ? `&search=${searchValue}` : '';

    dispatch(fetchPizzas({ sortBy, order, category, search, currentPage }));
  }, [categoryId, sortType, searchValue, currentPage, dispatch]);

  useEffect(() => {
    getPizzas();
  }, [getPizzas]);

  const handleRetry = () => {
    getPizzas();
  };

  // Sync filters with URL
  useEffect(() => {
    if (isMounted.current) {
      const queryString = qs.stringify({
        sortProperty: sortType.sortProperty,
        categoryId,
        currentPage,
      });
      navigate(`?${queryString}`);
    }
    isMounted.current = true;
  }, [categoryId, sortType.sortProperty, currentPage, navigate]);

  useEffect(() => {
    if (window.location.search) {
      const params = qs.parse(window.location.search.substring(1));
      const sortObj = sortList.find((obj) => obj.sortProperty === params.sortProperty);
      dispatch(setFilters({ ...params, sort: sortObj }));
    }
  }, [dispatch]);

  // Derived data
  const pizzas = pageItems.map((obj) => <PizzaCard key={obj.id} {...obj} />);
  const skeletons = [...new Array(6)].map((_, index) => <PizzasSkeleton key={index} />);

  return (
    <div className="container">
      <div className="content__top">
        <Categories value={categoryId} onClickCategory={onChangeCategory} />
        <Sort value={sortType} onChangeSort={onChangeSortType} />
      </div>

      <h2 className="content__title">Все пиццы</h2>

      {isError ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px',
            justifyContent: 'center',
            fontSize: '24px',
            margin: '40px 0',
          }}
        >
          <strong>Произошла ошибка, пицц не будет 😭</strong>
          <button onClick={handleRetry} className="button">
            Попробовать снова
          </button>
        </div>
      ) : (
        <div className="content__items">{status === 'pending' ? skeletons : pizzas}</div>
      )}

      {!isError && <Pagination onChangePage={onChangePage} />}
    </div>
  );
};
