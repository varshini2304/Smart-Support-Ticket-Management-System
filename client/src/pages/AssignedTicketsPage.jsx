/**
 * AssignedTicketsPage - Administrator Assigned Tickets Management
 * View and manage tickets assigned to team members and administrators.
 * Renders inside shared AdminLayout.
 */

import React, { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { adminAPI } from "../services/api";
import { TicketStatusBadge } from "../components/admin/TicketStatusBadge";

export const AssignedTicketsPage = () => {
  const { user } = useAuth();
  const { searchQuery = "", onOpenCreateTicket, refreshData } = useOutletContext() || {};

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("all"); // 'all', 'me', 'unassigned'

  // Edit/assign modal state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState("OPEN");
  const [modalPriority, setModalPriority] = useState("MEDIUM");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAPI.getAllTickets(1, 100, statusFilter || null);
      setTickets(data.tickets || []);
    } catch (err) {
      console.error("Failed to load assigned tickets:", err);
      setError(err.message || "Failed to load assigned tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (ticket) => {
    setSelectedTicket(ticket);
    setModalStatus(ticket.status || "OPEN");
    setModalPriority(ticket.priority || "MEDIUM");
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setSaving(true);
    try {
      await adminAPI.updateTicket(selectedTicket._id, {
        status: modalStatus,
        priority: modalPriority,
      });

      setIsModalOpen(false);
      setSelectedTicket(null);
      fetchTickets();
      if (refreshData) refreshData();
    } catch (err) {
      alert(`Error updating ticket: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Filter assigned tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Global search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ticket.title?.toLowerCase().includes(q);
        const matchId = ticket._id?.toLowerCase().includes(q);
        if (!matchTitle && !matchId) return false;
      }

      // Assignment filter
      if (assignedFilter === "me") {
        return ticket.assignedTo === user?.id || ticket.assignedTo === user?._id;
      }
      if (assignedFilter === "unassigned") {
        return !ticket.assignedTo;
      }
      return true; // 'all'
    });
  }, [tickets, searchQuery, assignedFilter, user]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-heading-group">
          <h1 className="admin-page-title">Assigned Tickets</h1>
          <p className="admin-page-subtitle">
            Track workload distribution and manage assigned tickets for support staff.
          </p>
        </div>
        <div className="admin-page-actions">
          <button
            type="button"
            className="admin-btn-create-ticket"
            onClick={onOpenCreateTicket}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Create New Ticket
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-tickets-card">
        {/* Table Filters Bar */}
        <div className="admin-table-filters-bar">
          <div className="admin-filter-inline-group">
            <label className="admin-filter-inline-label">Assignment:</label>
            <select
              className="admin-filter-inline-select"
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
            >
              <option value="all">All Tickets</option>
              <option value="me">Assigned to Me</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>

          <div className="admin-filter-inline-group">
            <label className="admin-filter-inline-label">Status:</label>
            <select
              className="admin-filter-inline-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          {(statusFilter || assignedFilter !== "all" || searchQuery) && (
            <button
              type="button"
              className="admin-filter-clear-btn"
              onClick={() => {
                setStatusFilter("");
                setAssignedFilter("all");
              }}
            >
              ✕ Clear Filters
            </button>
          )}

          <div style={{ marginLeft: "auto", fontSize: "0.8125rem", color: "#64748b" }}>
            Showing {filteredTickets.length} tickets
          </div>
        </div>

        {/* Tickets Content */}
        {loading ? (
          <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>⏳</div>
            Loading assigned tickets...
          </div>
        ) : error ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#ef4444" }}>
            <p>{error}</p>
            <button
              type="button"
              className="admin-page-nav-btn"
              style={{ marginTop: "1rem" }}
              onClick={fetchTickets}
            >
              Retry
            </button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📋</div>
            <h3 style={{ color: "#0f172a", marginBottom: "0.25rem" }}>
              No assigned tickets found
            </h3>
            <p style={{ fontSize: "0.875rem" }}>
              {assignedFilter === "me"
                ? "You currently have no tickets assigned to you."
                : "No tickets match the current filter selection."}
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Title</th>
                  <th>Customer</th>
                  <th>Assignee</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => {
                  const displayId = `#TK-${String(ticket._id).slice(-4).toUpperCase()}`;
                  const isAssignedToMe =
                    ticket.assignedTo &&
                    (ticket.assignedTo === user?.id || ticket.assignedTo === user?._id);

                  return (
                    <tr key={ticket._id}>
                      <td>
                        <span className="admin-ticket-id-tag">{displayId}</span>
                      </td>
                      <td>
                        <div className="admin-ticket-title-cell" title={ticket.title}>
                          {ticket.title}
                        </div>
                      </td>
                      <td>
                        {(() => {
                          const customerUser = ticket.createdBy;
                          const customerId =
                            customerUser?._id ||
                            (typeof customerUser === "string" ? customerUser : null);
                          const customerName =
                            customerUser?.name ||
                            customerUser?.email ||
                            (customerId ? `Customer (${String(customerId).slice(-6).toUpperCase()})` : "Unassigned");
                          return (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                              <span
                                className="admin-customer-cell"
                                title={customerId ? `User ID: ${customerId}` : undefined}
                              >
                                {customerName}
                              </span>
                              {customerId && (
                                <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontFamily: "monospace" }}>
                                  ID: {String(customerId).slice(-6).toUpperCase()}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td>
                        {ticket.assignedTo ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              fontSize: "0.8125rem",
                              fontWeight: 600,
                              color: isAssignedToMe ? "#2563eb" : "#475569",
                              backgroundColor: isAssignedToMe ? "#eff6ff" : "#f1f5f9",
                              padding: "0.2rem 0.55rem",
                              borderRadius: "6px",
                            }}
                          >
                            👤 {isAssignedToMe ? "Assigned to You" : "Assigned Admin"}
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: "0.8125rem",
                              color: "#94a3b8",
                              fontStyle: "italic",
                            }}
                          >
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td>
                        <TicketStatusBadge status={ticket.status} />
                      </td>
                      <td>
                        <span
                          className={`admin-priority-badge priority-${(
                            ticket.priority || "medium"
                          ).toLowerCase()}`}
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td>
                        <span className="admin-date-cell">
                          {formatDate(ticket.createdAt)}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-action-btn-view"
                          title="Manage Ticket"
                          onClick={() => handleOpenModal(ticket)}
                        >
                          <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                            <path
                              d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                              fill="currentColor"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isModalOpen && selectedTicket && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                Manage Ticket #TK-{String(selectedTicket._id).slice(-4).toUpperCase()}
              </h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal}>
              <div className="admin-modal-body">
                <div>
                  <h4 style={{ fontSize: "1rem", color: "#0f172a", marginBottom: "0.25rem" }}>
                    {selectedTicket.title}
                  </h4>
                  <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                    {selectedTicket.description}
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#475569", marginBottom: "0.4rem" }}>
                      Update Status:
                    </label>
                    <select
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.875rem",
                      }}
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#475569", marginBottom: "0.4rem" }}>
                      Update Priority:
                    </label>
                    <select
                      value={modalPriority}
                      onChange={(e) => setModalPriority(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.875rem",
                      }}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-page-nav-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-create-ticket"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
