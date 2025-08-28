import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  Crown,
  Gift,
  Check,
  Package,
  CheckCircle,
  CalendarDays,
  Clock,
  X,
} from "lucide-react";

const SubscriptionCard = ({ plan, isActive, onUpgrade, onCancel, loading }) => {
  const isPremium = plan === "premium";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card relative overflow-hidden ${
        isPremium
          ? "border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50"
          : ""
      }`}
    >
      {isPremium && (
        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-bold rounded-bl-lg">
          PREMIUM
        </div>
      )}

      <div className="text-center">
        <div
          className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isPremium ? "bg-yellow-400" : "bg-gray-200"
          }`}
        >
          {isPremium ? (
            <Crown className="w-8 h-8 text-yellow-900" />
          ) : (
            <Gift className="w-8 h-8 text-gray-600" />
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {isPremium ? "Premium Plan" : "Free Plan"}
        </h3>

        <div className="mb-4">
          <span className="text-3xl font-bold text-gray-900">
            {isPremium ? "₹199" : "₹0"}
          </span>
          <span className="text-gray-600 text-sm">
            {isPremium ? "/month" : "/forever"}
          </span>
        </div>

        <div className="space-y-3 mb-6 text-left">
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3" />
            <span className="text-gray-700">Full restaurant management</span>
          </div>
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3" />
            <span className="text-gray-700">Unlimited menu items</span>
          </div>
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3" />
            <span className="text-gray-700">Order management</span>
          </div>
          <div className="flex items-center">
            {isPremium ? (
              <Check className="w-5 h-5 text-green-500 mr-3" />
            ) : (
              <X className="w-5 h-5 text-red-500 mr-3" />
            )}
            <span
              className={`${isPremium ? "text-gray-700" : "text-gray-500"}`}
            >
              Ad-free customer experience
            </span>
          </div>
          <div className="flex items-center">
            {isPremium ? (
              <Check className="w-5 h-5 text-green-500 mr-3" />
            ) : (
              <X className="w-5 h-5 text-red-500 mr-3" />
            )}
            <span
              className={`${isPremium ? "text-gray-700" : "text-gray-500"}`}
            >
              Priority customer support
            </span>
          </div>
        </div>

        {isActive ? (
          <div className="space-y-2">
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium">
              Current Plan
            </div>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onUpgrade}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium disabled:opacity-50 ${
              isPremium
                ? "bg-yellow-400 hover:bg-yellow-500 text-yellow-900"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            {loading
              ? "Processing..."
              : isPremium
              ? "Upgrade to Premium"
              : "Current Plan"}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default function Plans() {
  const [subscription, setSubscription] = useState({
    plan: "free",
    status: "active",
  });
  console.log("subscription: ", JSON.stringify(subscription));
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const handleUpgradeToPremium = async () => {
    setSubscriptionLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway. Please try again.");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_API}/subscriptions/create-premium`
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: response.data.amount,
        currency: response.data.currency,
        order_id: response.data.orderId,
        name: response.data.name,
        description: response.data.description,
        handler: async (paymentResponse) => {
          try {
            await axios.post(
              `${
                import.meta.env.VITE_BACKEND_API
              }/subscriptions/verify-premium`,
              {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                amount: response.data.amount,
              }
            );

            toast.success("Premium subscription activated!");
            fetchSubscription();
          } catch (error) {
            console.log(error);
            toast.error("Payment verification failed");
          }
        },
        prefill: response.data.prefill,
        theme: {
          color: "#eab308",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        toast.error("Payment failed. Please try again.");
        console.error("Payment failed:", response.error);
      });
      rzp.open();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to initiate subscription";
      toast.error(errorMessage);
      console.error("Subscription error:", error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your premium subscription?"))
      return;

    setSubscriptionLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_API}/subscriptions/cancel`
      );
      toast.success("Subscription cancelled successfully");
      fetchSubscription();
    } catch (error) {
      console.log("error:", error);
      toast.error("Failed to cancel subscription");
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_API}/subscriptions/current`
      );
      setSubscription(response.data.subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  return (
    <>
      <div className="w-full bg-gradient-to-br from-green-50 to-green-100 text-green-800 rounded-2xl shadow-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          🌿 Current Subscription
          <span className="text-sm bg-green-600 text-white px-3 py-1 rounded-full shadow">
            {subscription.plan.toUpperCase()}
          </span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {/* Plan */}
          <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition">
            <div className="flex items-center gap-2 mb-2 text-gray-500 text-sm font-medium">
              <Package size={18} /> Plan
            </div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${
                subscription.plan === "free"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-200 text-yellow-700"
              }`}
            >
              {subscription.plan}
            </span>
          </div>

          {/* Status */}
          <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition">
            <div className="flex items-center gap-2 mb-2 text-gray-500 text-sm font-medium">
              <CheckCircle size={18} /> Status
            </div>
            <p
              className={`text-lg font-semibold ${
                subscription.status === "active"
                  ? "text-green-600"
                  : subscription.status === "pending"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {subscription.status}
            </p>
          </div>

          {/* Start Date */}
          <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition">
            <div className="flex items-center gap-2 mb-2 text-gray-500 text-sm font-medium">
              <CalendarDays size={18} /> Start Date
            </div>
            <p className="text-lg font-semibold text-gray-700">
              {new Date(subscription.startDate).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>

          {/* End Date */}
          <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition">
            <div className="flex items-center gap-2 mb-2 text-gray-500 text-sm font-medium">
              <Clock size={18} /> End Date
            </div>
            <p
              className={`text-lg font-semibold ${
                subscription.plan === "free"
                  ? "text-green-600"
                  : new Date(subscription.endDate) < new Date()
                  ? "text-red-600"
                  : "text-orange-600"
              }`}
            >
              {subscription.plan === "free"
                ? "Lifetime"
                : new Date(subscription.endDate).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subscription.plan === "free" && (
          <>
            <SubscriptionCard
              plan="free"
              isActive={subscription.plan === "free"}
              onUpgrade={() => {}}
              loading={subscriptionLoading}
            />
            <SubscriptionCard
              plan="premium"
              isActive={subscription.plan === "premium"}
              onUpgrade={handleUpgradeToPremium}
              onCancel={handleCancelSubscription}
              loading={subscriptionLoading}
            />
          </>
        )}
      </div>

      {/* 🧾 Transaction History Section */}
      <div className="mt-10 bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          💳 Transaction History
        </h2>

        {subscription.transactions && subscription.transactions.length > 0 ? (
          <ul className="space-y-4">
            {subscription.transactions.map((txn, idx) => (
              <li
                key={txn._id || idx}
                className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition"
              >
                {/* Left Info */}
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">
                    Payment ID:{" "}
                    <span className="text-gray-600">{txn.paymentId}</span>
                  </span>
                  <span className="text-sm text-gray-500">
                    Order ID: {txn.orderId}
                  </span>
                  <span className="text-sm text-gray-500">
                    Date:{" "}
                    {new Date(txn.date).toLocaleString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Right Info */}
                <div className="flex flex-col items-end">
                  <span className="font-semibold text-gray-900">
                    ₹{(txn.amount / 100).toFixed(2)} {txn.currency}
                  </span>

                  {txn.status === "success" ? (
                    <span className="flex items-center text-green-600 text-sm font-medium mt-1">
                      <CheckCircle className="w-4 h-4 mr-1" /> Success
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600 text-sm font-medium mt-1">
                      <X className="w-4 h-4 mr-1" /> Failed
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No transactions found</p>
        )}
      </div>
    </>
  );
}
