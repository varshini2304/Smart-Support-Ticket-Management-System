/**
 * AdminSidebar Component
 * Reuses the canonical Sidebar component configured with admin navigation and actions
 */

import React from "react";
import { Sidebar } from "../layout/Sidebar";
import { adminNavItems } from "../../config/navigation";

export const AdminSidebar = ({
  isOpen = false,
  onClose,
  onOpenCreateTicket,
}) => {
  return (
    <Sidebar
      isOpen={isOpen}
      onClose={onClose}
      navItems={adminNavItems}
      brandLink="/admin/dashboard"
      onOpenCreateTicket={onOpenCreateTicket}
      showQuickActions={true}
      role="ADMIN"
    />
  );
};

export default AdminSidebar;
