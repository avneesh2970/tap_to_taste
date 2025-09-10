import jwt from "jsonwebtoken";
import User from "../models/User.js";
import UserAccess from "../models/UserAccess.js";

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate("restaurant");
    if (!user) {
      return res.status(401).json({ message: "Invalid tokenss" });
    }
    if (user.isBlocked) {
      return res.status(403).json({ message: "Account is blocked" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("error in auth.js");
    res.status(401).json({ message: "Invalid token" });
  }
};

const superadminAuth = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Superadmin access required" });
  }
  next();
};

const adminAuth = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "staff") {
    console.log("role");
    return res.status(403).json({ message: "Admin or staff access required" });
  }
  next();
};

const staffAuth = (req, res, next) => {
  if (req.user.role !== "staff" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Staff or Admin access required" });
  }
  next();
};

const checkTabPermission = (tabName) => {
  return async (req, res, next) => {
    try {
      // Admins and superadmins have access to everything
      if (req.user.role === "admin" || req.user.role === "superadmin") {
        return next();
      }

      // For staff, check specific tab permissions
      if (req.user.role === "staff") {
        const userAccess = await UserAccess.findOne({
          staffUser: req.user._id,
          restaurant: req.user.restaurant,
          status: "active",
        });

        if (!userAccess) {
          return res
            .status(403)
            .json({ message: "No access permissions found" });
        }

        const hasPermission = userAccess.permissions.some(
          (permission) => permission.tabName === tabName && permission.hasAccess
        );

        if (!hasPermission) {
          return res
            .status(403)
            .json({ message: `Access denied to ${tabName}` });
        }

        return next();
      }

      return res.status(403).json({ message: "Access denied" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error checking permissions", error: error.message });
    }
  };
};

const superadminAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "superadmin" || decoded.id !== "superadmin") {
      return res.status(401).json({ message: "Invalid superadmin token" });
    }

    // Set superadmin user object
    req.user = {
      _id: "superadmin",
      id: "superadmin",
      role: "superadmin",
      name: "Super Administrator",
    };

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export {
  auth,
  superadminAuth,
  adminAuth,
  staffAuth,
  checkTabPermission,
  superadminAuthMiddleware,
};
