"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// 🌐 Global Axios Config for Cookies
axios.defaults.withCredentials = true;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://keestor.onrender.com";
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserStatus = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/auth/me`);
            if (res.data) {
                setUser({ 
                    username: res.data.username, 
                    role: res.data.role, 
                    email: res.data.email 
                });
            }
        } catch (err) {
            console.log("No active session found.");
            // Silent fail is okay, user just stays null
        } finally {
            setLoading(false);
        }
    };
    checkUserStatus();
  }, []);

  const login = (token, username, role, email) => {
    // 💡 No more manual token storage! Cookies are managed by the server.
    setUser({ username, role, email });
    if (role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  const logout = async () => {
    try {
        await axios.post(`${API_BASE_URL}/api/auth/logout`);
    } catch (e) {
        console.error("Logout request failed:", e.message);
    }
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
