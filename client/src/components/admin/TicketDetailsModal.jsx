/**
 * TicketDetailsModal Component
 * Full ticket inspection modal for administrators.
 * Displays all ticket fields, customer information, timestamps, and resolution details.
 * Provides a prominent "Resolve Ticket" action for eligible tickets.
 */

import React, { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import { TicketStatusBadge } from "./TicketStatusBadge";

export const TicketDetailsModal = ({
  ticketId,
  initialTicket,
  isOpen,
  onClose,
  onOpenResolve,
  onOpenEdit,
}) => {
  const [ticket, setTicket] = useState(initialTicket || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && ticketId) {
      loadTicketDetails();
    }
  }, [isOpen, ticketId]);

  const loadTicketDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAPI.getTicket(ticketId);
      setTicket(data.ticket || data);
    } catch (err) {
      console.error("Failed to load ticket details:", err);
      // Fallback to initial ticket if API fails
      if (!ticket && initialTicket) {
        setTicket(initialTicket);
      } else if (!ticket) {
        setError(err.message || "Failed to load ticket details");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentTicket = ticket || initialTicket;
  const displayId = currentTicket ? `#TK-${String(currentTicket._id).slice(-4).toUpperCase()}` : "";
  const isResolved = currentTicket?.status === "RESOLVED";

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

  const customerUser = currentTicket?.createdBy;
  const customerId =
    customerUser?._id ||
    (typeof customerUser === "string" ? customerUser : null);

  const customerName =
    customerUser?.name ||
    (customerUser?.email ? customerUser.email.split("@")[0] : null) ||
    (customerId ? `Customer (${String(customerId).slice(-6).toUpperCase()})` : "Not Available");

  const customerEmail = customerUser?.email || null;
  const priority = currentTicket?.priority || "MEDIUM";
  const category = currentTicket?.category || "Technical Issue";

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal-card admin-details-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-details-modal-title"
      >
        {/* Modal Header */}
        <div className="admin-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <span className="admin-ticket-id-tag" style={{ fontSize: "0.95rem", padding: "0.3rem 0.65rem" }}>
              {displayId}
            </span>
            {currentTicket && (
              <>
                <TicketStatusBadge status={currentTicket.status} />
                <span className={`admin-priority-badge priority-${priority.toLowerCase()}`}>
                  {priority}
                </span>
                <span className="admin-category-badge">{category}</span>
              </>
            )}
          </div>
          <button
            type="button"
            className="admin-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="admin-modal-body" style={{ maxHeight: "75vh", overflowY: "auto" }}>
          {loading && !currentTicket ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⏳</div>
              Loading ticket details...
            </div>
          ) : error && !currentTicket ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#ef4444" }}>
              <p>{error}</p>
              <button
                type="button"
                className="admin-page-nav-btn"
                onClick={loadTicketDetails}
                style={{ marginTop: "0.75rem" }}
              >
                Retry
              </button>
            </div>
          ) : currentTicket ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Title & Description */}
              <div>
                <h2
                  id="ticket-details-modal-title"
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#0f172a",
                    margin: "0 0 0.5rem 0",
                  }}
                >
                  {currentTicket.title}
                </h2>
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "1rem",
                    fontSize: "0.925rem",
                    lineHeight: 1.6,
                    color: "#334155",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {currentTicket.description || "No description provided."}
                </div>
              </div>

              {/* Resolved Banner & Note (if resolved) */}
              {isResolved && (
                <div
                  style={{
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "12px",
                    padding: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: "#16a34a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "#166534", fontSize: "0.95rem" }}>
                        Ticket Resolved
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "#15803d" }}>
                        Resolved on {formatDate(currentTicket.resolvedAt || currentTicket.updatedAt)}
                        {currentTicket.resolvedBy?.name
                          ? ` by ${currentTicket.resolvedBy.name}`
                          : ""}
                      </div>
                    </div>
                  </div>

                  {currentTicket.resolutionNote && (
                    <div
                      style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #bbf7d0",
                        borderRadius: "8px",
                        padding: "0.875rem 1rem",
                        fontSize: "0.875rem",
                        color: "#166534",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.8125rem",
                          color: "#15803d",
                          marginBottom: "0.35rem",
                        }}
                      >
                        Resolution Note:
                      </div>
                      <p style={{ margin: 0, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                        {currentTicket.resolutionNote}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Details 2-Column Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1.25rem",
                  padding: "1.25rem",
                  backgroundColor: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
                    Customer Details
                  </span>
                  <div style={{ marginTop: "0.4rem", fontWeight: 600, color: "#0f172a", fontSize: "0.925rem" }}>
                    {customerName}
                  </div>
                  {customerEmail ? (
                    <div style={{ fontSize: "0.8125rem", color: "#64748b" }}>
                      {customerEmail}
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.8125rem", color: "#94a3b8", fontStyle: "italic" }}>
                      Email not provided
                    </div>
                  )}
                  {customerId && (
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.4rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <span style={{ color: "#94a3b8" }}>User ID:</span>
                      <code style={{ backgroundColor: "#f1f5f9", padding: "0.15rem 0.4rem", borderRadius: "4px", fontSize: "0.75rem", fontFamily: "monospace", color: "#334155" }}>
                        {String(customerId)}
                      </code>
                    </div>
                  )}
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
                    Assignment
                  </span>
                  <div style={{ marginTop: "0.4rem", fontWeight: 600, color: "#0f172a", fontSize: "0.925rem" }}>
                    {currentTicket.assignedTo?.name || "Unassigned"}
                  </div>
                  {currentTicket.assignedTo?.email && (
                    <div style={{ fontSize: "0.8125rem", color: "#64748b" }}>
                      {currentTicket.assignedTo.email}
                    </div>
                  )}
                  {currentTicket.assignedTo?._id && (
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.4rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <span style={{ color: "#94a3b8" }}>Admin ID:</span>
                      <code style={{ backgroundColor: "#f1f5f9", padding: "0.15rem 0.4rem", borderRadius: "4px", fontSize: "0.75rem", fontFamily: "monospace", color: "#334155" }}>
                        {String(currentTicket.assignedTo._id)}
                      </code>
                    </div>
                  )}
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
                    Created Date
                  </span>
                  <div style={{ marginTop: "0.4rem", color: "#334155", fontSize: "0.875rem" }}>
                    {formatDate(currentTicket.createdAt)}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
                    Last Updated
                  </span>
                  <div style={{ marginTop: "0.4rem", color: "#334155", fontSize: "0.875rem" }}>
                    {formatDate(currentTicket.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer with Actions */}
        <div className="admin-modal-footer">
          <button type="button" className="admin-resolve-btn-cancel" onClick={onClose}>
            Close
          </button>

          {currentTicket && (
            <>
              {onOpenEdit && (
                <button
                  type="button"
                  className="admin-page-nav-btn"
                  onClick={() => {
                    onClose();
                    onOpenEdit(currentTicket);
                  }}
                >
                  Manage Status/Priority
                </button>
              )}

              {/* Requirement 2: Clearly visible Resolve Ticket action for eligible tickets */}
              {!isResolved && onOpenResolve && (
                <button
                  type="button"
                  className="admin-resolve-btn-submit"
                  onClick={() => {
                    onClose();
                    onOpenResolve(currentTicket);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Resolve Ticket
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
