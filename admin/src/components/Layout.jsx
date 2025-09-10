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
  ShieldCheck,
  Receipt,
} from "lucide-react";
import { Link, useLocation, Outlet } from "react-router-dom"; // ✅ import Outlet
import { useAuth } from "../hooks/useAuth";
import axios from "axios";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subscription, setSubscription] = useState({
    plan: "free",
    status: "active",
  });
  const [userPermissions, setUserPermissions] = useState([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);

  const { logout, user } = useAuth();
  const location = useLocation();

  const allNavigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Orders", href: "/orders", icon: ShoppingBag },
    { name: "Dishes", href: "/dishes", icon: ChefHat },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Restaurant", href: "/restaurant", icon: Store },
    { name: "Plans", href: "/plan", icon: IndianRupee },
    { name: "Access Control", href: "/access", icon: ShieldCheck },
    { name: "Billing", href: "/billing", icon: Receipt },
  ];

  const getFilteredNavigation = () => {
    if (user?.role === "admin" || user?.role === "superadmin") {
      return allNavigation;
    }

    if (user?.role === "staff") {
      return allNavigation.filter((navItem) => {
        if (navItem.name === "Access Control") return false;
        if (navItem.name === "Plans") return false;

        const permission = userPermissions.find(
          (p) => p.tabName === navItem.name
        );
        return permission?.hasAccess === true;
      });
    }

    return allNavigation;
  };

  const navigation = getFilteredNavigation();

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

  const fetchUserPermissions = async () => {
    try {
      setPermissionsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_API}/user-access/my-permissions`
      );
      setUserPermissions(response.data.permissions || []);
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      setUserPermissions([]);
    } finally {
      setPermissionsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
    if (user) {
      fetchUserPermissions();
    }
  }, [user]);

  const SidebarContent = ({ isMobile = false }) => (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-green-600">Restaurant Admin</h1>
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6"
        style={{
          maxHeight: "calc(100vh - 64px - 140px)",
          minHeight: "300px",
        }}
      >
        {permissionsLoading && user?.role === "staff" ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">Loading permissions...</div>
          </div>
        ) : (
          <div className="space-y-1">
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <motion.div
                  key={item.name}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                >
                  <Link
                    to={item.href}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-green-50 to-green-100 text-green-700 shadow-sm border-l-4 border-green-500"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                    }`}
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`w-5 h-5 mr-3 transition-colors ${
                        isActive
                          ? "text-green-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId={`activeIndicator-${
                          isMobile ? "mobile" : "desktop"
                        }`}
                        className="ml-auto w-2 h-2 bg-green-500 rounded-full"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* User Info & Logout */}
      <div className="border-t border-gray-200 bg-gray-50 p-4">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-3"
        >
          <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase() || "G"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || "Guest User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "guest@example.com"}
                </p>
                {user?.role && (
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${
                      user.role === "admin"
                        ? "bg-blue-100 text-blue-800"
                        : user.role === "staff"
                        ? "bg-green-100 text-green-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.button
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-white hover:text-red-600 hover:shadow-sm transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 mr-3 group-hover:text-red-600" />
          <span>Logout</span>
        </motion.button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black bg-opacity-60" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30">
        <div className="flex flex-col h-full border-r border-gray-200 shadow-lg bg-white">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden shadow-2xl"
      >
        <SidebarContent isMobile={true} />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:pl-64">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm sticky top-0 z-20">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Greeting + Plan */}
          <motion.div className="flex items-center w-full justify-between">
            <div className="text-sm text-gray-700 hidden sm:block">
              <span className="text-lg mr-2">👋</span>
              Hello,{" "}
              <span className="font-semibold text-gray-900">
                {user?.name || "Guest"}
              </span>
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium shadow-md border
                ${
                  subscription.plan === "free"
                    ? "bg-gray-50 text-gray-700 border-gray-300"
                    : "bg-gradient-to-r from-yellow-500 to-yellow-400 text-white border-yellow-400"
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
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  >
                    🌟
                  </motion.span>
                  <span>Premium Plan</span>
                </>
              )}
            </motion.div>
          </motion.div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Outlet /> {/* ✅ instead of {children} */}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
