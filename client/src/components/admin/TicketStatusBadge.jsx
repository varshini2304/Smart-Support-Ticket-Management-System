/**
 * TicketStatusBadge Component
 * Standardized status badge for tickets across admin dashboard and tables
 */

import React from "react";

export const TicketStatusBadge = ({ status = "OPEN", className = "" }) => {
  const normalizedStatus = (status || "").toUpperCase();

  const getStatusConfig = (s) => {
    switch (s) {
      case "OPEN":
        return {
          label: "Open",
          bg: "#fef2f2",
          color: "#ef4444",
          border: "#fee2e2",
          dot: "#ef4444",
        };
      case "IN_PROGRESS":
        return {
          label: "In Progress",
          bg: "#fffbeb",
          color: "#d97706",
          border: "#fef3c7",
          dot: "#f59e0b",
        };
      case "RESOLVED":
        return {
          label: "Resolved",
          bg: "#f0fdf4",
          color: "#15803d",
          border: "#dcfce7",
          dot: "#10b981",
        };
      case "CLOSED":
        return {
          label: "Closed",
          bg: "#f8fafc",
          color: "#64748b",
          border: "#e2e8f0",
          dot: "#94a3b8",
        };
      default:
        return {
          label: s ? s.replace(/_/g, " ") : "Unknown",
          bg: "#f8fafc",
          color: "#64748b",
          border: "#e2e8f0",
          dot: "#94a3b8",
        };
    }
  };

  const config = getStatusConfig(normalizedStatus);

  return (
    <span
      className={`admin-status-badge ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.375rem",
        padding: "0.25rem 0.625rem",
        borderRadius: "9999px",
        fontSize: "0.775rem",
        fontWeight: 600,
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        whiteSpace: "nowrap",
        letterSpacing: "0.01em",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: config.dot,
          flexShrink: 0,
        }}
      />
      {config.label}
    </span>
  );
};
