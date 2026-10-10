/**
 * CustomerDashboard - SupportHub Redesign
 * Modern dashboard with sidebar navigation and comprehensive ticket management
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ticketAPI } from "../services/api";
import { CreateTicketModal } from "../components/CreateTicketModal";

export const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchTicketsAndStats();
  }, []);

  const fetchTicketsAndStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await ticketAPI.getMyTickets(1, 10);
      setTickets(data.tickets || []);

      // Calculate stats
      const ticketStats = (data.tickets || []).reduce(
        (acc, ticket) => {
          acc.total++;
          if (ticket.status === "OPEN") acc.open++;
          if (ticket.status === "IN_PROGRESS") acc.inProgress++;
          if (ticket.status === "RESOLVED") acc.resolved++;
          return acc;
        },
        { total: 0, open: 0, inProgress: 0, resolved: 0 },
      );

      setStats(ticketStats);
    } catch (err) {
      setError(err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      OPEN: "#EF4444",
      IN_PROGRESS: "#F59E0B",
      RESOLVED: "#10B981",
      CLOSED: "#6B7280",
    };
    return colors[status] || "#6B7280";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      HIGH: "#EF4444",
      MEDIUM: "#F59E0B",
      LOW: "#10B981",
    };
    return colors[priority] || "#6B7280";
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
              {stats.open > 0 && (
                <span style={styles.notificationBadge}>{stats.open}</span>
              )}
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
                  <div style={styles.userRole}>Customer</div>
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

        {/* Welcome Banner */}
        <div style={styles.welcomeBanner}>
          <div style={styles.welcomeContent}>
            <div style={styles.welcomeGreeting}>
              Hello, {user?.name?.split(" ")[0] || "Varshini"}!
            </div>
            <div style={styles.welcomeTitle}>Welcome to SupportHub</div>
            <div style={styles.welcomeSubtitle}>
              Create, track and resolve your support requests quickly and
              efficiently.
            </div>
          </div>
          <div style={styles.welcomeIllustration}>
            <svg width="200" height="120" viewBox="0 0 200 120" fill="none">
              {/* Chat bubble */}
              <rect
                x="30"
                y="20"
                width="100"
                height="60"
                rx="8"
                fill="#DBEAFE"
              />
              <rect x="40" y="35" width="60" height="8" rx="4" fill="#3B82F6" />
              <rect x="40" y="50" width="40" height="8" rx="4" fill="#93C5FD" />

              {/* Laptop */}
              <rect
                x="60"
                y="50"
                width="80"
                height="50"
                rx="4"
                fill="#1E40AF"
              />
              <rect
                x="65"
                y="55"
                width="70"
                height="40"
                rx="2"
                fill="#3B82F6"
              />
              <rect
                x="50"
                y="100"
                width="100"
                height="4"
                rx="2"
                fill="#1E40AF"
              />

              {/* Person */}
              <circle cx="110" cy="60" r="8" fill="#FDE68A" />
              <path
                d="M110 68C110 68 105 70 105 75H115C115 70 110 68 110 68Z"
                fill="#60A5FA"
              />

              {/* Plant */}
              <ellipse cx="170" cy="85" rx="5" ry="12" fill="#34D399" />
              <ellipse cx="178" cy="88" rx="4" ry="10" fill="#10B981" />
            </svg>
          </div>
        </div>

        {/* Statistics Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: "#DBEAFE" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="6"
                  width="18"
                  height="14"
                  rx="2"
                  stroke="#2563EB"
                  strokeWidth="2"
                />
                <path
                  d="M7 10H17M7 14H12"
                  stroke="#2563EB"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>Total Tickets</div>
              <div style={styles.statValue}>{stats.total}</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: "#FEE2E2" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="#EF4444"
                  strokeWidth="2"
                />
                <path
                  d="M12 8V12L14 14"
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>Open</div>
              <div style={styles.statValue}>{stats.open}</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: "#FEF3C7" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="#F59E0B"
                  strokeWidth="2"
                />
                <path
                  d="M12 6V12H18"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>In Progress</div>
              <div style={styles.statValue}>{stats.inProgress}</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: "#D1FAE5" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="#10B981"
                  strokeWidth="2"
                />
                <path
                  d="M8 12L11 15L16 9"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>Resolved</div>
              <div style={styles.statValue}>{stats.resolved}</div>
            </div>
          </div>
        </div>

        {/* Recent Tickets Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recent Tickets</h2>
            <div style={styles.sectionActions}>
              <button
                onClick={() => setShowCreateModal(true)}
                style={styles.primaryButton}
              >
                + Create New Ticket
              </button>
              <button
                onClick={() => navigate("/tickets")}
                style={styles.secondaryButton}
              >
                View All →
              </button>
            </div>
          </div>

          {/* Tickets Table */}
          {loading ? (
            <div style={styles.emptyState}>
              <div style={styles.loadingSpinner} />
              <p>Loading tickets...</p>
            </div>
          ) : error ? (
            <div style={styles.errorState}>
              <p>{error}</p>
              <button onClick={fetchTicketsAndStats} style={styles.retryButton}>
                Retry
              </button>
            </div>
          ) : tickets.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🎫</div>
              <h3 style={styles.emptyTitle}>No tickets yet</h3>
              <p style={styles.emptyText}>
                Create your first support ticket to get started
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                style={styles.primaryButton}
              >
                Create Ticket
              </button>
            </div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead style={styles.tableHead}>
                  <tr>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Priority</th>
                    <th style={styles.th}>Created On</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.slice(0, 5).map((ticket, index) => (
                    <tr key={ticket._id} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={styles.ticketId}>
                          #TK-{String(index + 1).padStart(4, "0")}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.ticketTitle}>{ticket.title}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.category}>
                          {ticket.category || "Technical Issue"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            color: getStatusColor(ticket.status),
                            backgroundColor: `${getStatusColor(ticket.status)}15`,
                          }}
                        >
                          ● {ticket.status.replace("_", " ")}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.priorityBadge,
                            color: getPriorityColor(ticket.priority),
                          }}
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.dateText}>
                          {formatDate(ticket.createdAt)}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => navigate(`/tickets/${ticket._id}`)}
                          style={styles.viewButton}
                          title="View details"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                          >
                            <path
                              d="M1 9C1 9 3.5 3.5 9 3.5C14.5 3.5 17 9 17 9C17 9 14.5 14.5 9 14.5C3.5 14.5 1 9 1 9Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <circle
                              cx="9"
                              cy="9"
                              r="2.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bottom Sections */}
        <div style={styles.bottomGrid}>
          {/* Quick Actions */}
          <div style={styles.quickActions}>
            <h3 style={styles.quickActionsTitle}>Quick Actions</h3>
            <div style={styles.actionsList}>
              <button
                onClick={() => setShowCreateModal(true)}
                style={styles.actionItem}
              >
                <div
                  style={{ ...styles.actionIcon, backgroundColor: "#DBEAFE" }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle
                      cx="10"
                      cy="10"
                      r="7"
                      stroke="#2563EB"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M10 7V13M7 10H13"
                      stroke="#2563EB"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <div style={styles.actionTitle}>Create Ticket</div>
                  <div style={styles.actionDesc}>
                    Raise a new support request
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate("/tickets")}
                style={styles.actionItem}
              >
                <div
                  style={{ ...styles.actionIcon, backgroundColor: "#E0E7FF" }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect
                      x="3"
                      y="4"
                      width="14"
                      height="12"
                      rx="2"
                      stroke="#4F46E5"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M7 8H13M7 12H10"
                      stroke="#4F46E5"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <div style={styles.actionTitle}>View All Tickets</div>
                  <div style={styles.actionDesc}>See your ticket history</div>
                </div>
              </button>

              <button
                onClick={() => navigate("/profile")}
                style={styles.actionItem}
              >
                <div
                  style={{ ...styles.actionIcon, backgroundColor: "#DBEAFE" }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle
                      cx="10"
                      cy="7"
                      r="3"
                      stroke="#2563EB"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M4 17C4 14.2386 6.23858 12 9 12H11C13.7614 12 16 14.2386 16 17"
                      stroke="#2563EB"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <div style={styles.actionTitle}>Update Profile</div>
                  <div style={styles.actionDesc}>
                    Manage your account details
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Support Categories */}
          <div style={styles.supportCategories}>
            <div style={styles.categoriesHeader}>
              <h3 style={styles.categoriesTitle}>Support Categories</h3>
              <button style={styles.viewAllLink}>View All →</button>
            </div>
            <div style={styles.categoriesGrid}>
              <div style={styles.categoryCard}>
                <div
                  style={{ ...styles.categoryIcon, backgroundColor: "#DBEAFE" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="4"
                      y="4"
                      width="16"
                      height="16"
                      rx="2"
                      stroke="#2563EB"
                      strokeWidth="2"
                    />
                    <path
                      d="M8 10H16M8 14H12"
                      stroke="#2563EB"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div style={styles.categoryName}>Technical Issue</div>
              </div>

              <div style={styles.categoryCard}>
                <div
                  style={{ ...styles.categoryIcon, backgroundColor: "#DBEAFE" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="8"
                      stroke="#2563EB"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 8V12L14 14"
                      stroke="#2563EB"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div style={styles.categoryName}>Account Access</div>
              </div>

              <div style={styles.categoryCard}>
                <div
                  style={{ ...styles.categoryIcon, backgroundColor: "#FEF3C7" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                      stroke="#F59E0B"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div style={styles.categoryName}>Feature Request</div>
              </div>

              <div style={styles.categoryCard}>
                <div
                  style={{ ...styles.categoryIcon, backgroundColor: "#E0E7FF" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="#4F46E5"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 16V12M12 8H12.01"
                      stroke="#4F46E5"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div style={styles.categoryName}>General Inquiry</div>
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
          setActiveNav("dashboard");
        }}
        onSuccess={() => {
          fetchTicketsAndStats();
          setShowCreateModal(false);
          setActiveNav("dashboard");
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

  // Sidebar Styles
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
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "0.5rem",
    color: "#6B7280",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.15s ease",
    textAlign: "left",
  },

  navItemActive: {
    backgroundColor: "#EFF6FF",
    color: "#2563EB",
  },

  helpSection: {
    margin: "1rem",
    padding: "1rem",
    backgroundColor: "#F3F4F6",
    borderRadius: "0.75rem",
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
    padding: "0.5rem 0.75rem",
    backgroundColor: "#2563EB",
    color: "white",
    border: "none",
    borderRadius: "0.375rem",
    fontSize: "0.75rem",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "0.25rem",
  },

  // Main Content Styles
  main: {
    flex: 1,
    marginLeft: "260px",
    minHeight: "100vh",
  },

  // Header Styles
  header: {
    backgroundColor: "white",
    borderBottom: "1px solid #E5E7EB",
    padding: "1rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 9,
  },

  searchContainer: {
    position: "relative",
    flex: "1",
    maxWidth: "500px",
  },

  searchIcon: {
    position: "absolute",
    left: "1rem",
    top: "50%",
    transform: "translateY(-50%)",
  },

  searchInput: {
    width: "100%",
    padding: "0.625rem 1rem 0.625rem 2.75rem",
    backgroundColor: "#F9FAFB",
    border: "1px solid #E5E7EB",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    outline: "none",
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
    borderRadius: "0.5rem",
    color: "#6B7280",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  notificationBadge: {
    position: "absolute",
    top: "0.25rem",
    right: "0.25rem",
    backgroundColor: "#EF4444",
    color: "white",
    fontSize: "0.625rem",
    fontWeight: "600",
    width: "1rem",
    height: "1rem",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  userMenuContainer: {
    position: "relative",
  },

  userButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.375rem 0.75rem",
    backgroundColor: "transparent",
    border: "1px solid #E5E7EB",
    borderRadius: "0.5rem",
    cursor: "pointer",
  },

  userAvatar: {
    width: "2rem",
    height: "2rem",
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
    textAlign: "left",
  },

  userName: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#1F2937",
  },

  userRole: {
    fontSize: "0.75rem",
    color: "#6B7280",
  },

  userMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: "0.5rem",
    backgroundColor: "white",
    border: "1px solid #E5E7EB",
    borderRadius: "0.5rem",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    minWidth: "180px",
    zIndex: 10,
  },

  userMenuItem: {
    width: "100%",
    padding: "0.75rem 1rem",
    backgroundColor: "transparent",
    border: "none",
    textAlign: "left",
    fontSize: "0.875rem",
    color: "#374151",
    cursor: "pointer",
  },

  userMenuItemDanger: {
    width: "100%",
    padding: "0.75rem 1rem",
    backgroundColor: "transparent",
    border: "none",
    borderTop: "1px solid #E5E7EB",
    textAlign: "left",
    fontSize: "0.875rem",
    color: "#EF4444",
    cursor: "pointer",
  },

  // Welcome Banner
  welcomeBanner: {
    margin: "2rem",
    padding: "2rem",
    backgroundColor: "#EFF6FF",
    borderRadius: "1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  welcomeContent: {
    flex: 1,
  },

  welcomeGreeting: {
    fontSize: "0.875rem",
    color: "#2563EB",
    fontWeight: "500",
    marginBottom: "0.5rem",
  },

  welcomeTitle: {
    fontSize: "1.875rem",
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: "0.5rem",
  },

  welcomeSubtitle: {
    fontSize: "1rem",
    color: "#6B7280",
  },

  welcomeIllustration: {
    flexShrink: 0,
  },

  // Stats Grid
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1.5rem",
    padding: "0 2rem",
    marginBottom: "2rem",
  },

  statCard: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "0.75rem",
    border: "1px solid #E5E7EB",
    display: "flex",
    alignItems: "flex-start",
    gap: "1rem",
  },

  statIcon: {
    width: "3rem",
    height: "3rem",
    borderRadius: "0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  statContent: {
    flex: 1,
  },

  statLabel: {
    fontSize: "0.875rem",
    color: "#6B7280",
    marginBottom: "0.5rem",
  },

  statValue: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#1F2937",
  },

  // Section
  section: {
    padding: "0 2rem",
    marginBottom: "2rem",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },

  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#1F2937",
  },

  sectionActions: {
    display: "flex",
    gap: "0.75rem",
  },

  primaryButton: {
    padding: "0.625rem 1.25rem",
    backgroundColor: "#2563EB",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
  },

  secondaryButton: {
    padding: "0.625rem 1.25rem",
    backgroundColor: "white",
    color: "#2563EB",
    border: "1px solid #2563EB",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
  },

  // Table
  tableContainer: {
    backgroundColor: "white",
    borderRadius: "0.75rem",
    border: "1px solid #E5E7EB",
    overflow: "hidden",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  tableHead: {
    backgroundColor: "#F9FAFB",
  },

  th: {
    padding: "1rem",
    textAlign: "left",
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  tr: {
    borderTop: "1px solid #E5E7EB",
  },

  td: {
    padding: "1rem",
    fontSize: "0.875rem",
    color: "#374151",
  },

  ticketId: {
    color: "#2563EB",
    fontWeight: "500",
  },

  ticketTitle: {
    fontWeight: "500",
  },

  category: {
    color: "#6B7280",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: "500",
  },

  priorityBadge: {
    fontWeight: "500",
    fontSize: "0.875rem",
  },

  dateText: {
    color: "#6B7280",
  },

  viewButton: {
    padding: "0.375rem",
    backgroundColor: "transparent",
    border: "none",
    color: "#6B7280",
    cursor: "pointer",
    borderRadius: "0.375rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // Empty/Loading/Error States
  emptyState: {
    backgroundColor: "white",
    borderRadius: "0.75rem",
    border: "1px solid #E5E7EB",
    padding: "4rem 2rem",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "1rem",
  },

  emptyTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: "0.5rem",
  },

  emptyText: {
    color: "#6B7280",
    marginBottom: "1.5rem",
  },

  loadingSpinner: {
    width: "3rem",
    height: "3rem",
    border: "3px solid #E5E7EB",
    borderTopColor: "#2563EB",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
    margin: "0 auto 1rem",
  },

  errorState: {
    backgroundColor: "white",
    borderRadius: "0.75rem",
    border: "1px solid #FEE2E2",
    padding: "2rem",
    textAlign: "center",
  },

  retryButton: {
    marginTop: "1rem",
    padding: "0.625rem 1.25rem",
    backgroundColor: "#2563EB",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
  },

  // Bottom Grid
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2rem",
    padding: "0 2rem 2rem",
  },

  quickActions: {
    backgroundColor: "white",
    borderRadius: "0.75rem",
    border: "1px solid #E5E7EB",
    padding: "1.5rem",
  },

  quickActionsTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: "1.5rem",
  },

  actionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },

  actionItem: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem",
    backgroundColor: "transparent",
    border: "1px solid #E5E7EB",
    borderRadius: "0.5rem",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s ease",
  },

  actionIcon: {
    width: "2.5rem",
    height: "2.5rem",
    borderRadius: "0.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  actionTitle: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: "0.25rem",
  },

  actionDesc: {
    fontSize: "0.75rem",
    color: "#6B7280",
  },

  supportCategories: {
    backgroundColor: "white",
    borderRadius: "0.75rem",
    border: "1px solid #E5E7EB",
    padding: "1.5rem",
  },

  categoriesHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },

  categoriesTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#1F2937",
  },

  viewAllLink: {
    fontSize: "0.875rem",
    color: "#2563EB",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontWeight: "500",
  },

  categoriesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "1rem",
  },

  categoryCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "1.5rem",
    border: "1px solid #E5E7EB",
    borderRadius: "0.5rem",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },

  categoryIcon: {
    width: "3rem",
    height: "3rem",
    borderRadius: "0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0.75rem",
  },

  categoryName: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
  },
};

// Add CSS animation for spinner
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @media (max-width: 1024px) {
      .dashboard-stats-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      .dashboard-bottom-grid {
        grid-template-columns: 1fr !important;
      }
    }
    
    @media (max-width: 768px) {
      .dashboard-sidebar {
        transform: translateX(-100%);
      }
      .dashboard-main {
        margin-left: 0 !important;
      }
    }
  `;
  if (!document.querySelector("#dashboard-styles")) {
    styleSheet.id = "dashboard-styles";
    document.head.appendChild(styleSheet);
  }
}
