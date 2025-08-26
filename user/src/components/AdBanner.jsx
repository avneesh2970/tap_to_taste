"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Star } from "lucide-react";

const AdBanner = ({ restaurantId, placement = "menu" }) => {
  const [showAd, setShowAd] = useState(false);
  const [adData, setAdData] = useState(null);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [ads, setAds] = useState([]);
  useEffect(() => {
    fetchAds();
  }, [restaurantId]);

  useEffect(() => {
    if (ads.length > 0) {
      checkAdStatus();
      const rotationInterval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 20000);

      return () => clearInterval(rotationInterval);
    }
  }, [ads, restaurantId]);

  const fetchAds = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/ads`);
      const data = await response.json();

      if (data.ads && data.ads.length > 0) {
        setAds(data.ads);
      } else {
        setAds([]);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
      setAds([]);
    }
  };

  const checkAdStatus = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_API
        }/restaurants/${restaurantId}/ad-status`
      );
      const data = await response.json();
      if (!data.hasPremium && ads.length > 0) {
        setAdData(ads[currentAdIndex]);
        const delay =
          placement === "menu" ? 3000 : placement === "checkout" ? 1000 : 5000;
        setTimeout(() => setShowAd(true), delay);
      }
    } catch (error) {
      console.error("Error checking ad status:", error);
    }
  };

  const handleClose = () => {
    setShowAd(false);
    localStorage.setItem(`ad-closed-${restaurantId}-${placement}`, "true");
  };

  const handleAdClick = () => {
    window.open(adData.link, "_blank");
    console.log("Ad clicked:", adData.title, "Placement:", placement);
  };

  useEffect(() => {
    if (showAd && ads.length > 0) {
      setAdData(ads[currentAdIndex]);
    }
  }, [currentAdIndex, showAd, ads]);

  useEffect(() => {
    if (ads.length > 0) {
      checkAdStatus();
    }
  }, [ads, currentAdIndex, restaurantId]);

  // Function to convert Tailwind gradient to CSS gradient
  const convertTailwindToCSSGradient = (tailwindGradient) => {
    const colorMap = {
      'emerald-500': '#10b981',
      'teal-600': '#0d9488',
      'blue-500': '#3b82f6',
      'purple-600': '#9333ea',
      'pink-500': '#ec4899',
      'rose-600': '#e11d48',
      'orange-500': '#f97316',
      'red-600': '#dc2626',
      'indigo-500': '#6366f1',
      'cyan-500': '#06b6d4',
      'yellow-500': '#eab308',
    };

    // Parse the Tailwind gradient string
    const match = tailwindGradient.match(/from-(.+?)\s+to-(.+)/);
    if (match) {
      const fromColor = colorMap[match[1]] || '#3b82f6';
      const toColor = colorMap[match[2]] || '#9333ea';
      return `linear-gradient(135deg, ${fromColor}, ${toColor})`;
    }
    
    // Fallback gradient
    return 'linear-gradient(135deg, #3b82f6, #9333ea)';
  };

  if (!showAd || !adData || ads.length === 0) return null;

  const getAdLayout = () => {
    switch (placement) {
      case "checkout":
        return "fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80";
      case "tracking":
        return "fixed bottom-20 left-4 right-4 md:left-4 md:w-72";
      default: // menu
        return "fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96";
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{
          opacity: 0,
          y: placement === "checkout" ? -100 : 100,
          scale: 0.9,
        }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{
          opacity: 0,
          y: placement === "checkout" ? -100 : 100,
          scale: 0.9,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`${getAdLayout()} rounded-xl shadow-2xl z-50 overflow-hidden`}
        style={{
          background: convertTailwindToCSSGradient(adData.gradient)
        }}
      >
        <div className="relative p-4 md:p-6">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 md:top-3 md:right-3 text-white/80 hover:text-white transition-colors z-10"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <div className="flex items-start space-x-3 md:space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-xl flex items-center justify-center text-2xl md:text-3xl overflow-hidden">
                {adData.image &&
                adData.image !== "/placeholder.svg?height=80&width=80" ? (
                  <img
                    src={adData.image || "/placeholder.svg"}
                    alt={adData.title}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <span>{adData.icon}</span>
                )}
              </div>
            </div>

            <div className="flex-1 text-white min-w-0">
              <h3 className="font-bold text-base md:text-lg mb-1 leading-tight">
                {adData.title}
              </h3>
              <p className="text-white/90 text-xs md:text-sm mb-3 leading-relaxed">
                {adData.description}
              </p>

              {adData.features && adData.features.length > 0 && (
                <div className="flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-4">
                  {adData.features.slice(0, 3).map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-1 text-xs bg-white/20 rounded-full px-2 py-1"
                    >
                      <Star className="w-2.5 h-2.5 md:w-3 md:h-3" />
                      <span className="text-xs">{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAdClick}
                className="bg-white text-gray-800 px-3 py-2 md:px-4 md:py-2 rounded-lg font-semibold text-xs md:text-sm flex items-center space-x-2 hover:bg-gray-50 transition-colors w-full md:w-auto justify-center"
              >
                <span>{adData.buttonText}</span>
                <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
              </motion.button>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-full -translate-y-8 md:-translate-y-10 translate-x-8 md:translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-full translate-y-6 md:translate-y-8 -translate-x-6 md:-translate-x-8"></div>

          {/* {ads.length > 1 && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {ads.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    index === currentAdIndex ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          )} */}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdBanner;