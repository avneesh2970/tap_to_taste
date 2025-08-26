import React from "react";
import discount from "../../assets/home/discount.jpg"
import { ArrowRight, CheckCircle } from "lucide-react";

export default function Discount() {
  return (
    <div id="pricing" className="px-6 lg:px-20 py-16 bg-[#fffef5]">
      <div className="text-center mb-10">
        <p className="text-sm text-gray-500">{"{ Limited Time Offer }"}</p>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold mt-2">
          Premium Features, Limited-Time Discount
        </h2>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-10">
        <div className="w-full md:w-1/2">
          <img
            src={discount}
            alt="Limited Offer"
            className="rounded-3xl w-full max-w-md mx-auto"
          />
        </div>

        <div className="w-full md:w-1/2 max-w-lg">
          <h3 className="text-xl font-semibold mb-4">
            Start With Digital Menu Today.
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Upgrade your digital menu with powerful premium features to enhance
            service and streamline operations. Get full access at a limited-time
            discounted rate — no long-term commitment needed.
          </p>

          <ul className="space-y-3 mb-6">
            <li className="flex items-center text-sm text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" /> No credit
              card required
            </li>
            <li className="flex items-center text-sm text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Setup in 5
              minutes
            </li>
            <li className="flex items-center text-sm text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Save 20%
              instantly
            </li>
          </ul>

          <button className="inline-flex items-center gap-2 bg-yellow-400 text-black font-medium px-5 py-2 rounded-full hover:bg-yellow-500 transition">
            Upgrade to Premium <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
