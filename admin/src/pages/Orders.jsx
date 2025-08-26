"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ShoppingBag, Clock, User, Phone, MapPin, CheckCircle, Search, Filter, X, IndianRupee } from "lucide-react"
import axios from "axios"
import useSocket from "../hooks/useSocket"
import { toast } from "react-hot-toast"

const OrderCard = ({ order, onUpdateStatus, onUpdatePaymentStatus, onCancelOrder }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500 text-white"
      case "accepted":
        return "bg-blue-500 text-white"
      case "preparing":
        return "bg-purple-500 text-white"
      case "ready":
        return "bg-green-500 text-white"
      case "completed":
        return "bg-green-600 text-white"
      case "cancelled":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case "pending":
        return "accepted"
      case "accepted":
        return "preparing"
      case "preparing":
        return "ready"
      case "ready":
        return "completed"
      default:
        return null
    }
  }

  const nextStatus = getNextStatus(order.orderStatus)

  return (
<motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="card"
    >
      {/* Header - Stack on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-lg truncate">{order.orderNumber}</h3>
          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium self-start ${getStatusColor(order.orderStatus)}`}>
          {order.orderStatus}
        </span>
      </div>

      {/* Customer Info */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center text-gray-600 text-sm">
          <User className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{order.customerName}</span>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{order.customerPhone}</span>
        </div>
        {order.tableNumber && (
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Table {order.tableNumber}</span>
          </div>
        )}
        <div className="flex items-center text-gray-600 text-sm">
          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>Est. {order.estimatedTime} minutes</span>
        </div>
      </div>

      {/* Order Items */}
      <div className="border-t border-gray-200 pt-3 mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Items ({order.items?.length})</h4>
        <div className="space-y-2">
          {order.items?.slice(0, 3).map((item, index) => (
            <div key={index} className="flex justify-between text-sm gap-2">
              <span className="text-gray-600 flex-1 min-w-0 truncate">
                {item.quantity}x {item.dish?.name}
              </span>
              <span className="text-gray-900 font-medium flex-shrink-0">₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          {order.items?.length > 3 && <p className="text-xs text-gray-500">+{order.items.length - 3} more items</p>}
        </div>
      </div>

      {/* Special Instructions */}
      {order.specialInstructions && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-800 break-words">
            <strong>Special Instructions:</strong> {order.specialInstructions}
          </p>
        </div>
      )}

      {/* Total and Actions - Responsive layout */}
      <div className="pt-3 border-t border-gray-200 space-y-3">
        {/* Total Amount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-lg font-bold text-gray-900">
            ₹{order.totalAmount}
          </div>
        </div>

        {/* Action Buttons - Stack on mobile, row on larger screens */}
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          {order.paymentMethod === "cash" && order.paymentStatus === "pending" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onUpdatePaymentStatus(order._id, "completed")}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center w-full sm:w-auto"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Mark Paid
            </motion.button>
          )}

          {["pending", "accepted"].includes(order.orderStatus) && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCancelOrder(order._id)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center w-full sm:w-auto"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </motion.button>
          )}

          {nextStatus && order.orderStatus !== "completed" && order.orderStatus !== "cancelled" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onUpdateStatus(order._id, nextStatus)}
              className="btn-primary text-sm flex items-center justify-center w-full sm:w-auto px-3 py-2"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Mark as {nextStatus}
            </motion.button>
          )}
        </div>
      </div>

      {/* Payment Status - Full width on mobile */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
        <span className="text-gray-500">Payment: {order.paymentMethod}</span>
        <span
          className={`px-2 py-1 rounded-full font-medium text-center sm:text-left ${
            order.paymentStatus === "completed"
              ? "bg-green-100 text-green-800"
              : order.paymentStatus === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {order.paymentStatus}
        </span>
      </div>
    </motion.div>
  )
}

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)

  const { on, off } = useSocket()

  useEffect(() => {
    fetchOrders()
  }, [currentPage, statusFilter, searchTerm])

  useEffect(() => {
    const handleNewOrder = (newOrder) => {
      setOrders((prevOrders) => {
        // Check if order already exists to prevent duplicates
        const exists = prevOrders.some((order) => order._id === newOrder._id)
        if (exists) return prevOrders

        toast.success(`New order received: ${newOrder.orderNumber}`)
        return [newOrder, ...prevOrders]
      })
      setTotalOrders((prev) => prev + 1)
    }

    const handleOrderStatusUpdate = (updatedOrder) => {
      setOrders((prevOrders) => prevOrders.map((order) => (order._id === updatedOrder._id ? updatedOrder : order)))
    }

    on("new-order", handleNewOrder)
    on("order-status-updated", handleOrderStatusUpdate)

    return () => {
      off("new-order", handleNewOrder)
      off("order-status-updated", handleOrderStatusUpdate)
    }
  }, [on, off])

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
      })

      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim())
      }

      const response = await axios.get(`${import.meta.env.VITE_BACKEND_API}/orders/restaurant/my-orders?${params}`)
      setOrders(response.data.orders)
      setTotalPages(response.data.totalPages)
      setTotalOrders(response.data.totalOrders || response.data.orders.length)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_API}/orders/${orderId}/status`, {
        status: newStatus,
      })

      setOrders(orders.map((order) => (order._id === orderId ? { ...order, orderStatus: newStatus } : order)))
      toast.success(`Order status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Failed to update order status")
    }
  }

  const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_API}/orders/${orderId}/payment-status`, {
        paymentStatus: newPaymentStatus,
      })

      setOrders(orders.map((order) => (order._id === orderId ? { ...order, paymentStatus: newPaymentStatus } : order)))
      toast.success("Payment status updated")
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast.error("Failed to update payment status")
    }
  }

  const handleCancelOrder = async (orderId) => {
    if (!confirm("Are you sure you want to cancel this order?")) return

    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_API}/orders/${orderId}/cancel`)
      setOrders(orders.map((order) => (order._id === orderId ? { ...order, orderStatus: "cancelled" } : order)))
      toast.success("Order cancelled successfully")
    } catch (error) {
      console.error("Error cancelling order:", error)
      toast.error("Failed to cancel order")
    }
  }

  const statusOptions = [
    { value: "all", label: "All Orders", color: "bg-gray-600" },
    { value: "pending", label: "Pending", color: "bg-yellow-500" },
    { value: "accepted", label: "Accepted", color: "bg-blue-500" },
    { value: "preparing", label: "Preparing", color: "bg-purple-500" },
    { value: "ready", label: "Ready", color: "bg-green-500" },
    { value: "completed", label: "Completed", color: "bg-green-600" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-500" },
  ]

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders</h1>
          <p className="text-gray-600">Manage incoming orders and track their status</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-600">{totalOrders}</p>
          <p className="text-sm text-gray-500">Total Orders</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number, customer name, or phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="input pl-10 w-full"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">Filter:</span>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setStatusFilter(option.value)
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white ${
                statusFilter === option.value ? option.color + " shadow-md" : "bg-gray-300 hover:bg-gray-400"
              }`}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            onUpdateStatus={handleUpdateStatus}
            onUpdatePaymentStatus={handleUpdatePaymentStatus}
            onCancelOrder={handleCancelOrder}
          />
        ))}
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * 12 + 1} to {Math.min(currentPage * 12, totalOrders)} of {totalOrders} orders
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === pageNum
                        ? "bg-primary-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              {totalPages > 5 && (
                <>
                  <span className="px-2 text-gray-500">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === totalPages
                        ? "bg-primary-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {statusFilter === "all" ? "No orders yet" : `No ${statusFilter} orders`}
          </p>
        </div>
      )}
    </div>
  )
}

export default Orders
