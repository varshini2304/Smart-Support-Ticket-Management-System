/**
 * ErrorState Component
 * Reusable error display with retry action
 */

import { sharedStyles } from "../../styles/sharedStyles";

export const ErrorState = ({
  title = "Something went wrong",
  message = "An error occurred while loading data",
  onRetry,
}) => {
  return (
    <div style={sharedStyles.errorState}>
      <div style={sharedStyles.errorIcon}>⚠️</div>
      <h3 style={sharedStyles.errorTitle}>{title}</h3>
      <p style={sharedStyles.errorText}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} style={sharedStyles.retryButton}>
          Try Again
        </button>
      )}
    </div>
  );
};
