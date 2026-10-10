/**
 * Sidebar Component
 * Reusable navigation sidebar for SupportHub (Customer & Admin)
 * Features brand logo, navigation links with active state, and quick actions
 */

import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "../../styles/AdminSidebar.css";

export const Sidebar = ({
  isOpen = false,
  onClose,
  navItems = [],
  brandLink = "/dashboard",
  onOpenCreateTicket,
  showQuickActions = true,
  role = "CUSTOMER",
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleQuickAction = (action) => {
    if (action === "createTicket") {
      if (onOpenCreateTicket) {
        onOpenCreateTicket();
      } else {
        navigate(role === "ADMIN" ? "/admin/tickets" : "/tickets");
      }
    } else if (action === "reports") {
      navigate("/admin/reports");
    } else if (action === "users") {
      navigate("/admin/users");
    }
    if (onClose) onClose();
  };

  const isActive = (itemPath) => {
    if (itemPath === brandLink) {
      return location.pathname === brandLink || location.pathname === `${brandLink}/`;
    }
    return location.pathname === itemPath;
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
      {/* Brand Header */}
      <div className="admin-sidebar-header">
        <Link to={brandLink} className="admin-sidebar-logo" onClick={onClose}>
          <div className="admin-sidebar-logo-icon">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 6L8 11V21L16 26L24 21V11L16 6Z"
                fill="white"
                stroke="white"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle cx="16" cy="16" r="3" fill="#2563EB" />
            </svg>
          </div>
          <span className="admin-sidebar-logo-text">SupportHub</span>
        </Link>
        <button
          type="button"
          className="admin-sidebar-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="admin-sidebar-nav">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className={`admin-nav-item ${active ? "active" : ""}`}
              type="button"
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Quick Actions Card */}
      {showQuickActions && (
        <div className="admin-sidebar-quick-actions">
          <div className="admin-quick-actions-header">
            <div className="admin-quick-actions-badge">⚡</div>
            <span className="admin-quick-actions-title">Quick Actions</span>
          </div>
          <div className="admin-quick-actions-list">
            <button
              type="button"
              className="admin-quick-action-btn admin-quick-action-btn-primary"
              onClick={() => handleQuickAction("createTicket")}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3V13M3 8H13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Create Ticket
            </button>

            {role === "ADMIN" && (
              <>
                <button
                  type="button"
                  className="admin-quick-action-btn"
                  onClick={() => handleQuickAction("reports")}
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="8" width="3" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="6.5" y="5" width="3" height="9" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="11" y="2" width="3" height="12" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  View Reports
                </button>
                <button
                  type="button"
                  className="admin-quick-action-btn"
                  onClick={() => handleQuickAction("users")}
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                    <path
                      d="M2.5 13C2.5 11 4 9.5 6 9.5C8 9.5 9.5 11 9.5 13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10 5.5C11 5.5 12 6.5 12 7.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10.5 12C11.5 12 13 12.5 13 13.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  Manage Users
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
