import React from "react";
import { ArrowRight, Star, CheckCircle } from "lucide-react";

// eslint-disable-next-line no-unused-vars
const testimonials = Array.from({ length: 10 }).map((_, i) => ({
  name: "Evan Dorsey",
  title: "Restaurant Owner",
  image: "https://randomuser.me/api/portraits/men/45.jpg",
  review:
    "Switching to digital menus has drastically improved our efficiency. Customers love the convenience, and our staff has more time to focus on service. Highly recommend this solution to any modern restaurant.",
}));

const testimonial1 = [
  {
    name: "Ramesh Iyer",
    title: "Restaurant Owner - Spice Junction",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    review:
      "Earlier we used to struggle with taking orders during peak hours. After moving to QR code menus, customers can browse dishes on their phones and order directly. It reduced crowding at the counter and improved service speed.",
  },
  {
    name: "Priya Sharma",
    title: "Manager - Curry Tales",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    review:
      "The digital menu is a game-changer. Updating prices or adding new items used to take hours, now it's done in minutes. Our customers also find it very modern and easy to use.",
  },
  {
    name: "Amit Mehta",
    title: "Owner - Tandoori Nights",
    image: "https://randomuser.me/api/portraits/men/23.jpg",
    review:
      "We noticed a 20% increase in repeat customers after adopting QR-based ordering. People like the quick ordering and cashless payment options. It also reduced mistakes in order-taking.",
  },
  {
    name: "Neha Verma",
    title: "Restaurant Admin - Masala-e-Magic",
    image: "https://randomuser.me/api/portraits/women/29.jpg",
    review:
      "Managing orders has become so simple. The kitchen receives everything directly without confusion. Plus, customers spend more time exploring dishes since the menu looks attractive on their phones.",
  },
  {
    name: "Sandeep Singh",
    title: "Restaurant Owner - Zaika Darbar",
    image: "https://randomuser.me/api/portraits/men/50.jpg",
    review:
      "Our restaurant used to face delays in billing. With this system, customers can order and pay instantly. Billing errors have gone down and table turnover is much faster.",
  },
];

const testimonial2 = [
  {
    name: "Anjali Nair",
    title: "Manager - South Spice Villa",
    image: "https://randomuser.me/api/portraits/women/56.jpg",
    review:
      "Customers love scanning the QR and directly seeing today's specials. It saves time and gives a modern touch to the dining experience. We also got great feedback from younger customers.",
  },
  {
    name: "Rahul Deshmukh",
    title: "Owner - Urban Zaika",
    image: "https://randomuser.me/api/portraits/men/61.jpg",
    review:
      "Earlier we had to print menus again and again due to price changes. Now everything is digital and cost-effective. Staff workload is reduced, and customers feel more comfortable ordering.",
  },
  {
    name: "Sunita Agarwal",
    title: "Admin - Shahi Rasoi",
    image: "https://randomuser.me/api/portraits/women/36.jpg",
    review:
      "This system has given us transparency. Customers can see full details, ingredients, and even pictures of dishes. It creates trust and they order more confidently.",
  },
  {
    name: "Vikram Chauhan",
    title: "Owner - Punjabi Zaika",
    image: "https://randomuser.me/api/portraits/men/72.jpg",
    review:
      "We don’t need extra waiters for taking orders anymore. Staff can focus on serving food and maintaining quality. Customers enjoy the fast service, and we save on costs.",
  },
  {
    name: "Kavita Joshi",
    title: "Manager - Annapurna Thali House",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    review:
      "The best part is that our customers can pay instantly after ordering. No more long waiting for bills. Families and office groups are especially happy with the smooth process.",
  },
];

const TestimonialSection = () => {
  return (
    <div className="bg-[#fffef5] py-16">
      <div className="text-center mb-12">
        <p className="text-sm text-gray-500">
          {"{ What Our Clients Are Saying }"}
        </p>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold mt-2">
          Real Stories From Satisfied Customers
        </h2>
      </div>

      <div className="overflow-hidden space-y-8">
        {/* First Row - Right to Left */}
        <div className="w-full whitespace-nowrap animate-marquee-right">
          <div className="inline-flex gap-6">
            {[...testimonial1, ...testimonial1, ...testimonial1].map((t, i) => (
              <div
                key={`r1-${i}`}
                className="min-w-[300px] max-w-xs bg-white rounded-xl border p-6 shadow-sm"
              >
              
                 <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.title}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed text-wrap">
                  {t.review}
                </p>
                <div className="flex gap-1">
                  {Array(5)
                    .fill(0)
                    .map((_, idx) => (
                      <Star
                        key={idx}
                        className="w-4 h-4 text-yellow-400 fill-yellow-400"
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Second Row - Left to Right */}
        <div className="w-full whitespace-nowrap animate-marquee-left">
          <div className="inline-flex gap-6">
            {[...testimonial2, ...testimonial2, ...testimonial2].map((t, i) => (
              <div
                key={`r2-${i}`}
                className="min-w-[300px] max-w-xs bg-white rounded-xl border p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.title}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-4 leading-relaxed text-wrap">
                  {t.review}
                </p>
                <div className="flex gap-1">
                  {Array(5)
                    .fill(0)
                    .map((_, idx) => (
                      <Star
                        key={idx}
                        className="w-4 h-4 text-yellow-400 fill-yellow-400"
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
       {/* @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-100%); }
       }
        .animate-marquee {
         animation: marquee 20s linear infinite;
         display: flex;
         width: fit-content;
        }  */}
        
        @keyframes marquee-right {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes marquee-left {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}
.animate-marquee-right {
  animation: marquee-right 30s linear infinite;
  display: flex;
  width: fit-content;
}
.animate-marquee-left {
  animation: marquee-left 30s linear infinite;
  display: flex;
  width: fit-content;
}

    `}</style>
    </div>
  );
};

export default TestimonialSection;
