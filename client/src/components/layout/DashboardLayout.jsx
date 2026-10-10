/**
 * DashboardLayout Component
 * Wrapper layout for all dashboard pages (Customer & Admin)
 * Provides consistent sidebar, header, and main content structure
 */

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { sharedStyles } from "../../styles/sharedStyles";

export const DashboardLayout = ({
  children,
  navItems,
  activeNav,
  onNavChange,
  sidebarBottomContent,
  searchPlaceholder,
  searchQuery,
  onSearchChange,
  notificationCount,
  showSearch = true,
}) => {
  return (
    <div style={sharedStyles.container}>
      <Sidebar
        navItems={navItems}
        activeNav={activeNav}
        onNavChange={onNavChange}
        bottomContent={sidebarBottomContent}
      />
      <main style={sharedStyles.main}>
        <Header
          searchPlaceholder={searchPlaceholder}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          notificationCount={notificationCount}
          showSearch={showSearch}
        />
        {children}
      </main>
    </div>
  );
};
