"use client"

import { useEffect, useRef } from "react"
import io from "socket.io-client"

const useSocket = (serverPath = import.meta.env.VITE_SOCKET_URL) => {
  const socketRef = useRef(null)

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(serverPath, {
      transports: ["websocket", "polling"],
    })

    const socket = socketRef.current

    socket.on("connect", () => {
      console.log("Connected to server")
      // Join superadmin room
      socket.emit("join-superadmin")
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from server")
    })

    return () => {
      socket.disconnect()
    }
  }, [serverPath])

  const emit = (event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data)
    }
  }

  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback)
    }
  }

  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback)
    }
  }

  return { emit, on, off, socket: socketRef.current }
}

export default useSocket
