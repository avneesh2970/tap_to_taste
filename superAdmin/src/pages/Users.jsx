"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, Search, Filter, MoreVertical, Shield, Ban, CheckCircle, Crown, Calendar, Mail } from "lucide-react"
import axios from "axios"
import { toast } from "react-hot-toast"

const UserCard = ({ user, onUpdateUser, onToggleBlock }) => {
  const [showActions, setShowActions] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="card relative"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              user.role === "superadmin" ? "bg-yellow-500" : "bg-blue-500"
            }`}
          >
            {user.role === "superadmin" ? (
              <Crown className="w-6 h-6 text-white" />
            ) : (
              <Shield className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{user.name}</h3>
            <p className="text-gray-400 text-sm capitalize">{user.role}</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-10 bg-dark-700 border border-dark-600 rounded-lg shadow-lg z-10 min-w-48">
              <button
                onClick={() => {
                  onToggleBlock(user._id, !user.isBlocked)
                  setShowActions(false)
                }}
                className={`w-full px-4 py-2 text-left hover:bg-dark-600 flex items-center space-x-2 ${
                  user.isBlocked ? "text-green-400" : "text-red-400"
                }`}
              >
                {user.isBlocked ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                <span>{user.isBlocked ? "Unblock User" : "Block User"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-gray-300 text-sm">
          <Mail className="w-4 h-4 mr-2" />
          {user.email}
        </div>
        <div className="flex items-center text-gray-300 text-sm">
          <Calendar className="w-4 h-4 mr-2" />
          Joined {new Date(user.createdAt).toLocaleDateString()}
        </div>
        {user.restaurant && (
          <div className="flex items-center text-gray-300 text-sm">
            <Shield className="w-4 h-4 mr-2" />
            Restaurant: {user.restaurant.name}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            user.isBlocked
              ? "bg-red-500/20 text-red-400"
              : user.role === "superadmin"
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-green-500/20 text-green-400"
          }`}
        >
          {user.isBlocked ? "Blocked" : user.role === "superadmin" ? "Super Admin" : "Active"}
        </span>

        {user.subscription && (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              user.subscription.plan === "premium" ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-500/20 text-gray-400"
            }`}
          >
            {user.subscription.plan}
          </span>
        )}
      </div>
    </motion.div>
  )
}

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm, roleFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
      })

      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim())
      }
      if (roleFilter !== "all") {
        params.append("role", roleFilter)
      }
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      const response = await axios.get(`${import.meta.env.VITE_BACKEND_API}/superadmin/users?${params}`)
      setUsers(response.data.users)
      setTotalPages(response.data.totalPages)
      setTotalUsers(response.data.totalUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBlock = async (userId, shouldBlock) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_API}/superadmin/users/${userId}/toggle-block`, {
        isBlocked: shouldBlock,
      })

      setUsers(users.map((user) => (user._id === userId ? { ...user, isBlocked: shouldBlock } : user)))
      toast.success(`User ${shouldBlock ? "blocked" : "unblocked"} successfully`)
    } catch (error) {
      console.error("Error toggling user block:", error)
      toast.error("Failed to update user status")
    }
  }

  const roleOptions = [
    { value: "all", label: "All Roles" },
    { value: "admin", label: "Admins" },
    { value: "superadmin", label: "Super Admins" },
  ]

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "blocked", label: "Blocked" },
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
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400">Manage platform users and their permissions</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-400">{totalUsers}</p>
          <p className="text-sm text-gray-500">Total Users</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="input pl-10 w-full bg-dark-700 border-dark-600 text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-400">Filters:</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {roleOptions.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setRoleFilter(option.value)
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === option.value
                  ? "bg-primary-600 text-white shadow-md"
                  : "bg-dark-700 text-gray-300 hover:bg-dark-600"
              }`}
            >
              {option.label}
            </motion.button>
          ))}

          {statusOptions.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setStatusFilter(option.value)
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === option.value
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-dark-700 text-gray-300 hover:bg-dark-600"
              }`}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <UserCard key={user._id} user={user} onToggleBlock={handleToggleBlock} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-400">
            Showing {(currentPage - 1) * 12 + 1} to {Math.min(currentPage * 12, totalUsers)} of {totalUsers} users
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
                        : "bg-dark-700 text-gray-300 hover:bg-dark-600"
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
                        : "bg-dark-700 text-gray-300 hover:bg-dark-600"
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

      {users.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No users found</p>
        </div>
      )}
    </div>
  )
}

export default UserManagement
