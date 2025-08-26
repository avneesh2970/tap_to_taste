import axios from "axios";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_API}/contact`, form);
      if (res.status === 201) {
        toast.success("Message sent successfully!");
        setForm({ name: "", email: "", message: "" });
      } else {
        toast.error(res.data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.response?.data?.error || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="w-full py-16 px-6 md:px-12 lg:px-24 flex justify-center items-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="w-full max-w-6xl border border-orange-300 rounded-3xl p-10"
      >
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-10"
        >
          Contact Us
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left side - Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col justify-center space-y-6"
          >
            <h3 className="text-2xl font-semibold text-gray-800">
              We’d love to hear from you!
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Have a question, feedback, or just want to say hello? Use the form
              and we’ll get back to you soon.
            </p>
            <div className="space-y-2">
              <p className="font-medium text-gray-700">📍 Dehradun, India</p>
              <p className="font-medium text-gray-700">📧 taptotaste@novanectar.in</p>
              <p className="font-medium text-gray-700">📞 +91 8979891708</p>
            </div>
          </motion.div>

          {/* Right side - Contact Form */}
          <motion.form
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            className="bg-gray-50 rounded-2xl shadow-md p-8 space-y-6"
          >
            <div>
              <label className="block text-gray-700 font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows="4"
                className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none"
              ></textarea>
            </div>
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-semibold shadow-md transition 
    ${
      loading
        ? "bg-orange-400 cursor-not-allowed"
        : "bg-orange-600 hover:bg-orange-700"
    }`}
            >
              {loading ? "Sending..." : "Send Message"}
            </motion.button>
          </motion.form>
        </div>
      </motion.div>
    </section>
  );
}
