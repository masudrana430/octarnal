import React, { createContext, useContext, useMemo, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  const token = localStorage.getItem("token");
  const isAuthed = Boolean(token && user);

  async function login(email, password) {
    const { data } = await api.post("/api/login", { email, password });
    // expected: { id, email, token }
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify({ id: data.id, email: data.email }));
    setUser({ id: data.id, email: data.email });
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  const value = useMemo(() => ({ user, isAuthed, login, logout }), [user, isAuthed]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}