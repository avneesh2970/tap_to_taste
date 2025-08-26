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
import Dashboard from "./pages/Dashboard";
import Admins from "./pages/Admins";
import Restaurants from "./pages/Restaurants";
import Orders from "./pages/Orders";
import Analytics from "./pages/Analytics";
import Layout from "./components/Layout";
import Ads from "./pages/Ads";
import Submissions from "./pages/Submissions";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth(); // Added loading state

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-dark-900">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/admins" element={<Admins />} />
                      <Route path="/restaurants" element={<Restaurants />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/ads" element={<Ads />} />
                      <Route path="/submissions" element={<Submissions />} />
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
