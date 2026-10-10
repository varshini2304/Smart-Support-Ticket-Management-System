/**
 * Pagination Component
 * Reusable pagination controls for tables and lists
 */

import { sharedStyles } from "../../styles/sharedStyles";

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div style={sharedStyles.pagination}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          ...sharedStyles.paginationButton,
          ...(currentPage === 1 && sharedStyles.paginationButtonDisabled),
        }}
      >
        Previous
      </button>

      <div style={sharedStyles.paginationInfo}>
        Page {currentPage} of {totalPages}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          ...sharedStyles.paginationButton,
          ...(currentPage === totalPages && sharedStyles.paginationButtonDisabled),
        }}
      >
        Next
      </button>
    </div>
  );
};
