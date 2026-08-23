import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AIChatWidget } from "@/components/storefront/AIChatWidget";
import Index from "./pages/Index";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import OrderDetailPage from "./pages/OrderDetailPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminDiscounts from "./pages/admin/AdminDiscounts";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function RequireAuth({
  children,
  admin = false,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background" />;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <CartProvider>
            <WishlistProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route
                    path="/order-confirmation"
                    element={<OrderConfirmationPage />}
                  />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route
                    path="/forgot-password"
                    element={<ForgotPasswordPage />}
                  />
                  <Route
                    path="/profile"
                    element={
                      <RequireAuth>
                        <ProfilePage />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/orders/:id"
                    element={
                      <RequireAuth>
                        <OrderDetailPage />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <RequireAuth admin>
                        <AdminDashboard />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/admin/products"
                    element={
                      <RequireAuth admin>
                        <AdminProducts />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <RequireAuth admin>
                        <AdminOrders />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/admin/customers"
                    element={
                      <RequireAuth admin>
                        <AdminCustomers />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/admin/discounts"
                    element={
                      <RequireAuth admin>
                        <AdminDiscounts />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <RequireAuth admin>
                        <AdminAnalytics />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <RequireAuth admin>
                        <AdminSettings />
                      </RequireAuth>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <AIChatWidget />
              </BrowserRouter>
            </WishlistProvider>
          </CartProvider>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
