import React from "react";
import feature1 from "../../assets/home/features/feature1.png";
import feature2 from "../../assets/home/features/feature4.png";
import feature3 from "../../assets/home/features/feature3.png";
import feature4 from "../../assets/home/features/feature4.png";
import feature5 from "../../assets/home/features/feature5.png";
import feature6 from "../../assets/home/features/feature6.png";

export default function Features() {
  const features = [
    {
      title: "Customize Your Menu",
      desc: "Easily tailor menus with item images, tags and real-time previews, ensuring smooth layout control & beautiful dishes presentation.",
      img: feature1,
    },
    {
      title: "Branded QR codes and Styling",
      desc: "Create your QR codes with custom logos, colors, and titles to boost recognition. Upload logos or brand tags for a consistent, on-brand experience.",
      img: feature2,
    },
    {
      title: "POS And Inventory Sync",
      desc: "Enjoy digital menu sync with POS & inventory systems to streamline operations. Real-time control over items & stock tracking in real-time.",
      img: feature3,
    },
    {
      title: "Secure Ordering And Integrated Payments",
      desc: "Enable fast, secure, and flexible ordering & payments — supporting cards, UPI, wallets, QR links or custom integrations.",
      img: feature4,
    },
    {
      title: "Multi-Language Support",
      desc: "Offer a seamless experience in every territory, silently adapt to each visitor in their native language and menu settings.",
      img: feature5,
    },
    {
      title: "Analytics Dashboard",
      desc: "Track performance with an intuitive analytics dashboard that helps spot-selling items, customer behavior, and sales in real-time.",
      img: feature6,
    },
  ];
  return (
    <div id="features" className="px-6 lg:px-20 py-16 bg-[#fffef5]">
      <div className="text-center mb-12">
        <p className="text-sm text-gray-500">{"{ Powerful Menu Features }"}</p>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold mt-2">
          Everything You Need to Serve Smarter and Faster.
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((item, i) => (
          <div
            key={i}
            className="bg-gradient-to-t from-[#FFF8D7] to-[#FFFEF5] rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition"
          >
            <img
              src={item.img}
              alt={item.title}
              className="w-full h-48 object-contain mb-4"
            />
            <h3 className="text-md font-semibold mb-1 text-gray-800">
              {item.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
