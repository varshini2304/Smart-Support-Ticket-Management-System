/**
 * ProtectedRoute Component - Redesigned
 * Redirects unauthenticated users to login
 * Redirects non-admin users away from admin pages
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Card } from "./ui/Card";

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  const loadingStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "var(--color-gray-50)",
  };

  if (loading) {
    return (
      <div style={loadingStyles}>
        <Card>
          <div style={{ padding: "var(--spacing-8)", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "var(--spacing-4)" }}>
              ⏳
            </div>
            <p style={{ color: "var(--color-gray-600)" }}>Loading...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
