import React, { useState } from "react";
import discount from "../../assets/home/discount.jpg";
import { Check, X, ArrowRight, CheckCircle } from "lucide-react";

export default function Discount() {
  const [isYearly, setIsYearly] = useState(false);
  const plans = [
    {
      name: "Free",
      monthlyPrice: "₹0",
      yearlyPrice: "₹0",
      period: isYearly ? "/year" : "/month",
      subtitle: "Simple, Smart Start",
      features: [
        { name: "Mobile-Friendly QR Code Access", included: true },
        // { name: "Unlimited Menu Edits", included: true },
        // { name: "Category & Item Management", included: true },
        // { name: "Basic Menu Customization", included: true },
        // { name: "Simple Menu Builder Tools", included: true },
        { name: "Real-Time Menu Updates", included: true },
        { name: "Basic Usage Analytics", included: true },
        { name: "Multilingual Menu Support", included: false },
        { name: "Full White-Label Branding", included: false },
      ],
      buttonText: "Get Started",
      popular: false,
    },
    {
      name: "Premium",
      monthlyPrice: "₹199",
      yearlyPrice: "₹1,990",
      period: isYearly ? "/year" : "/month",
      subtitle: "Premium Tools, Full Access",
      features: [
        { name: "POS System Integration", included: true },
        { name: "Unlimited Menu Edits", included: true },
        // { name: "Advanced Staff Permissions", included: true },
        // { name: "Customer Feedback Collection", included: true },
        // { name: "Full White-Label Branding", included: true },
        // { name: "Basic Usage Analytics", included: true },
        { name: "Daily Sales Reports", included: true },
        { name: "Dedicated Account Manager", included: true },
        { name: "Advanced Analytics & Guest insights", included: true },
      ],
      buttonText: "Get Started",
      popular: true,
    },
  ];
  return (
    <div id="pricing" className="px-6 lg:px-20 pb-16">
      <div className="min-h-screen py-8 px-4 sm:py-12 sm:px-6 lg:py- lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-block bg-orange-300 text-xs sm:text-sm px-3 py-1 rounded-full mb-4 font-medium">
              Pricing Plan
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
              Choose The Perfect Plan For Your Business
            </h1>

            {/* Toggle */}
            {/* <div className="flex items-center justify-center space-x-4">
            <span className={`font-medium transition-colors ${!isYearly ? 'text-gray-700' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-full"
            >
              <div className={`w-12 h-6 rounded-full shadow-inner transition-colors ${
                isYearly ? 'bg-yellow-400' : 'bg-gray-300'
              }`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  isYearly ? 'translate-x-6 translate-y-0.5' : 'translate-x-1 translate-y-0.5'
                }`}></div>
              </div>
            </button>
            <span className={`font-medium transition-colors ${isYearly ? 'text-gray-700' : 'text-gray-500'}`}>
              Yearly
            </span>
          </div> */}
            {isYearly && (
              <div className="mt-2 text-sm text-green-600 font-medium">
                Save up to 17% with yearly billing!
              </div>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  plan.popular
                    ? "border-purple-200 ring-2 ring-orange-500 ring-opacity-20"
                    : "border-gray-200 hover:border-purple-200"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-6 sm:p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                  {console.log(plan)}
                    <h3 className={`${plan.name === "Premium" ? "text-orange-500":"text-gray-900"} text-xl sm:text-2xl font-bold mb-2`}>
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                        {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-gray-600 ml-1 text-sm sm:text-base">
                        {plan.period}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {plan.subtitle}
                    </p>
                  </div>

                  {/* Get Started Button */}
                  <button
                    className={`w-full py-3 sm:py-4 px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center space-x-2 group mb-8 ${
                      plan.popular
                        ? "bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl"
                        : "bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl"
                    }`}
                    onClick={() =>
                      window.open(
                        import.meta.env.VITE_ADMIN_SIGNUP_URL,
                        "_blank"
                      )
                    }
                  >
                    <span>{plan.buttonText}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  {/* Features List */}
                  <div className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-start space-x-3"
                      >
                        <div
                          className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                            feature.included ? "bg-green-100" : "bg-red-50"
                          }`}
                        >
                          {feature.included ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <X className="w-3 h-3 text-red-400" />
                          )}
                        </div>
                        <span
                          className={`text-sm sm:text-base leading-relaxed ${
                            feature.included ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12 sm:mt-16">
            <p className="text-gray-600 text-sm sm:text-base">
              Need help choosing? Contact our sales team for personalized
              recommendations.
            </p>
          </div>
        </div>
      </div>
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

          <button
            className="inline-flex items-center gap-2 bg-orange-400 text-white font-medium px-5 py-2 rounded-full hover:bg-orange-500 transition"
            onClick={() =>
              window.open(import.meta.env.VITE_ADMIN_SIGNUP_URL, "_blank")
            }
          >
            Upgrade to Premium <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
