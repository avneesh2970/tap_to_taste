"use client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import Home from "./pages/Home";

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-warm-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu/:restaurantId" element={<Menu />} />
            <Route path="/checkout/:restaurantId" element={<Checkout />} />
            <Route path="/order/:orderId" element={<OrderTracking />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
