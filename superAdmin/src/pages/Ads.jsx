"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  LoaderCircle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const Ads = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    buttonText: "Learn More",
    link: "",
    features: "",
    gradient: "from-blue-500 to-purple-600",
    icon: "🚀",
    priority: 0,
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const gradientOptions = [
    {
      value: "from-blue-500 to-purple-600",
      label: "Blue to Purple",
      preview: "bg-gradient-to-r from-blue-500 to-purple-600",
    },
    {
      value: "from-emerald-500 to-teal-600",
      label: "Emerald to Teal",
      preview: "bg-gradient-to-r from-emerald-500 to-teal-600",
    },
    {
      value: "from-orange-500 to-red-600",
      label: "Orange to Red",
      preview: "bg-gradient-to-r from-orange-500 to-red-600",
    },
    {
      value: "from-purple-500 to-indigo-600",
      label: "Purple to Indigo",
      preview: "bg-gradient-to-r from-purple-500 to-indigo-600",
    },
    {
      value: "from-pink-500 to-rose-600",
      label: "Pink to Rose",
      preview: "bg-gradient-to-r from-pink-500 to-rose-600",
    },
    {
      value: "from-cyan-500 to-blue-600",
      label: "Cyan to Blue",
      preview: "bg-gradient-to-r from-cyan-500 to-blue-600",
    },
  ];

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/ads/manage`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("superadmin_token")}`,
          },
        }
      );
      const data = await response.json();
      setAds(data.ads || []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch ads");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      submitData.append(key, formData[key]);
    });

    if (imageFile) {
      submitData.append("image", imageFile);
    }

    try {
      const url = editingAd
        ? `${import.meta.env.VITE_BACKEND_API}/ads/${editingAd._id}`
        : `${import.meta.env.VITE_BACKEND_API}/ads`;
      setBtnLoading(true);
      const response = await fetch(url, {
        method: editingAd ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("superadmin_token")}`,
        },
        body: submitData,
      });

      if (response.ok) {
        toast.success(
          editingAd ? "Ad updated successfully" : "Ad created successfully"
        );
        setShowModal(false);
        resetForm();
        fetchAds();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to save ad");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to save ad");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/ads/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("superadmin_token")}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Ad deleted successfully");
        fetchAds();
      } else {
        toast.error("Failed to delete ad");
      }
    } catch (error) {
      console.log("error: ", error);
      toast.error("Failed to delete ad");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      buttonText: "Learn More",
      link: "",
      features: "",
      gradient: "from-blue-500 to-purple-600",
      icon: "🚀",
      priority: 0,
      isActive: true,
    });
    setImageFile(null);
    setImagePreview("");
    setEditingAd(null);
  };

  const openEditModal = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description,
      buttonText: ad.buttonText,
      link: ad.link,
      features: ad.features.join(", "),
      gradient: ad.gradient,
      icon: ad.icon,
      priority: ad.priority,
      isActive: ad.isActive,
    });
    setImagePreview(ad.image);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ad Management</h1>
          <p className="text-gray-600">
            Manage banner ads shown to free plan users
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Create Ad</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map((ad) => (
          <div
            key={ad._id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className={`h-32 bg-gradient-to-r ${ad.gradient} relative`}>
              <img
                src={ad.image || "/placeholder.svg"}
                alt={ad.title}
                className="w-full h-full object-cover mix-blend-overlay"
              />
              <div className="absolute top-2 right-2 flex space-x-1">
                {ad.isActive ? (
                  <Eye className="w-4 h-4 text-white" />
                ) : (
                  <EyeOff className="w-4 h-4 text-white/60" />
                )}
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{ad.icon}</span>
                <h3 className="font-semibold text-gray-900 truncate">
                  {ad.title}
                </h3>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {ad.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-3">
                {ad.features.slice(0, 2).map((feature, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                  >
                    {feature}
                  </span>
                ))}
                {ad.features.length > 2 && (
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    +{ad.features.length - 2} more
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    ad.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {ad.isActive ? "Active" : "Inactive"}
                </span>

                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(ad)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ad._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingAd ? "Edit Ad" : "Create New Ad"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={formData.buttonText}
                      onChange={(e) =>
                        setFormData({ ...formData, buttonText: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Features (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.features}
                    onChange={(e) =>
                      setFormData({ ...formData, features: e.target.value })
                    }
                    placeholder="No Setup Fees, 24/7 Support, Real-time Analytics"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icon
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) =>
                        setFormData({ ...formData, icon: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <input
                      type="number"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: Number.parseInt(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.isActive}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isActive: e.target.value === "true",
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gradient
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {gradientOptions.map((option) => (
                      <label key={option.value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="gradient"
                          value={option.value}
                          checked={formData.gradient === option.value}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              gradient: e.target.value,
                            })
                          }
                          className="sr-only"
                        />
                        <div
                          className={`h-8 rounded-lg ${
                            option.preview
                          } border-2 ${
                            formData.gradient === option.value
                              ? "border-blue-500"
                              : "border-gray-200"
                          }`}
                        ></div>
                        <span className="text-xs text-gray-600 mt-1 block">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad Image *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview("");
                            setImageFile(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-2">
                          <label className="cursor-pointer">
                            <span className="text-blue-600 hover:text-blue-500">
                              Upload an image
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="sr-only"
                              required={!editingAd}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, WEBP up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={btnLoading}
                    className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 ${
                      btnLoading
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {btnLoading ? (
                      <>
                        <LoaderCircle className="h-5 w-5 animate-spin text-white" />
                        <span>Processing...</span>
                      </>
                    ) : editingAd ? (
                      "Update Ad"
                    ) : (
                      "Create Ad"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ads;
