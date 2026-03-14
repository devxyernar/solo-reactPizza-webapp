import { useContext } from 'react';
import { SearchContext } from '../../../App';
import styles from './SearchBar.module.scss';

export const SearchBar = () => {
  const { searchQuerry, setSearchQuerry } = useContext(SearchContext);
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
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      {/* контролируемый инпут */}
      <input
        value={searchQuerry}
        onChange={(event) => setSearchQuerry(event.target.value)}
        className={styles.input}
        placeholder="Поиск пиццы..."
      />
      {searchQuerry && (
        <svg
          onClick={() => setSearchQuerry('')}
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
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M3 3.32001L21 21.32"
            stroke="#000000"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      )}
    </div>
  );
};
