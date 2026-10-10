/**
 * Sidebar Component
 * Reusable sidebar navigation with logo and navigation items
 */

import { useNavigate } from "react-router-dom";
import { sharedStyles } from "../../styles/sharedStyles";

export const Sidebar = ({ navItems, activeNav, onNavChange, bottomContent }) => {
  const navigate = useNavigate();

  const handleNavClick = (item) => {
    onNavChange(item.id);
    navigate(item.path);
  };

  return (
    <aside style={sharedStyles.sidebar}>
      {/* Logo */}
      <div style={sharedStyles.sidebarHeader}>
        <div style={sharedStyles.logo}>
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
          <span style={sharedStyles.logoText}>SupportHub</span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={sharedStyles.nav}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            style={{
              ...sharedStyles.navItem,
              ...(activeNav === item.id && sharedStyles.navItemActive),
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom Content (Help section or Quick Actions) */}
      {bottomContent && <div>{bottomContent}</div>}
    </aside>
  );
};
