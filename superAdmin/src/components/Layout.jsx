"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingBag,
  BarChart3,
  LogOut,
  Menu,
  X,
  Megaphone,
  Inbox
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Admins", href: "/admins", icon: Users },
    { name: "Restaurants", href: "/restaurants", icon: Store },
    { name: "Orders", href: "/orders", icon: ShoppingBag },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Ads", href: "/ads", icon: Megaphone },
    { name: "Submissions", href: "/submissions", icon: Inbox }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-slate-900">
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
        <div className="flex flex-col flex-grow bg-slate-800 border-r border-slate-700">
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
            <h1 className="text-xl font-bold text-blue-400">SuperAdmin</h1>
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
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-slate-700 hover:text-white transition-colors duration-200"
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
        className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 lg:hidden"
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-blue-400">SuperAdmin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-white"
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
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-slate-700 hover:text-white"
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
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-slate-700 hover:text-white transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </nav>
      </motion.div>

      <div className="flex-1 flex flex-col overflow-hidden lg:pl-64">
        {/* Top bar */}
        <header className="bg-slate-800 border-b border-slate-700 h-16 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              Welcome back, Superadmin
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
