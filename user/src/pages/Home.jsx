import BrandSection from "../components/home/BrandSection";
import HeroSection from "../components/home/HeroSection";
import OurWorking from "../components/home/OurWorking";
import Navbar from "../components/navbar/Navbar";
import Features from "../components/home/Features";
import Discount from "../components/home/Discount";
import TestimonialSection from "../components/home/Testimonials";
import Conatctus from "../components/home/Conatctus";
import Footer from "../components/home/Footer";
import { scroller } from "react-scroll";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Home = () => {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const target = hash.replace("#", "");
    // Let the page render first
    setTimeout(() => {
      scroller.scrollTo(target, {
        smooth: true,
        duration: 500,
        offset: -80, // same as Navbar
      });
    }, 0);
  }, [hash]);
  return (
    <div className="bg-[#fffef5] min-h-screen w-full">
      <Navbar />
      <HeroSection />
      <BrandSection />
      <OurWorking />
      <Features />
      <Discount />
      <TestimonialSection />
      <Conatctus/>
      <Footer />
    </div>
  );
};

export default Home;
