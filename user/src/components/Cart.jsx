"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react"
import { useCart } from "../contexts/CartContext"
import { useNavigate } from "react-router-dom"

const Cart = ({ isOpen, onClose, restaurant }) => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCart()
  const navigate = useNavigate()

  const handleCheckout = () => {
    onClose()
    navigate(`/checkout/${restaurant._id}`)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Cart Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-900">Your Order</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </motion.button>
            </div>

            {/* Restaurant Info */}
            <div className="p-6 bg-warm-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">{restaurant?.name}</h3>
              <p className="text-sm text-gray-600">{restaurant?.address}</p>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-4 bg-gray-50 rounded-xl p-4"
                    >
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-warm-100 to-warm-200" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                        <p className="text-sm text-gray-600">₹{item.price}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </motion.button>
                        <span className="font-semibold text-gray-900 min-w-[20px] text-center">{item.quantity}</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </motion.button>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeFromCart(item._id)}
                          className="text-xs text-red-600 hover:text-red-700 mt-1"
                        >
                          Remove
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 p-6 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-900">Total ({getTotalItems()} items)</span>
                  <span className="text-2xl font-bold text-orange-600">₹{getTotalPrice().toFixed(2)}</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Cart
