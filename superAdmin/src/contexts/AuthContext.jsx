"use client"

import { createContext, useState, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext()

export { AuthContext }

// export const useAuth = () => {
//   const context = useContext(AuthContext)
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider")
//   }
//   return context
// }

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const API_URL = import.meta.env.VITE_BACKEND_API

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("superadmin_token")
        console.log("Checking auth, token exists:", !!token) // Added debug logging

        if (!token) {
          console.log("No token found, setting loading to false")
          setLoading(false)
          return
        }

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

        const response = await axios.get(`${API_URL}/auth/superadmin/verify`)
        console.log("Token verification successful:", response.data) // Added debug logging

        setIsAuthenticated(true)
        setUser(response.data.user || { role: "superadmin" })
      } catch (error) {
        console.error("Token verification failed:", error)
        localStorage.removeItem("superadmin_token")
        delete axios.defaults.headers.common["Authorization"]
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        console.log("Setting loading to false") // Added debug logging
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/superadmin/login`, {
        password,
      })

      const { token, user } = response.data
      localStorage.setItem("superadmin_token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setIsAuthenticated(true)
      setUser(user)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("superadmin_token")
    delete axios.defaults.headers.common["Authorization"]
    setIsAuthenticated(false)
    setUser(null)
  }

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
