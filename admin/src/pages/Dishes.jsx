"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Plus, Edit, Trash2, Save, X } from "lucide-react";
import axios from "axios";

const DishCard = ({ dish, onEdit, onDelete }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    className="card"
  >
    <div className="space-y-4">
      {/* Dish Image */}
      <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
        {dish.image ? (
          <img
            src={dish.image || "/placeholder.svg"}
            alt={dish.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>

      {/* Dish Info */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900">{dish.name}</h3>
          <div className="flex items-center space-x-1">
            <span
              className={`w-3 h-3 rounded-full ${
                dish.isVeg ? "bg-green-500" : "bg-red-500"
              }`}
              title={dish.isVeg ? "Vegetarian" : "Non-Vegetarian"}
            />
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                dish.isAvailable
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {dish.isAvailable ? "Available" : "Unavailable"}
            </span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {dish.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span className="bg-gray-100 px-2 py-1 rounded">{dish.category}</span>
          <span>{dish.preparationTime} min</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-green-600">₹{dish.price}</div>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onEdit(dish)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(dish._id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const DishModal = ({ dish, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    isVeg: true,
    spiceLevel: "mild",
    preparationTime: "15",
    isAvailable: true,
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dish) {
      setFormData({
        name: dish.name || "",
        description: dish.description || "",
        price: dish.price?.toString() || "",
        category: dish.category || "",
        isVeg: dish.isVeg ?? true,
        spiceLevel: dish.spiceLevel || "mild",
        preparationTime: dish.preparationTime?.toString() || "15",
        isAvailable: dish.isAvailable ?? true,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        isVeg: true,
        spiceLevel: "mild",
        preparationTime: "15",
        isAvailable: true,
      });
    }
    setSelectedImage(null);
  }, [dish, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });

      if (selectedImage) {
        submitData.append("image", selectedImage);
      }

      let response;
      if (dish) {
        response = await axios.put(
          `${import.meta.env.VITE_BACKEND_API}/dishes/${dish._id}`,
          submitData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_BACKEND_API}/dishes`,
          submitData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }
      onSave(response.data.dish);
      onClose();
    } catch (error) {
      alert(error.response.data.message);
      console.error("Error saving dish:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {dish ? "Edit Dish" : "Add New Dish"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dish Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="Enter dish name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="e.g., Appetizers, Main Course"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preparation Time (minutes)
                </label>
                <input
                  type="number"
                  name="preparationTime"
                  value={formData.preparationTime}
                  onChange={handleChange}
                  className="input w-full"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spice Level
                </label>
                <select
                  name="spiceLevel"
                  value={formData.spiceLevel}
                  onChange={handleChange}
                  className="input w-full"
                >
                  <option value="mild">Mild</option>
                  <option value="medium">Medium</option>
                  <option value="spicy">Spicy</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isVeg"
                    checked={formData.isVeg}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Vegetarian
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Available
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="textarea w-full"
                placeholder="Describe the dish..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dish Image
              </label>
              {dish?.image && (
                <div className="mb-4">
                  <img
                    src={dish.image || "/placeholder.svg"}
                    alt="Current dish"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
            </div>

            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center disabled:opacity-50"
              >
                <Save className="w-5 h-5 mr-2" />
                {loading ? "Saving..." : dish ? "Update Dish" : "Add Dish"}
              </motion.button>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Dishes = () => {
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);

  useEffect(() => {
    fetchDishes();
  }, []);

  useEffect(() => {
    filterDishes();
  }, [dishes, searchTerm, selectedCategory]);

  const fetchDishes = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_API}/dishes/my-dishes`
      );
      setDishes(response.data.dishes);
    } catch (error) {
      console.error("Error fetching dishes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterDishes = () => {
    let filtered = dishes;

    if (searchTerm) {
      filtered = filtered.filter((dish) =>
        dish.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((dish) => dish.category === selectedCategory);
    }

    setFilteredDishes(filtered);
  };

  const handleAddDish = () => {
    setEditingDish(null);
    setModalOpen(true);
  };

  const handleEditDish = (dish) => {
    setEditingDish(dish);
    setModalOpen(true);
  };

  const handleDeleteDish = async (dishId) => {
    if (window.confirm("Are you sure you want to delete this dish?")) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_API}/dishes/${dishId}`
        );
        setDishes(dishes.filter((dish) => dish._id !== dishId));
      } catch (error) {
        console.error("Error deleting dish:", error);
      }
    }
  };

  const handleSaveDish = (savedDish) => {
    if (editingDish) {
      setDishes(
        dishes.map((dish) => (dish._id === savedDish._id ? savedDish : dish))
      );
    } else {
      setDishes([...dishes, savedDish]);
    }
  };

  const categories = ["all", ...new Set(dishes.map((dish) => dish.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dishes</h1>
          <p className="text-gray-600">Manage your restaurant's menu items</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddDish}
          className="btn-primary flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Dish
        </motion.button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input w-full"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDishes.map((dish) => (
          <DishCard
            key={dish._id}
            dish={dish}
            onEdit={handleEditDish}
            onDelete={handleDeleteDish}
          />
        ))}
      </div>

      {filteredDishes.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {dishes.length === 0
              ? "No dishes added yet"
              : "No dishes match your search"}
          </p>
          {dishes.length === 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddDish}
              className="btn-primary mt-4"
            >
              Add Your First Dish
            </motion.button>
          )}
        </div>
      )}

      <DishModal
        dish={editingDish}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveDish}
      />
    </div>
  );
};

export default Dishes;
