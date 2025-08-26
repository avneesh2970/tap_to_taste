"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, DollarSign, ShoppingBag, ChefHat, Users, Calendar } from "lucide-react"
import axios from "axios"

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]

const StatCard = ({ title, value, icon: Icon, color, change }) => (
  <motion.div whileHover={{ scale: 1.02 }} className="card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {change && (
          <div className="flex items-center mt-2">
            <TrendingUp className="w-4 h-4 text-primary-600 mr-1" />
            <span className="text-primary-600 text-sm">{change}</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
)

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalDishes: 0,
    avgOrderValue: 0,
    monthlyData: [],
    topDishes: [],
    orderStatusData: [],
    recentTrends: [],
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30")

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      // Fetch restaurant orders for analytics
      const ordersResponse = await axios.get(`${import.meta.env.VITE_BACKEND_API}/orders/restaurant/my-orders?limit=100`)
      const orders = ordersResponse.data.orders

      // Fetch dishes
      const dishesResponse = await axios.get(`${import.meta.env.VITE_BACKEND_API}/dishes/my-dishes`)
      const dishes = dishesResponse.data.dishes

      // Calculate analytics
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
      const totalOrders = orders.length
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Monthly data (last 6 months)
      const monthlyData = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthOrders = orders.filter((order) => {
          const orderDate = new Date(order.createdAt)
          return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear()
        })
        monthlyData.push({
          month: date.toLocaleDateString("en-US", { month: "short" }),
          revenue: monthOrders.reduce((sum, order) => sum + order.totalAmount, 0),
          orders: monthOrders.length,
        })
      }

      // Top dishes by order count
      const dishOrderCounts = {}
      orders.forEach((order) => {
        order.items?.forEach((item) => {
          const dishName = item.dish?.name || "Unknown"
          dishOrderCounts[dishName] = (dishOrderCounts[dishName] || 0) + item.quantity
        })
      })

      const topDishes = Object.entries(dishOrderCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))

      // Order status distribution
      const statusCounts = {}
      orders.forEach((order) => {
        statusCounts[order.orderStatus] = (statusCounts[order.orderStatus] || 0) + 1
      })

      const orderStatusData = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
      }))

      setAnalyticsData({
        totalRevenue,
        totalOrders,
        totalDishes: dishes.length,
        avgOrderValue,
        monthlyData,
        topDishes,
        orderStatusData,
      })
    } catch (error) {
      console.error("Error fetching analytics:", error)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">Track your restaurant's performance and insights</p>
        </div>
        <div>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="input">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${analyticsData.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-primary-500"
          change="+12% from last month"
        />
        <StatCard
          title="Total Orders"
          value={analyticsData.totalOrders}
          icon={ShoppingBag}
          color="bg-blue-500"
          change="+8% from last month"
        />
        <StatCard
          title="Menu Items"
          value={analyticsData.totalDishes}
          icon={ChefHat}
          color="bg-purple-500"
          change="+2 this week"
        />
        <StatCard
          title="Avg Order Value"
          value={`₹${analyticsData.avgOrderValue.toFixed(2)}`}
          icon={Users}
          color="bg-green-500"
          change="+5% from last month"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card">
          <div className="flex items-center mb-6">
            <TrendingUp className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Monthly Revenue</h2>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ fill: "#22c55e", strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Dishes */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card">
          <div className="flex items-center mb-6">
            <ChefHat className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Top Selling Dishes</h2>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.topDishes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Order Status & Monthly Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="flex items-center mb-6">
            <ShoppingBag className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Order Status Distribution</h2>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center mb-6">
            <Calendar className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Monthly Orders</h2>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="orders" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Analytics
