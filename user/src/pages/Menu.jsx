"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useParams } from "react-router-dom"
import { ShoppingCart, Plus, Minus, Star, Clock, Leaf, Flame, UtensilsCrossed } from "lucide-react"
import { useCart } from "../contexts/CartContext"
import Cart from "../components/Cart"
import AdBanner from "../components/AdBanner"
import axios from "axios"

const DishCard = ({ dish, onAddToCart }) => {
  const [quantity, setQuantity] = useState(0)
  const { cartItems, updateQuantity } = useCart()

  useEffect(() => {
    const cartItem = cartItems.find((item) => item._id === dish._id)
    setQuantity(cartItem ? cartItem.quantity : 0)
  }, [cartItems, dish._id])

  const handleAddToCart = () => {
    onAddToCart(dish, 1)
  }

  const handleUpdateQuantity = (newQuantity) => {
    updateQuantity(dish._id, newQuantity)
  }

  const getSpiceIcon = (level) => {
    switch (level) {
      case "mild":
        return <Flame className="w-4 h-4 text-green-500" />
      case "medium":
        return <Flame className="w-4 h-4 text-yellow-500" />
      case "spicy":
        return <Flame className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="dish-card"
    >
      <div className="relative">
        <div className="w-full h-48 bg-gray-100 overflow-hidden">
          {dish.image ? (
            <img src={dish.image || "/placeholder.svg"} alt={dish.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200">
              <UtensilsCrossed className="w-16 h-16 text-amber-400" />
            </div>
          )}
        </div>

        <div className="absolute top-3 left-3 flex space-x-2">
          {dish.isVeg && (
            <div className="bg-green-500 text-white p-1 rounded-full">
              <Leaf className="w-3 h-3" />
            </div>
          )}
          {getSpiceIcon(dish.spiceLevel)}
        </div>

        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-gray-600" />
            <span className="text-xs text-gray-600">{dish.preparationTime}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-gray-900 text-lg leading-tight">{dish.name}</h3>
          <div className="text-right">
            <div className="text-xl font-bold text-orange-600">₹{dish.price}</div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{dish.description}</p>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{dish.category}</div>

          {quantity === 0 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="btn-cart flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </motion.button>
          ) : (
            <div className="flex items-center space-x-3 bg-amber-100 rounded-lg p-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleUpdateQuantity(quantity - 1)}
                className="w-8 h-8 bg-orange-600 text-white rounded-md flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </motion.button>
              <span className="font-semibold text-gray-900 min-w-[20px] text-center">{quantity}</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleUpdateQuantity(quantity + 1)}
                className="w-8 h-8 bg-orange-600 text-white rounded-md flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const Menu = () => {
  const { restaurantId } = useParams()
  const { addToCart, getTotalItems, updateQuantity } = useCart()
  const [restaurant, setRestaurant] = useState(null)
  const [dishes, setDishes] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    fetchRestaurantData()
  }, [restaurantId])

  const fetchRestaurantData = async () => {
    try {
      // Fetch restaurant info
      const restaurantResponse = await axios.get(`${import.meta.env.VITE_BACKEND_API}/restaurants/${restaurantId}`)
      setRestaurant(restaurantResponse.data.restaurant)

      // Fetch dishes
      const dishesResponse = await axios.get(`${import.meta.env.VITE_BACKEND_API}/dishes/restaurant/${restaurantId}`)
      const dishesData = dishesResponse.data.dishes
      setDishes(dishesData)

      // Extract categories
      const uniqueCategories = [...new Set(dishesData.map((dish) => dish.category))]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error("Error fetching restaurant data:", error)
      if (error.response?.status === 403) {
        setRestaurant({ blocked: true })
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredDishes =
    selectedCategory === "all" ? dishes : dishes.filter((dish) => dish.category === selectedCategory)

  const handleAddToCart = (dish, quantity) => {
    addToCart(dish, quantity)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Not Found</h1>
          <p className="text-gray-600">The restaurant you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  if (restaurant.blocked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Temporarily Unavailable</h1>
          <p className="text-gray-600">This restaurant is currently not accepting orders. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Restaurant Header */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-orange-500 to-amber-600 overflow-hidden">
          {restaurant.image && (
            <img
              src={restaurant.image || "/placeholder.svg"}
              alt={restaurant.name}
              className="w-full h-full object-cover opacity-80"
            />
          )}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-white">
            <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
            <p className="text-white/90 mb-2">{restaurant.description}</p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{restaurant.isOpen ? "Open Now" : "Closed"}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-current" />
                <span>4.5</span>
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-10">
        <div className="p-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === "all" ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Items
            </motion.button>
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? "bg-orange-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Dishes Grid */}
      <div className="p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredDishes.map((dish) => (
            <DishCard key={dish._id} dish={dish} onAddToCart={handleAddToCart} />
          ))}
        </motion.div>

        {filteredDishes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No dishes available in this category</p>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {getTotalItems() > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCartOpen(true)}
            className="fixed bottom-6 right-6 bg-orange-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-20"
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              <div className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {getTotalItems()}
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} restaurant={restaurant} />

      {/* AdBanner for menu page to show ads for free plan restaurants */}
      {restaurant && !restaurant.blocked && <AdBanner restaurantId={restaurantId} placement="menu" />}
    </div>
  )
}

export default Menu
