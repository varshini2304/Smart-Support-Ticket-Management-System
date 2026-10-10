/**
 * Topbar Component
 * Reusable top header navigation for SupportHub (Customer & Admin)
 * Features ticket search, notifications, and user profile/logout dropdown
 */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/AdminTopbar.css";

export const Topbar = ({
  searchQuery = "",
  onSearchChange,
  notificationCount = 0,
  onToggleSidebar,
  roleLabel,
  profilePath = "/profile",
  ticketsPath = "/tickets",
  searchPlaceholder = "Search tickets by ID, title or status...",
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayRole = roleLabel || (user?.role === "ADMIN" ? "Administrator" : "Customer");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    navigate(profilePath);
  };

  return (
    <header className="admin-topbar">
      {/* Mobile Toggle Button */}
      <button
        type="button"
        className="admin-mobile-toggle"
        onClick={onToggleSidebar}
        aria-label="Toggle navigation menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 6H20M4 12H20M4 18H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Global Ticket Search Bar */}
      <div className="admin-search-wrapper">
        <span className="admin-search-icon">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.75" />
            <path
              d="M13.5 13.5L18 18"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <input
          type="text"
          className="admin-search-input"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="admin-search-clear"
            onClick={() => onSearchChange && onSearchChange("")}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Topbar Right Actions */}
      <div className="admin-topbar-actions">
        {/* Notification Bell */}
        <button
          type="button"
          className="admin-notif-btn"
          aria-label="Notifications"
          onClick={() => navigate(ticketsPath)}
          title={
            notificationCount > 0
              ? `${notificationCount} open tickets requiring attention`
              : "No pending notifications"
          }
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {notificationCount > 0 && (
            <span className="admin-notif-badge">{notificationCount}</span>
          )}
        </button>

        {/* User Dropdown */}
        <div className="admin-user-menu-wrapper" ref={menuRef}>
          <button
            type="button"
            className={`admin-user-trigger ${showUserMenu ? "active" : ""}`}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="admin-avatar-circle">
              {getInitials(user?.name)}
            </div>
            <div className="admin-user-meta">
              <span className="admin-user-name">
                {user?.name || "User"}
              </span>
              <span className="admin-user-role">{displayRole}</span>
            </div>
            <svg
              className={`admin-user-chevron ${showUserMenu ? "open" : ""}`}
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {showUserMenu && (
            <div className="admin-dropdown-menu">
              <div className="admin-dropdown-header">
                <div className="admin-dropdown-user-name">
                  {user?.name || "User"}
                </div>
                <div className="admin-dropdown-user-email">
                  {user?.email || ""}
                </div>
                <span className="admin-dropdown-role-badge">
                  {displayRole}
                </span>
              </div>
              <div className="admin-dropdown-divider" />
              <button
                type="button"
                className="admin-dropdown-item"
                onClick={handleProfileClick}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M4 17C4 14.2386 6.23858 12 9 12H11C13.7614 12 16 14.2386 16 17"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Profile Settings
              </button>
              <div className="admin-dropdown-divider" />
              <button
                type="button"
                className="admin-dropdown-item admin-dropdown-item-danger"
                onClick={handleLogout}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M13 14L17 10M17 10L13 6M17 10H7M7 3H5C3.89543 3 3 3.89543 3 5V15C3 16.1046 3.89543 17 5 17H7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
