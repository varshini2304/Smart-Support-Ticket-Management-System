/**
 * AdminDashboard Page
 * Matches reference dashboard screenshot: Welcome banner, 4 metric cards,
 * 3 analytics panels (Status Donut, Category Bar, Recent Activity),
 * and Recent Tickets table with filters and pagination.
 * Rendered inside shared AdminLayout.
 */

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { adminAPI } from "../services/api";
import { AdminStatCard } from "../components/admin/AdminStatCard";
import { TicketStatusBadge } from "../components/admin/TicketStatusBadge";

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Outlet context provided by AdminLayout
  const outletContext = useOutletContext() || {};
  const {
    searchQuery = "",
    onOpenCreateTicket,
    stats: layoutStats,
    statsLoading: layoutStatsLoading,
    refreshData: refreshLayoutData,
  } = outletContext;

  // Local state
  const [stats, setStats] = useState(layoutStats || null);
  const [statsLoading, setStatsLoading] = useState(layoutStats ? false : true);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTicketsCount, setTotalTicketsCount] = useState(0);

  // Update stats from layout context when available
  useEffect(() => {
    if (layoutStats) {
      setStats(layoutStats);
      setStatsLoading(false);
    }
  }, [layoutStats]);

  // Fetch dashboard tickets and stats
  useEffect(() => {
    fetchDashboardData();
  }, [currentPage, statusFilter, priorityFilter]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // If layout hasn't loaded stats yet, fetch them
      if (!stats) {
        setStatsLoading(true);
        const statsData = await adminAPI.getDashboardStats();
        setStats(statsData);
        setStatsLoading(false);
      }

      // Fetch tickets page
      const ticketsData = await adminAPI.getAllTickets(
        currentPage,
        10,
        statusFilter || null,
        priorityFilter || null
      );

      setTickets(ticketsData.tickets || []);
      setTotalPages(ticketsData.pages || 1);
      setTotalTicketsCount(ticketsData.total || 0);
    } catch (err) {
      console.error("Error fetching admin dashboard tickets:", err);
      setError(err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setStatusFilter("");
    setPriorityFilter("");
    setCurrentPage(1);
  };

  // Helper to format date
  const formatDate = (dateString) => {
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

  // Helper to get time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return "Just now";
    const diff = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Helper to derive category from ticket
  const getTicketCategory = (ticket) => {
    if (ticket.category) return ticket.category;
    const text = `${ticket.title} ${ticket.description}`.toLowerCase();
    if (text.includes("bill") || text.includes("payment") || text.includes("invoice") || text.includes("charge")) {
      return "Billing";
    }
    if (text.includes("login") || text.includes("password") || text.includes("account") || text.includes("auth")) {
      return "Account Access";
    }
    if (text.includes("feature") || text.includes("request") || text.includes("suggest") || text.includes("add")) {
      return "Feature Request";
    }
    if (text.includes("bug") || text.includes("error") || text.includes("crash") || text.includes("issue") || text.includes("failed")) {
      return "Technical Issue";
    }
    return "General Inquiry";
  };

  // Filter tickets by global search query (client-side matching on title, ID, customer)
  const filteredTickets = useMemo(() => {
    if (!searchQuery) return tickets;
    const query = searchQuery.toLowerCase().trim();
    return tickets.filter((ticket) => {
      const idMatch = ticket._id?.toLowerCase().includes(query) ||
        `#tk-${String(ticket._id).slice(-4)}`.toLowerCase().includes(query);
      const titleMatch = ticket.title?.toLowerCase().includes(query);
      const descMatch = ticket.description?.toLowerCase().includes(query);
      const statusMatch = ticket.status?.toLowerCase().includes(query);
      return idMatch || titleMatch || descMatch || statusMatch;
    });
  }, [tickets, searchQuery]);

  // Derived category statistics for Bar Chart
  const categoryStats = useMemo(() => {
    const counts = {
      "Technical Issue": 0,
      "Account Access": 0,
      "Feature Request": 0,
      "Billing": 0,
      "General Inquiry": 0,
    };

    tickets.forEach((ticket) => {
      const cat = getTicketCategory(ticket);
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(counts), 1);

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / (tickets.length || 1)) * 100),
      barWidth: Math.round((count / maxCount) * 100),
    }));
  }, [tickets]);

  // Recent activity stream derived from actual recent tickets
  const recentActivities = useMemo(() => {
    return tickets.slice(0, 4).map((ticket, idx) => {
      const isResolved = ticket.status === "RESOLVED";
      const isInProgress = ticket.status === "IN_PROGRESS";
      return {
        id: ticket._id || idx,
        type: isResolved ? "resolved" : isInProgress ? "in_progress" : "created",
        title: ticket.title,
        ticketId: `#TK-${String(ticket._id).slice(-4).toUpperCase()}`,
        time: getTimeAgo(ticket.updatedAt || ticket.createdAt),
        user: typeof ticket.createdBy === "string" && ticket.createdBy.length < 15
          ? ticket.createdBy
          : "Customer",
      };
    });
  }, [tickets]);

  // Donut chart calculations
  const totalCount = stats?.total || 0;
  const openCount = stats?.byStatus?.OPEN || 0;
  const inProgressCount = stats?.byStatus?.IN_PROGRESS || 0;
  const resolvedCount = stats?.byStatus?.RESOLVED || 0;

  const circumference = 2 * Math.PI * 65; // r = 65 -> approx 408.4
  const resolvedPct = totalCount > 0 ? resolvedCount / totalCount : 0;
  const inProgressPct = totalCount > 0 ? inProgressCount / totalCount : 0;
  const openPct = totalCount > 0 ? openCount / totalCount : 0;

  const resolvedDash = resolvedPct * circumference;
  const inProgressDash = inProgressPct * circumference;
  const openDash = openPct * circumference;

  return (
    <div className="admin-dashboard-page">
      {/* 1. Welcome Banner */}
      <section className="admin-welcome-banner">
        <div className="admin-welcome-content">
          <h1 className="admin-welcome-title">
            Welcome back, {user?.name || "Admin"}!
          </h1>
          <p className="admin-welcome-subtitle">
            Manage support tickets, track team performance and keep your customers happy.
          </p>
        </div>
        <div className="admin-welcome-illustration">
          <svg width="180" height="110" viewBox="0 0 180 110" fill="none">
            {/* Background glowing shape */}
            <rect x="25" y="15" width="130" height="80" rx="16" fill="#3B82F6" fillOpacity="0.08" />
            {/* Screen / Workstation */}
            <rect x="40" y="22" width="100" height="60" rx="8" fill="#1E40AF" />
            <rect x="44" y="26" width="92" height="48" rx="5" fill="#FFFFFF" />
            {/* Screen Mockup lines */}
            <rect x="52" y="34" width="30" height="4" rx="2" fill="#2563EB" />
            <rect x="52" y="42" width="76" height="3" rx="1.5" fill="#E2E8F0" />
            <rect x="52" y="48" width="60" height="3" rx="1.5" fill="#E2E8F0" />
            <rect x="52" y="54" width="70" height="3" rx="1.5" fill="#E2E8F0" />
            {/* Mini status pill on screen */}
            <rect x="106" y="34" width="22" height="6" rx="3" fill="#10B981" />
            {/* Stand */}
            <rect x="85" y="82" width="10" height="10" fill="#94A3B8" />
            <rect x="70" y="92" width="40" height="4" rx="2" fill="#64748B" />
            {/* Floating Badges */}
            <circle cx="34" cy="36" r="14" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="2" />
            <path d="M28 36L32 40L40 32" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="148" cy="68" r="14" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="2" />
            <path d="M148 62V69M148 73V74" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </section>

      {/* 2. Four Statistic Metric Cards */}
      <section className="admin-stats-grid">
        <AdminStatCard
          variant="total"
          label="Total Tickets"
          value={totalCount}
          trend="+12% this month"
          loading={statsLoading}
          onClick={() => navigate("/admin/tickets")}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
              <path d="M7 9H17M7 13H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
        />
        <AdminStatCard
          variant="open"
          label="Open Tickets"
          value={openCount}
          trend="Requires action"
          loading={statsLoading}
          onClick={() => {
            setStatusFilter("OPEN");
            setCurrentPage(1);
          }}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
        />
        <AdminStatCard
          variant="progress"
          label="In Progress"
          value={inProgressCount}
          trend="Under review"
          loading={statsLoading}
          onClick={() => {
            setStatusFilter("IN_PROGRESS");
            setCurrentPage(1);
          }}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M12 6V12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
        />
        <AdminStatCard
          variant="resolved"
          label="Resolved"
          value={resolvedCount}
          trend="94% satisfaction"
          loading={statsLoading}
          onClick={() => {
            setStatusFilter("RESOLVED");
            setCurrentPage(1);
          }}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
      </section>

      {/* 3. Three Analytics Panels */}
      <section className="admin-analytics-grid">
        {/* Panel 1: Tickets by Status (Donut Chart) */}
        <div className="admin-analytics-panel">
          <div className="admin-panel-header">
            <h3 className="admin-panel-title">Tickets by Status</h3>
          </div>
          <div className="admin-donut-wrapper">
            <div className="admin-donut-svg-container">
              <svg className="admin-donut-svg" viewBox="0 0 160 160">
                {/* Background circle track */}
                <circle
                  cx="80"
                  cy="80"
                  r="65"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="20"
                />
                {totalCount > 0 && (
                  <>
                    {/* Resolved segment (green) */}
                    <circle
                      cx="80"
                      cy="80"
                      r="65"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="20"
                      strokeDasharray={`${resolvedDash} ${circumference}`}
                      strokeDashoffset="0"
                    />
                    {/* In Progress segment (amber) */}
                    <circle
                      cx="80"
                      cy="80"
                      r="65"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="20"
                      strokeDasharray={`${inProgressDash} ${circumference}`}
                      strokeDashoffset={`-${resolvedDash}`}
                    />
                    {/* Open segment (red) */}
                    <circle
                      cx="80"
                      cy="80"
                      r="65"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="20"
                      strokeDasharray={`${openDash} ${circumference}`}
                      strokeDashoffset={`-${resolvedDash + inProgressDash}`}
                    />
                  </>
                )}
              </svg>
              <div className="admin-donut-center-text">
                <span className="admin-donut-center-total">
                  {statsLoading ? "..." : totalCount}
                </span>
                <span className="admin-donut-center-label">Total</span>
              </div>
            </div>

            <div className="admin-donut-legend">
              <div className="admin-legend-row">
                <div className="admin-legend-left">
                  <span className="admin-legend-dot" style={{ backgroundColor: "#ef4444" }} />
                  <span className="admin-legend-name">Open</span>
                </div>
                <span className="admin-legend-value">
                  {openCount} ({totalCount > 0 ? Math.round(openPct * 100) : 0}%)
                </span>
              </div>
              <div className="admin-legend-row">
                <div className="admin-legend-left">
                  <span className="admin-legend-dot" style={{ backgroundColor: "#f59e0b" }} />
                  <span className="admin-legend-name">In Progress</span>
                </div>
                <span className="admin-legend-value">
                  {inProgressCount} ({totalCount > 0 ? Math.round(inProgressPct * 100) : 0}%)
                </span>
              </div>
              <div className="admin-legend-row">
                <div className="admin-legend-left">
                  <span className="admin-legend-dot" style={{ backgroundColor: "#10b981" }} />
                  <span className="admin-legend-name">Resolved</span>
                </div>
                <span className="admin-legend-value">
                  {resolvedCount} ({totalCount > 0 ? Math.round(resolvedPct * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Tickets by Category (Bar Chart) */}
        <div className="admin-analytics-panel">
          <div className="admin-panel-header">
            <h3 className="admin-panel-title">Tickets by Category</h3>
          </div>
          <div className="admin-categories-wrapper">
            {categoryStats.map((item, idx) => {
              const colors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#cbd5e1"];
              const color = colors[idx % colors.length];
              return (
                <div key={item.name} className="admin-category-item">
                  <div className="admin-category-header">
                    <span className="admin-category-name">{item.name}</span>
                    <span className="admin-category-count">
                      {item.count} tickets
                    </span>
                  </div>
                  <div className="admin-category-progress-bg">
                    <div
                      className="admin-category-progress-fill"
                      style={{
                        width: `${item.barWidth}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel 3: Recent Activity Feed */}
        <div className="admin-analytics-panel">
          <div className="admin-panel-header">
            <h3 className="admin-panel-title">Recent Activity</h3>
            <button
              type="button"
              className="admin-panel-action"
              onClick={() => navigate("/admin/tickets")}
            >
              View All
            </button>
          </div>
          <div className="admin-activity-list">
            {recentActivities.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", textAlign: "center", padding: "1rem" }}>
                No recent activity recorded
              </p>
            ) : (
              recentActivities.map((act) => (
                <div key={act.id} className="admin-activity-item">
                  <div
                    className="admin-activity-icon"
                    style={{
                      backgroundColor:
                        act.type === "resolved"
                          ? "#f0fdf4"
                          : act.type === "in_progress"
                          ? "#fffbeb"
                          : "#eff6ff",
                      color:
                        act.type === "resolved"
                          ? "#10b981"
                          : act.type === "in_progress"
                          ? "#d97706"
                          : "#2563eb",
                    }}
                  >
                    {act.type === "resolved" ? "✓" : act.type === "in_progress" ? "⏳" : "🎫"}
                  </div>
                  <div className="admin-activity-content">
                    <div className="admin-activity-text">
                      <span className="admin-activity-title">{act.ticketId}</span>{" "}
                      {act.title}
                    </div>
                    <span className="admin-activity-time">{act.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4. Recent Tickets Table Card */}
      <section className="admin-tickets-card">
        {/* Table Card Header */}
        <div className="admin-tickets-card-header">
          <h2 className="admin-tickets-card-title">Recent Tickets</h2>
          <div className="admin-tickets-header-actions">
            <button
              type="button"
              className="admin-btn-create-ticket"
              onClick={onOpenCreateTicket}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Create New Ticket
            </button>
            <button
              type="button"
              className="admin-btn-view-all"
              onClick={() => navigate("/admin/tickets")}
            >
              View All →
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="admin-table-filters-bar">
          <div className="admin-filter-inline-group">
            <label className="admin-filter-inline-label">Status:</label>
            <select
              className="admin-filter-inline-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <div className="admin-filter-inline-group">
            <label className="admin-filter-inline-label">Priority:</label>
            <select
              className="admin-filter-inline-select"
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {(statusFilter || priorityFilter || searchQuery) && (
            <button
              type="button"
              className="admin-filter-clear-btn"
              onClick={handleClearFilters}
            >
              ✕ Clear Filters
            </button>
          )}

          <div style={{ marginLeft: "auto", fontSize: "0.8125rem", color: "#64748b" }}>
            Showing {filteredTickets.length} of {totalTicketsCount} tickets
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⏳</div>
            Loading tickets...
          </div>
        ) : error ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#ef4444" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⚠️</div>
            <p>{error}</p>
            <button
              type="button"
              className="admin-page-nav-btn"
              style={{ marginTop: "1rem" }}
              onClick={fetchDashboardData}
            >
              Try Again
            </button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div style={{ padding: "3.5rem", textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🎫</div>
            <h4 style={{ color: "#0f172a", marginBottom: "0.25rem" }}>No tickets found</h4>
            <p style={{ fontSize: "0.875rem" }}>
              {searchQuery || statusFilter || priorityFilter
                ? "Try adjusting your search criteria or filters."
                : "No tickets have been created yet."}
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Title</th>
                  <th>Customer</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => {
                  const displayId = `#TK-${String(ticket._id).slice(-4).toUpperCase()}`;
                  const category = getTicketCategory(ticket);
                  const customerName =
                    typeof ticket.createdBy === "string" && ticket.createdBy.length < 20
                      ? ticket.createdBy
                      : "Customer";

                  return (
                    <tr key={ticket._id}>
                      <td>
                        <span className="admin-ticket-id-tag">{displayId}</span>
                      </td>
                      <td>
                        <div className="admin-ticket-title-cell" title={ticket.title}>
                          {ticket.title}
                        </div>
                      </td>
                      <td>
                        <span className="admin-customer-cell">{customerName}</span>
                      </td>
                      <td>
                        <span className="admin-category-badge">{category}</span>
                      </td>
                      <td>
                        <TicketStatusBadge status={ticket.status} />
                      </td>
                      <td>
                        <span
                          className={`admin-priority-badge priority-${(
                            ticket.priority || "medium"
                          ).toLowerCase()}`}
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td>
                        <span className="admin-date-cell">
                          {formatDate(ticket.createdAt)}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-action-btn-view"
                          title="View / Edit Ticket"
                          onClick={() => navigate("/admin/tickets")}
                        >
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                            <path
                              d="M10 4.5C5.5 4.5 1.73 7.61 1 12C1.73 16.39 5.5 19.5 10 19.5C14.5 19.5 18.27 16.39 19 12C18.27 7.61 14.5 4.5 10 4.5ZM10 17C7.24 17 5 14.76 5 12C5 9.24 7.24 7 10 7C12.76 7 15 9.24 15 12C15 14.76 12.76 17 10 17ZM10 9C8.34 9 7 10.34 7 12C7 13.66 8.34 15 10 15C11.66 15 13 13.66 13 12C13 10.34 11.66 9 10 9Z"
                              fill="currentColor"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="admin-pagination-bar">
            <div className="admin-pagination-info">
              Page {currentPage} of {totalPages}
            </div>
            <div className="admin-pagination-actions">
              <button
                type="button"
                className="admin-page-nav-btn"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="admin-page-nav-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
