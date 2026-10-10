/**
 * MyTicketsPage - Complete Ticket Management with Search & Filters
 * Refactored to use shared DashboardLayout and components (Phase 2)
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ticketAPI } from "../services/api";
import { CreateTicketModal } from "../components/CreateTicketModal";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { EmptyState } from "../components/common/EmptyState";
import { Pagination } from "../components/common/Pagination";
import { customerNavItems } from "../config/navigation";
import { sharedStyles } from "../styles/sharedStyles";
import {
  formatDate,
  getStatusColor,
  getPriorityColor,
  formatTicketId,
} from "../utils/formatters";

export const MyTicketsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Tickets state
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeNav, setActiveNav] = useState("tickets");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);

  useEffect(() => {
    fetchTickets();
  }, [currentPage, statusFilter, categoryFilter, priorityFilter, searchQuery]);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await ticketAPI.getMyTickets(currentPage, 10);
      let filteredTickets = data.tickets || [];

      // Apply filters
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredTickets = filteredTickets.filter(
          (ticket) =>
            ticket.title.toLowerCase().includes(query) ||
            ticket.description.toLowerCase().includes(query) ||
            `#TK-${String(ticket._id).slice(-4)}`.toLowerCase().includes(query),
        );
      }

      if (statusFilter) {
        filteredTickets = filteredTickets.filter(
          (t) => t.status === statusFilter,
        );
      }

      if (categoryFilter) {
        filteredTickets = filteredTickets.filter(
          (t) => (t.category || "Technical Issue") === categoryFilter,
        );
      }

      if (priorityFilter) {
        filteredTickets = filteredTickets.filter(
          (t) => t.priority === priorityFilter,
        );
      }

      setTickets(filteredTickets);
      setTotalTickets(filteredTickets.length);
      setTotalPages(Math.ceil(filteredTickets.length / 10));
    } catch (err) {
      setError(err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setCategoryFilter("");
    setPriorityFilter("");
    setCurrentPage(1);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <DashboardLayout
      navItems={customerNavItems}
      activeNav={activeNav}
      onNavChange={(nav) => {
        setActiveNav(nav);
        if (nav === "dashboard") navigate("/dashboard");
        else if (nav === "create") setShowCreateModal(true);
        else if (nav === "tickets") navigate("/tickets");
        else if (nav === "profile") navigate("/profile");
      }}
      searchQuery={searchQuery}
      onSearchChange={handleSearch}
      notificationCount={0}
      showSearch={true}
      userName={user?.name || "User"}
      userRole="Customer"
      onLogout={logout}
    >
      {/* Page Title and Actions */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>My Tickets</h1>
          <p style={styles.pageSubtitle}>
            Manage and track all your support requests in one place
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={styles.createButton}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="1.5" />
            <path
              d="M10 7V13M7 10H13"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Create New Ticket
        </button>
      </div>

      {/* Filters Section */}
      <div style={styles.filtersCard}>
        <div style={styles.filtersRow}>
          {/* Status Filter */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={styles.filterSelect}
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={styles.filterSelect}
            >
              <option value="">All Categories</option>
              <option value="Technical Issue">Technical Issue</option>
              <option value="Account Access">Account Access</option>
              <option value="Feature Request">Feature Request</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={styles.filterSelect}
            >
              <option value="">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery ||
            statusFilter ||
            categoryFilter ||
            priorityFilter) && (
            <button
              onClick={handleClearFilters}
              style={styles.clearFiltersButton}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 4L12 12M4 12L12 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Clear Filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div style={styles.resultsCount}>
          Showing {tickets.length} of {totalTickets} tickets
        </div>
      </div>

      {/* Tickets Content */}
      {loading ? (
        <LoadingState message="Loading tickets..." />
      ) : error ? (
        <ErrorState
          title="Failed to load tickets"
          message={error}
          onRetry={fetchTickets}
        />
      ) : tickets.length === 0 ? (
        <EmptyState
          title={
            searchQuery || statusFilter || categoryFilter || priorityFilter
              ? "No tickets match your filters"
              : "No tickets yet"
          }
          message={
            searchQuery || statusFilter || categoryFilter || priorityFilter
              ? "Try adjusting your search or filters"
              : "Create your first support ticket to get started"
          }
          actionLabel={
            !(searchQuery || statusFilter || categoryFilter || priorityFilter)
              ? "Create Ticket"
              : null
          }
          onAction={
            !(searchQuery || statusFilter || categoryFilter || priorityFilter)
              ? () => setShowCreateModal(true)
              : null
          }
        />
      ) : (
        <div style={styles.tableCard}>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead style={styles.tableHead}>
                <tr>
                  <th style={styles.th}>Ticket ID</th>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Priority</th>
                  <th style={styles.th}>Created On</th>
                  <th style={styles.th}>Last Updated</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket._id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.ticketId}>
                        #TK-{String(ticket._id).slice(-4).toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.ticketTitleContainer}>
                        <span style={styles.ticketTitle}>{ticket.title}</span>
                        <span style={styles.ticketDescription}>
                          {ticket.description?.substring(0, 60)}
                          {ticket.description?.length > 60 ? "..." : ""}
                        </span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.category}>
                        {ticket.category || "Technical Issue"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          color: getStatusColor(ticket.status),
                          backgroundColor: `${getStatusColor(ticket.status)}15`,
                        }}
                      >
                        ● {ticket.status.replace("_", " ")}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.priorityBadge,
                          color: getPriorityColor(ticket.priority),
                          backgroundColor: `${getPriorityColor(ticket.priority)}15`,
                        }}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.dateText}>
                        {formatDate(ticket.createdAt)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.dateText}>
                        {formatDate(ticket.updatedAt)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => navigate(`/tickets/${ticket._id}`)}
                        style={styles.viewButton}
                        title="View details"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                        >
                          <path
                            d="M1 9C1 9 3.5 3.5 9 3.5C14.5 3.5 17 9 17 9C17 9 14.5 14.5 9 14.5C3.5 14.5 1 9 1 9Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <circle
                            cx="9"
                            cy="9"
                            r="2.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPreviousPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
              onNextPage={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
            />
          )}
        </div>
      )}

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setActiveNav("tickets");
        }}
        onSuccess={() => {
          fetchTickets();
          setShowCreateModal(false);
          setActiveNav("tickets");
        }}
      />
    </DashboardLayout>
  );
};

