/**
 * RegisterPage - SupportHub Redesign
 * Modern two-column layout matching Login page design
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setValidationErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const errors = {};

    if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (formData.password.length < 8) {
      errors.password =
        "Password must be at least 8 characters long and include letters and numbers";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register(formData.name, formData.email, formData.password);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="auth-success">
        <div className="modal-success">
          <div className="modal-success-icon">✓</div>
          <h2 className="modal-success-title">Account Created Successfully!</h2>
          <p className="modal-success-message">Redirecting you to login...</p>
        </div>
      </div>
    );
  }

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
            Join <span className="auth-heading-accent">SupportHub</span> today!
          </h1>
          <p className="auth-subheading">
            Create your account and start managing your support tickets
            efficiently.
          </p>

          {/* Feature Highlights */}
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">🎫</div>
              <div>
                <div className="auth-feature-title">Submit Tickets</div>
                <div className="auth-feature-desc">
                  Report your issues easily
                </div>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">⏱️</div>
              <div>
                <div className="auth-feature-title">Track Status</div>
                <div className="auth-feature-desc">Get real-time updates</div>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">💬</div>
              <div>
                <div className="auth-feature-title">Expert Support</div>
                <div className="auth-feature-desc">
                  Connect with our support team
                </div>
              </div>
            </div>
          </div>

          {/* Illustration */}
          <div className="auth-illustration">
            <svg width="280" height="200" viewBox="0 0 280 200" fill="none">
              {/* User profile card */}
              <rect
                x="40"
                y="50"
                width="200"
                height="120"
                rx="12"
                fill="white"
              />
              <rect
                x="40"
                y="50"
                width="200"
                height="120"
                rx="12"
                stroke="#E5E7EB"
                strokeWidth="2"
              />

              {/* Profile circle */}
              <circle cx="140" cy="90" r="20" fill="#DBEAFE" />
              <circle
                cx="140"
                cy="90"
                r="20"
                stroke="#3B82F6"
                strokeWidth="2"
              />

              {/* User icon */}
              <circle cx="140" cy="85" r="6" fill="#3B82F6" />
              <path
                d="M128 100C128 95 132 92 140 92C148 92 152 95 152 100"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Form lines */}
              <rect
                x="80"
                y="120"
                width="120"
                height="8"
                rx="4"
                fill="#F3F4F6"
              />
              <rect
                x="80"
                y="135"
                width="100"
                height="8"
                rx="4"
                fill="#F3F4F6"
              />

              {/* Action button */}
              <rect
                x="90"
                y="150"
                width="100"
                height="12"
                rx="6"
                fill="#3B82F6"
              />

              {/* Decorative plus icon */}
              <circle cx="230" cy="70" r="25" fill="#3B82F6" opacity="0.8" />
              <path
                d="M230 60V80M220 70H240"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Decorative elements */}
              <circle cx="25" cy="40" r="20" fill="#DBEAFE" opacity="0.5" />
              <circle cx="255" cy="160" r="25" fill="#93C5FD" opacity="0.3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="auth-panel auth-panel--right">
        <div className="auth-right-content">
          <div className="auth-content">
            <div className="auth-form-header">
              <h2 className="auth-form-title">Create Account</h2>
              <p className="auth-form-subtitle">
                Join to get started with support services
              </p>
            </div>

            {error && (
              <div className="auth-error">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Full Name Field */}
              <div className="auth-input-wrapper">
                <label className="auth-input-label">Full Name</label>
                <div className="auth-input-field">
                  <button
                    type="button"
                    className="auth-input-icon"
                    disabled
                    aria-hidden="true"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle
                        cx="8"
                        cy="5"
                        r="2.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M3 13C3 10.7909 5.23858 9 8 9C10.7614 9 13 10.7909 13 13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    autoComplete="name"
                    className={`auth-input ${
                      validationErrors.name ? "auth-input--error" : ""
                    }`}
                  />
                </div>
                {validationErrors.name && (
                  <span className="form-help-text form-help-text--error">
                    {validationErrors.name}
                  </span>
                )}
              </div>

              {/* Email Field */}
              <div className="auth-input-wrapper">
                <label className="auth-input-label">Email address</label>
                <div className="auth-input-field">
                  <button
                    type="button"
                    className="auth-input-icon"
                    disabled
                    aria-hidden="true"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M2 4L8 8L14 4M2 4V12H14V4M2 4H14"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                    autoComplete="email"
                    className={`auth-input ${
                      validationErrors.email ? "auth-input--error" : ""
                    }`}
                  />
                </div>
                {validationErrors.email && (
                  <span className="form-help-text form-help-text--error">
                    {validationErrors.email}
                  </span>
                )}
              </div>

              {/* Password Field */}
              <div className="auth-input-wrapper">
                <label className="auth-input-label">Password</label>
                <div className="auth-input-field">
                  <button
                    type="button"
                    className="auth-input-icon"
                    disabled
                    aria-hidden="true"
                  >
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
                  </button>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                    autoComplete="new-password"
                    className={`auth-input ${
                      validationErrors.password ? "auth-input--error" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-input-icon"
                    style={{ position: "relative", right: "-8px" }}
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
                {validationErrors.password && (
                  <span className="form-help-text form-help-text--error">
                    {validationErrors.password}
                  </span>
                )}
                <span className="form-help-text">
                  Password must be at least 8 characters long and include
                  letters and numbers.
                </span>
              </div>

              {/* Confirm Password Field */}
              <div className="auth-input-wrapper">
                <label className="auth-input-label">Confirm Password</label>
                <div className="auth-input-field">
                  <button
                    type="button"
                    className="auth-input-icon"
                    disabled
                    aria-hidden="true"
                  >
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
                  </button>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                    autoComplete="new-password"
                    className={`auth-input ${
                      validationErrors.confirmPassword
                        ? "auth-input--error"
                        : ""
                    }`}
                  />
                </div>
                {validationErrors.confirmPassword && (
                  <span className="form-help-text form-help-text--error">
                    {validationErrors.confirmPassword}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn--primary btn--lg btn--block"
              >
                {loading ? (
                  <>
                    <div
                      className="loading-spinner"
                      style={{ width: "16px", height: "16px" }}
                    />
                    Creating account...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle
                        cx="10"
                        cy="10"
                        r="7"
                        stroke="white"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M10 7V13M7 10H13"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    Create Account
                  </>
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="auth-link-group">
              <p className="auth-link-text">
                Already have an account?{" "}
                <a href="/login" className="auth-link">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
