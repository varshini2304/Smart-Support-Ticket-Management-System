/**
 * Navigation Configuration
 * Centralized navigation items for Customer and Admin dashboards
 */

import {
  DashboardIcon,
  TicketsIcon,
  CreateTicketIcon,
  ProfileIcon,
} from "../components/icons/NavIcons";

export const customerNavItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: <DashboardIcon />,
  },
  {
    id: "create",
    label: "Create Ticket",
    path: "/tickets/create",
    icon: <CreateTicketIcon />,
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
    path: "/admin/dashboard",
    icon: <TicketsIcon />,
  },
  {
    id: "profile",
    label: "Profile",
    path: "/profile",
    icon: <ProfileIcon />,
  },
];
