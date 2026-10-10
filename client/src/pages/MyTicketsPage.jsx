/**
 * MyTicketsPage - Complete Ticket Management with Search & Filters
 * Refactored to use shared DashboardLayout and components (Phase 2)
 */

import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ticketAPI } from "../services/api";
import { CreateTicketModal } from "../components/CreateTicketModal";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { EmptyState } from "../components/common/EmptyState";
import { Pagination } from "../components/common/Pagination";
import "../styles/dashboard.css";
import {
  formatDate,
  getStatusColor,
  getPriorityColor,
  formatTicketId,
} from "../utils/formatters";

export const MyTicketsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const outletContext = useOutletContext();
  const onOpenLayoutCreate = outletContext?.onOpenCreateTicket;

  // Tickets state
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Sync searchQuery from layout topbar if provided
  useEffect(() => {
    if (outletContext?.searchQuery !== undefined) {
      setSearchQuery(outletContext.searchQuery);
    }
  }, [outletContext?.searchQuery]);

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
      const data = await ticketAPI.getMyTickets(currentPage, 10, {
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        category: categoryFilter || undefined,
      });

      setTickets(data.tickets || []);
      setTotalTickets(data.total || 0);
      setTotalPages(data.pages || 1);
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

  const handleCreateTicketClick = () => {
    if (onOpenLayoutCreate) {
      onOpenLayoutCreate();
    } else {
      setShowCreateModal(true);
    }
  };

  return (
    <div className="my-tickets-page-view">
      {/* Page Title and Actions */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tickets</h1>
          <p className="page-subtitle">
            Manage and track all your support requests in one place
          </p>
        </div>
        <button
          onClick={handleCreateTicketClick}
          className="create-button"
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
      <div className="filters-card">
        <div className="filters-row">
          {/* Status Filter */}
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="">All Categories</option>
              <option value="Technical Issue">Technical Issue</option>
              <option value="Account Access">Account Access</option>
              <option value="Feature Request">Feature Request</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="filter-group">
            <label className="filter-label">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
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
              className="clear-filters-button"
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
        <div className="results-count">
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
        <div className="table-card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created On</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td>
                      <span className="ticket-id">
                        #TK-{String(ticket._id).slice(-4).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="ticket-title-container">
                        <span className="ticket-title">{ticket.title}</span>
                        <span className="ticket-description">
                          {ticket.description?.substring(0, 60)}
                          {ticket.description?.length > 60 ? "..." : ""}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="category-cell">
                        {ticket.category || "Technical Issue"}
                      </span>
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          color: getStatusColor(ticket.status),
                          backgroundColor: `${getStatusColor(ticket.status)}15`,
                        }}
                      >
                        ● {ticket.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <span
                        className="priority-badge"
                        style={{
                          color: getPriorityColor(ticket.priority),
                          backgroundColor: `${getPriorityColor(ticket.priority)}15`,
                        }}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td>
                      <span className="date-text">
                        {formatDate(ticket.createdAt)}
                      </span>
                    </td>
                    <td>
                      <span className="date-text">
                        {formatDate(ticket.updatedAt)}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => navigate(`/tickets/${ticket._id}`)}
                        className="view-button"
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
              onPageChange={(p) => setCurrentPage(p)}
            />
          )}
        </div>
      )}

      {/* Create Ticket Modal Fallback */}
      {showCreateModal && (
        <CreateTicketModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchTickets();
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};
