/**
 * LoadingState Component
 * Reusable loading indicator
 */

import { sharedStyles } from "../../styles/sharedStyles";

export const LoadingState = ({ message = "Loading..." }) => {
  return (
    <div style={sharedStyles.emptyState}>
      <div style={sharedStyles.loadingSpinner} />
      <p style={{ marginTop: "1rem", color: "#6B7280" }}>{message}</p>
    </div>
  );
};
