import ReactPaginate from 'react-paginate'
import styles from './Pagination.module.scss'

export const Pagination = ({ currentPage, onChangePage, pageCount }) => {
  return (
    <div>
      <ReactPaginate
        className={styles.root}
        previousLabel={'<'}
        nextLabel={'>'}
        breakLabel={'...'}
        breakClassName={'break-me'}
        pageCount={pageCount}
        marginPagesDisplayed={4} // Number of pages to show at the beginning and end
        pageRangeDisplayed={3} // Number of pages to show around the current page
        onPageChange={(event) => onChangePage(event.selected + 1)}
        forcePage={currentPage - 1}
        containerClassName={'pagination'}
        activeClassName={'active'}
      />
    </div>
  )
}
