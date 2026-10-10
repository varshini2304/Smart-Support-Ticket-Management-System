/**
 * AdminDashboard - SupportHub Redesign
 * Professional admin view with statistics, charts, and ticket management
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { adminAPI } from "../services/api";

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeNav, setActiveNav] = useState("dashboard");
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDashboardData();
  }, [currentPage, statusFilter, priorityFilter]);

  const fetchDashboardData = async () => {
    // Fetch stats
    setStatsLoading(true);
    try {
      const statsData = await adminAPI.getDashboardStats();
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setStatsLoading(false);
    }

    // Fetch tickets
    setLoading(true);
    setError(null);
    try {
      const ticketsData = await adminAPI.getAllTickets(
        currentPage,
        10,
        statusFilter || null,
        priorityFilter || null,
      );
      setTickets(ticketsData.tickets || []);
      setTotalPages(ticketsData.pages || 1);
    } catch (err) {
      setError(err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setStatusFilter("");
    setPriorityFilter("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
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

  const getStatusColor = (status) => {
    const colors = {
      OPEN: "#EF4444",
      IN_PROGRESS: "#F59E0B",
      RESOLVED: "#10B981",
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
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Filter tickets by search query (client-side)
  const filteredTickets = tickets.filter((ticket) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ticket.title?.toLowerCase().includes(query) ||
      ticket._id?.toLowerCase().includes(query) ||
      ticket.description?.toLowerCase().includes(query)
    );
  });

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
              navigate("/admin/dashboard");
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
              navigate("/admin/dashboard");
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
            <span>All Tickets</span>
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

        {/* Quick Actions */}
        <div style={styles.quickActions}>
          <div style={styles.quickActionsIcon}>⚡</div>
          <div style={styles.quickActionsContent}>
            <div style={styles.quickActionsTitle}>Quick Actions</div>
            <button
              onClick={() => navigate("/admin/dashboard")}
              style={styles.quickActionButton}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3V13M3 8H13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              View All Tickets
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
              placeholder="Search tickets by ID, title, customer or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={styles.clearSearchButton}
              >
                ✕
              </button>
            )}
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
              {stats?.byStatus?.OPEN > 0 && (
                <span style={styles.notificationBadge}>
                  {stats.byStatus.OPEN}
                </span>
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
                  <div style={styles.userName}>
                    {user?.name || "Admin User"}
                  </div>
                  <div style={styles.userRole}>Administrator</div>
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
            <h1 style={styles.welcomeTitle}>Welcome back, Admin!</h1>
            <p style={styles.welcomeSubtitle}>
              Manage support tickets, track team performance and keep your
              customers happy.
            </p>
          </div>
          <div style={styles.welcomeIllustration}>
            <svg width="180" height="120" viewBox="0 0 180 120" fill="none">
              {/* Admin illustration */}
              <circle cx="90" cy="50" r="20" fill="#DBEAFE" />
              <circle cx="90" cy="45" r="10" fill="#FDE68A" />
              <path
                d="M90 55C85 55 75 58 75 65H105C105 58 95 55 90 55Z"
                fill="#60A5FA"
              />
              {/* Laptop */}
              <rect
                x="65"
                y="65"
                width="50"
                height="35"
                rx="2"
                fill="#3B82F6"
              />
              <rect
                x="60"
                y="100"
                width="60"
                height="3"
                rx="1.5"
                fill="#1E40AF"
              />
              {/* Settings gear */}
              <circle cx="130" cy="40" r="12" fill="#10B981" opacity="0.2" />
              <circle
                cx="130"
                cy="40"
                r="6"
                stroke="#10B981"
                strokeWidth="2"
                fill="none"
              />
              {/* Plant */}
              <ellipse cx="45" cy="85" rx="5" ry="12" fill="#34D399" />
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
              <div style={styles.statValue}>
                {statsLoading ? "..." : stats?.total || 0}
              </div>
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
              <div style={styles.statLabel}>Open Tickets</div>
              <div style={styles.statValue}>
                {statsLoading ? "..." : stats?.byStatus?.OPEN || 0}
              </div>
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
              <div style={styles.statValue}>
                {statsLoading ? "..." : stats?.byStatus?.IN_PROGRESS || 0}
              </div>
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
              <div style={styles.statValue}>
                {statsLoading ? "..." : stats?.byStatus?.RESOLVED || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={styles.chartsGrid}>
          {/* Tickets by Status Chart */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Tickets by Status</h3>
            {stats && (
              <div style={styles.donutContainer}>
                <svg width="240" height="240" viewBox="0 0 240 240">
                  <circle
                    cx="120"
                    cy="120"
                    r="80"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="40"
                    strokeDasharray={`${(stats.byStatus.RESOLVED / stats.total) * 502.4} 502.4`}
                    transform="rotate(-90 120 120)"
                  />
                  <circle
                    cx="120"
                    cy="120"
                    r="80"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="40"
                    strokeDasharray={`${(stats.byStatus.IN_PROGRESS / stats.total) * 502.4} 502.4`}
                    strokeDashoffset={`-${(stats.byStatus.RESOLVED / stats.total) * 502.4}`}
                    transform="rotate(-90 120 120)"
                  />
                  <circle
                    cx="120"
                    cy="120"
                    r="80"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="40"
                    strokeDasharray={`${(stats.byStatus.OPEN / stats.total) * 502.4} 502.4`}
                    strokeDashoffset={`-${((stats.byStatus.RESOLVED + stats.byStatus.IN_PROGRESS) / stats.total) * 502.4}`}
                    transform="rotate(-90 120 120)"
                  />
                  <text
                    x="120"
                    y="110"
                    textAnchor="middle"
                    style={{
                      fontSize: "32px",
                      fontWeight: "700",
                      fill: "#1F2937",
                    }}
                  >
                    {stats.total}
                  </text>
                  <text
                    x="120"
                    y="135"
                    textAnchor="middle"
                    style={{ fontSize: "14px", fill: "#6B7280" }}
                  >
                    Tickets
                  </text>
                </svg>
                <div style={styles.chartLegend}>
                  <div style={styles.legendItem}>
                    <div
                      style={{
                        ...styles.legendDot,
                        backgroundColor: "#EF4444",
                      }}
                    />
                    <span style={styles.legendLabel}>Open</span>
                    <span style={styles.legendValue}>
                      {stats.byStatus.OPEN} (
                      {Math.round((stats.byStatus.OPEN / stats.total) * 100)}%)
                    </span>
                  </div>
                  <div style={styles.legendItem}>
                    <div
                      style={{
                        ...styles.legendDot,
                        backgroundColor: "#F59E0B",
                      }}
                    />
                    <span style={styles.legendLabel}>In Progress</span>
                    <span style={styles.legendValue}>
                      {stats.byStatus.IN_PROGRESS} (
                      {Math.round(
                        (stats.byStatus.IN_PROGRESS / stats.total) * 100,
                      )}
                      %)
                    </span>
                  </div>
                  <div style={styles.legendItem}>
                    <div
                      style={{
                        ...styles.legendDot,
                        backgroundColor: "#10B981",
                      }}
                    />
                    <span style={styles.legendLabel}>Resolved</span>
                    <span style={styles.legendValue}>
                      {stats.byStatus.RESOLVED} (
                      {Math.round(
                        (stats.byStatus.RESOLVED / stats.total) * 100,
                      )}
                      %)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tickets by Priority Chart */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Tickets by Priority</h3>
            {stats && (
              <div style={styles.barChartContainer}>
                <div style={styles.barChart}>
                  {["HIGH", "MEDIUM", "LOW"].map((priority) => {
                    const count = stats.byPriority[priority] || 0;
                    const maxCount = Math.max(
                      ...Object.values(stats.byPriority),
                    );
                    const height = maxCount > 0 ? (count / maxCount) * 100 : 0;

                    return (
                      <div key={priority} style={styles.barWrapper}>
                        <div style={styles.barContainer}>
                          <div
                            style={{
                              ...styles.bar,
                              height: `${height}%`,
                              backgroundColor: getPriorityColor(priority),
                            }}
                          >
                            <span style={styles.barValue}>{count}</span>
                          </div>
                        </div>
                        <div style={styles.barLabel}>
                          {priority.charAt(0) + priority.slice(1).toLowerCase()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Tickets Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recent Tickets</h2>
            <div style={styles.sectionActions}>
              <button
                onClick={() => navigate("/admin/dashboard")}
                style={styles.viewAllButton}
              >
                View All →
              </button>
            </div>
          </div>

          {/* Filters */}
          <div style={styles.filtersCard}>
            <div style={styles.filtersRow}>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="">All Statuses</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="">All Priorities</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              {(statusFilter || priorityFilter || searchQuery) && (
                <button
                  onClick={handleClearFilters}
                  style={styles.clearFiltersButton}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4 4L12 12M4 12L12 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  Clear Filters
                </button>
              )}
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
              <div style={styles.errorIcon}>⚠️</div>
              <h3 style={styles.errorTitle}>Failed to load tickets</h3>
              <p style={styles.errorText}>{error}</p>
              <button onClick={fetchDashboardData} style={styles.retryButton}>
                Try Again
              </button>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🎫</div>
              <h3 style={styles.emptyTitle}>No tickets found</h3>
              <p style={styles.emptyText}>
                {searchQuery || statusFilter || priorityFilter
                  ? "Try adjusting your search or filters"
                  : "No tickets have been created yet"}
              </p>
            </div>
          ) : (
            <div style={styles.tableCard}>
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead style={styles.tableHead}>
                    <tr>
                      <th style={styles.th}>#</th>
                      <th style={styles.th}>Title</th>
                      <th style={styles.th}>Customer</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Priority</th>
                      <th style={styles.th}>Created On</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((ticket, index) => (
                      <tr key={ticket._id} style={styles.tr}>
                        <td style={styles.td}>
                          <span style={styles.ticketId}>
                            #TK-{String(ticket._id).slice(-4).toUpperCase()}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.ticketTitle}>{ticket.title}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.customerText}>
                            {ticket.createdBy || "Unknown"}
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
                              backgroundColor: `${getPriorityColor(ticket.priority)}15`,
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
                            onClick={() =>
                              navigate(`/admin/tickets/${ticket._id}`)
                            }
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      ...styles.paginationButton,
                      ...(currentPage === 1 && styles.paginationButtonDisabled),
                    }}
                  >
                    Previous
                  </button>

                  <div style={styles.paginationInfo}>
                    Page {currentPage} of {totalPages}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    style={{
                      ...styles.paginationButton,
                      ...(currentPage === totalPages &&
                        styles.paginationButtonDisabled),
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
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

  // Sidebar
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

  quickActions: {
    margin: "1rem",
    padding: "1.25rem",
    backgroundColor: "#F0F9FF",
    borderRadius: "12px",
    border: "1px solid #DBEAFE",
  },

  quickActionsIcon: {
    fontSize: "1.5rem",
    marginBottom: "0.5rem",
  },

  quickActionsContent: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },

  quickActionsTitle: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#1F2937",
  },

  quickActionButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
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

  clearSearchButton: {
    position: "absolute",
    right: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    padding: "4px 8px",
    background: "none",
    border: "none",
    color: "#9CA3AF",
    cursor: "pointer",
    fontSize: "14px",
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

  notificationBadge: {
    position: "absolute",
    top: "4px",
    right: "4px",
    minWidth: "18px",
    height: "18px",
    padding: "0 4px",
    fontSize: "10px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#EF4444",
    borderRadius: "9px",
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

  // Welcome Banner
  welcomeBanner: {
    backgroundColor: "#EFF6FF",
    borderBottom: "1px solid #DBEAFE",
    padding: "2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  welcomeContent: {
    flex: 1,
  },

  welcomeTitle: {
    fontSize: "1.875rem",
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: "0.5rem",
  },

  welcomeSubtitle: {
    fontSize: "0.9375rem",
    color: "#3B82F6",
  },

  welcomeIllustration: {
    marginLeft: "2rem",
  },

  // Statistics
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
    padding: "2rem",
  },

  statCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    padding: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  },

  statIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "12px",
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
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: "0.25rem",
  },

  statValue: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#1F2937",
  },

  // Charts
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "1.5rem",
    padding: "0 2rem 2rem 2rem",
  },

  chartCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    padding: "1.5rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  },

  chartTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: "1.5rem",
  },

  donutContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.5rem",
  },

  chartLegend: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    width: "100%",
  },

  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },

  legendDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    flexShrink: 0,
  },

  legendLabel: {
    fontSize: "0.875rem",
    color: "#6B7280",
    flex: 1,
  },

  legendValue: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#1F2937",
  },

  barChartContainer: {
    padding: "1rem 0",
  },

  barChart: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-around",
    gap: "2rem",
    height: "200px",
  },

  barWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem",
    flex: 1,
  },

  barContainer: {
    width: "100%",
    height: "180px",
    display: "flex",
    alignItems: "flex-end",
  },

  bar: {
    width: "100%",
    borderRadius: "8px 8px 0 0",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: "0.5rem",
    transition: "height 0.3s ease",
  },

  barValue: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "white",
  },

  barLabel: {
    fontSize: "0.8125rem",
    fontWeight: "500",
    color: "#6B7280",
  },

  // Recent Tickets Section
  section: {
    padding: "0 2rem 2rem 2rem",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
  },

  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1F2937",
  },

  sectionActions: {
    display: "flex",
    gap: "0.75rem",
  },

  viewAllButton: {
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#2563EB",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  // Filters
  filtersCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  },

  filtersRow: {
    display: "flex",
    gap: "1rem",
    alignItems: "flex-end",
    flexWrap: "wrap",
  },

  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    minWidth: "180px",
  },

  filterLabel: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  filterSelect: {
    padding: "0.625rem 0.875rem",
    fontSize: "0.875rem",
    color: "#374151",
    backgroundColor: "white",
    border: "1px solid #D1D5DB",
    borderRadius: "8px",
    outline: "none",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  clearFiltersButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.625rem 1rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#6B7280",
    backgroundColor: "#F9FAFB",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  // Table
  tableCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    overflow: "hidden",
  },

  tableContainer: {
    overflowX: "auto",
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
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "left",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "1px solid #E5E7EB",
  },

  tr: {
    borderBottom: "1px solid #F3F4F6",
    transition: "background-color 0.2s",
  },

  td: {
    padding: "1rem",
    fontSize: "0.875rem",
    color: "#374151",
  },

  ticketId: {
    fontFamily: "monospace",
    fontSize: "0.8125rem",
    fontWeight: "600",
    color: "#2563EB",
  },

  ticketTitle: {
    fontWeight: "600",
    color: "#1F2937",
  },

  customerText: {
    fontSize: "0.8125rem",
    color: "#6B7280",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    padding: "0.375rem 0.75rem",
    fontSize: "0.75rem",
    fontWeight: "600",
    borderRadius: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },

  priorityBadge: {
    display: "inline-block",
    padding: "0.375rem 0.75rem",
    fontSize: "0.75rem",
    fontWeight: "600",
    borderRadius: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },

  dateText: {
    fontSize: "0.8125rem",
    color: "#6B7280",
  },

  viewButton: {
    padding: "0.5rem",
    backgroundColor: "transparent",
    border: "1px solid #E5E7EB",
    borderRadius: "6px",
    color: "#6B7280",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  // Pagination
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 1.5rem",
    borderTop: "1px solid #E5E7EB",
  },

  paginationButton: {
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
    backgroundColor: "white",
    border: "1px solid #D1D5DB",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  paginationButtonDisabled: {
    color: "#9CA3AF",
    cursor: "not-allowed",
    opacity: 0.5,
  },

  paginationInfo: {
    fontSize: "0.875rem",
    color: "#6B7280",
  },

  // Empty States
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem 2rem",
    textAlign: "center",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
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
    fontSize: "0.875rem",
    color: "#6B7280",
  },

  // Error State
  errorState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem 2rem",
    textAlign: "center",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
  },

  errorIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },

  errorTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#EF4444",
    marginBottom: "0.5rem",
  },

  errorText: {
    fontSize: "0.875rem",
    color: "#6B7280",
    marginBottom: "1.5rem",
  },

  retryButton: {
    padding: "0.75rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#2563EB",
    backgroundColor: "white",
    border: "1px solid #2563EB",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  // Loading Spinner
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
