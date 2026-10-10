import { sharedStyles } from "../../styles/sharedStyles";

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  onPreviousPage,
  onNextPage,
}) => {
  if (totalPages <= 1) return null;

  const goToPage = (page) => {
    const safePage = Math.max(1, Math.min(totalPages, page));

    if (onPageChange) {
      onPageChange(safePage);
    } else if (safePage < currentPage && onPreviousPage) {
      onPreviousPage();
    } else if (safePage > currentPage && onNextPage) {
      onNextPage();
    }
  };

  return (
    <div style={sharedStyles.pagination}>
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        style={{
          ...sharedStyles.paginationButton,
          ...(currentPage <= 1 ? sharedStyles.paginationButtonDisabled : {}),
        }}
      >
        Previous
      </button>

      <div style={sharedStyles.paginationInfo}>
        Page {currentPage} of {totalPages}
      </div>

      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        style={{
          ...sharedStyles.paginationButton,
          ...(currentPage >= totalPages
            ? sharedStyles.paginationButtonDisabled
            : {}),
        }}
      >
        Next
      </button>
    </div>
  );
};
