"use client";

import { useState, useEffect } from "react";
import {
  Receipt,
  Download,
  Plus,
  CreditCard,
  DollarSign,
  FileText,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createBillLoading, setBillLoading] = useState(false);

  const [todaySummary, setTodaySummary] = useState({});
  const [filters, setFilters] = useState({
    date: "",
    paymentMethod: "",
    paymentStatus: "",
    page: 1,
  });
  const [showManualBillModal, setShowManualBillModal] = useState(false);
  const [manualBillData, setManualBillData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    items: [{ name: "", quantity: 1, price: 0, total: 0 }],
    paymentMethod: "cash",
    tax: 0,
    discount: 0,
    notes: "",
  });

  const API_BASE_URL = import.meta.env.VITE_BACKEND_API;

  useEffect(() => {
    fetchBills();
    fetchTodaySummary();
  }, [filters]);

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("staffToken");
      
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(`${API_BASE_URL}/bills?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBills(response.data.bills);
    } catch (error) {
      toast.error("Failed to fetch bills");
      console.error("Error fetching bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaySummary = async () => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("staffToken");
      if (!token) {
        console.warn("No token found in localStorage");
        return; // or redirect to login
      }
      console.log("tokennn  : ", token);
      const response = await axios.get(`${API_BASE_URL}/bills/today-summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("todays summ: ", response.data);
      setTodaySummary(response.data);
    } catch (error) {
      console.error("Error fetching today's summary:", error);
    }
  };

  const generateAutoBill = async (orderId) => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("staffToken");

      await axios.post(
        `${API_BASE_URL}/bills/auto/${orderId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Bill generated successfully");
      fetchBills();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate bill");
    }
  };

  const createManualBill = async () => {
    try {
      setBillLoading(true);
      const token =
        localStorage.getItem("token") || localStorage.getItem("staffToken");

      // Calculate totals
      const items = manualBillData.items.map((item) => ({
        ...item,
        total: item.quantity * item.price,
      }));

      const billData = {
        ...manualBillData,
        items,
      };

      await axios.post(`${API_BASE_URL}/bills/manual`, billData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Manual bill created successfully");
      setShowManualBillModal(false);
      resetManualBillForm();
      fetchBills();
      fetchTodaySummary();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create bill");
    } finally {
      setBillLoading(false);
    }
  };

  const downloadBill = async (billId, billNumber) => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("staffToken");

      const response = await axios.get(
        `${API_BASE_URL}/bills/download/${billId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `bill-${billNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Bill downloaded successfully");
    } catch (error) {
      console.log("error: ", error);
      toast.error("Failed to download bill");
    }
  };

  const resetManualBillForm = () => {
    setManualBillData({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      items: [{ name: "", quantity: 1, price: 0, total: 0 }],
      paymentMethod: "cash",
      tax: 0,
      discount: 0,
      notes: "",
    });
  };

  const addItem = () => {
    setManualBillData((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: 1, price: 0, total: 0 }],
    }));
  };

  const updateItem = (index, field, value) => {
    setManualBillData((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };

      if (field === "quantity" || field === "price") {
        items[index].total = items[index].quantity * items[index].price;
      }

      return { ...prev, items };
    });
  };

  const removeItem = (index) => {
    setManualBillData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateSubtotal = () => {
    return manualBillData.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + manualBillData.tax - manualBillData.discount;
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading bills...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Billing & Transactions
          </h1>
          <p className="text-gray-600">
            Manage bills and view transaction history
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowManualBillModal(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Manual Bill
          </button>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Receipt className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Bills</p>
              <p className="text-2xl font-bold text-gray-900">
                {todaySummary.totalBills || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Today's Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{todaySummary.totalRevenue || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CreditCard className="w-8 h-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Online Payments
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{todaySummary.onlinePayments || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cash Payments</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{todaySummary.cashPayments || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, date: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={filters.paymentMethod}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  paymentMethod: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="online">Online</option>
              <option value="card">Card</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Status
            </label>
            <select
              value={filters.paymentStatus}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  paymentStatus: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() =>
                setFilters({
                  date: "",
                  paymentMethod: "",
                  paymentStatus: "",
                  page: 1,
                })
              }
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Bills & Transactions
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bills.map((bill) => (
                <tr key={bill._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {bill.billNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(bill.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {bill.billType === "auto" ? "Auto Generated" : "Manual"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {bill.customerName}
                      </div>
                      {bill.customerPhone && (
                        <div className="text-sm text-gray-500">
                          {bill.customerPhone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{bill.totalAmount}
                    </div>
                    <div className="text-sm text-gray-500">
                      {bill.items.length} items
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">
                      {bill.paymentMethod}
                    </div>
                    {bill.transactionId && (
                      <div className="text-xs text-gray-500">
                        ID: {bill.transactionId}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                        bill.paymentStatus
                      )}`}
                    >
                      {getPaymentStatusIcon(bill.paymentStatus)}
                      <span className="ml-1 capitalize">
                        {bill.paymentStatus}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => downloadBill(bill._id, bill.billNumber)}
                      className="text-green-600 hover:text-green-900 mr-3"
                      title="Download Bill"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {bills.length === 0 && (
            <div className="text-center py-12">
              <Receipt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No bills found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first bill.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Manual Bill Modal */}
      {showManualBillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Create Manual Bill
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={manualBillData.customerName}
                    onChange={(e) =>
                      setManualBillData((prev) => ({
                        ...prev,
                        customerName: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={manualBillData.customerPhone}
                    onChange={(e) =>
                      setManualBillData((prev) => ({
                        ...prev,
                        customerPhone: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={manualBillData.customerEmail}
                    onChange={(e) =>
                      setManualBillData((prev) => ({
                        ...prev,
                        customerEmail: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Items</h3>
                  <button
                    onClick={addItem}
                    className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {manualBillData.items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          placeholder="Item name"
                          value={item.name}
                          onChange={(e) =>
                            updateItem(index, "name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity === 0 ? "" : item.quantity}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "quantity",
                              Number.parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Price"
                          value={item.price === 0 ? "" : item.price}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "price",
                              Number.parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          ₹{item.quantity * item.price}
                        </span>
                        {manualBillData.items.length > 1 && (
                          <button
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={manualBillData.paymentMethod}
                    onChange={(e) =>
                      setManualBillData((prev) => ({
                        ...prev,
                        paymentMethod: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="cash">Cash</option>
                    <option value="online">Online</option>
                    <option value="card">Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax (₹)
                  </label>
                  <input
                    type="number"
                    value={manualBillData.tax}
                    onChange={(e) =>
                      setManualBillData((prev) => ({
                        ...prev,
                        tax: Number.parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    value={manualBillData.discount}
                    onChange={(e) =>
                      setManualBillData((prev) => ({
                        ...prev,
                        discount: Number.parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total
                  </label>
                  <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-lg font-semibold text-gray-900">
                    ₹{calculateTotal()}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={manualBillData.notes}
                  onChange={(e) =>
                    setManualBillData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowManualBillModal(false);
                  resetManualBillForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createManualBill}
                disabled={
                  loading ||
                  !manualBillData.customerName ||
                  manualBillData.items.some((item) => !item.name)
                }
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin h-5 w-5 text-white" />
                    Creating...
                  </span>
                ) : (
                  "Create Bill"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
