"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Clock,
  Crown,
  Shield,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import axios from "axios"

const StatCard = ({ title, value, icon: Icon, color, change, trend }) => (
  <motion.div whileHover={{ scale: 1.02 }} className="card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {change && (
          <div className="flex items-center mt-2">
            <TrendingUp
              className={`w-4 h-4 mr-1 ${trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-yellow-400"}`}
            />
            <span
              className={`text-sm ${trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-yellow-400"}`}
            >
              {change}
            </span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
)

const RecentOrder = ({ order }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center justify-between p-4 bg-dark-700 rounded-lg"
  >
    <div className="flex-1">
      <p className="font-medium text-white">{order.orderNumber}</p>
      <p className="text-sm text-gray-400">{order.restaurant?.name}</p>
      <p className="text-xs text-gray-500">{order.customerName}</p>
    </div>
    <div className="text-right">
      <p className="font-medium text-white">₹{order.totalAmount}</p>
      <span
        className={`inline-block px-2 py-1 rounded-full text-xs ${
          order.orderStatus === "completed"
            ? "bg-green-500/20 text-green-400"
            : order.orderStatus === "pending"
              ? "bg-yellow-500/20 text-yellow-400"
              : order.orderStatus === "cancelled"
                ? "bg-red-500/20 text-red-400"
                : "bg-blue-500/20 text-blue-400"
        }`}
      >
        {order.orderStatus}
      </span>
    </div>
  </motion.div>
)

const AlertCard = ({ alert }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`p-4 rounded-lg border-l-4 ${
      alert.type === "error"
        ? "bg-red-500/10 border-red-500"
        : alert.type === "warning"
          ? "bg-yellow-500/10 border-yellow-500"
          : "bg-blue-500/10 border-blue-500"
    }`}
  >
    <div className="flex items-start space-x-3">
      {alert.type === "error" ? (
        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
      ) : alert.type === "warning" ? (
        <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
      ) : (
        <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" />
      )}
      <div>
        <p className="text-white font-medium">{alert.title}</p>
        <p className="text-gray-400 text-sm">{alert.message}</p>
        <p className="text-gray-500 text-xs mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
      </div>
    </div>
  </motion.div>
)

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalRestaurants: 0,
    totalOrders: 0,
    totalRevenue: 0,
    premiumUsers: 0,
    blockedUsers: 0,
    todayOrders: 0,
    todayRevenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [systemAlerts, setSystemAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_API}/superadmin/dashboard`)
      setStats(response.data.stats)
      setRecentOrders(response.data.recentOrders)
      setSystemAlerts(response.data.systemAlerts || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Super Admin Dashboard</h1>
        <p className="text-gray-400">Platform overview and system monitoring</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Admins"
          value={stats.totalAdmins}
          icon={Users}
          color="bg-blue-500"
          change="+12% from last month"
          trend="up"
        />
        <StatCard
          title="Total Restaurants"
          value={stats.totalRestaurants}
          icon={Store}
          color="bg-green-500"
          change="+8% from last month"
          trend="up"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          color="bg-purple-500"
          change="+23% from last month"
          trend="up"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-yellow-500"
          change="+15% from last month"
          trend="up"
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Premium Users"
          value={stats.premiumUsers}
          icon={Crown}
          color="bg-yellow-600"
          change="+5% from last month"
          trend="up"
        />
        <StatCard
          title="Blocked Users"
          value={stats.blockedUsers}
          icon={Shield}
          color="bg-red-500"
          change="-2% from last month"
          trend="down"
        />
        <StatCard
          title="Today's Orders"
          value={stats.todayOrders}
          icon={ShoppingBag}
          color="bg-indigo-500"
          change="+18% from yesterday"
          trend="up"
        />
        <StatCard
          title="Today's Revenue"
          value={`₹${stats.todayRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-emerald-500"
          change="+22% from yesterday"
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Orders</h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentOrders.length > 0 ? (
              recentOrders.map((order, index) => <RecentOrder key={order._id} order={order} />)
            ) : (
              <p className="text-gray-400 text-center py-8">No recent orders</p>
            )}
          </div>
        </div>

        {/* System Alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">System Alerts</h2>
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {systemAlerts.length > 0 ? (
              systemAlerts.map((alert, index) => <AlertCard key={index} alert={alert} />)
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                <p className="text-gray-400">All systems operational</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
