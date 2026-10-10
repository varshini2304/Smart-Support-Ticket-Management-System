/**
 * App.jsx - Main Application Router
 * Sets up routing for all pages with proper role-based protection
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./layouts/AdminLayout";
import { CustomerLayout } from "./layouts/CustomerLayout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { CustomerDashboard } from "./pages/CustomerDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AllTicketsPage } from "./pages/AllTicketsPage";
import { AssignedTicketsPage } from "./pages/AssignedTicketsPage";
import { UsersPage } from "./pages/UsersPage";
import { ReportsPage } from "./pages/ReportsPage";
import { CreateTicketPage } from "./pages/CreateTicketPage";
import { MyTicketsPage } from "./pages/MyTicketsPage";
import { ProfilePage } from "./pages/ProfilePage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer protected routes sharing single CustomerLayout architecture */}
          <Route
            element={
              <ProtectedRoute>
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/tickets" element={<MyTicketsPage />} />
            <Route path="/tickets/create" element={<CreateTicketPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Admin protected routes sharing single AdminLayout architecture */}
          <Route
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/tickets" element={<AllTicketsPage />} />
            <Route path="/admin/assigned-tickets" element={<AssignedTicketsPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
            <Route path="/admin/profile" element={<ProfilePage />} />
          </Route>

          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
