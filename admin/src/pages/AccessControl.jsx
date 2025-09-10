"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Mail,
  Shield,
  Trash2,
  Edit3,
  Check,
  X,
  AlertCircle,
  UserPlus,
  Copy,
  ExternalLink,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

const AccessControl = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccess, setEditingAccess] = useState(null);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [invitationLink, setInvitationLink] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const { user } = useAuth();
  // Available tabs that can be granted access to
  const availableTabs = [
    { name: "Dashboard", description: "View dashboard and overview" },
    { name: "Orders", description: "Manage orders and order status" },
    { name: "Dishes", description: "Manage menu items and dishes" },
    { name: "Analytics", description: "View reports and analytics" },
    { name: "Restaurant", description: "Manage restaurant settings" },
    { name: "Plans", description: "View subscription plans" },
    { name: "Billing", description: "View and generate bills" },
  ];

  // Form state for adding new staff
  const [newStaffForm, setNewStaffForm] = useState({
    email: "",
    permissions: availableTabs.map((tab) => ({
      tabName: tab.name,
      hasAccess: false,
    })),
  });

  useEffect(() => {
    fetchStaffList();
    checkPremiumUser();
  }, []);

  const checkPremiumUser = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/restaurants/${
          user?.restaurant?._id
        }/ad-status`
      );
      const data = await response.json();
      if (data?.hasPremium) {
        setIsPremium(true);
      }
    } catch (error) {
      console.error("Error checking user premium:", error);
    }
  };

  const fetchStaffList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_API}/user-access/staff`
      );
      setStaffList(response.data.staffAccess);
    } catch (error) {
      console.error("Error fetching staff list:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (staffList?.length > 3 && !isPremium) {
      toast.error(
        "you need to buy premium plan to add staff members more than 3"
      );
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_API}/user-access/grant`,
        {
          staffEmail: newStaffForm.email,
          permissions: newStaffForm.permissions,
        }
      );

      const email = newStaffForm.email;
      const inviteLink = `${
        window.location.origin
      }/setup-password?email=${encodeURIComponent(email)}`;
      setInvitationLink(inviteLink);
      setShowInvitationModal(true);

      setStaffList([response.data.userAccess, ...staffList]);
      setShowAddForm(false);
      setNewStaffForm({
        email: "",
        permissions: availableTabs.map((tab) => ({
          tabName: tab.name,
          hasAccess: false,
        })),
      });
    } catch (error) {
      console.error("Error adding staff:", error);
      alert(error.response?.data?.message || "Error adding staff member");
    }
  };

  const copyInvitationLink = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const generateInvitationLink = (staffEmail) => {
    const inviteLink = `${
      window.location.origin
    }/setup-password?email=${encodeURIComponent(staffEmail)}`;
    setInvitationLink(inviteLink);
    setShowInvitationModal(true);
  };

  const handleUpdateAccess = async (accessId, updatedPermissions) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_API}/user-access/update/${accessId}`,
        {
          permissions: updatedPermissions,
        }
      );

      setStaffList(
        staffList.map((staff) =>
          staff._id === accessId ? response.data.userAccess : staff
        )
      );
      setEditingAccess(null);
    } catch (error) {
      console.error("Error updating access:", error);
      alert(error.response?.data?.message || "Error updating access");
    }
  };

  const handleRevokeAccess = async (accessId) => {
    if (
      !confirm("Are you sure you want to revoke access for this staff member?")
    ) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_API}/user-access/revoke/${accessId}`
      );
      setStaffList(staffList.filter((staff) => staff._id !== accessId));
    } catch (error) {
      console.error("Error revoking access:", error);
      alert(error.response?.data?.message || "Error revoking access");
      fetchStaffList();
    }
  };

  const togglePermission = (permissions, tabName) => {
    return permissions.map((perm) =>
      perm.tabName === tabName ? { ...perm, hasAccess: !perm.hasAccess } : perm
    );
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600">
            Only administrators can manage staff access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Access Control
          </h1>
          <p className="text-gray-600 mt-1">
            Manage staff access to different sections of your dashboard
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Staff Member
        </motion.button>
      </div>

      <AnimatePresence>
        {showInvitationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowInvitationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-600" />
                Staff Invitation Link
              </h3>

              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Share this link with your staff member to set up their
                  password and access the dashboard:
                </p>

                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-xs text-gray-500 mb-1">
                    Invitation Link:
                  </div>
                  <div className="text-sm font-mono break-all text-gray-800">
                    {invitationLink}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={copyInvitationLink}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
                      copiedLink
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Link
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => window.open(invitationLink, "_blank")}
                    className="flex items-center gap-2 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open
                  </button>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-xs text-blue-700 font-medium mb-1">
                    Instructions for Staff:
                  </div>
                  <div className="text-xs text-blue-600">
                    1. Click the link above
                    <br />
                    2. Create a secure password
                    <br />
                    3. Access the dashboard with granted permissions
                  </div>
                </div>

                <button
                  onClick={() => setShowInvitationModal(false)}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Staff Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Add Staff Member
              </h3>

              <form onSubmit={handleAddStaff} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={newStaffForm.email}
                    onChange={(e) =>
                      setNewStaffForm({
                        ...newStaffForm,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="staff@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Permissions
                  </label>
                  <div className="space-y-2">
                    {availableTabs.map((tab) => {
                      const hasAccess = newStaffForm.permissions.find(
                        (p) => p.tabName === tab.name
                      )?.hasAccess;
                      return (
                        <label
                          key={tab.name}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={hasAccess}
                            onChange={() =>
                              setNewStaffForm({
                                ...newStaffForm,
                                permissions: togglePermission(
                                  newStaffForm.permissions,
                                  tab.name
                                ),
                              })
                            }
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div>
                            <div className="font-medium text-sm">
                              {tab.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {tab.description}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Staff Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Staff List */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-600">Loading staff members...</div>
        </div>
      ) : staffList.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Staff Members
          </h3>
          <p className="text-gray-600 mb-4">
            You haven't added any staff members yet.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Staff Member
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {staffList.map((staff) => (
            <motion.div
              key={staff._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {staff.staffUser?.name || "Pending Setup"}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {staff.staffEmail}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      staff.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {staff.status === "active" ? "Active" : "Pending"}
                  </span>
                  {staff.status === "pending" && (
                    <button
                      onClick={() => generateInvitationLink(staff.staffEmail)}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="Generate invitation link"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setEditingAccess(staff._id)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRevokeAccess(staff._id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {editingAccess === staff._id ? (
                <EditPermissions
                  permissions={staff.permissions}
                  availableTabs={availableTabs}
                  onSave={(updatedPermissions) =>
                    handleUpdateAccess(staff._id, updatedPermissions)
                  }
                  onCancel={() => setEditingAccess(null)}
                />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {staff.permissions.map((perm) => (
                    <div
                      key={perm.tabName}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                        perm.hasAccess
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-50 text-gray-500"
                      }`}
                    >
                      {perm.hasAccess ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                      {perm.tabName}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// Component for editing permissions
const EditPermissions = ({ permissions, availableTabs, onSave, onCancel }) => {
  const [editedPermissions, setEditedPermissions] = useState([...permissions]);

  const togglePermission = (tabName) => {
    setEditedPermissions(
      editedPermissions.map((perm) =>
        perm.tabName === tabName
          ? { ...perm, hasAccess: !perm.hasAccess }
          : perm
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2">
        {availableTabs.map((tab) => {
          const hasAccess = editedPermissions.find(
            (p) => p.tabName === tab.name
          )?.hasAccess;
          return (
            <label
              key={tab.name}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={hasAccess}
                onChange={() => togglePermission(tab.name)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-sm">{tab.name}</div>
                <div className="text-xs text-gray-500">{tab.description}</div>
              </div>
            </label>
          );
        })}
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => onSave(editedPermissions)}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Save Changes
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AccessControl;
