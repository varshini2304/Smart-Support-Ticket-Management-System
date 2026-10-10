/**
 * ReportsPage - Administrator Analytics & Reporting View
 * Detailed performance metrics, status distributions, and resolution statistics.
 * Renders inside shared AdminLayout.
 */

import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";

export const ReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all");

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [statsData, ticketsData] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getAllTickets(1, 100),
      ]);
      setStats(statsData);
      setTickets(ticketsData.tickets || []);
    } catch (err) {
      console.error("Failed to load reports data:", err);
    } finally {
      setLoading(false);
    }
  };

  const total = stats?.total || tickets.length || 0;
  const openCount = stats?.byStatus?.OPEN || 0;
  const inProgressCount = stats?.byStatus?.IN_PROGRESS || 0;
  const resolvedCount = stats?.byStatus?.RESOLVED || 0;

  const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;
  const assignedCount = stats?.assignment?.assigned || tickets.filter((t) => t.assignedTo).length;
  const assignmentRate = total > 0 ? Math.round((assignedCount / total) * 100) : 0;

  const highPriority = stats?.byPriority?.HIGH || 0;
  const mediumPriority = stats?.byPriority?.MEDIUM || 0;
  const lowPriority = stats?.byPriority?.LOW || 0;

  const handleExportCSV = () => {
    if (!tickets.length) return alert("No ticket data to export.");

    const headers = ["Ticket ID,Title,Status,Priority,Created Date\n"];
    const rows = tickets.map(
      (t) =>
        `#TK-${String(t._id).slice(-4).toUpperCase()},"${t.title.replace(/"/g, '""')}",${t.status},${t.priority},${t.createdAt}`
    );

    const blob = new Blob([headers.concat(rows).join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `SupportHub_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-heading-group">
          <h1 className="admin-page-title">Reports & Analytics</h1>
          <p className="admin-page-subtitle">
            Comprehensive system performance, resolution throughput, and ticket distributions.
          </p>
        </div>
        <div className="admin-page-actions">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="admin-filter-inline-select"
            style={{ padding: "0.55rem 0.85rem" }}
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="week">Last 7 Days</option>
          </select>
          <button
            type="button"
            className="admin-btn-create-ticket"
            onClick={handleExportCSV}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2V10M8 10L5 7M8 10L11 7M3 13H13"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="admin-reports-stats-row">
        <div className="admin-stat-card stat-resolved">
          <div className="admin-stat-top">
            <div className="admin-stat-icon-box">✓</div>
            <span className="admin-stat-badge">Efficiency</span>
          </div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{loading ? "..." : `${resolutionRate}%`}</div>
            <div className="admin-stat-label">Resolution Rate</div>
          </div>
        </div>

        <div className="admin-stat-card stat-total">
          <div className="admin-stat-top">
            <div className="admin-stat-icon-box">📊</div>
            <span className="admin-stat-badge">Overall</span>
          </div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{loading ? "..." : total}</div>
            <div className="admin-stat-label">Total Volume</div>
          </div>
        </div>

        <div className="admin-stat-card stat-progress">
          <div className="admin-stat-top">
            <div className="admin-stat-icon-box">👤</div>
            <span className="admin-stat-badge">Coverage</span>
          </div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{loading ? "..." : `${assignmentRate}%`}</div>
            <div className="admin-stat-label">Tickets Assigned</div>
          </div>
        </div>

        <div className="admin-stat-card stat-open">
          <div className="admin-stat-top">
            <div className="admin-stat-icon-box">⏳</div>
            <span className="admin-stat-badge">Backlog</span>
          </div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{loading ? "..." : openCount}</div>
            <div className="admin-stat-label">Pending Review</div>
          </div>
        </div>
      </div>

      {/* 2-Column Analytics Section */}
      <div className="admin-reports-2col-grid">
        {/* Status Distribution Panel */}
        <div className="admin-report-chart-card">
          <h3 className="admin-panel-title" style={{ marginBottom: "1.25rem" }}>
            Status Distribution
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.86rem" }}>
                <span style={{ fontWeight: 600, color: "#10b981" }}>Resolved</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>
                  {resolvedCount} ({total > 0 ? Math.round((resolvedCount / total) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: "10px", borderRadius: "5px", backgroundColor: "#f1f5f9", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    backgroundColor: "#10b981",
                    width: `${total > 0 ? (resolvedCount / total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.86rem" }}>
                <span style={{ fontWeight: 600, color: "#f59e0b" }}>In Progress</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>
                  {inProgressCount} ({total > 0 ? Math.round((inProgressCount / total) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: "10px", borderRadius: "5px", backgroundColor: "#f1f5f9", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    backgroundColor: "#f59e0b",
                    width: `${total > 0 ? (inProgressCount / total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.86rem" }}>
                <span style={{ fontWeight: 600, color: "#ef4444" }}>Open</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>
                  {openCount} ({total > 0 ? Math.round((openCount / total) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: "10px", borderRadius: "5px", backgroundColor: "#f1f5f9", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    backgroundColor: "#ef4444",
                    width: `${total > 0 ? (openCount / total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Priority Breakdown Panel */}
        <div className="admin-report-chart-card">
          <h3 className="admin-panel-title" style={{ marginBottom: "1.25rem" }}>
            Priority Breakdown
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.86rem" }}>
                <span style={{ fontWeight: 600, color: "#ef4444" }}>High Priority</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>
                  {highPriority} ({total > 0 ? Math.round((highPriority / total) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: "10px", borderRadius: "5px", backgroundColor: "#f1f5f9", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    backgroundColor: "#ef4444",
                    width: `${total > 0 ? (highPriority / total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.86rem" }}>
                <span style={{ fontWeight: 600, color: "#f59e0b" }}>Medium Priority</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>
                  {mediumPriority} ({total > 0 ? Math.round((mediumPriority / total) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: "10px", borderRadius: "5px", backgroundColor: "#f1f5f9", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    backgroundColor: "#f59e0b",
                    width: `${total > 0 ? (mediumPriority / total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.86rem" }}>
                <span style={{ fontWeight: 600, color: "#10b981" }}>Low Priority</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>
                  {lowPriority} ({total > 0 ? Math.round((lowPriority / total) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: "10px", borderRadius: "5px", backgroundColor: "#f1f5f9", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    backgroundColor: "#10b981",
                    width: `${total > 0 ? (lowPriority / total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
