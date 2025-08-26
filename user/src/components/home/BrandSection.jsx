import React from "react";

export default function BrandSection() {
  const logos = [
    "https://cdn.worldvectorlogo.com/logos/zomato-2.svg",
    "https://cdn.worldvectorlogo.com/logos/swiggy-1.svg",
    "https://cdn.worldvectorlogo.com/logos/dominos-pizza-1.svg",
    "https://cdn.worldvectorlogo.com/logos/kfc-2.svg",
    "https://cdn.worldvectorlogo.com/logos/burger-king-4.svg",
    "https://cdn.worldvectorlogo.com/logos/pizza-hut-2.svg",
    "https://cdn.worldvectorlogo.com/logos/starbucks-coffee.svg",
    "https://cdn.worldvectorlogo.com/logos/subway-1.svg",
    "https://cdn.worldvectorlogo.com/logos/burger-king-4.svg",
    "https://cdn.worldvectorlogo.com/logos/starbucks-coffee.svg",
    "https://cdn.worldvectorlogo.com/logos/dunkin-donuts.svg",
  ];

  return (
    <div className="text-center px-6 py-16 bg-[#fffef5]">
      <p className="text-sm text-gray-500">
        {"{ Smart Contactless Solutions }"}
      </p>
      <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold mt-5">
        Helping Restaurants, Bars and Cafe’s Worldwide go Contactless with
        Confidence
      </h2>

      <div className="overflow-hidden mt-10 relative w-full">
        <div className="flex animate-marquee gap-8 sm:gap-12 lg:gap-16 px-4 sm:px-6 lg:px-10">
          {[...logos, ...logos].map((logo, i) => (
            <img
              key={i}
              src={logo}
              alt="brand"
              className="h-6 sm:h-8 md:h-10 lg:h-12 w-auto grayscale hover:grayscale-0 transition duration-300"
            />
          ))}
        </div>
      </div>
      <style>{`
       @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-100%); }
       }
        .animate-marquee {
         animation: marquee 20s linear infinite;
         display: flex;
         width: fit-content;
        } 
    `}</style>
    </div>
  );
}
