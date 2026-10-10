/**
 * Shared inline styles for SupportHub
 * Common styles used across multiple pages to ensure consistency
 */

export const sharedStyles = {
  // Layout
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#F9FAFB",
  },

  // Sidebar
  sidebar: {
    width: "260px",
    backgroundColor: "white",
    borderRight: "1px solid #E5E7EB",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    height: "100vh",
    left: 0,
    top: 0,
    zIndex: 10,
  },

  sidebarHeader: {
    padding: "1.5rem 1.25rem",
    borderBottom: "1px solid #E5E7EB",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },

  logoText: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#1F2937",
  },

  nav: {
    padding: "1.5rem 0.75rem",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },

  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#6B7280",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    textAlign: "left",
  },

  navItemActive: {
    color: "#2563EB",
    backgroundColor: "#EFF6FF",
  },

  // Main Content
  main: {
    flex: 1,
    marginLeft: "260px",
    minHeight: "100vh",
  },

  // Header
  header: {
    backgroundColor: "white",
    borderBottom: "1px solid #E5E7EB",
    padding: "1rem 2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1.5rem",
    position: "sticky",
    top: 0,
    zIndex: 5,
  },

  searchContainer: {
    position: "relative",
    flex: 1,
    maxWidth: "500px",
  },

  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },

  searchInput: {
    width: "100%",
    padding: "0.625rem 2.5rem 0.625rem 2.75rem",
    fontSize: "0.875rem",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    outline: "none",
    transition: "all 0.2s",
  },

  clearSearchButton: {
    position: "absolute",
    right: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    padding: "4px 8px",
    background: "none",
    border: "none",
    color: "#9CA3AF",
    cursor: "pointer",
    fontSize: "14px",
  },

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },

  iconButton: {
    position: "relative",
    padding: "0.5rem",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "8px",
    color: "#6B7280",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  notificationBadge: {
    position: "absolute",
    top: "4px",
    right: "4px",
    minWidth: "18px",
    height: "18px",
    padding: "0 4px",
    fontSize: "10px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#EF4444",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // User Menu
  userMenuContainer: {
    position: "relative",
  },

  userButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.5rem",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  userAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#2563EB",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.875rem",
    fontWeight: "600",
  },

  userInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "2px",
  },

  userName: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#1F2937",
  },

  userRole: {
    fontSize: "0.75rem",
    color: "#6B7280",
  },

  userMenu: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    minWidth: "200px",
    backgroundColor: "white",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    zIndex: 100,
  },

  userMenuItem: {
    width: "100%",
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    color: "#374151",
    backgroundColor: "transparent",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  userMenuItemDanger: {
    width: "100%",
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    color: "#EF4444",
    backgroundColor: "transparent",
    border: "none",
    borderTop: "1px solid #E5E7EB",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  // States
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #E5E7EB",
    borderTop: "4px solid #2563EB",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "1rem",
  },

  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem 2rem",
    textAlign: "center",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
  },

  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "1rem",
  },

  emptyTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: "0.5rem",
  },

  emptyText: {
    fontSize: "0.875rem",
    color: "#6B7280",
  },

  errorState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem 2rem",
    textAlign: "center",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
  },

  errorIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },

  errorTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#EF4444",
    marginBottom: "0.5rem",
  },

  errorText: {
    fontSize: "0.875rem",
    color: "#6B7280",
    marginBottom: "1.5rem",
  },

  retryButton: {
    padding: "0.75rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#2563EB",
    backgroundColor: "white",
    border: "1px solid #2563EB",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  // Table
  tableCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    overflow: "hidden",
  },

  tableContainer: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  tableHead: {
    backgroundColor: "#F9FAFB",
  },

  th: {
    padding: "1rem",
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "left",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "1px solid #E5E7EB",
  },

  tr: {
    borderBottom: "1px solid #F3F4F6",
    transition: "background-color 0.2s",
  },

  td: {
    padding: "1rem",
    fontSize: "0.875rem",
    color: "#374151",
  },

  ticketId: {
    fontFamily: "monospace",
    fontSize: "0.8125rem",
    fontWeight: "600",
    color: "#2563EB",
  },

  ticketTitle: {
    fontWeight: "600",
    color: "#1F2937",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    padding: "0.375rem 0.75rem",
    fontSize: "0.75rem",
    fontWeight: "600",
    borderRadius: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },

  priorityBadge: {
    display: "inline-block",
    padding: "0.375rem 0.75rem",
    fontSize: "0.75rem",
    fontWeight: "600",
    borderRadius: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },

  dateText: {
    fontSize: "0.8125rem",
    color: "#6B7280",
  },

  viewButton: {
    padding: "0.5rem",
    backgroundColor: "transparent",
    border: "1px solid #E5E7EB",
    borderRadius: "6px",
    color: "#6B7280",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  // Pagination
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 1.5rem",
    borderTop: "1px solid #E5E7EB",
  },

  paginationButton: {
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
    backgroundColor: "white",
    border: "1px solid #D1D5DB",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  paginationButtonDisabled: {
    color: "#9CA3AF",
    cursor: "not-allowed",
    opacity: 0.5,
  },

  paginationInfo: {
    fontSize: "0.875rem",
    color: "#6B7280",
  },
};
