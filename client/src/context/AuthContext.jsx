/**
 * Authentication Context
 * Manages user authentication state globally
 * Handles login, logout, and user session persistence
 */

import { createContext, useState, useEffect, useCallback } from "react";
import { authAPI, tokenAPI } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Restore user session from stored token on app load
   */
  const restoreSession = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = tokenAPI.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch (err) {
      // Token is invalid or expired
      tokenAPI.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initialize auth session on app mount
   */
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  /**
   * Handle user registration
   */
  const register = useCallback(async (name, email, password) => {
    setError(null);
    try {
      const response = await authAPI.register(name, email, password);
      // Registration successful, but doesn't return token
      // User must login separately
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Handle user login
   */
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await authAPI.login(email, password);
      // Store token
      tokenAPI.setToken(response.token);
      setUser(response.user);
      return response.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Handle user logout
   */
  const logout = useCallback(() => {
    authAPI.logout();
    setUser(null);
    setError(null);
  }, []);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!user;

  /**
   * Check if user is an admin
   */
  const isAdmin = user?.role === "ADMIN";

  /**
   * Refresh current user data
   */
  const refreshUser = useCallback(async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch (err) {
      // Ignore errors
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    refreshUser,
    isAuthenticated,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
