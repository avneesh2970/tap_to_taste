"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, Shield, ShieldOff, Store, Mail, Calendar } from "lucide-react"
import axios from "axios"

const AdminCard = ({ admin, onToggleBlock }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    className="card"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{admin.name}</h3>
            <div className="flex items-center text-sm text-gray-400">
              <Mail className="w-4 h-4 mr-1" />
              {admin.email}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-400">
            <Store className="w-4 h-4 mr-2" />
            {admin.restaurant ? admin.restaurant.name : "No restaurant"}
          </div>
          <div className="flex items-center text-gray-400">
            <Calendar className="w-4 h-4 mr-2" />
            Joined {new Date(admin.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              admin.isBlocked ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
            }`}
          >
            {admin.isBlocked ? "Blocked" : "Active"}
          </span>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggleBlock(admin._id, admin.isBlocked)}
            className={`flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              admin.isBlocked ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {admin.isBlocked ? (
              <>
                <Shield className="w-4 h-4 mr-1" />
                Unblock
              </>
            ) : (
              <>
                <ShieldOff className="w-4 h-4 mr-1" />
                Block
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  </motion.div>
)

const Admins = () => {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_API}/superadmin/admins`)
      setAdmins(response.data.admins)
    } catch (error) {
      console.error("Error fetching admins:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBlock = async (adminId, isCurrentlyBlocked) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_API}/superadmin/admins/${adminId}/toggle-block`)

      setAdmins(admins.map((admin) => (admin._id === adminId ? { ...admin, isBlocked: !isCurrentlyBlocked } : admin)))
    } catch (error) {
      console.error("Error toggling admin block status:", error)
    }
  }

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()),
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
          <h1 className="text-3xl font-bold text-white mb-2">Admin Management</h1>
          <p className="text-gray-400">Manage restaurant administrators</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-400">{admins.length}</p>
          <p className="text-sm text-gray-400">Total Admins</p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <input
          type="text"
          placeholder="Search admins by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input w-full"
        />
      </div>

      {/* Admins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAdmins.map((admin) => (
          <AdminCard key={admin._id} admin={admin} onToggleBlock={handleToggleBlock} />
        ))}
      </div>

      {filteredAdmins.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No admins found</p>
        </div>
      )}
    </div>
  )
}

export default Admins
