/**
 * EmptyState Component
 * Reusable empty state display
 */

import { sharedStyles } from "../../styles/sharedStyles";

export const EmptyState = ({
  icon = "🎫",
  title = "No items found",
  message = "There are no items to display",
  action,
}) => {
  return (
    <div style={sharedStyles.emptyState}>
      <div style={sharedStyles.emptyIcon}>{icon}</div>
      <h3 style={sharedStyles.emptyTitle}>{title}</h3>
      <p style={sharedStyles.emptyText}>{message}</p>
      {action && <div style={{ marginTop: "1.5rem" }}>{action}</div>}
    </div>
  );
};
