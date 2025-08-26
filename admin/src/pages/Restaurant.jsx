"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Store, Clock, Camera, Save, Edit, CreditCard } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import axios from "axios"

const Restaurant = () => {
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    isOpen: false,
  })
  const [razorpayDetails, setRazorpayDetails] = useState({
    keyId: "",
    keySecret: "",
    isRazorpayEnabled: false,
  })
  const [openingHours, setOpeningHours] = useState({
    monday: { open: "09:00", close: "22:00", isOpen: true },
    tuesday: { open: "09:00", close: "22:00", isOpen: true },
    wednesday: { open: "09:00", close: "22:00", isOpen: true },
    thursday: { open: "09:00", close: "22:00", isOpen: true },
    friday: { open: "09:00", close: "22:00", isOpen: true },
    saturday: { open: "09:00", close: "22:00", isOpen: true },
    sunday: { open: "09:00", close: "22:00", isOpen: true },
  })
  const [selectedImage, setSelectedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (user?.restaurant) {
      fetchRestaurant()
    }
  }, [user])

  const fetchRestaurant = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_API}/restaurants/${user.restaurant._id}`)
      const restaurantData = response.data.restaurant
      setRestaurant(restaurantData)
      setFormData({
        name: restaurantData.name || "",
        description: restaurantData.description || "",
        address: restaurantData.address || "",
        phone: restaurantData.phone || "",
        email: restaurantData.email || "",
        isOpen: restaurantData.isOpen || false,
      })
      setRazorpayDetails({
        keyId: restaurantData.razorpayDetails?.keyId || "",
        keySecret: restaurantData.razorpayDetails?.keySecret || "",
        isRazorpayEnabled: restaurantData.razorpayDetails?.isRazorpayEnabled || false,
      })
      if (restaurantData.openingHours && typeof restaurantData.openingHours === "object") {
        const defaultHours = {
          monday: { open: "09:00", close: "22:00", isOpen: true },
          tuesday: { open: "09:00", close: "22:00", isOpen: true },
          wednesday: { open: "09:00", close: "22:00", isOpen: true },
          thursday: { open: "09:00", close: "22:00", isOpen: true },
          friday: { open: "09:00", close: "22:00", isOpen: true },
          saturday: { open: "09:00", close: "22:00", isOpen: true },
          sunday: { open: "09:00", close: "22:00", isOpen: true },
        }

        const mergedHours = {}
        Object.keys(defaultHours).forEach((day) => {
          mergedHours[day] = {
            ...defaultHours[day],
            ...(restaurantData.openingHours[day] || {}),
          }
        })
        setOpeningHours(mergedHours)
      }
    } catch (error) {
      console.error("Error fetching restaurant:", error)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleRazorpayChange = (e) => {
    const { name, value, type, checked } = e.target
    setRazorpayDetails({
      ...razorpayDetails,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleHoursChange = (day, field, value) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const submitData = new FormData()
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key])
      })
      submitData.append("openingHours", JSON.stringify(openingHours))
      submitData.append("razorpayDetails", JSON.stringify(razorpayDetails))

      if (selectedImage) {
        submitData.append("image", selectedImage)
      }

      let response
      if (restaurant) {
        // Update existing restaurant
        response = await axios.put(`${import.meta.env.VITE_BACKEND_API}/restaurants/${restaurant._id}`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      } else {
        // Create new restaurant
        response = await axios.post(`${import.meta.env.VITE_BACKEND_API}/restaurants`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      }

      setRestaurant(response.data.restaurant)
      setMessage(restaurant ? "Restaurant updated successfully!" : "Restaurant created successfully!")
      setSelectedImage(null)
      setIsEditing(false)

      if (restaurant) {
        await fetchRestaurant()
      } else {
        // Update user context if this is a new restaurant
        window.location.reload()
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurant Profile</h1>
          <p className="text-gray-600">Manage your restaurant information and settings</p>
        </div>
        {restaurant && !isEditing && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsEditing(true)}
            className="btn-primary flex items-center"
          >
            <Edit className="w-5 h-5 mr-2" />
            Edit Restaurant
          </motion.button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Store className="w-6 h-6 mr-2 text-green-600" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input w-full"
                placeholder="Enter restaurant name"
                required
                disabled={restaurant && !isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input w-full"
                placeholder="Enter restaurant email"
                required
                disabled={restaurant && !isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input w-full"
                placeholder="Enter phone number"
                required
                disabled={restaurant && !isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isOpen"
                  checked={formData.isOpen}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  disabled={restaurant && !isEditing}
                />
                <label className="ml-2 text-sm text-gray-700">Restaurant is currently open</label>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input w-full"
                placeholder="Enter full address"
                required
                disabled={restaurant && !isEditing}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="textarea w-full"
                placeholder="Describe your restaurant..."
                disabled={restaurant && !isEditing}
              />
            </div>
          </div>
        </div>

        {/* Razorpay Payment Configuration */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <CreditCard className="w-6 h-6 mr-2 text-green-600" />
            Razorpay Payment Configuration
          </h2>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isRazorpayEnabled"
                checked={razorpayDetails.isRazorpayEnabled}
                onChange={handleRazorpayChange}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                disabled={restaurant && !isEditing}
              />
              <label className="ml-2 text-sm text-gray-700">Enable Razorpay payments for customers</label>
            </div>

            {razorpayDetails.isRazorpayEnabled && (
              <div className="grid grid-cols-1 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Razorpay Key ID *</label>
                  <input
                    type="text"
                    name="keyId"
                    value={razorpayDetails.keyId}
                    onChange={handleRazorpayChange}
                    className="input w-full"
                    placeholder="rzp_test_xxxxxxxxxx or rzp_live_xxxxxxxxxx"
                    required={razorpayDetails.isRazorpayEnabled}
                    disabled={restaurant && !isEditing}
                  />
                  <p className="text-xs text-gray-500 mt-1">Your Razorpay Key ID from the dashboard</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Razorpay Key Secret *</label>
                  <input
                    type="password"
                    name="keySecret"
                    value={razorpayDetails.keySecret}
                    onChange={handleRazorpayChange}
                    className="input w-full"
                    placeholder="Your Razorpay Key Secret"
                    required={razorpayDetails.isRazorpayEnabled}
                    disabled={restaurant && !isEditing}
                  />
                  <p className="text-xs text-gray-500 mt-1">Your Razorpay Key Secret (kept secure)</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">How to get Razorpay Keys:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>
                      Sign up at{" "}
                      <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer" className="underline">
                        razorpay.com
                      </a>
                    </li>
                    <li>Complete KYC verification</li>
                    <li>Go to Settings → API Keys</li>
                    <li>Generate new API keys</li>
                    <li>Copy Key ID and Key Secret here</li>
                  </ol>
                </div>
              </div>
            )}

            {!razorpayDetails.isRazorpayEnabled && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Enable Razorpay payments to allow customers to pay online directly to your
                  account. Payments will be processed securely and deposited to your bank account.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Restaurant Image */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Camera className="w-6 h-6 mr-2 text-green-600" />
            Restaurant Image
          </h2>

          <div className="space-y-4">
            {restaurant?.image && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                <img
                  src={restaurant.image || "/placeholder.svg"}
                  alt="Restaurant"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}

            {(!restaurant || isEditing) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {restaurant?.image ? "Update Image" : "Upload Image"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>
            )}
          </div>
        </div>

        {/* Opening Hours */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Clock className="w-6 h-6 mr-2 text-green-600" />
            Opening Hours
          </h2>

          <div className="space-y-4">
            {days.map((day) => (
              <div key={day} className="flex items-center space-x-4">
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 capitalize">{day}</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={openingHours[day]?.isOpen || false}
                    onChange={(e) => handleHoursChange(day, "isOpen", e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    disabled={restaurant && !isEditing}
                  />
                  <span className="text-sm text-gray-600">Open</span>
                </div>

                {openingHours[day]?.isOpen && (
                  <>
                    <div>
                      <input
                        type="time"
                        value={openingHours[day]?.open || "09:00"}
                        onChange={(e) => handleHoursChange(day, "open", e.target.value)}
                        className="input"
                        disabled={restaurant && !isEditing}
                      />
                    </div>
                    <span className="text-gray-500">to</span>
                    <div>
                      <input
                        type="time"
                        value={openingHours[day]?.close || "22:00"}
                        onChange={(e) => handleHoursChange(day, "close", e.target.value)}
                        className="input"
                        disabled={restaurant && !isEditing}
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </motion.div>
        )}

        {(!restaurant || isEditing) && (
          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? "Saving..." : restaurant ? "Update Restaurant" : "Create Restaurant"}
            </motion.button>

            {restaurant && isEditing && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  fetchRestaurant()
                }}
                className="btn-secondary"
              >
                Cancel
              </motion.button>
            )}
          </div>
        )}
      </form>
    </div>
  )
}

export default Restaurant
