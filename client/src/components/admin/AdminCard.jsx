/**
 * AdminCard Component
 * Reusable card panel container with header, actions, and body for admin pages
 */

import React from "react";

export const AdminCard = ({
  title,
  subtitle,
  actions,
  children,
  footer,
  className = "",
  bodyClassName = "",
  headerClassName = "",
  style,
}) => {
  return (
    <div
      className={`admin-analytics-panel ${className}`}
      style={style}
    >
      {(title || actions) && (
        <div className={`admin-panel-header ${headerClassName}`}>
          <div>
            {title && <h3 className="admin-panel-title">{title}</h3>}
            {subtitle && (
              <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "2px 0 0 0" }}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className={bodyClassName} style={{ flex: 1 }}>{children}</div>
      {footer && (
        <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #e2e8f0" }}>
          {footer}
        </div>
      )}
    </div>
  );
};
