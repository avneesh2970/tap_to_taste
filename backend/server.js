import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

// Import routes
import authRoutes from "./routes/auth.js";
import restaurantRoutes from "./routes/restaurants.js";
import dishRoutes from "./routes/dishes.js";
import orderRoutes from "./routes/orders.js";
import superadminRoutes from "./routes/superadmin.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import adsRoutes from "./routes/ads.js";
import contactRoutes from "./routes/contactRoutes.js";
import quoteRoutes from "./routes/quoteRoutes.js";
import blogRoutes from "./routes/blogs/blogRoute.js";
import { uploadBlogImage } from "./config/multerConfig.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      process.env.SUPERADMIN_FRONTEND_URL,
      process.env.ADMIN_FRONTEND_URL,
      process.env.USER_FRONTEND_URL,
    ],
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(
  cors({
    origin: [
      process.env.SUPERADMIN_FRONTEND_URL,
      process.env.ADMIN_FRONTEND_URL,
      process.env.USER_FRONTEND_URL,
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-restaurant", (restaurantId) => {
    socket.join(`restaurant-${restaurantId}`);
    console.log(`Socket ${socket.id} joined restaurant-${restaurantId}`);
  });

  socket.on("join-order", (orderId) => {
    socket.join(`order-${orderId}`);
    console.log(`Socket ${socket.id} joined order-${orderId}`);
  });

  socket.on("join-admin", (adminId) => {
    socket.join(`admin-${adminId}`);
    console.log(`Admin ${adminId} connected`);
  });

  socket.on("join-superadmin", () => {
    socket.join("superadmin");
    console.log("Superadmin connected");
  });

  socket.on("leave-restaurant", (restaurantId) => {
    socket.leave(`restaurant-${restaurantId}`);
  });

  socket.on("leave-order", (orderId) => {
    socket.leave(`order-${orderId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Make io accessible to routes
app.set("io", io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/dishes", dishRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/superadmin", superadminRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/ads", adsRoutes);

//submissions
app.use("/api/contact", contactRoutes);
app.use("/api/quotes", quoteRoutes);

//blog routes
// app.get("/api/get-blog", getAllBlogs);
// app.get("/api/get-blog/:slug", getBlogByslug);
// app.post("/api/blog", uploadBlogImage.single("featuredImage"), uploadBlog);

app.use("/api", blogRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running!" });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
