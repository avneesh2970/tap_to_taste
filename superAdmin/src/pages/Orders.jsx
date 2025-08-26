"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ShoppingBag, Clock, User, Phone } from "lucide-react"
import axios from "axios"

const OrderCard = ({ order }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.01 }}
    className="card"
  >
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="font-bold text-white text-lg">{order.orderNumber}</h3>
        <p className="text-gray-400 text-sm">{order.restaurant?.name}</p>
      </div>
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
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

    <div className="space-y-3">
      <div className="flex items-center text-gray-400 text-sm">
        <User className="w-4 h-4 mr-2" />
        {order.customerName}
      </div>
      <div className="flex items-center text-gray-400 text-sm">
        <Phone className="w-4 h-4 mr-2" />
        {order.customerPhone}
      </div>
      <div className="flex items-center text-gray-400 text-sm">
        <Clock className="w-4 h-4 mr-2" />
        {new Date(order.createdAt).toLocaleString()}
      </div>
    </div>

    <div className="border-t border-dark-600 pt-3 mt-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">{order.items?.length} items</div>
        <div className="flex items-center text-lg font-bold text-white">
          <span className="mr-1">₹</span>
          {order.totalAmount}
        </div>
      </div>

      <div className="mt-2">
        <span
          className={`inline-block px-2 py-1 rounded text-xs ${
            order.paymentStatus === "completed"
              ? "bg-green-500/20 text-green-400"
              : order.paymentStatus === "pending"
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-red-500/20 text-red-400"
          }`}
        >
          Payment: {order.paymentStatus}
        </span>
        <span className="ml-2 text-xs text-gray-400">via {order.paymentMethod}</span>
      </div>
    </div>
  </motion.div>
)

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchOrders()
  }, [currentPage])

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_API}/orders?page=${currentPage}&limit=12`)
      setOrders(response.data.orders)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.restaurant?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
          <h1 className="text-3xl font-bold text-white mb-2">Order Management</h1>
          <p className="text-gray-400">View and track all orders across the platform</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-400">{orders.length}</p>
          <p className="text-sm text-gray-400">Orders This Page</p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <input
          type="text"
          placeholder="Search orders by number, customer, or restaurant..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input w-full"
        />
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          <span className="flex items-center px-4 py-2 text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No orders found</p>
        </div>
      )}
    </div>
  )
}

export default Orders
