import { useDispatch, useSelector } from 'react-redux';
import { setSearchValue } from '../../../redux/slices/filterSlice';
import styles from './SearchBar.module.scss';

export const SearchBar = () => {
  const searchValue = useSelector((state) => state.filter.searchValue);

  const dispatch = useDispatch();
  const onChangeSearch = (i) => {
    dispatch(setSearchValue(i));
  };
  console.log(onChangeSearch);
  return (
    <div className={styles.root}>
      <svg
        className={styles.icon}
        width="800px"
        height="800px"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {/* контролируемый инпут */}
      <input
        value={searchValue}
        onChange={(event) => onChangeSearch(event.target.value)}
        className={styles.input}
        placeholder="Поиск пиццы..."
      />
      {searchValue && (
        <svg
          onClick={() => onChangeSearch('')}
          className={styles.clearIcon}
          width="800px"
          height="800px"
          viewBox="-0.5 0 25 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 21.32L21 3.32001"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 3.32001L21 21.32"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
};
