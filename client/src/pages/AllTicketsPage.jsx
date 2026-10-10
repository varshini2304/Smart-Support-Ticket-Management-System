/**
 * AllTicketsPage - Administrator Ticket Management
 * Full administrative control for all tickets: filtering, searching, status/priority updates.
 * Renders inside shared AdminLayout.
 */

import React, { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { adminAPI } from "../services/api";
import { TicketStatusBadge } from "../components/admin/TicketStatusBadge";
import { ResolveTicketModal } from "../components/admin/ResolveTicketModal";
import { TicketDetailsModal } from "../components/admin/TicketDetailsModal";

export const AllTicketsPage = () => {
  const { searchQuery = "", onOpenCreateTicket, refreshData } = useOutletContext() || {};

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);

  // Modal for editing ticket
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState("OPEN");
  const [editPriority, setEditPriority] = useState("MEDIUM");
  const [savingEdit, setSavingEdit] = useState(false);

  // Modal for inspecting ticket details (Requirement 1)
  const [detailsTicket, setDetailsTicket] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Modal for resolving ticket (Requirement 2, 3, 4)
  const [resolvingTicket, setResolvingTicket] = useState(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [currentPage, statusFilter, priorityFilter, searchQuery]);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAPI.getAllTickets(
        currentPage,
        15,
        statusFilter || null,
        priorityFilter || null,
        searchQuery || null
      );
      setTickets(data.tickets || []);
      setTotalPages(data.pages || 1);
      setTotalTickets(data.total || 0);
    } catch (err) {
      console.error("Failed to load admin tickets:", err);
      setError(err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (ticket) => {
    setDetailsTicket(ticket);
    setIsDetailsModalOpen(true);
  };

  const handleOpenResolve = (ticket) => {
    setResolvingTicket(ticket);
    setIsResolveModalOpen(true);
  };

  const handleExecuteResolve = async (ticketId, note) => {
    const data = await adminAPI.resolveTicket(ticketId, note);
    const updatedTicket = data.ticket;

    // Immediately update local tickets state for instant reactive UI
    setTickets((prev) =>
      prev.map((t) =>
        t._id === ticketId
          ? {
              ...t,
              ...(updatedTicket || {}),
              status: "RESOLVED",
              resolutionNote: note,
              resolvedAt: new Date().toISOString(),
            }
          : t
      )
    );

    // If details modal is open for this ticket, update it
    if (detailsTicket && detailsTicket._id === ticketId) {
      setDetailsTicket((prev) => ({
        ...prev,
        ...(updatedTicket || {}),
        status: "RESOLVED",
        resolutionNote: note,
        resolvedAt: new Date().toISOString(),
      }));
    }

    setSuccessMessage(
      `Ticket #${String(ticketId).slice(-4).toUpperCase()} marked as resolved successfully.`
    );
    setTimeout(() => setSuccessMessage(null), 4000);

    // Re-fetch tickets to ensure complete database sync
    fetchTickets();

    // Trigger AdminLayout to refresh stats & notification badges
    if (refreshData) {
      refreshData();
    }

    return data;
  };

  const handleOpenEdit = (ticket) => {
    setSelectedTicket(ticket);
    setEditStatus(ticket.status || "OPEN");
    setEditPriority(ticket.priority || "MEDIUM");
    setIsEditModalOpen(true);
  };

  const handleSaveTicketUpdate = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setSavingEdit(true);
    try {
      await adminAPI.updateTicket(selectedTicket._id, {
        status: editStatus,
        priority: editPriority,
      });

      setSuccessMessage(`Ticket #${String(selectedTicket._id).slice(-4).toUpperCase()} updated successfully.`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setIsEditModalOpen(false);
      setSelectedTicket(null);
      fetchTickets();
      if (refreshData) refreshData();
    } catch (err) {
      alert(`Error updating ticket: ${err.message}`);
    } finally {
      setSavingEdit(false);
    }
  };

  const getTicketCategory = (ticket) => {
    if (ticket.category) return ticket.category;
    const text = `${ticket.title} ${ticket.description}`.toLowerCase();
    if (text.includes("bill") || text.includes("payment")) return "Billing";
    if (text.includes("login") || text.includes("password") || text.includes("auth")) return "Account Access";
    if (text.includes("feature")) return "Feature Request";
    if (text.includes("bug") || text.includes("error") || text.includes("issue")) return "Technical Issue";
    return "General Inquiry";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Category filter is still client-side (no category field in backend query)
  const filteredTickets = useMemo(() => {
    if (!categoryFilter) return tickets;
    return tickets.filter((ticket) => {
      const cat = getTicketCategory(ticket);
      return cat === categoryFilter;
    });
  }, [tickets, categoryFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-heading-group">
          <h1 className="admin-page-title">All Tickets</h1>
          <p className="admin-page-subtitle">
            Manage, review, and update support tickets across all customers.
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

      {/* Success notification */}
      {successMessage && (
        <div
          style={{
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#15803d",
            padding: "0.75rem 1rem",
            borderRadius: "10px",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          ✓ {successMessage}
        </div>
      )}

      {/* Filter and Table Card */}
      <div className="admin-tickets-card">
        {/* Table Filters Bar */}
        <div className="admin-table-filters-bar">
          <div className="admin-filter-inline-group">
            <label className="admin-filter-inline-label">Status:</label>
            <select
              className="admin-filter-inline-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <div className="admin-filter-inline-group">
            <label className="admin-filter-inline-label">Priority:</label>
            <select
              className="admin-filter-inline-select"
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="admin-filter-inline-group">
            <label className="admin-filter-inline-label">Category:</label>
            <select
              className="admin-filter-inline-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Technical Issue">Technical Issue</option>
              <option value="Account Access">Account Access</option>
              <option value="Billing">Billing</option>
              <option value="Feature Request">Feature Request</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
          </div>

          {(statusFilter || priorityFilter || categoryFilter || searchQuery) && (
            <button
              type="button"
              className="admin-filter-clear-btn"
              onClick={() => {
                setStatusFilter("");
                setPriorityFilter("");
                setCategoryFilter("");
                setCurrentPage(1);
              }}
            >
              ✕ Clear Filters
            </button>
          )}

          <div style={{ marginLeft: "auto", fontSize: "0.8125rem", color: "#64748b" }}>
            Showing {filteredTickets.length} of {totalTickets} tickets
          </div>
        </div>

        {/* Tickets Table */}
        {loading ? (
          <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>⏳</div>
            Loading all tickets...
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
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🎫</div>
            <h3 style={{ color: "#0f172a", marginBottom: "0.25rem" }}>No tickets found</h3>
            <p style={{ fontSize: "0.875rem" }}>
              {searchQuery || statusFilter || priorityFilter || categoryFilter
                ? "No tickets match your filter criteria."
                : "No tickets exist yet."}
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
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => {
                  const displayId = `#TK-${String(ticket._id).slice(-4).toUpperCase()}`;
                  const category = getTicketCategory(ticket);
                  const customerUser = ticket.createdBy;
                  const customerId =
                    customerUser?._id ||
                    (typeof customerUser === "string" ? customerUser : null);

                  const customerName =
                    customerUser?.name ||
                    customerUser?.email ||
                    (customerId ? `Customer (${String(customerId).slice(-6).toUpperCase()})` : "Unassigned");

                  const isTicketResolved = ticket.status === "RESOLVED";

                  return (
                    <tr key={ticket._id}>
                      <td>
                        <span
                          className="admin-ticket-id-tag"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleOpenDetails(ticket)}
                          title="Click to inspect ticket details"
                        >
                          {displayId}
                        </span>
                      </td>
                      <td>
                        <div
                          className="admin-ticket-title-cell"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleOpenDetails(ticket)}
                          title={`Click to inspect details: ${ticket.title}`}
                        >
                          {ticket.title}
                        </div>
                      </td>
                      <td>
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
                      </td>
                      <td>
                        <span className="admin-category-badge">{category}</span>
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
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                          {/* 1. View / Inspect Details */}
                          <button
                            type="button"
                            className="admin-action-btn-view"
                            title="Inspect Ticket Details"
                            onClick={() => handleOpenDetails(ticket)}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                            </svg>
                          </button>

                          {/* 2. Edit Status / Priority */}
                          <button
                            type="button"
                            className="admin-action-btn-view"
                            title="Manage Status & Priority"
                            onClick={() => handleOpenEdit(ticket)}
                          >
                            <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                              <path
                                d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                                fill="currentColor"
                              />
                            </svg>
                          </button>

                          {/* 3. Clearly Visible Resolve Action */}
                          <button
                            type="button"
                            className="admin-action-btn-resolve"
                            title={
                              isTicketResolved
                                ? "Ticket is already resolved"
                                : "Resolve Ticket with Note"
                            }
                            disabled={isTicketResolved}
                            onClick={() => handleOpenResolve(ticket)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M20 6L9 17L4 12"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="admin-pagination-bar">
            <div className="admin-pagination-info">
              Page {currentPage} of {totalPages}
            </div>
            <div className="admin-pagination-actions">
              <button
                type="button"
                className="admin-page-nav-btn"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="admin-page-nav-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Ticket Modal */}
      {isEditModalOpen && selectedTicket && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                Manage Ticket #TK-{String(selectedTicket._id).slice(-4).toUpperCase()}
              </h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setIsEditModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTicketUpdate}>
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
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
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
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
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
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-create-ticket"
                  disabled={savingEdit}
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Details Inspection Modal (Requirement 1 & 2) */}
      <TicketDetailsModal
        ticketId={detailsTicket?._id}
        initialTicket={detailsTicket}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setDetailsTicket(null);
        }}
        onOpenResolve={(ticket) => {
          setIsDetailsModalOpen(false);
          handleOpenResolve(ticket);
        }}
        onOpenEdit={(ticket) => {
          setIsDetailsModalOpen(false);
          handleOpenEdit(ticket);
        }}
      />

      {/* Resolve Ticket Modal (Requirement 2, 3, 4, 9, 10 - Matching Screenshot) */}
      <ResolveTicketModal
        ticket={resolvingTicket}
        isOpen={isResolveModalOpen}
        onClose={() => {
          setIsResolveModalOpen(false);
          setResolvingTicket(null);
        }}
        onResolveSuccess={handleExecuteResolve}
      />
    </div>
  );
};
