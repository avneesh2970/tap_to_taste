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
import { TrendingUp , ShoppingBag, Store } from "lucide-react"
import axios from "axios"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    monthlyRevenue: [],
    topRestaurants: [],
    orderStatusStats: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_API}/superadmin/analytics`)
      setAnalyticsData(response.data)
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
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics & Reports</h1>
        <p className="text-gray-400">Platform-wide insights and performance metrics</p>
      </div>

      {/* Monthly Revenue Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="flex items-center mb-6">
          <TrendingUp className="w-6 h-6 text-primary-400 mr-3" />
          <h2 className="text-xl font-bold text-white">Monthly Revenue Trend</h2>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="_id.month" stroke="#9ca3af" tickFormatter={(value) => `Month ${value}`} />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#f3f4f6" }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Restaurants */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card">
          <div className="flex items-center mb-6">
            <Store className="w-6 h-6 text-green-400 mr-3" />
            <h2 className="text-xl font-bold text-white">Top Restaurants by Revenue</h2>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.topRestaurants.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="totalRevenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Order Status Distribution */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card">
          <div className="flex items-center mb-6">
            <ShoppingBag className="w-6 h-6 text-purple-400 mr-3" />
            <h2 className="text-xl font-bold text-white">Order Status Distribution</h2>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.orderStatusStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.orderStatusStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card text-center">
          <TrendingUp  className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            ₹{analyticsData.monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0).toLocaleString()}
          </h3>
          <p className="text-gray-400">Total Revenue (12 months)</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card text-center"
        >
          <ShoppingBag className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            {analyticsData.monthlyRevenue.reduce((sum, month) => sum + month.orders, 0).toLocaleString()}
          </h3>
          <p className="text-gray-400">Total Orders (12 months)</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card text-center"
        >
          <Store className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">{analyticsData.topRestaurants.length}</h3>
          <p className="text-gray-400">Active Restaurants</p>
        </motion.div>
      </div>
    </div>
  )
}

export default Analytics
