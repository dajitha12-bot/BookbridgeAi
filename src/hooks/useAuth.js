"use client";
import { useContext } from "react";
import { AuthContext } from "../components/AuthProvider";
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
export {
  useAuth
};
