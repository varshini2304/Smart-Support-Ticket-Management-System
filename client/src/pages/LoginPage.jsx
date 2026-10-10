/**
 * LoginPage - SupportHub Redesign
 * Modern two-column layout inspired by SupportHub UI
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

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
    <div style={styles.container}>
      {/* Left Panel - Branding */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          {/* Logo */}
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>
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
            <span style={styles.logoText}>SupportHub</span>
          </div>

          {/* Heading */}
          <h1 style={styles.heading}>
            Smart
            <br />
            <span style={styles.headingAccent}>Support Ticket</span>
            <br />
            Management
          </h1>
          <p style={styles.subheading}>
            Raise, track and resolve issues efficiently in one place.
          </p>

          {/* Feature Highlights */}
          <div style={styles.features}>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>⚡</div>
              <div>
                <div style={styles.featureTitle}>Faster Resolution</div>
                <div style={styles.featureDesc}>
                  Get your issues resolved quickly
                </div>
              </div>
            </div>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>📊</div>
              <div>
                <div style={styles.featureTitle}>Track Progress</div>
                <div style={styles.featureDesc}>Stay updated in real-time</div>
              </div>
            </div>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>👥</div>
              <div>
                <div style={styles.featureTitle}>Better Support</div>
                <div style={styles.featureDesc}>
                  Connect with the right team
                </div>
              </div>
            </div>
          </div>

          {/* Illustration */}
          <div style={styles.illustration}>
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
      <div style={styles.rightPanel}>
        <div style={styles.rightContent}>
          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>Welcome Back</h2>
            <p style={styles.formSubtitle}>
              Sign in to your account to continue
            </p>

            {error && (
              <div style={styles.errorAlert}>
                <span style={styles.errorIcon}>⚠️</span>
                <span style={styles.errorText}>{error}</span>
                <button
                  onClick={() => setError(null)}
                  style={styles.errorClose}
                  aria-label="Close error"
                >
                  ×
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              {/* Email Field */}
              <div style={styles.fieldGroup}>
                <label htmlFor="email" style={styles.label}>
                  Email address
                </label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>
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
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                    style={styles.input}
                    onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div style={styles.fieldGroup}>
                <label htmlFor="password" style={styles.label}>
                  Password
                </label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>
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
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    style={styles.input}
                    onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.showPasswordBtn}
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
              <div style={styles.formOptions}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span style={styles.checkboxText}>Remember me</span>
                </label>
                <a href="#" style={styles.forgotLink}>
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                style={styles.submitButton}
              >
                {loading ? (
                  <>
                    <span style={styles.spinner} />
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
                      style={styles.arrowIcon}
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
            <div style={styles.registerContainer}>
              <span style={styles.registerText}>Don't have an account? </span>
              <a href="/register" style={styles.registerLink}>
                Register now
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#F9FAFB",
  },

  // Left Panel Styles
  leftPanel: {
    flex: "1",
    backgroundColor: "#EFF6FF",
    padding: "3rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },

  leftContent: {
    maxWidth: "500px",
    width: "100%",
    zIndex: 1,
  },

  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "2.5rem",
  },

  logoIcon: {
    display: "flex",
  },

  logoText: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#1F2937",
  },

  heading: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#1F2937",
    lineHeight: "1.2",
    marginBottom: "1rem",
  },

  headingAccent: {
    color: "#2563EB",
  },

  subheading: {
    fontSize: "1.125rem",
    color: "#6B7280",
    marginBottom: "3rem",
    lineHeight: "1.6",
  },

  features: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    marginBottom: "3rem",
  },

  feature: {
    display: "flex",
    alignItems: "flex-start",
    gap: "1rem",
  },

  featureIcon: {
    fontSize: "1.5rem",
    backgroundColor: "white",
    width: "3rem",
    height: "3rem",
    borderRadius: "0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    flexShrink: 0,
  },

  featureTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: "0.25rem",
  },

  featureDesc: {
    fontSize: "0.875rem",
    color: "#6B7280",
  },

  illustration: {
    marginTop: "2rem",
  },

  // Right Panel Styles
  rightPanel: {
    flex: "1",
    backgroundColor: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
  },

  rightContent: {
    width: "100%",
    maxWidth: "420px",
  },

  formContainer: {
    width: "100%",
  },

  formTitle: {
    fontSize: "1.875rem",
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: "0.5rem",
  },

  formSubtitle: {
    fontSize: "0.875rem",
    color: "#6B7280",
    marginBottom: "2rem",
  },

  errorAlert: {
    backgroundColor: "#FEF2F2",
    border: "1px solid #FEE2E2",
    borderRadius: "0.5rem",
    padding: "0.875rem",
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },

  errorIcon: {
    fontSize: "1.125rem",
    flexShrink: 0,
  },

  errorText: {
    flex: 1,
    color: "#DC2626",
    fontSize: "0.875rem",
  },

  errorClose: {
    background: "none",
    border: "none",
    color: "#DC2626",
    fontSize: "1.5rem",
    cursor: "pointer",
    padding: "0",
    lineHeight: "1",
    opacity: "0.7",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },

  label: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
  },

  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  inputIcon: {
    position: "absolute",
    left: "0.875rem",
    color: "#9CA3AF",
    display: "flex",
    pointerEvents: "none",
  },

  input: {
    width: "100%",
    padding: "0.625rem 0.875rem 0.625rem 2.75rem",
    fontSize: "0.875rem",
    border: "1px solid #E5E7EB",
    borderRadius: "0.5rem",
    outline: "none",
    transition: "border-color 0.15s ease",
    backgroundColor: "white",
    color: "#1F2937",
  },

  showPasswordBtn: {
    position: "absolute",
    right: "0.875rem",
    background: "none",
    border: "none",
    color: "#9CA3AF",
    cursor: "pointer",
    padding: "0.25rem",
    display: "flex",
    alignItems: "center",
  },

  formOptions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.875rem",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    cursor: "pointer",
  },

  checkbox: {
    width: "1rem",
    height: "1rem",
    cursor: "pointer",
    accentColor: "#2563EB",
  },

  checkboxText: {
    color: "#374151",
  },

  forgotLink: {
    color: "#2563EB",
    textDecoration: "none",
    fontWeight: "500",
  },

  submitButton: {
    width: "100%",
    padding: "0.75rem 1.5rem",
    backgroundColor: "#2563EB",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    fontSize: "0.9375rem",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    transition: "background-color 0.15s ease",
    marginTop: "0.5rem",
  },

  arrowIcon: {
    marginLeft: "0.25rem",
  },

  spinner: {
    width: "1rem",
    height: "1rem",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },

  registerContainer: {
    marginTop: "1.5rem",
    textAlign: "center",
    fontSize: "0.875rem",
  },

  registerText: {
    color: "#6B7280",
  },

  registerLink: {
    color: "#2563EB",
    fontWeight: "500",
    textDecoration: "none",
  },
};

// Add CSS animation for spinner
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
      .login-container {
        flex-direction: column !important;
      }
      .login-left-panel {
        padding: 2rem !important;
        min-height: auto !important;
      }
      .login-right-panel {
        padding: 2rem 1.5rem !important;
      }
      .login-illustration {
        display: none !important;
      }
      .login-heading {
        font-size: 2rem !important;
      }
    }
  `;
  if (!document.querySelector("#login-page-styles")) {
    styleSheet.id = "login-page-styles";
    document.head.appendChild(styleSheet);
  }
}
