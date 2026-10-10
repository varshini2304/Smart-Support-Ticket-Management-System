/**
 * ResolveTicketModal Component
 * Confirmation and resolution note modal matching the reference screenshot.
 * Allows administrators to mark a ticket as Resolved with a mandatory validated solution note.
 */

import React, { useState } from "react";
import { TicketStatusBadge } from "./TicketStatusBadge";

export const ResolveTicketModal = ({
  ticket,
  isOpen,
  onClose,
  onResolveSuccess,
}) => {
  const [resolutionNote, setResolutionNote] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  if (!isOpen || !ticket) return null;

  const displayId = `#TK-${String(ticket._id).slice(-4).toUpperCase()}`;

  // Helper for category
  const getTicketCategory = (t) => {
    if (t.category) return t.category;
    const text = `${t.title || ""} ${t.description || ""}`.toLowerCase();
    if (text.includes("bill") || text.includes("payment")) return "Billing";
    if (text.includes("login") || text.includes("password") || text.includes("auth")) return "Account Access";
    if (text.includes("feature")) return "Feature Request";
    if (text.includes("bug") || text.includes("error") || text.includes("issue")) return "Technical Issue";
    return "Technical Issue";
  };

  const category = getTicketCategory(ticket);

  // Helper for created date
  const formatCreatedDate = (dateString) => {
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

  // Customer metadata
  const customerUser = ticket.createdBy;
  const customerId =
    customerUser?._id ||
    (typeof customerUser === "string" ? customerUser : null);

  const customerName =
    customerUser?.name ||
    customerUser?.email ||
    (customerId ? `Customer (${String(customerId).slice(-6).toUpperCase()})` : "Not Available");

  const priority = ticket.priority || "MEDIUM";

  const handleNoteChange = (e) => {
    const val = e.target.value;
    if (val.length <= 500) {
      setResolutionNote(val);
      if (validationError) setValidationError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = resolutionNote.trim();
    if (!trimmed) {
      setValidationError("Resolution note is required to resolve this ticket.");
      return;
    }

    if (trimmed.length < 5) {
      setValidationError("Resolution note must be at least 5 characters long.");
      return;
    }

    if (trimmed.length > 500) {
      setValidationError("Resolution note cannot exceed 500 characters.");
      return;
    }

    setIsSubmitting(true);
    setServerError("");

    try {
      await onResolveSuccess(ticket._id, trimmed);
      onClose();
    } catch (err) {
      console.error("Failed to resolve ticket:", err);
      setServerError(err.message || "Failed to resolve ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={isSubmitting ? undefined : onClose}>
      <div
        className="admin-resolve-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="resolve-modal-title"
      >
        {/* Header */}
        <div className="admin-resolve-modal-header">
          <div className="admin-resolve-modal-icon-badge">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6L9 17L4 12"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="admin-resolve-modal-title-group">
            <h3 id="resolve-modal-title" className="admin-resolve-modal-title">
              Resolve Ticket
            </h3>
            <p className="admin-resolve-modal-subtitle">
              Mark this ticket as resolved with a solution note.
            </p>
          </div>
          <button
            type="button"
            className="admin-modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-resolve-modal-body">
            {/* Server Error Notification */}
            {serverError && (
              <div className="admin-resolve-alert-error">
                <span style={{ fontSize: "1rem" }}>⚠️</span>
                <span>{serverError}</span>
              </div>
            )}

            {/* Ticket Summary Card */}
            <div className="admin-resolve-summary-card">
              <div className="admin-resolve-summary-top">
                <div className="admin-resolve-doc-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 12H15M9 16H13M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H14L20 9V19C20 20.1046 19.1046 21 19 21Z"
                      stroke="#2563eb"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="admin-resolve-summary-titles">
                  <span className="admin-resolve-summary-id">{displayId}</span>
                  <div className="admin-resolve-summary-ticket-title" title={ticket.title}>
                    {ticket.title}
                  </div>
                </div>
                <div className="admin-resolve-summary-status">
                  <TicketStatusBadge status={ticket.status} />
                </div>
              </div>

              <div className="admin-resolve-summary-divider" />

              <div className="admin-resolve-summary-grid">
                {/* Customer */}
                <div className="admin-resolve-grid-item">
                  <div className="admin-resolve-grid-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                        stroke="#64748b"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="7" r="4" stroke="#64748b" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="admin-resolve-grid-texts">
                    <span className="admin-resolve-grid-label">Customer</span>
                    <span className="admin-resolve-grid-value" title={customerId ? `User ID: ${customerId}` : undefined}>
                      {customerName}
                    </span>
                    {customerId && (
                      <span style={{ fontSize: "0.72rem", color: "#64748b", fontFamily: "monospace", marginTop: "1px" }}>
                        ID: {String(customerId).slice(-6).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Priority */}
                <div className="admin-resolve-grid-item">
                  <div className="admin-resolve-grid-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 15S5.5 14 8 14S12.5 16 15 16S19 15 19 15V3S17.5 4 15 4S10.5 2 8 2S4 3 4 3V21"
                        stroke="#64748b"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="admin-resolve-grid-texts">
                    <span className="admin-resolve-grid-label">Priority</span>
                    <span
                      className={`admin-priority-badge priority-${priority.toLowerCase()}`}
                      style={{ marginTop: "2px" }}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div className="admin-resolve-grid-item">
                  <div className="admin-resolve-grid-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 7V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V9C21 7.89543 20.1046 7 19 7H11L9 4H5C3.89543 4 3 4.89543 3 6V7Z"
                        stroke="#64748b"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="admin-resolve-grid-texts">
                    <span className="admin-resolve-grid-label">Category</span>
                    <span className="admin-resolve-grid-value">{category}</span>
                  </div>
                </div>

                {/* Created On */}
                <div className="admin-resolve-grid-item">
                  <div className="admin-resolve-grid-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="#64748b" strokeWidth="2" />
                      <path d="M16 2V6M8 2V6M3 10H21" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="admin-resolve-grid-texts">
                    <span className="admin-resolve-grid-label">Created On</span>
                    <span className="admin-resolve-grid-value">{formatCreatedDate(ticket.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resolution Note Field */}
            <div className="admin-resolve-field-group">
              <div className="admin-resolve-field-header">
                <label htmlFor="resolution-note" className="admin-resolve-field-label">
                  Resolution Note <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <span
                  className="admin-resolve-char-counter"
                  style={{ color: resolutionNote.length >= 480 ? "#ef4444" : "#94a3b8" }}
                >
                  {resolutionNote.length}/500
                </span>
              </div>
              <textarea
                id="resolution-note"
                className={`admin-resolve-textarea ${validationError ? "error" : ""}`}
                rows={4}
                placeholder="Describe the solution provided, steps taken, or any additional notes..."
                value={resolutionNote}
                onChange={handleNoteChange}
                disabled={isSubmitting}
                required
              />
              {validationError && (
                <p className="admin-resolve-validation-message">{validationError}</p>
              )}
            </div>

            {/* Information Banner matching reference screenshot */}
            <div className="admin-resolve-info-banner">
              <div className="admin-resolve-info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#2563eb" />
                  <path d="M12 16V12M12 8H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="admin-resolve-info-content">
                <div className="admin-resolve-info-title">This will:</div>
                <ul className="admin-resolve-info-list">
                  <li>Change the ticket status to Resolved</li>
                  <li>
                    <span style={{ color: "#2563eb", fontWeight: 500 }}>Notify</span> the customer (if enabled)
                  </li>
                  <li>Record the resolution note and timestamp</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="admin-resolve-modal-footer">
            <button
              type="button"
              className="admin-resolve-btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-resolve-btn-submit"
              disabled={isSubmitting || !resolutionNote.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="admin-spinner-inline" />
                  Resolving...
                </>
              ) : (
                <>
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
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
