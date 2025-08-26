import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Star, X } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

export default function HeroSection() {
  const [activeAgent, setActiveAgent] = useState(null);
  const avatarGroupRef = useRef(null);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false); // Modal state
  const [quoteForm, setQuoteForm] = useState({
    name: "",
    email: "",
    phone: "",
    business: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const agents = [
    { name: "Agent 1", img: "https://randomuser.me/api/portraits/men/32.jpg" },
    {
      name: "Agent 2",
      img: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    { name: "Agent 3", img: "https://randomuser.me/api/portraits/men/55.jpg" },
    {
      name: "Agent 4",
      img: "https://randomuser.me/api/portraits/women/66.jpg",
    },
  ];

  // Detect click outside avatar group
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        avatarGroupRef.current &&
        !avatarGroupRef.current.contains(event.target)
      ) {
        setActiveAgent(null); // Close tooltip if clicked outside
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle form change
  const handleChange = (e) => {
    setQuoteForm({ ...quoteForm, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_API}/quotes`,
        quoteForm
      );

      if (res.status === 201) {
        toast.success("Quote request submitted successfully!");
        setQuoteForm({
          name: "",
          email: "",
          phone: "",
          business: "",
          message: "",
        });
      } else {
        toast.error(res.data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Error submitting quote request:", error);
    } finally {
      setLoading(false);
    }
    setQuoteForm({ name: "", email: "", phone: "", business: "", message: "" });
    setIsQuoteOpen(false); // close after submit
  };

  return (
    <div id="home" className="relative w-full overflow-hidden pt-14">
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092"
        alt="food-bg"
        className="w-full h-[90vh] object-cover rounded-b-[32px]"
      />

      {/* Black Overlay */}
      <div className="absolute inset-0 bg-black/55 z-10"></div>

      {/* Content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center items-center px-6 lg:px-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-white text-center text-4xl lg:text-6xl font-semibold max-w-3xl leading-tight"
        >
          Enhance Guest Experience with Technology
        </motion.h1>
        <p className="text-white mt-4 max-w-xl text-base lg:text-lg text-center">
          Offer a faster, safer, and contactless dining experience with a simple
          QR scan — no physical menus, just seamless service.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <a
            href={import.meta.env.VITE_ADMIN_SIGNUP_URL || "/"}
            className="flex items-center gap-2 bg-[#ff6900] hover:bg-[#ff2f00] transition text-white font-semibold py-2.5 px-5 rounded-full"
          >
            Get Started For Free <ArrowRight size={24} />
          </a>
          <button
            onClick={() => setIsQuoteOpen(true)}
            className="flex items-center gap-2 border border-white hover:border-orange-400 hover:text-orange-400 transition text-white font-semibold py-2.5 px-5 rounded-full"
          >
            Request a Quote <ArrowRight size={16} />
          </button>
        </div>

   
      </div>

      {/* ===== Quote Modal ===== */}
      <AnimatePresence>
        {isQuoteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsQuoteOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Request a Quote
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={quoteForm.name}
                    onChange={handleChange}
                    required
                    className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={quoteForm.email}
                    onChange={handleChange}
                    required
                    className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={quoteForm.phone}
                    onChange={handleChange}
                    required
                    className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">
                    Business Type
                  </label>
                  <input
                    type="text"
                    name="business"
                    value={quoteForm.business}
                    onChange={handleChange}
                    required
                    className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={quoteForm.message}
                    onChange={handleChange}
                    rows="4"
                    required
                    className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                  ></textarea>
                </div>
                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.05 }}
                  whileTap={{ scale: loading ? 1 : 0.95 }}
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-xl text-black font-semibold shadow-md transition 
    ${
      loading
        ? "bg-yellow-300 cursor-not-allowed"
        : "bg-yellow-400 hover:bg-yellow-500"
    }`}
                >
                  {loading ? "Submitting..." : "Submit Quote Request 🚀"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
