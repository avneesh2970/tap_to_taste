"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Store, MapPin, Phone, Mail } from "lucide-react"
import axios from "axios"

const RestaurantCard = ({ restaurant }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    className="card"
  >
    <div className="space-y-4">
      {/* Restaurant Image */}
      <div className="w-full h-48 bg-dark-700 rounded-lg overflow-hidden">
        {restaurant.image ? (
          <img
            src={restaurant.image || "/placeholder.svg"}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Store className="w-16 h-16 text-gray-600" />
          </div>
        )}
      </div>

      {/* Restaurant Info */}
      <div>
        <h3 className="text-xl font-bold text-white mb-2">{restaurant.name}</h3>
        <p className="text-gray-400 text-sm mb-3">{restaurant.description}</p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-400">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{restaurant.address}</span>
          </div>
          <div className="flex items-center text-gray-400">
            <Phone className="w-4 h-4 mr-2" />
            {restaurant.phone}
          </div>
          <div className="flex items-center text-gray-400">
            <Mail className="w-4 h-4 mr-2" />
            {restaurant.email}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-dark-600">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-400">{restaurant.totalOrders}</p>
            <p className="text-xs text-gray-400">Total Orders</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">₹{restaurant.totalRevenue}</p>
            <p className="text-xs text-gray-400">Revenue</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between mt-4">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              restaurant.isOpen ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            }`}
          >
            {restaurant.isOpen ? "Open" : "Closed"}
          </span>

          <div className="text-xs text-gray-400">Owner: {restaurant.owner?.name}</div>
        </div>
      </div>
    </div>
  </motion.div>
)

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_API}/restaurants`)
      setRestaurants(response.data.restaurants)
    } catch (error) {
      console.error("Error fetching restaurants:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.address.toLowerCase().includes(searchTerm.toLowerCase()),
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
          <h1 className="text-3xl font-bold text-white mb-2">Restaurant Management</h1>
          <p className="text-gray-400">View and manage all restaurants on the platform</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-400">{restaurants.length}</p>
          <p className="text-sm text-gray-400">Total Restaurants</p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <input
          type="text"
          placeholder="Search restaurants by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input w-full"
        />
      </div>

      {/* Restaurants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.map((restaurant) => (
          <RestaurantCard key={restaurant._id} restaurant={restaurant} />
        ))}
      </div>

      {filteredRestaurants.length === 0 && (
        <div className="text-center py-12">
          <Store className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No restaurants found</p>
        </div>
      )}
    </div>
  )
}

export default Restaurants
