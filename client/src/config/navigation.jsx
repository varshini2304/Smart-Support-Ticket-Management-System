/**
 * Navigation Configuration
 * Centralized navigation items for Customer and Admin dashboards
 */

import {
  DashboardIcon,
  TicketsIcon,
  CreateTicketIcon,
  ProfileIcon,
  UsersIcon,
  ReportsIcon,
} from "../components/icons/NavIcons";

export const customerNavItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: <DashboardIcon />,
  },
  {
    id: "tickets",
    label: "My Tickets",
    path: "/tickets",
    icon: <TicketsIcon />,
  },
  {
    id: "profile",
    label: "Profile",
    path: "/profile",
    icon: <ProfileIcon />,
  },
];

export const adminNavItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <DashboardIcon />,
  },
  {
    id: "tickets",
    label: "All Tickets",
    path: "/admin/tickets",
    icon: <TicketsIcon />,
  },
  {
    id: "assigned",
    label: "Assigned Tickets",
    path: "/admin/assigned-tickets",
    icon: <TicketsIcon />,
  },
  {
    id: "users",
    label: "Users",
    path: "/admin/users",
    icon: <UsersIcon />,
  },
  {
    id: "reports",
    label: "Reports",
    path: "/admin/reports",
    icon: <ReportsIcon />,
  },
  {
    id: "profile",
    label: "Profile",
    path: "/admin/profile",
    icon: <ProfileIcon />,
  },
];
