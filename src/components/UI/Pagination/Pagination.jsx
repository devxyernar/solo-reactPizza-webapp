import ReactPaginate from 'react-paginate';
import styles from './Pagination.module.scss';

export const Pagination = ({ onChangePage }) => {
  return (
    <div>
      <ReactPaginate
        className={styles.root}
        previousLabel={'<'}
        nextLabel={'>'}
        breakLabel={'...'}
        breakClassName={'break-me'}
        pageCount={3}
        marginPagesDisplayed={4} // Number of pages to show at the beginning and end
        pageRangeDisplayed={3} // Number of pages to show around the current page
        onPageChange={(event) => onChangePage(event.selected + 1)}
        containerClassName={'pagination'}
        activeClassName={'active'}
      />
    </div>
  );
};
