"use client";

import { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState([]);

  const API_URL = import.meta.env.VITE_BACKEND_API;

  // 🔎 helper: fetch permissions for staff
  const fetchUserPermissions = async () => {
    try {
      const response = await axios.get(`${API_URL}/user-access/my-permissions`);
      setUserPermissions(response.data.permissions || []);
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      setUserPermissions([]);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const staffToken = localStorage.getItem("staffToken");

        if (!token && !staffToken) {
          console.log("No token found, setting loading to false");
          setLoading(false);
          return;
        }

        // Set axios header before making the request
        axios.defaults.headers.common["Authorization"] = `Bearer ${
          token ? token : staffToken
        }`;

        // Verify token with backend
        const response = await axios.get(`${API_URL}/auth/me`);

        setIsAuthenticated(true);
        setUser(response.data.user);

        // Fetch permissions if staff
        if (response.data.user?.role === "staff") {
          await fetchUserPermissions();
        }

        if (
          localStorage.getItem("admin_token") &&
          !localStorage.getItem("token")
        ) {
          localStorage.setItem("token", token);
          localStorage.removeItem("admin_token");
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        // Token is invalid, remove both possible token keys
        localStorage.removeItem("admin_token");
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      // const { token, user } = response.data;
      const user = response.data.user;
      const token = response.data?.token;
      const staffToken = response.data?.staffToken;

      if (token) {
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setIsAuthenticated(true);
        setUser(user);
      } else if (staffToken) {
        localStorage.setItem("staffToken", staffToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${staffToken}`;

        setIsAuthenticated(true);
        setUser(user);
      }
      // Fetch permissions if staff
      if (user?.role === "staff") {
        await fetchUserPermissions();
      }

      return { success: true };
    } catch (error) {
      const errorData = error.response?.data;

      // Handle staff password setup requirement
      if (errorData?.requiresPasswordSetup) {
        return {
          success: false,
          requiresPasswordSetup: true,
          email: errorData.email,
          message: errorData.message,
        };
      }

      return {
        success: false,
        message: errorData?.message || "Login failed",
      };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        name,
        email,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setIsAuthenticated(true);
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Signup failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("token");
    localStorage.removeItem("staffToken");
    delete axios.defaults.headers.common["Authorization"];
    setIsAuthenticated(false);
    setUser(null);
    setUserPermissions([]);
  };

  const setupStaffPassword = async (email, password, name) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/setup-staff-password`,
        {
          email,
          password,
          name,
        }
      );

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setIsAuthenticated(true);
      setUser(user);
      if (user?.role === "staff") {
        await fetchUserPermissions();
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to set password",
      };
    }
  };

  const value = {
    isAuthenticated,
    user,
    userPermissions,
    login,
    signup,
    logout,
    loading,
    setupStaffPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