// Inline styles for page-specific UI (filters, table, etc.)
const styles = {
  pageHeader: {
    padding: "2rem",
    backgroundColor: "white",
    borderBottom: "1px solid #E5E7EB",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: "260px",
  },

  pageTitle: {
    fontSize: "1.875rem",
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: "0.5rem",
  },

  pageSubtitle: {
    fontSize: "0.875rem",
    color: "#6B7280",
  },

  createButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#2563EB",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  filtersCard: {
    margin: "1.5rem 2rem 0 calc(260px + 2rem)",
    padding: "1.5rem",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  },

  filtersRow: {
    display: "flex",
    gap: "1rem",
    alignItems: "flex-end",
    flexWrap: "wrap",
  },

  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    minWidth: "180px",
  },

  filterLabel: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  filterSelect: {
    padding: "0.625rem 0.875rem",
    fontSize: "0.875rem",
    color: "#374151",
    backgroundColor: "white",
    border: "1px solid #D1D5DB",
    borderRadius: "8px",
    outline: "none",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  clearFiltersButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.625rem 1rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#6B7280",
    backgroundColor: "#F9FAFB",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  resultsCount: {
    marginTop: "1rem",
    fontSize: "0.875rem",
    color: "#6B7280",
  },

  tableCard: {
    margin: "1.5rem 2rem 2rem calc(260px + 2rem)",
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

  ticketTitleContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },

  ticketTitle: {
    fontWeight: "600",
    color: "#1F2937",
  },

  ticketDescription: {
    fontSize: "0.75rem",
    color: "#9CA3AF",
  },

  category: {
    fontSize: "0.8125rem",
    color: "#6B7280",
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
};
