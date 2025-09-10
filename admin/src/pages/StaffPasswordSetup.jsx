"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, CheckCircle, User } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const StaffPasswordSetup = () => {
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [userExists, setUserExists] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
      checkUserSetupStatus(emailParam);
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate]);

  const checkUserSetupStatus = async (email) => {
    try {
      setCheckingUser(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_API
        }/auth/check-staff-setup/${encodeURIComponent(email)}`
      );

      if (response.data.needsPasswordSetup) {
        setUserExists(true);
        setFormData((prev) => ({
          ...prev,
          name: response.data.name || email.split("@")[0],
        }));
      } else {
        // User already has password, redirect to login
        navigate("/login", {
          state: {
            message:
              "Password already set. Please login with your credentials.",
            email: email,
          },
        });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setError(
          "Staff invitation not found. Please contact your administrator."
        );
      } else {
        setError("Unable to verify invitation. Please try again.");
      }
    } finally {
      setCheckingUser(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_API}/auth/setup-staff-password`,
        {
          email: email,
          password: formData.password,
          name: formData.name.trim(),
        }
      );

      if (response.data.staffToken) {
        // Store token and user data
        localStorage.setItem("staffToken", response.data.staffToken);
        localStorage.setItem("staffUser", JSON.stringify(response.data.staffUser));

        // Set axios default header
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.staffToken}`;

        // Redirect to dashboard
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Password setup error:", error);
      setError(
        error.response?.data?.message ||
          "Failed to set password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (!userExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100">
        <div className="max-w-md w-full mx-4 text-center">
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="text-red-600 mb-4">
              <CheckCircle className="w-16 h-16 mx-auto" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Invalid Invitation
            </h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full mx-4"
      >
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4"
            >
              <CheckCircle className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Set Up Your Password
            </h1>
            <p className="text-gray-600">
              Welcome to the team! Please create your password to get started.
            </p>
            {email && (
              <p className="text-sm text-green-600 mt-2 font-medium">{email}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Create Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Setting up..." : "Set Password & Continue"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default StaffPasswordSetup;
