/**
 * AdminLayout Component
 * Central shared layout architecture for all Administrator pages
 * Owns persistent sidebar, top navigation, search, and responsive layout shell
 */

import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { AdminTopbar } from "../components/admin/AdminTopbar";
import { CreateTicketModal } from "../components/CreateTicketModal";
import { adminAPI } from "../services/api";

export const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Fetch admin dashboard stats for topbar notification count and child pages
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const statsData = await adminAPI.getDashboardStats();
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load admin dashboard stats in layout:", err);
    } finally {
      setStatsLoading(false);
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

  // Notification count: number of OPEN tickets from backend stats
  const openTicketsCount = stats?.byStatus?.OPEN || 0;

  return (
    <div className="admin-layout-root">
      {/* Mobile Backdrop */}
      <div
        className={`admin-sidebar-backdrop ${isSidebarOpen ? "active" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Shared Persistent Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenCreateTicket={() => setIsCreateModalOpen(true)}
      />

      {/* Main Layout Area */}
      <div className="admin-layout-main">
        {/* Shared Top Navigation Bar */}
        <AdminTopbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          notificationCount={openTicketsCount}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Dynamic Page Content Rendered via React Router Outlet */}
        <main className="admin-layout-content">
          <Outlet
            context={{
              searchQuery,
              setSearchQuery,
              onOpenCreateTicket: () => setIsCreateModalOpen(true),
              stats,
              statsLoading,
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
