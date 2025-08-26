import React from "react";
import ourMenu from "../../assets/home/ourmenu.jpg";

export default function OurWorking() {
  const steps = [
    {
      title: "Create Your Menu",
      desc: "Create and manage a sleek, mobile-friendly digital menu effortlessly — anytime, from any device.",
    },
    {
      title: "Generate QR Code",
      desc: "Create a custom QR code instantly and let customers access your digital menu with a simple scan.",
    },
    {
      title: "Start Serving Customers",
      desc: "Serve customers faster and safer with quick, contactless ordering through a simple QR code scan.",
    },
  ];
  return (
    <div id="about" className="px-6 lg:px-20 pb-16 pt- bg-[#fffef5]">
      <div className="text-center mb-10">
        <p className="text-sm text-gray-500">
          {"{ How Our Digital Menu Work }"}
        </p>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold mt-2">
          Effortless Setup, Exceptional Results
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-center">
        <div className="w-full lg:w-1/2">
          <img
            src={ourMenu}
            alt="QR Demo"
            className="w-full h-auto rounded-3xl shadow-md"
          />
        </div>

        <div className="w-full lg:w-1/2 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative pl-8 mb-10">
              <span className="text-3xl font-bold text-yellow-500">
                {index + 1}.{" "}
              </span>

              <h3 className="text-lg font-bold text-yellow-500 inline">
                {step.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
