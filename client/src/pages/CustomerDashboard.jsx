/**
 * CustomerDashboard - SupportHub
 * Modern customer dashboard rendered inside the shared CustomerLayout architecture
 * Displays personalized welcome banner, ticket statistics, recent tickets, and categories
 */

import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ticketAPI } from "../services/api";
import { CreateTicketModal } from "../components/CreateTicketModal";

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const searchQuery = outletContext?.searchQuery || "";
  const onOpenLayoutCreate = outletContext?.onOpenCreateTicket;

  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLocalCreateModal, setShowLocalCreateModal] = useState(false);

  useEffect(() => {
    fetchTicketsAndStats();
  }, []);

  const fetchTicketsAndStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await ticketAPI.getMyTickets(1, 10);
      setTickets(data.tickets || []);

      // Calculate stats
      const ticketStats = (data.tickets || []).reduce(
        (acc, ticket) => {
          acc.total++;
          if (ticket.status === "OPEN") acc.open++;
          if (ticket.status === "IN_PROGRESS") acc.inProgress++;
          if (ticket.status === "RESOLVED") acc.resolved++;
          return acc;
        },
        { total: 0, open: 0, inProgress: 0, resolved: 0 },
      );

      setStats(ticketStats);
      if (outletContext?.refreshData) {
        outletContext.refreshData();
      }
    } catch (err) {
      setError(err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateTicket = () => {
    if (onOpenLayoutCreate) {
      onOpenLayoutCreate();
    } else {
      setShowLocalCreateModal(true);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      OPEN: "var(--color-error)",
      IN_PROGRESS: "var(--color-warning)",
      RESOLVED: "var(--color-success)",
      CLOSED: "var(--color-gray-500)",
    };
    return colors[status] || "var(--color-gray-500)";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      HIGH: "var(--color-error)",
      MEDIUM: "var(--color-warning)",
      LOW: "var(--color-success)",
    };
    return colors[priority] || "var(--color-gray-500)";
  };

  const filteredTickets = searchQuery
    ? tickets.filter(
        (t) =>
          t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `#TK-${String(t._id).slice(-4)}`.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : tickets;

  return (
    <div className="customer-dashboard-view">
      {/* Welcome Banner */}
      <div className="dashboard-welcome-banner">
        <div className="dashboard-welcome-content">
          <p className="dashboard-welcome-greeting">WELCOME BACK,</p>
          <h1 className="dashboard-welcome-title">{user?.name || "Customer"}!</h1>
          <p className="dashboard-welcome-subtitle">
            Here's your support ticket overview and quick actions
          </p>
        </div>
        <div className="dashboard-welcome-illustration">
          <svg width="280" height="180" viewBox="0 0 280 180" fill="none">
            <rect
              x="40"
              y="40"
              width="200"
              height="100"
              rx="8"
              fill="white"
            />
            <rect
              x="40"
              y="40"
              width="200"
              height="100"
              rx="8"
              stroke="#E5E7EB"
              strokeWidth="2"
            />
            <circle cx="60" cy="60" r="4" fill="#3B82F6" />
            <rect
              x="75"
              y="55"
              width="60"
              height="10"
              rx="5"
              fill="#DBEAFE"
            />
            <rect
              x="60"
              y="80"
              width="100"
              height="6"
              rx="3"
              fill="#F3F4F6"
            />
            <rect x="60" y="95" width="80" height="6" rx="3" fill="#F3F4F6" />
            <circle cx="20" cy="20" r="20" fill="#DBEAFE" opacity="0.5" />
            <circle cx="250" cy="150" r="25" fill="#93C5FD" opacity="0.3" />
          </svg>
        </div>
      </div>

      {/* Page Content */}
      <div className="dashboard-content">
        {/* Statistics Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon">📋</div>
            <div className="stat-card-label">TOTAL TICKETS</div>
            <div className="stat-card-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">🔴</div>
            <div className="stat-card-label">OPEN</div>
            <div className="stat-card-value">{stats.open}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">⏳</div>
            <div className="stat-card-label">IN PROGRESS</div>
            <div className="stat-card-value">{stats.inProgress}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">✅</div>
            <div className="stat-card-label">RESOLVED</div>
            <div className="stat-card-value">{stats.resolved}</div>
          </div>
        </div>

        {/* Recent Tickets Section */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <div>
              <h2 className="dashboard-section-title">Recent Tickets</h2>
            </div>
            <div>
              <button
                type="button"
                onClick={handleOpenCreateTicket}
                className="btn btn--primary"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <circle
                    cx="10"
                    cy="10"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M10 7V13M7 10H13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Create New Ticket
              </button>
            </div>
          </div>

          <div className="dashboard-section-body">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading tickets...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <div className="error-state__icon">⚠️</div>
                <h3 className="error-state__title">Failed to load tickets</h3>
                <p className="error-state__message">{error}</p>
                <button
                  type="button"
                  onClick={fetchTicketsAndStats}
                  className="btn btn--primary"
                >
                  Try Again
                </button>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">🎫</div>
                <h3 className="empty-state__title">
                  {searchQuery ? "No matching tickets found" : "No tickets yet"}
                </h3>
                <p className="empty-state__message">
                  {searchQuery
                    ? "Try adjusting your search criteria"
                    : "Create your first support ticket to get started"}
                </p>
                {!searchQuery && (
                  <button
                    type="button"
                    onClick={handleOpenCreateTicket}
                    className="btn btn--primary"
                  >
                    Create Ticket
                  </button>
                )}
              </div>
            ) : (
              <div className="table-container">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th className="dashboard-table th">Ticket ID</th>
                      <th className="dashboard-table th">Title</th>
                      <th className="dashboard-table th">Category</th>
                      <th className="dashboard-table th">Status</th>
                      <th className="dashboard-table th">Priority</th>
                      <th className="dashboard-table th">Created</th>
                      <th className="dashboard-table th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.slice(0, 5).map((ticket) => (
                      <tr key={ticket._id} className="dashboard-table tr">
                        <td className="dashboard-table td">
                          <span className="ticket-id">
                            #TK-
                            {String(ticket._id)
                              .slice(-4)
                              .toUpperCase()
                              .padStart(4, "0")}
                          </span>
                        </td>
                        <td className="dashboard-table td">
                          <div className="ticket-title-wrapper">
                            <span className="ticket-title-text">
                              {ticket.title}
                            </span>
                            <span className="ticket-description-text">
                              {ticket.description?.substring(0, 50)}
                              {ticket.description?.length > 50 ? "..." : ""}
                            </span>
                          </div>
                        </td>
                        <td className="dashboard-table td">
                          <span className="category-badge">
                            {ticket.category || "Technical Issue"}
                          </span>
                        </td>
                        <td className="dashboard-table td">
                          <span
                            className="badge badge--status"
                            style={{
                              color: getStatusColor(ticket.status),
                              backgroundColor: `${getStatusColor(ticket.status)}15`,
                            }}
                          >
                            ● {ticket.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="dashboard-table td">
                          <span
                            className="badge badge--priority"
                            style={{
                              color: getPriorityColor(ticket.priority),
                            }}
                          >
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="dashboard-table td">
                          <span className="date-text">
                            {formatDate(ticket.createdAt)}
                          </span>
                        </td>
                        <td className="dashboard-table td">
                          <button
                            type="button"
                            onClick={() => navigate(`/tickets/${ticket._id}`)}
                            className="action-button"
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
                                cy="2.5"
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
            )}
          </div>

          {!loading && !error && filteredTickets.length > 0 && (
            <div className="dashboard-section-footer">
              <button
                type="button"
                onClick={() => navigate("/tickets")}
                className="dashboard-section-action"
              >
                View All Tickets →
              </button>
            </div>
          )}
        </div>

        {/* Bottom Grid: Quick Actions & Support Categories */}
        <div className="dashboard-bottom-grid">
          {/* Quick Actions */}
          <div className="card-section">
            <div className="card-section__header">
              <h3 className="card-section__title">Quick Actions</h3>
            </div>
            <div className="card-section__body">
              <div className="quick-actions-list">
                <button
                  type="button"
                  onClick={handleOpenCreateTicket}
                  className="quick-action-item"
                >
                  <div className="quick-action-icon">➕</div>
                  <div className="quick-action-content">
                    <div className="quick-action-title">Create Ticket</div>
                    <div className="quick-action-description">
                      Report a new issue
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/tickets")}
                  className="quick-action-item"
                >
                  <div className="quick-action-icon">📋</div>
                  <div className="quick-action-content">
                    <div className="quick-action-title">My Tickets</div>
                    <div className="quick-action-description">
                      View all your tickets
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="quick-action-item"
                >
                  <div className="quick-action-icon">👤</div>
                  <div className="quick-action-content">
                    <div className="quick-action-title">Profile</div>
                    <div className="quick-action-description">
                      Manage your account
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Support Categories */}
          <div className="card-section">
            <div className="card-section__header">
              <div>
                <h3 className="card-section__title">Support Categories</h3>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateTicket}
                className="dashboard-section-action"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                View All →
              </button>
            </div>
            <div className="card-section__body">
              <div className="categories-grid">
                <div className="category-card" onClick={handleOpenCreateTicket} role="button" tabIndex={0}>
                  <div className="category-icon">🔧</div>
                  <div className="category-name">Technical Issue</div>
                </div>
                <div className="category-card" onClick={handleOpenCreateTicket} role="button" tabIndex={0}>
                  <div className="category-icon">🔑</div>
                  <div className="category-name">Account Access</div>
                </div>
                <div className="category-card" onClick={handleOpenCreateTicket} role="button" tabIndex={0}>
                  <div className="category-icon">💡</div>
                  <div className="category-name">Feature Request</div>
                </div>
                <div className="category-card" onClick={handleOpenCreateTicket} role="button" tabIndex={0}>
                  <div className="category-icon">❓</div>
                  <div className="category-name">General Inquiry</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Local Create Ticket Modal fallback */}
      {showLocalCreateModal && (
        <CreateTicketModal
          isOpen={showLocalCreateModal}
          onClose={() => setShowLocalCreateModal(false)}
          onSuccess={() => {
            fetchTicketsAndStats();
            setShowLocalCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
