"use client"

import { createContext, useContext, useState, useEffect } from "react"

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [restaurantId, setRestaurantId] = useState(null)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    const savedRestaurantId = localStorage.getItem("cartRestaurantId")

    if (savedCart && savedRestaurantId) {
      setCartItems(JSON.parse(savedCart))
      setRestaurantId(savedRestaurantId)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cartItems))
      localStorage.setItem("cartRestaurantId", restaurantId)
    } else {
      localStorage.removeItem("cart")
      localStorage.removeItem("cartRestaurantId")
    }
  }, [cartItems, restaurantId])

  const addToCart = (dish, quantity = 1) => {
    console.log("[v0] Adding to cart:", {
      dish: dish.name,
      dishRestaurant: dish.restaurant,
      currentRestaurantId: restaurantId,
    })

    const dishRestaurantId = dish.restaurant?._id || dish.restaurant

    // If adding from a different restaurant, clear cart
    if (restaurantId && restaurantId !== dishRestaurantId) {
      console.log("[v0] Different restaurant detected, clearing cart")
      setCartItems([])
      setRestaurantId(dishRestaurantId)
    } else if (!restaurantId) {
      console.log("[v0] Setting initial restaurant ID")
      setRestaurantId(dishRestaurantId)
    }

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === dish._id)

      if (existingItem) {
        console.log("[v0] Updating existing item quantity")
        return prevItems.map((item) => (item._id === dish._id ? { ...item, quantity: item.quantity + quantity } : item))
      } else {
        console.log("[v0] Adding new item to cart")
        return [...prevItems, { ...dish, quantity }]
      }
    })
  }

  const removeFromCart = (dishId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== dishId))
  }

  const updateQuantity = (dishId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(dishId)
      return
    }

    setCartItems((prevItems) => prevItems.map((item) => (item._id === dishId ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setCartItems([])
    setRestaurantId(null)
    localStorage.removeItem("cart")
    localStorage.removeItem("cartRestaurantId")
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const setRestaurantContext = (id) => {
    console.log("[v0] Setting restaurant context:", id)
    setRestaurantId(id)
  }

  const value = {
    cartItems,
    restaurantId,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    setRestaurantContext, // Added new method
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
