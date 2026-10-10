/**
 * AdminStatCard Component
 * Metric statistic card for administrator dashboard
 */

import React from "react";

export const AdminStatCard = ({
  icon,
  label,
  value = 0,
  trend,
  variant = "total",
  loading = false,
  className = "",
  onClick,
}) => {
  return (
    <div
      className={`admin-stat-card stat-${variant} ${className}`}
      onClick={onClick}
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      <div className="admin-stat-top">
        <div className="admin-stat-icon-box">{icon}</div>
        {trend && <span className="admin-stat-badge">{trend}</span>}
      </div>
      <div className="admin-stat-info">
        <div className="admin-stat-value">
          {loading ? (
            <span style={{ opacity: 0.5, fontSize: "1.25rem" }}>...</span>
          ) : (
            value
          )}
        </div>
        <div className="admin-stat-label">{label}</div>
      </div>
    </div>
  );
};
