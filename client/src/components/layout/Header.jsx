/**
 * Header Component
 * Reusable top header with search bar and user menu
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getInitials } from "../../utils/formatters";
import { sharedStyles } from "../../styles/sharedStyles";

export const Header = ({
  searchPlaceholder = "Search tickets by ID, title or status...",
  searchQuery = "",
  onSearchChange,
  notificationCount = 0,
  showSearch = true,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userRole = user?.role === "ADMIN" ? "Administrator" : "Customer";

  return (
    <header style={sharedStyles.header}>
      {/* Search Bar */}
      {showSearch && (
        <div style={sharedStyles.searchContainer}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            style={sharedStyles.searchIcon}
          >
            <circle cx="8" cy="8" r="6" stroke="#9CA3AF" strokeWidth="1.5" />
            <path
              d="M12.5 12.5L16 16"
              stroke="#9CA3AF"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            style={sharedStyles.searchInput}
          />
          {searchQuery && onSearchChange && (
            <button
              onClick={() => onSearchChange("")}
              style={sharedStyles.clearSearchButton}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* User Actions */}
      <div style={sharedStyles.headerActions}>
        {/* Notifications */}
        <button style={sharedStyles.iconButton}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 5C8.067 5 6.5 6.567 6.5 8.5V11.5L5 14H15L13.5 11.5V8.5C13.5 6.567 11.933 5 10 5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.5 14V14.5C8.5 15.328 9.172 16 10 16C10.828 16 11.5 15.328 11.5 14.5V14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          {notificationCount > 0 && (
            <span style={sharedStyles.notificationBadge}>{notificationCount}</span>
          )}
        </button>

        {/* User Menu */}
        <div style={sharedStyles.userMenuContainer}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={sharedStyles.userButton}
          >
            <div style={sharedStyles.userAvatar}>{getInitials(user?.name)}</div>
            <div style={sharedStyles.userInfo}>
              <div style={sharedStyles.userName}>{user?.name || "User"}</div>
              <div style={sharedStyles.userRole}>{userRole}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
            <div style={sharedStyles.userMenu}>
              <button
                onClick={() => {
                  navigate("/profile");
                  setShowUserMenu(false);
                }}
                style={sharedStyles.userMenuItem}
              >
                Profile Settings
              </button>
              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                style={sharedStyles.userMenuItemDanger}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
