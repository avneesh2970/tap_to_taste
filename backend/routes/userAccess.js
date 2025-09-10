import express from "express";
import { auth } from "../middleware/auth.js";
import UserAccess from "../models/UserAccess.js";
import User from "../models/User.js";

const router = express.Router();

// Get all staff members and their access for current admin's restaurant
router.get("/staff", auth, async (req, res) => {
  try {
    // Only admins can view staff access
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const staffAccess = await UserAccess.find({
      restaurant: req.user.restaurant,
      grantedBy: req.user._id,
    })
      .populate("staffUser", "name email role")
      .sort({ createdAt: -1 });

    res.json({ staffAccess });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Grant access to a staff member
router.post("/grant", auth, async (req, res) => {
  try {
    // Only admins can grant access
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { staffEmail, permissions } = req.body;

    if (!req.user.restaurant) {
      return res
        .status(400)
        .json({
          success: false,
          message: "please create your restaurant profile first",
        });
    }

    if (!staffEmail || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        message: "Staff email and permissions array are required",
      });
    }

    // Check if staff user exists
    let staffUser = await User.findOne({ email: staffEmail });
    let isNewUser = false;

    if (!staffUser) {
      staffUser = new User({
        name: req.user.name + " " + "restro" + " staff",
        email: staffEmail,
        // Don't set password - let staff set it up themselves
        role: "staff",
        restaurant: req.user.restaurant,
        invitedBy: req.user._id,
        isActive: false, // Will be activated when password is set
      });
      await staffUser.save();
      isNewUser = true;
    } else {
      // If user exists, update their role and restaurant if needed
      if (staffUser.role !== "staff") {
        staffUser.role = "staff";
      }
      if (!staffUser.restaurant) {
        staffUser.restaurant = req.user.restaurant;
      }
      staffUser.invitedBy = req.user._id;
      await staffUser.save();
    }

    // Check if access record already exists
    let userAccess = await UserAccess.findOne({
      staffUser: staffUser._id,
      restaurant: req.user.restaurant,
    });

    if (userAccess) {
      // Update existing access
      userAccess.permissions = permissions;
      userAccess.status = "active";
      userAccess.grantedBy = req.user._id;
    } else {
      // Create new access record
      userAccess = new UserAccess({
        staffUser: staffUser._id,
        grantedBy: req.user._id,
        restaurant: req.user.restaurant,
        staffEmail: staffEmail,
        permissions: permissions,
        status: "active",
      });
    }

    await userAccess.save();
    await userAccess.populate("staffUser", "name email role");

    res.json({
      message: "Access granted successfully",
      userAccess,
      isNewUser: isNewUser,
      invitationLink: isNewUser
        ? `${
            process.env.ADMIN_FRONTEND_URL
          }/setup-password?email=${encodeURIComponent(staffEmail)}`
        : null,
    });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update staff access permissions
router.put("/update/:accessId", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { permissions, status } = req.body;
    const { accessId } = req.params;

    const userAccess = await UserAccess.findOne({
      _id: accessId,
      restaurant: req.user.restaurant,
      grantedBy: req.user._id,
    });

    if (!userAccess) {
      return res.status(404).json({ message: "Access record not found" });
    }

    if (permissions) userAccess.permissions = permissions;
    if (status) userAccess.status = status;

    await userAccess.save();
    await userAccess.populate("staffUser", "name email role");

    res.json({ message: "Access updated successfully", userAccess });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Revoke staff access
router.delete("/revoke/:accessId", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { accessId } = req.params;

    const userAccess = await UserAccess.findOneAndDelete({
      _id: accessId,
      restaurant: req.user.restaurant,
      grantedBy: req.user._id,
    });

    if (!userAccess) {
      return res.status(404).json({ message: "Access record not found" });
    }

    await User.findByIdAndUpdate(userAccess.staffUser, {
      isActive: false,
      role: "user", // Reset role back to regular user
    });

    res.json({ message: "Access revoked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get current user's permissions (for staff users)
router.get("/my-permissions", auth, async (req, res) => {
  try {
    if (req.user.role === "admin" || req.user.role === "superadmin") {
      // Admins have access to all tabs
      const allPermissions = [
        { tabName: "Dashboard", hasAccess: true },
        { tabName: "Orders", hasAccess: true },
        { tabName: "Dishes", hasAccess: true },
        { tabName: "Analytics", hasAccess: true },
        { tabName: "Restaurant", hasAccess: true },
        { tabName: "Plans", hasAccess: true },
      ];
      return res.json({ permissions: allPermissions });
    }

    if (req.user.role === "staff") {
      const userAccess = await UserAccess.findOne({
        staffUser: req.user._id,
        restaurant: req.user.restaurant,
        status: "active",
      });

      if (!userAccess) {
        return res.status(403).json({
          message: "No active access found",
          permissions: [],
        });
      }

      return res.json({ permissions: userAccess.permissions });
    }

    res.status(403).json({ message: "Invalid user role" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
