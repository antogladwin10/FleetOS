import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking session
  const [error, setError] = useState(null);

  // ── Fetch current user on mount ──────────────────────────────────────────
  const fetchMe = useCallback(async () => {
    try {
      const res = await authService.getMe();
      setUser(res.data.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = async (credentials) => {
    setError(null);
    const res = await authService.login(credentials);
    setUser(res.data.data.user);
    return res.data.data.user;
  };

  // ── Register ─────────────────────────────────────────────────────────────
  const register = async (data) => {
    setError(null);
    const res = await authService.register(data);
    setUser(res.data.data.user);
    return res.data.data.user;
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    setUser(null);
  };

  // ── Derived state ─────────────────────────────────────────────────────────
  const isAuthenticated = !!user;
  const isSuperAdmin = user?.role === 'super_admin';
  const isOrgAdmin = user?.role === 'org_admin';
  const isFleetManager = user?.role === 'fleet_manager';
  const isDriver = user?.role === 'driver';
  const organizationId = user?.organizationId;

  const hasRole = (...roles) => roles.includes(user?.role);

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    isSuperAdmin,
    isOrgAdmin,
    isFleetManager,
    isDriver,
    organizationId,
    hasRole,
    login,
    register,
    logout,
    refetchUser: fetchMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
