"use client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth"; // Updated import path
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Restaurant from "./pages/Restaurant";
import Dishes from "./pages/Dishes";
import Orders from "./pages/Orders";
import Analytics from "./pages/Analytics";
import Layout from "./components/Layout";
import Plans from "./pages/Plans";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth(); // Added loading state

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/restaurant" element={<Restaurant />} />
                      <Route path="/dishes" element={<Dishes />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/plan" element={<Plans />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
