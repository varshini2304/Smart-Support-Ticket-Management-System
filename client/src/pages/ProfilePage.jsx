/**
 * ProfilePage - User Profile Management
 * SupportHub-inspired design with account information and settings
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { authAPI, ticketAPI } from "../services/api";
import { CreateTicketModal } from "../components/CreateTicketModal";

export const ProfilePage = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("profile");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Profile form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [memberSince, setMemberSince] = useState("");
  const [totalTickets, setTotalTickets] = useState(0);
  const [lastLogin, setLastLogin] = useState("");

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Load user profile
      setName(user.name || "");
      setEmail(user.email || "");
      setRole(user.role || "CUSTOMER");
      setMemberSince(user.createdAt || "");
      setLastLogin(new Date().toISOString()); // Current login

      // Load ticket count
      const ticketsData = await ticketAPI.getMyTickets(1, 1000);
      setTotalTickets(ticketsData.tickets?.length || 0);
    } catch (err) {
      setError(err.message || "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Update profile via API
      await authAPI.updateProfile(name);

      // Refresh user data in context
      await refreshUser();

      // Reload profile data
      await loadProfileData();

      setSuccess(true);
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setIsEditing(false);
    setError(null);
    setSuccess(false);
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

  const formatDateTime = (dateString) => {
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

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleLabel = (role) => {
    return role === "ADMIN" ? "Administrator" : "Customer";
  };

  return (
    <div style={styles.container}>
      {/* Left Sidebar */}
      <aside style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="#2563EB" />
              <path
                d="M16 8L10 12V20L16 24L22 20V12L16 8Z"
                fill="white"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="16" cy="16" r="2.5" fill="#2563EB" />
            </svg>
            <span style={styles.logoText}>SupportHub</span>
          </div>
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          <button
            onClick={() => {
              setActiveNav("dashboard");
              navigate("/dashboard");
            }}
            style={{
              ...styles.navItem,
              ...(activeNav === "dashboard" && styles.navItemActive),
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect
                x="3"
                y="3"
                width="6"
                height="6"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <rect
                x="11"
                y="3"
                width="6"
                height="6"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <rect
                x="3"
                y="11"
                width="6"
                height="6"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <rect
                x="11"
                y="11"
                width="6"
                height="6"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => {
              setActiveNav("create");
              setShowCreateModal(true);
            }}
            style={{
              ...styles.navItem,
              ...(activeNav === "create" && styles.navItemActive),
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle
                cx="10"
                cy="10"
                r="7"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M10 7V13M7 10H13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>Create Ticket</span>
          </button>

          <button
            onClick={() => {
              setActiveNav("tickets");
              navigate("/tickets");
            }}
            style={{
              ...styles.navItem,
              ...(activeNav === "tickets" && styles.navItemActive),
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect
                x="3"
                y="4"
                width="14"
                height="12"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M7 8H13M7 12H10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>My Tickets</span>
          </button>

          <button
            onClick={() => {
              setActiveNav("profile");
              navigate("/profile");
            }}
            style={{
              ...styles.navItem,
              ...(activeNav === "profile" && styles.navItemActive),
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle
                cx="10"
                cy="7"
                r="3"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M4 17C4 14.2386 6.23858 12 9 12H11C13.7614 12 16 14.2386 16 17"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>Profile</span>
          </button>
        </nav>

        {/* Help Section */}
        <div style={styles.helpSection}>
          <div style={styles.helpIcon}>💬</div>
          <div style={styles.helpContent}>
            <div style={styles.helpTitle}>Need Help?</div>
            <div style={styles.helpText}>
              Can't find what you're looking for? Create a ticket and we'll help
              you.
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              style={styles.helpButton}
            >
              Create Ticket →
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Top Header */}
        <header style={styles.header}>
          {/* Search Bar */}
          <div style={styles.searchContainer}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              style={styles.searchIcon}
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
              placeholder="Search tickets by ID, title or status..."
              style={styles.searchInput}
              readOnly
            />
          </div>

          {/* User Actions */}
          <div style={styles.headerActions}>
            {/* Notifications */}
            <button style={styles.iconButton}>
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
            </button>

            {/* User Menu */}
            <div style={styles.userMenuContainer}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={styles.userButton}
              >
                <div style={styles.userAvatar}>{getInitials(user?.name)}</div>
                <div style={styles.userInfo}>
                  <div style={styles.userName}>{user?.name || "User"}</div>
                  <div style={styles.userRole}>{getRoleLabel(user?.role)}</div>
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
                <div style={styles.userMenu}>
                  <button
                    onClick={() => navigate("/profile")}
                    style={styles.userMenuItem}
                  >
                    Profile Settings
                  </button>
                  <button onClick={logout} style={styles.userMenuItemDanger}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Profile Header Banner */}
        <div style={styles.profileBanner}>
          <div style={styles.bannerContent}>
            <div style={styles.bannerTextContainer}>
              <div style={styles.bannerLabel}>YOUR PROFILE</div>
              <h1 style={styles.bannerTitle}>Manage Your Account</h1>
              <p style={styles.bannerSubtitle}>
                Update your personal information and account settings.
              </p>
            </div>
            <div style={styles.bannerIllustration}>
              <svg width="160" height="120" viewBox="0 0 160 120" fill="none">
                {/* Settings icon */}
                <circle cx="80" cy="50" r="25" fill="#DBEAFE" />
                <path
                  d="M80 35V40M80 60V65M65 50H70M90 50H95"
                  stroke="#2563EB"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle
                  cx="80"
                  cy="50"
                  r="8"
                  stroke="#2563EB"
                  strokeWidth="3"
                />
                {/* Person illustration */}
                <circle cx="120" cy="45" r="12" fill="#FDE68A" />
                <path
                  d="M120 57C115 57 110 60 110 65H130C130 60 125 57 120 57Z"
                  fill="#60A5FA"
                />
                {/* Plant decoration */}
                <ellipse cx="40" cy="75" rx="6" ry="15" fill="#34D399" />
                <ellipse cx="48" cy="78" rx="5" ry="12" fill="#10B981" />
              </svg>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div style={styles.successAlert}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="#10B981" strokeWidth="2" />
              <path
                d="M6 10L9 13L14 7"
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Profile updated successfully!</span>
          </div>
        )}

        {error && (
          <div style={styles.errorAlert}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="#EF4444" strokeWidth="2" />
              <path
                d="M10 6V11M10 14H10.01"
                stroke="#EF4444"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Profile Content */}
        <div style={styles.contentWrapper}>
          <div style={styles.contentGrid}>
            {/* Left Column - Personal Information */}
            <div style={styles.leftColumn}>
              {/* Personal Information Card */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardHeaderIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="12"
                        cy="8"
                        r="4"
                        stroke="#2563EB"
                        strokeWidth="2"
                      />
                      <path
                        d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20"
                        stroke="#2563EB"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 style={styles.cardTitle}>Personal Information</h2>
                    <p style={styles.cardDescription}>
                      Update your personal details. This information helps us
                      provide better support.
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div style={styles.loadingContainer}>
                    <div style={styles.loadingSpinner} />
                    <p>Loading profile...</p>
                  </div>
                ) : (
                  <div style={styles.formGroup}>
                    {/* Full Name */}
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>
                        Full Name <span style={styles.required}>*</span>
                      </label>
                      <div style={styles.inputWithIcon}>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          style={styles.inputIcon}
                        >
                          <circle
                            cx="10"
                            cy="7"
                            r="3"
                            stroke="#9CA3AF"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M4 17C4 14.2386 6.23858 12 9 12H11C13.7614 12 16 14.2386 16 17"
                            stroke="#9CA3AF"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={!isEditing || saving}
                          style={{
                            ...styles.input,
                            ...((!isEditing || saving) && styles.inputDisabled),
                          }}
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>
                        Email Address <span style={styles.required}>*</span>
                      </label>
                      <div style={styles.inputWithIcon}>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          style={styles.inputIcon}
                        >
                          <rect
                            x="2"
                            y="4"
                            width="16"
                            height="12"
                            rx="2"
                            stroke="#9CA3AF"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M2 7L10 12L18 7"
                            stroke="#9CA3AF"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        <input
                          type="email"
                          value={email}
                          disabled
                          style={{
                            ...styles.input,
                            ...styles.inputDisabled,
                          }}
                        />
                        <div style={styles.verifiedBadge}>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                          >
                            <circle cx="7" cy="7" r="6" fill="#10B981" />
                            <path
                              d="M4 7L6 9L10 5"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>Verified</span>
                        </div>
                      </div>
                      <p style={styles.helpText}>
                        Email address cannot be changed. Contact support if you
                        need to update it.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    {isEditing ? (
                      <div style={styles.buttonGroup}>
                        <button
                          onClick={handleSaveChanges}
                          disabled={saving}
                          style={{
                            ...styles.primaryButton,
                            ...(saving && styles.buttonDisabled),
                          }}
                        >
                          {saving ? (
                            <>
                              <div style={styles.buttonSpinner} />
                              Saving...
                            </>
                          ) : (
                            <>
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                              >
                                <path
                                  d="M13 2H3C2.44772 2 2 2.44772 2 3V15C2 15.5523 2.44772 16 3 16H15C15.5523 16 16 15.5523 16 15V5L13 2Z"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M12 16V10H6V16"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M6 2V6H11"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              Save Changes
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          style={{
                            ...styles.secondaryButton,
                            ...(saving && styles.buttonDisabled),
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        style={styles.editButton}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                        >
                          <path
                            d="M12.5 2.5L15.5 5.5L6 15H3V12L12.5 2.5Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Edit Profile
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Account Info & Security */}
            <div style={styles.rightColumn}>
              {/* Profile Picture Card */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardHeaderIconSmall}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect
                        x="2"
                        y="4"
                        width="16"
                        height="12"
                        rx="2"
                        stroke="#2563EB"
                        strokeWidth="1.5"
                      />
                      <circle cx="7" cy="9" r="1.5" fill="#2563EB" />
                      <path
                        d="M18 12L14 8L8 14"
                        stroke="#2563EB"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 style={styles.cardTitleSmall}>Profile Picture</h3>
                    <p style={styles.cardDescriptionSmall}>
                      Update your profile picture.
                    </p>
                  </div>
                </div>

                <div style={styles.profilePictureSection}>
                  <div style={styles.profilePicture}>{getInitials(name)}</div>
                  <p style={styles.helpTextCenter}>
                    Profile picture upload is not yet available.
                  </p>
                </div>
              </div>

              {/* Account Information Card */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardHeaderIconSmall}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle
                        cx="10"
                        cy="10"
                        r="8"
                        stroke="#2563EB"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M10 10V14M10 6H10.01"
                        stroke="#2563EB"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 style={styles.cardTitleSmall}>Account Information</h3>
                  </div>
                </div>

                <div style={styles.infoList}>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <circle
                          cx="8"
                          cy="6"
                          r="2"
                          stroke="#6B7280"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M3 14C3 11.7909 4.79086 10 7 10H9C11.2091 10 13 11.7909 13 14"
                          stroke="#6B7280"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span>Role</span>
                    </div>
                    <div style={styles.infoValue}>{getRoleLabel(role)}</div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <rect
                          x="2"
                          y="3"
                          width="12"
                          height="10"
                          rx="1"
                          stroke="#6B7280"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M2 6H14M5 1V3M11 1V3"
                          stroke="#6B7280"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span>Member Since</span>
                    </div>
                    <div style={styles.infoValue}>
                      {formatDate(memberSince)}
                    </div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <rect
                          x="2"
                          y="3"
                          width="12"
                          height="9"
                          rx="1"
                          stroke="#6B7280"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M5 6H11M5 9H8"
                          stroke="#6B7280"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span>Total Tickets</span>
                    </div>
                    <div style={styles.infoValue}>{totalTickets}</div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <circle
                          cx="8"
                          cy="8"
                          r="6"
                          stroke="#6B7280"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M8 4V8L10 10"
                          stroke="#6B7280"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span>Last Login</span>
                    </div>
                    <div style={styles.infoValue}>
                      {formatDateTime(lastLogin)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Card */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardHeaderIconSmall}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect
                        x="4"
                        y="8"
                        width="12"
                        height="9"
                        rx="2"
                        stroke="#2563EB"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M7 8V6C7 4.34315 8.34315 3 10 3C11.6569 3 13 4.34315 13 6V8"
                        stroke="#2563EB"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <circle cx="10" cy="12" r="1" fill="#2563EB" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={styles.cardTitleSmall}>Security</h3>
                    <p style={styles.cardDescriptionSmall}>
                      Keep your account secure.
                    </p>
                  </div>
                </div>

                <div style={styles.securitySection}>
                  <p style={styles.helpTextCenter}>
                    Password change functionality is not yet available. Contact
                    support if you need to update your password.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setActiveNav("profile");
        }}
        onSuccess={() => {
          setShowCreateModal(false);
          setActiveNav("profile");
          loadProfileData(); // Refresh ticket count
        }}
      />
    </div>
  );
};

// Styles
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#F9FAFB",
  },

  // Sidebar Styles (reused from other pages)
  sidebar: {
    width: "260px",
    backgroundColor: "white",
    borderRight: "1px solid #E5E7EB",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    height: "100vh",
    left: 0,
    top: 0,
    zIndex: 10,
  },

  sidebarHeader: {
    padding: "1.5rem 1.25rem",
    borderBottom: "1px solid #E5E7EB",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },

  logoText: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#1F2937",
  },

  nav: {
    padding: "1.5rem 0.75rem",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },

  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#6B7280",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    textAlign: "left",
  },

  navItemActive: {
    color: "#2563EB",
    backgroundColor: "#EFF6FF",
  },

  helpSection: {
    margin: "1rem",
    padding: "1.25rem",
    backgroundColor: "#F0F9FF",
    borderRadius: "12px",
    border: "1px solid #DBEAFE",
  },

  helpIcon: {
    fontSize: "2rem",
    marginBottom: "0.5rem",
  },

  helpContent: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },

  helpTitle: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#1F2937",
  },

  helpText: {
    fontSize: "0.75rem",
    color: "#6B7280",
    lineHeight: "1.4",
  },

  helpButton: {
    marginTop: "0.5rem",
    padding: "0.5rem 1rem",
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#2563EB",
    backgroundColor: "white",
    border: "1px solid #2563EB",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  // Main Content
  main: {
    flex: 1,
    marginLeft: "260px",
    minHeight: "100vh",
  },

  // Header
  header: {
    backgroundColor: "white",
    borderBottom: "1px solid #E5E7EB",
    padding: "1rem 2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1.5rem",
    position: "sticky",
    top: 0,
    zIndex: 5,
  },

  searchContainer: {
    position: "relative",
    flex: 1,
    maxWidth: "500px",
  },

  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },

  searchInput: {
    width: "100%",
    padding: "0.625rem 2.5rem 0.625rem 2.75rem",
    fontSize: "0.875rem",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    outline: "none",
    transition: "all 0.2s",
  },

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },

  iconButton: {
    position: "relative",
    padding: "0.5rem",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "8px",
    color: "#6B7280",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  userMenuContainer: {
    position: "relative",
  },

  userButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.5rem",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  userAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#2563EB",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.875rem",
    fontWeight: "600",
  },

  userInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "2px",
  },

  userName: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#1F2937",
  },

  userRole: {
    fontSize: "0.75rem",
    color: "#6B7280",
  },

  userMenu: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    minWidth: "200px",
    backgroundColor: "white",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    zIndex: 100,
  },

  userMenuItem: {
    width: "100%",
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    color: "#374151",
    backgroundColor: "transparent",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  userMenuItemDanger: {
    width: "100%",
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    color: "#EF4444",
    backgroundColor: "transparent",
    border: "none",
    borderTop: "1px solid #E5E7EB",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  // Profile Banner
  profileBanner: {
    backgroundColor: "#EFF6FF",
    borderBottom: "1px solid #DBEAFE",
    padding: "2rem",
  },

  bannerContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "1200px",
  },

  bannerTextContainer: {
    flex: 1,
  },

  bannerLabel: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#2563EB",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "0.5rem",
  },

  bannerTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: "0.5rem",
  },

  bannerSubtitle: {
    fontSize: "0.9375rem",
    color: "#3B82F6",
  },

  bannerIllustration: {
    marginLeft: "2rem",
  },

  // Alerts
  successAlert: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    margin: "1.5rem 2rem",
    padding: "1rem 1.25rem",
    backgroundColor: "#D1FAE5",
    border: "1px solid #10B981",
    borderRadius: "8px",
    color: "#065F46",
    fontSize: "0.875rem",
    fontWeight: "500",
  },

  errorAlert: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    margin: "1.5rem 2rem",
    padding: "1rem 1.25rem",
    backgroundColor: "#FEE2E2",
    border: "1px solid #EF4444",
    borderRadius: "8px",
    color: "#991B1B",
    fontSize: "0.875rem",
    fontWeight: "500",
  },

  // Content
  contentWrapper: {
    padding: "2rem",
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 400px",
    gap: "1.5rem",
    maxWidth: "1200px",
  },

  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },

  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },

  // Cards
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    padding: "1.5rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "1.5rem",
  },

  cardHeaderIcon: {
    padding: "0.75rem",
    backgroundColor: "#EFF6FF",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  cardHeaderIconSmall: {
    padding: "0.5rem",
    backgroundColor: "#EFF6FF",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  cardTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: "0.25rem",
  },

  cardTitleSmall: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: "0.25rem",
  },

  cardDescription: {
    fontSize: "0.875rem",
    color: "#6B7280",
    lineHeight: "1.5",
  },

  cardDescriptionSmall: {
    fontSize: "0.8125rem",
    color: "#6B7280",
    lineHeight: "1.4",
  },

  // Form
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },

  label: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#374151",
  },

  required: {
    color: "#EF4444",
  },

  inputWithIcon: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  inputIcon: {
    position: "absolute",
    left: "12px",
    pointerEvents: "none",
  },

  input: {
    width: "100%",
    padding: "0.75rem 1rem 0.75rem 2.75rem",
    fontSize: "0.875rem",
    color: "#1F2937",
    backgroundColor: "white",
    border: "1px solid #D1D5DB",
    borderRadius: "8px",
    outline: "none",
    transition: "all 0.2s",
  },

  inputDisabled: {
    backgroundColor: "#F9FAFB",
    color: "#9CA3AF",
    cursor: "not-allowed",
  },

  verifiedBadge: {
    position: "absolute",
    right: "12px",
    display: "flex",
    alignItems: "center",
    gap: "0.375rem",
    padding: "0.25rem 0.625rem",
    backgroundColor: "#D1FAE5",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#065F46",
  },

  helpTextCenter: {
    fontSize: "0.8125rem",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: "1.5",
  },

  // Buttons
  buttonGroup: {
    display: "flex",
    gap: "0.75rem",
    marginTop: "0.5rem",
  },

  primaryButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#2563EB",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  secondaryButton: {
    padding: "0.75rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#374151",
    backgroundColor: "white",
    border: "1px solid #D1D5DB",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  editButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#2563EB",
    backgroundColor: "#EFF6FF",
    border: "1px solid #DBEAFE",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },

  buttonSpinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  // Profile Picture
  profilePictureSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    paddingTop: "0.5rem",
  },

  profilePicture: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    backgroundColor: "#2563EB",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    fontWeight: "600",
    border: "4px solid #EFF6FF",
  },

  // Account Info
  infoList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },

  infoItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: "1rem",
    borderBottom: "1px solid #F3F4F6",
  },

  infoLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.8125rem",
    color: "#6B7280",
    fontWeight: "500",
  },

  infoValue: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#1F2937",
  },

  // Security
  securitySection: {
    paddingTop: "0.5rem",
  },

  // Loading
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem 2rem",
    textAlign: "center",
  },

  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #E5E7EB",
    borderTop: "4px solid #2563EB",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "1rem",
  },
};
