"use client";
import { createContext, useState, useEffect } from "react";
import { getMeAction, logoutAction } from "../actions/authActions";
const AuthContext = createContext({
  user: null,
  loading: true,
  refreshUser: async () => {
  },
  logout: async () => {
  }
});
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshUser = async () => {
    try {
      setLoading(true);
      const me = await getMeAction();
      setUser(me);
    } catch (e) {
      console.error("Failed to load profile", e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  const logout = async () => {
    try {
      setLoading(true);
      await logoutAction();
      setUser(null);
      window.location.href = "/";
    } catch (e) {
      console.error("Failed to log out", e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    refreshUser();
  }, []);
  return <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>;
}
export {
  AuthContext,
  AuthProvider
};
