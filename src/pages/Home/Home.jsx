import qs from 'qs';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Categories } from '@/components/Categories/Categories';
import { ContentItems } from '@/components/ContentItems/ContentItems';
import { Pagination } from '@/components/Pagination/Pagination';
import PizzasSkeleton from '@/components/Skeleton/Skeleton';
import { Sort, sortList } from '@/components/Sort/Sort';

import { setCategoryId, setCurrentPage, setFilters, setSort } from '@/store/slices/filterSlice';
import { fetchPizzas } from '@/store/slices/pizzaSlice';

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
  const isError = useSelector((state) => state.pizzas.error === 'rejected');

  // Handlers
  const onChangeCategory = (index) => {
    dispatch(setCategoryId(index));
  };

  const onChangeSortType = (obj) => {
    dispatch(setSort(obj));
  };

  const onChangePage = (page) => {
    dispatch(setCurrentPage(page));
  };

  useEffect(() => {
    if (window.location.search) {
      const params = qs.parse(window.location.search.substring(1));
      const sortObj = sortList.find((obj) => obj.sortProperty === params.sortProperty);
      dispatch(setFilters({ ...params, sort: sortObj }));
    }
  }, []);
  // Fetch pizzas
  useEffect(() => {
    const sortBy = sortType.sortProperty.replace('-', '');
    const order = sortType.sortProperty.includes('-') ? 'asc' : 'desc';
    const category = categoryId > 0 ? `&category=${categoryId}` : '';
    const search = searchValue ? `&search=${searchValue}` : '';

    dispatch(fetchPizzas({ sortBy, order, category, search, currentPage }));
  }, [categoryId, sortType, searchValue, currentPage]);

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
  }, [categoryId, sortType.sortProperty, currentPage]);

  // Derived data

  const pizzas = pageItems.map((obj) => <ContentItems key={obj.id} {...obj} />);

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
            justifyContent: 'center',
            fontSize: '24px',
          }}
        >
          <strong>Произошла ошибка, пицц не будет 😭</strong>
        </div>
      ) : (
        <div className="content__items">{status === 'pending' ? skeletons : pizzas}</div>
      )}

      <Pagination onChangePage={onChangePage} />
    </div>
  );
};
