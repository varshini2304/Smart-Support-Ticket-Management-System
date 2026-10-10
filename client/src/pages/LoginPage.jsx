/**
 * LoginPage - SupportHub Redesign
 * Modern two-column layout inspired by SupportHub UI
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/auth.css";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password);
      // Navigate based on role
      if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left Panel - Branding */}
      <div className="auth-panel auth-panel--left">
        <div className="auth-left-content">
          {/* Logo */}
          <div className="auth-logo-container">
            <div className="auth-logo-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="8" fill="#2563EB" />
                <path
                  d="M20 10L12 16V26L20 32L28 26V16L20 10Z"
                  fill="white"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <circle cx="20" cy="20" r="3" fill="#2563EB" />
              </svg>
            </div>
            <span className="auth-logo-text">SupportHub</span>
          </div>

          {/* Heading */}
          <h1 className="auth-heading">
            Smart
            <br />
            <span className="auth-heading-accent">Support Ticket</span>
            <br />
            Management
          </h1>
          <p className="auth-subheading">
            Raise, track and resolve issues efficiently in one place.
          </p>

          {/* Feature Highlights */}
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">⚡</div>
              <div>
                <div className="auth-feature-title">Faster Resolution</div>
                <div className="auth-feature-desc">
                  Get your issues resolved quickly
                </div>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">📊</div>
              <div>
                <div className="auth-feature-title">Track Progress</div>
                <div className="auth-feature-desc">
                  Stay updated in real-time
                </div>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">👥</div>
              <div>
                <div className="auth-feature-title">Better Support</div>
                <div className="auth-feature-desc">
                  Connect with the right team
                </div>
              </div>
            </div>
          </div>

          {/* Illustration */}
          <div className="auth-illustration">
            <svg width="280" height="200" viewBox="0 0 280 200" fill="none">
              {/* Ticket card */}
              <rect
                x="40"
                y="40"
                width="200"
                height="140"
                rx="12"
                fill="white"
              />
              <rect
                x="40"
                y="40"
                width="200"
                height="140"
                rx="12"
                stroke="#E5E7EB"
                strokeWidth="2"
              />

              {/* Header */}
              <circle cx="60" cy="60" r="6" fill="#3B82F6" />
              <rect
                x="75"
                y="55"
                width="80"
                height="10"
                rx="5"
                fill="#DBEAFE"
              />

              {/* Lines */}
              <rect
                x="60"
                y="85"
                width="160"
                height="8"
                rx="4"
                fill="#F3F4F6"
              />
              <rect
                x="60"
                y="105"
                width="140"
                height="8"
                rx="4"
                fill="#F3F4F6"
              />
              <rect
                x="60"
                y="125"
                width="120"
                height="8"
                rx="4"
                fill="#F3F4F6"
              />

              {/* Status badge */}
              <rect
                x="60"
                y="150"
                width="60"
                height="20"
                rx="10"
                fill="#DBEAFE"
              />

              {/* Decorative elements */}
              <circle cx="20" cy="30" r="25" fill="#DBEAFE" opacity="0.5" />
              <circle cx="260" cy="170" r="30" fill="#93C5FD" opacity="0.3" />

              {/* Plant decoration */}
              <ellipse
                cx="220"
                cy="165"
                rx="8"
                ry="15"
                fill="#34D399"
                opacity="0.6"
              />
              <ellipse
                cx="230"
                cy="170"
                rx="6"
                ry="12"
                fill="#10B981"
                opacity="0.6"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="auth-panel auth-panel--right">
        <div className="auth-right-content">
          <div className="auth-content">
            <div className="auth-form-header">
              <h2 className="auth-form-title">Welcome Back</h2>
              <p className="auth-form-subtitle">
                Sign in to your account to continue
              </p>
            </div>

            {error && (
              <div className="auth-error">
                <span>⚠️</span>
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="auth-close-btn"
                  aria-label="Close error"
                >
                  ×
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Email Field */}
              <div className="auth-input-wrapper">
                <label htmlFor="email" className="auth-input-label">
                  Email address
                </label>
                <div className="auth-input-field">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                    className="auth-input"
                  />
                  <span className="auth-input-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M2 4L8 8L14 4M2 4V12H14V4M2 4H14"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Password Field */}
              <div className="auth-input-wrapper">
                <label htmlFor="password" className="auth-input-label">
                  Password
                </label>
                <div className="auth-input-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="auth-input"
                  />
                  <span className="auth-input-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect
                        x="3"
                        y="7"
                        width="10"
                        height="7"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M5 7V5C5 3.34315 6.34315 2 8 2C9.65685 2 11 3.34315 11 5V7"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-show-password-btn"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M3 3L21 21M10.584 10.587C10.2087 10.9624 9.99778 11.4707 9.99756 12.0014C9.99734 12.5321 10.2078 13.0406 10.5829 13.4163C10.958 13.7919 11.4663 14.0028 11.997 14.003C12.5277 14.0032 13.0362 13.7928 13.4118 13.4177M10.584 10.587L13.4118 13.4177M10.584 10.587L7.36396 7.36396M13.4118 13.4177L16.636 16.636M7.36396 7.36396C5.49598 8.67596 3.99896 10.558 2.99896 12.75C4.49996 16.558 7.97396 19.25 11.997 19.25C13.687 19.25 15.264 18.778 16.636 17.964M7.36396 7.36396L16.636 16.636M16.636 16.636C18.504 15.324 20.001 13.442 21.001 11.25C19.5 7.442 16.026 4.75 12.003 4.75C10.313 4.75 8.73596 5.222 7.36396 6.036"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="auth-checkbox-group">
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="auth-checkbox"
                  />
                  <span>Remember me</span>
                </label>
                <a href="#" className="auth-link">
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button */}
              <button type="submit" disabled={loading} className="auth-button">
                {loading ? (
                  <>
                    <span className="auth-button-spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      style={{ marginLeft: "8px", display: "inline" }}
                    >
                      <path
                        d="M3 8H13M13 8L9 4M13 8L9 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="auth-link-group">
              <span className="auth-link-text">Don't have an account? </span>
              <a href="/register" className="auth-link">
                Register now
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
