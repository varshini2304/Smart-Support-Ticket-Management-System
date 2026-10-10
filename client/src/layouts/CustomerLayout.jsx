/**
 * CustomerLayout Component
 * Central shared layout architecture for all Customer pages
 * Owns persistent sidebar, top navigation, search, and responsive layout shell
 */

import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";
import { CreateTicketModal } from "../components/CreateTicketModal";
import { customerNavItems } from "../config/navigation";
import { ticketAPI } from "../services/api";
import "../styles/AdminLayout.css";

export const CustomerLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Fetch customer dashboard stats for topbar notification badge and outlet context
  const fetchStats = useCallback(async () => {
    try {
      const data = await ticketAPI.getMyTickets(1, 100);
      const tickets = data.tickets || [];
      const calculatedStats = tickets.reduce(
        (acc, ticket) => {
          acc.total++;
          if (ticket.status === "OPEN") acc.open++;
          if (ticket.status === "IN_PROGRESS") acc.inProgress++;
          if (ticket.status === "RESOLVED") acc.resolved++;
          return acc;
        },
        { total: 0, open: 0, inProgress: 0, resolved: 0 }
      );
      setStats(calculatedStats);
    } catch (err) {
      console.error("Failed to load customer stats in layout:", err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, refreshTrigger]);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleTicketCreated = () => {
    setIsCreateModalOpen(false);
    handleRefresh();
  };

  return (
    <div className="admin-layout-root customer-layout-root">
      {/* Mobile Backdrop */}
      <div
        className={`admin-sidebar-backdrop ${isSidebarOpen ? "active" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Shared Persistent Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        navItems={customerNavItems}
        brandLink="/dashboard"
        onOpenCreateTicket={() => setIsCreateModalOpen(true)}
        showQuickActions={true}
        role="CUSTOMER"
      />

      {/* Main Layout Area */}
      <div className="admin-layout-main">
        {/* Shared Top Navigation Bar */}
        <Topbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          notificationCount={stats.open}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          roleLabel="Customer"
          profilePath="/profile"
          ticketsPath="/tickets"
          searchPlaceholder="Search tickets by ID, title or status..."
        />

        {/* Dynamic Page Content Rendered via React Router Outlet */}
        <main className="admin-layout-content">
          <Outlet
            context={{
              searchQuery,
              setSearchQuery,
              onOpenCreateTicket: () => setIsCreateModalOpen(true),
              stats,
              refreshData: handleRefresh,
            }}
          />
        </main>
      </div>

      {/* Shared Create Ticket Modal */}
      {isCreateModalOpen && (
        <CreateTicketModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleTicketCreated}
        />
      )}
    </div>
  );
};

export default CustomerLayout;
