"use client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useSearchParams,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Restaurant from "./pages/Restaurant";
import Dishes from "./pages/Dishes";
import Orders from "./pages/Orders";
import Analytics from "./pages/Analytics";
import Layout from "./components/Layout";
import Plans from "./pages/Plans";
import AccessControl from "./pages/AccessControl";
import StaffPasswordSetup from "./pages/StaffPasswordSetup";
import Billing from "./pages/Billing";

/* ---------------- ProtectedRoute ---------------- */
function ProtectedRoute({ children, allowedRoles, requiredTab }) {
  const { isAuthenticated, loading, user, userPermissions } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  console.log("role: ", user.role);
  console.log("requiredTab: ", requiredTab);
  console.log("userPermissions: ", userPermissions);
  // Staff permission-based access
  if (user?.role === "staff" && requiredTab) {
    const hasPermission = userPermissions?.some(
      (p) => p.tabName === requiredTab && p.hasAccess
    );
    console.log("hasPermission: ", hasPermission);
    if (!hasPermission) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

/* ---------------- SetupPasswordRoute ---------------- */
function SetupPasswordRoute() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  return email ? <StaffPasswordSetup /> : <Navigate to="/login" />;
}

/* ---------------- App ---------------- */
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/setup-password" element={<SetupPasswordRoute />} />

            {/* Protected routes with layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={
                  <ProtectedRoute
                    allowedRoles={["admin", "staff"]}
                    requiredTab="Dashboard"
                  >
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="restaurant"
                element={
                  <ProtectedRoute
                    allowedRoles={["admin", "staff"]}
                    requiredTab="Restaurant"
                  >
                    <Restaurant />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dishes"
                element={
                  <ProtectedRoute
                    allowedRoles={["admin", "staff"]}
                    requiredTab="Dishes"
                  >
                    <Dishes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders"
                element={
                  <ProtectedRoute
                    allowedRoles={["admin", "staff"]}
                    requiredTab="Orders"
                  >
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="analytics"
                element={
                  <ProtectedRoute
                    allowedRoles={["admin", "staff"]}
                    requiredTab="Analytics"
                  >
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="plan"
                element={
                  <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                    <Plans />
                  </ProtectedRoute>
                }
              />
              <Route
                path="access"
                element={
                  <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                    <AccessControl />
                  </ProtectedRoute>
                }
              />
              <Route
                path="billing"
                element={
                  <ProtectedRoute allowedRoles={["admin", "staff"]}>
                    <Billing />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
