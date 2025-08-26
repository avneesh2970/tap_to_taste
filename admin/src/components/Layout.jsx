"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Store,
  ChefHat,
  ShoppingBag,
  BarChart3,
  LogOut,
  Menu,
  X,
  IndianRupee,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subscription, setSubscription] = useState({
    plan: "free",
    status: "active",
  });
  const { logout, user } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Orders", href: "/orders", icon: ShoppingBag },
    { name: "Dishes", href: "/dishes", icon: ChefHat },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Restaurant", href: "/restaurant", icon: Store },
    { name: "Plans", href: "/plan", icon: IndianRupee },
  ];

  const handleLogout = () => {
    logout();
  };

  const fetchSubscription = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_API}/subscriptions/current`
      );
      setSubscription(response.data.subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black opacity-50" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-green-600">
              Restaurant Admin
            </h1>
          </div>

          <nav className="mt-8 flex-1">
            <div className="px-4 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? "bg-green-50 text-green-700 border-r-2 border-green-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : "-100%",
        }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 lg:hidden shadow-sm"
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-green-600">Restaurant Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-green-50 text-green-700 border-r-2 border-green-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </nav>
      </motion.div>

      <div className="flex-1 flex flex-col overflow-hidden lg:pl-64">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm">
          {/* Sidebar Toggle (Mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center w-full justify-between">
            {/* Left side - Greeting */}
            <div className="text-sm text-gray-700">
              👋 Hello,{" "}
              <span className="font-semibold text-gray-900">
                {user?.name || "Guest"}
              </span>
            </div>

            {/* Right side - Plan Info */}
            <div
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium shadow-md border 
        ${
          subscription.plan === "free"
            ? "bg-gray-50 text-gray-600 border-gray-300"
            : "bg-gradient-to-r from-yellow-600 to-yellow-400 text-white border-yellow-500"
        }
      `}
            >
              {subscription.plan === "free" ? (
                <>
                  <span className="text-gray-500">⚡</span>
                  <span>Free Plan</span>
                </>
              ) : (
                <>
                  <span className="animate-pulse">🌟</span>
                  <span>Premium Plan</span>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
