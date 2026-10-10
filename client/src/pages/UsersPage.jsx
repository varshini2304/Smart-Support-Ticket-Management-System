/**
 * UsersPage - Administrator User Management View
 * Overview of users, roles, support team, and customers.
 * Renders inside shared AdminLayout.
 */

import React, { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { adminAPI } from "../services/api";

export const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const { searchQuery = "" } = useOutletContext() || {};

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getAllTickets(1, 100);
      setTickets(data.tickets || []);
    } catch (err) {
      console.error("Failed to load tickets for users page:", err);
    } finally {
      setLoading(false);
    }
  };

  // Build a distinct user list combining current admin and ticket creators
  const usersList = useMemo(() => {
    const userMap = new Map();

    // 1. Current logged-in administrator
    if (currentUser) {
      userMap.set(currentUser.email || "admin", {
        id: currentUser.id || currentUser._id || "adm-1",
        name: currentUser.name || "Administrator",
        email: currentUser.email || "admin@example.com",
        role: "ADMIN",
        ticketsCount: 0,
        status: "Active",
        createdAt: currentUser.createdAt || new Date().toISOString(),
      });
    }

    // 2. Customers extracted from tickets
    tickets.forEach((ticket, idx) => {
      const creatorName =
        typeof ticket.createdBy === "string" && ticket.createdBy.length < 25
          ? ticket.createdBy
          : `Customer ${String(ticket._id).slice(-4)}`;

      const emailKey = `${creatorName.toLowerCase().replace(/\s+/g, ".")}@customer.support`;

      if (userMap.has(emailKey)) {
        userMap.get(emailKey).ticketsCount += 1;
      } else {
        userMap.set(emailKey, {
          id: ticket.createdBy || `usr-${idx + 1}`,
          name: creatorName,
          email: emailKey,
          role: "CUSTOMER",
          ticketsCount: 1,
          status: "Active",
          createdAt: ticket.createdAt,
        });
      }
    });

    return Array.from(userMap.values());
  }, [currentUser, tickets]);

  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }
      return true;
    });
  }, [usersList, roleFilter, searchQuery]);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recent";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const totalUsers = usersList.length;
  const adminUsers = usersList.filter((u) => u.role === "ADMIN").length;
  const customerUsers = usersList.filter((u) => u.role === "CUSTOMER").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-heading-group">
          <h1 className="admin-page-title">Users & Team</h1>
          <p className="admin-page-subtitle">
            Manage user accounts, roles, access permissions, and support team members.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="admin-users-grid">
        <div className="admin-stat-card stat-total">
          <div className="admin-stat-top">
            <div className="admin-stat-icon-box">👥</div>
            <span className="admin-stat-badge">Total Accounts</span>
          </div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{totalUsers}</div>
            <div className="admin-stat-label">Registered Users</div>
          </div>
        </div>

        <div className="admin-stat-card stat-open">
          <div className="admin-stat-icon-box">🛡️</div>
          <span className="admin-stat-badge">Support Staff</span>
        </div>
        <div className="admin-stat-info">
          <div className="admin-stat-value">{adminUsers}</div>
          <div className="admin-stat-label">Administrators</div>
        </div>

        <div className="admin-stat-card stat-resolved">
          <div className="admin-stat-icon-box">🎫</div>
          <span className="admin-stat-badge">Ticket Requesters</span>
        </div>
        <div className="admin-stat-info">
          <div className="admin-stat-value">{customerUsers}</div>
          <div className="admin-stat-label">Customers</div>
        </div>
      </div>

      {/* Users Card Table */}
      <div className="admin-tickets-card">
        {/* Table Filters Bar */}
        <div className="admin-table-filters-bar">
          <div className="admin-filter-inline-group">
            <label className="admin-filter-inline-label">Role:</label>
            <select
              className="admin-filter-inline-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Administrator</option>
              <option value="CUSTOMER">Customer</option>
            </select>
          </div>

          {(roleFilter || searchQuery) && (
            <button
              type="button"
              className="admin-filter-clear-btn"
              onClick={() => setRoleFilter("")}
            >
              ✕ Clear Filters
            </button>
          )}

          <div style={{ marginLeft: "auto", fontSize: "0.8125rem", color: "#64748b" }}>
            Showing {filteredUsers.length} users
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>⏳</div>
            Loading users...
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Tickets</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.email}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            backgroundColor: u.role === "ADMIN" ? "#eff6ff" : "#f1f5f9",
                            color: u.role === "ADMIN" ? "#2563eb" : "#475569",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {getInitials(u.name)}
                        </div>
                        <span style={{ fontWeight: 600, color: "#0f172a" }}>
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: "#64748b" }}>{u.email}</span>
                    </td>
                    <td>
                      <span
                        className={`admin-role-badge ${
                          u.role === "ADMIN" ? "role-admin" : "role-customer"
                        }`}
                      >
                        {u.role === "ADMIN" ? "🛡️ Administrator" : "👤 Customer"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>
                        {u.ticketsCount}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: "#15803d",
                          backgroundColor: "#f0fdf4",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "9999px",
                        }}
                      >
                        ● Active
                      </span>
                    </td>
                    <td>
                      <span className="admin-date-cell">{formatDate(u.createdAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
