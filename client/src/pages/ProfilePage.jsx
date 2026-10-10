/**
 * ProfilePage - User Profile Management
 * Clean architecture using external CSS from client/src/styles/profile.css
 * Supports both standalone customer layout and shared AdminLayout.
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { authAPI, ticketAPI } from "../services/api";
import { CreateTicketModal } from "../components/CreateTicketModal";
import "../styles/profile.css";

export const ProfilePage = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const outletContext = useOutletContext();
  const isAdminView = location.pathname.startsWith("/admin") || !!outletContext;

  const [activeNav, setActiveNav] = useState("profile");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Profile form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [memberSince, setMemberSince] = useState("");
  const [totalTickets, setTotalTickets] = useState(0);
  const [lastLogin, setLastLogin] = useState("");

  // Form interaction states
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      setName(user.name || "");
      setEmail(user.email || "");
      setRole(user.role || "CUSTOMER");
      setMemberSince(user.createdAt || "");
      setLastLogin(new Date().toISOString());

      const ticketsData = await ticketAPI.getMyTickets(1, 1000);
      setTotalTickets(ticketsData.tickets?.length || 0);
    } catch (err) {
      console.error("Failed to load profile data:", err);
      setError(err.message || "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await authAPI.updateProfile(name);
      await refreshUser();
      await loadProfileData();
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setIsEditing(false);
    setError(null);
    setSuccess(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getInitials = (userName) => {
    if (!userName) return "U";
    return userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleLabel = (userRole) => {
    return userRole === "ADMIN" ? "Administrator" : "Customer";
  };

  // Reusable profile content without duplicate shells
  const profileBody = (
    <div className="profile-content-root">
      {/* Profile Header Banner */}
      <div className="profile-banner">
        <div className="banner-content">
          <div className="banner-text-container">
            <div className="banner-label">YOUR PROFILE</div>
            <h1 className="banner-title">Manage Your Account</h1>
            <p className="banner-subtitle">
              Update your personal information and account settings.
            </p>
          </div>
          <div className="banner-illustration">
            <svg width="160" height="120" viewBox="0 0 160 120" fill="none">
              <circle cx="80" cy="50" r="25" fill="#DBEAFE" />
              <path
                d="M80 35V40M80 60V65M65 50H70M90 50H95"
                stroke="#2563EB"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="80" cy="50" r="8" stroke="#2563EB" strokeWidth="3" />
              <circle cx="120" cy="45" r="12" fill="#FDE68A" />
              <path d="M120 57C115 57 110 60 110 65H130C130 60 125 57 120 57Z" fill="#60A5FA" />
              <ellipse cx="40" cy="75" rx="6" ry="15" fill="#34D399" />
              <ellipse cx="48" cy="78" rx="5" ry="12" fill="#10B981" />
            </svg>
          </div>
        </div>
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <div className="alert success">
          ✓ Profile updated successfully!
        </div>
      )}

      {error && (
        <div className="alert error">
          ⚠️ {error}
        </div>
      )}

      {/* Profile Content Grid */}
      <div className="content-grid" style={{ marginTop: "1.5rem" }}>
        {/* Left Column - Personal Information Card */}
        <div className="left-column">
          <div className="card">
            <div className="card-header">
              <div className="card-header-icon">👤</div>
              <div>
                <h2 className="card-title">Personal Information</h2>
                <p className="card-description">
                  Update your personal details. This information helps us identify you.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner" />
                <p>Loading profile...</p>
              </div>
            ) : (
              <div className="form-group">
                {/* Full Name */}
                <div className="input-group">
                  <label className="label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className="input"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email Address */}
                <div className="input-group">
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="input"
                  />
                  <span className="help-text">Email address cannot be changed</span>
                </div>

                {/* Role */}
                <div className="input-group">
                  <label className="label">Account Role</label>
                  <input
                    type="text"
                    value={getRoleLabel(role)}
                    disabled
                    className="input"
                  />
                </div>

                {/* Form Action Buttons */}
                <div className="form-actions" style={{ marginTop: "0.5rem" }}>
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="primary-button"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <button
                        type="button"
                        onClick={handleSaveChanges}
                        disabled={saving}
                        className="primary-button"
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        className="secondary-button"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Account Statistics & Security */}
        <div className="right-column">
          {/* Account Details Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-icon-small">📊</div>
              <div>
                <h3 className="card-title-small">Account Statistics</h3>
                <p className="card-description-small">Your system activity overview</p>
              </div>
            </div>

            <div className="stats-list">
              <div className="stat-row">
                <span className="stat-label">Member Since</span>
                <span className="stat-value">{formatDate(memberSince)}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Total Tickets</span>
                <span className="stat-value">{totalTickets}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Last Active</span>
                <span className="stat-value">{formatDateTime(lastLogin)}</span>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-icon-small">🔒</div>
              <div>
                <h3 className="card-title-small">Security</h3>
                <p className="card-description-small">Account credentials & authentication</p>
              </div>
            </div>
            <p className="help-text">
              Your account is authenticated securely via JWT. Password change requests can be processed via administrator support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render profile content directly within shared layout (AdminLayout or CustomerLayout)
  return (
    <div className="profile-page-wrapper" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {profileBody}
    </div>
  );
};
