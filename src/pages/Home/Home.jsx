import qs from 'qs'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { PizzaCard } from '@/entities/pizza/ui/PizzaCard'
import PizzasSkeleton from '@/entities/pizza/ui/PizzaSkeleton'
import { Categories } from '@/features/filter-pizzas/ui/Categories'
import { Sort, sortList } from '@/features/filter-pizzas/ui/Sort'
import { Pagination } from '@/shared/ui/Pagination/Pagination'

import { fetchPizzas } from '@/entities/pizza/model/pizzaSlice'
import {
  setCategoryId,
  setCurrentPage,
  setFilters,
  setSort,
} from '@/features/filter-pizzas/model/filterSlice'

export const Home = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isMounted = useRef(false)
  const [filtersInitialized, setFiltersInitialized] = useState(false)

  // Селекторы
  const searchValue = useSelector((state) => state.filter.searchValue)
  const categoryId = useSelector((state) => state.filter.categoryId)
  const sortType = useSelector((state) => state.filter.sort)
  const currentPage = useSelector((state) => state.filter.currentPage)
  const pageItems = useSelector((state) => state.pizzas.items)
  const status = useSelector((state) => state.pizzas.status)

  const onChangeCategory = useCallback(
    (index) => {
      dispatch(setCategoryId(index))
    },
    [dispatch],
  )

  const onChangeSortType = useCallback(
    (obj) => {
      dispatch(setSort(obj))
    },
    [dispatch],
  )

  const onChangePage = useCallback(
    (page) => {
      dispatch(setCurrentPage(page))
    },
    [dispatch],
  )

  useEffect(() => {
    if (filtersInitialized === false) {
      return
    } else {
      if (isMounted.current) {
        const queryString = qs.stringify({
          sortProperty: sortType.sortProperty,
          categoryId,
          currentPage,
        })
        navigate(`?${queryString}`)
      }
      isMounted.current = true
    }
  }, [categoryId, filtersInitialized, sortType.sortProperty, currentPage, navigate])

  useEffect(() => {
    if (window.location.search) {
      const params = qs.parse(window.location.search.substring(1))
      let validPage = Number(params.currentPage)
      validPage = Number.isInteger(validPage) && validPage >= 1 ? validPage : 1
      let validCategory = Number(params.categoryId)
      validCategory =
        Number.isInteger(validCategory) && validCategory >= 0 && validCategory <= 5
          ? validCategory
          : 0
      const sortObj = sortList.find((obj) => obj.sortProperty === params.sortProperty)
      let validSortObj = {}
      if (sortObj) {
        validSortObj = sortObj
      } else {
        validSortObj = sortList.find((obj) => obj.sortProperty === 'rating')
      }
      dispatch(
        setFilters({ sort: validSortObj, currentPage: validPage, categoryId: validCategory }),
      )
    }

    setFiltersInitialized(true)
  }, [dispatch])

  const getPizzas = useCallback(() => {
    const sortBy = sortType.sortProperty.replace('-', '')
    const order = sortType.sortProperty.includes('-') ? 'asc' : 'desc'
    const category = categoryId > 0 ? `&category=${categoryId}` : ''
    const search = searchValue ? `&search=${searchValue}` : ''

    dispatch(fetchPizzas({ sortBy, order, category, search, currentPage }))
  }, [categoryId, sortType, searchValue, currentPage, dispatch])

  useEffect(() => {
    if (filtersInitialized === false) {
      return
    }
    getPizzas()
  }, [getPizzas, filtersInitialized])

  const handleRetry = () => {
    getPizzas()
  }

  const isFulfilled = status === 'fulfilled'
  const isItemsEmpty = isFulfilled && pageItems.length === 0

  const skeletons = [...new Array(6)].map((_, index) => <PizzasSkeleton key={index} />)
  const pizzas = pageItems.map((obj) => <PizzaCard key={obj.id} {...obj} />)

  const emptyStateMessage = searchValue
    ? 'По вашему запросу ничего не найдено'
    : 'В этой категории пока нет пицц'

  const renderContent = () => {
    if (status === 'pending') {
      return <div className="content__items">{skeletons}</div>
    }

    if (status === 'rejected') {
      return (
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
      )
    }

    if (isItemsEmpty) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0', fontSize: '20px' }}>
          <strong>{emptyStateMessage}</strong>
        </div>
      )
    }

    return <div className="content__items">{pizzas}</div>
  }

  return (
    <div className="container">
      <div className="content__top">
        <Categories value={categoryId} onClickCategory={onChangeCategory} />
        <Sort value={sortType} onChangeSort={onChangeSortType} />
      </div>

      <h2 className="content__title">Все пиццы</h2>

      {renderContent()}

      {isFulfilled && !isItemsEmpty && <Pagination onChangePage={onChangePage} />}
    </div>
  )
}
