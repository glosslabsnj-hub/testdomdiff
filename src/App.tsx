import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { WardenChat } from "@/components/warden";
import CartDrawer from "@/components/shop/CartDrawer";
import Index from "./pages/Index";
import About from "./pages/About";
import Programs from "./pages/Programs";
import Membership from "./pages/programs/Membership";
import Transformation from "./pages/programs/Transformation";
import Coaching from "./pages/programs/Coaching";
import Checkout from "./pages/Checkout";
import Intake from "./pages/Intake";
import IntakeComplete from "./pages/IntakeComplete";
import BookCall from "./pages/BookCall";
import Login from "./pages/Login";
import AccessExpired from "./pages/AccessExpired";
import Dashboard from "./pages/dashboard/Dashboard";
import StartHere from "./pages/dashboard/StartHere";
import Workouts from "./pages/dashboard/Workouts";
import WorkoutTemplate from "./pages/dashboard/WorkoutTemplate";
import Program from "./pages/dashboard/Program";
import Discipline from "./pages/dashboard/Discipline";
import Nutrition from "./pages/dashboard/Nutrition";
import CheckIn from "./pages/dashboard/CheckIn";
import Faith from "./pages/dashboard/Faith";
import Progress from "./pages/dashboard/Progress";
import PhotoGallery from "./pages/dashboard/PhotoGallery";
import Community from "./pages/dashboard/Community";
import CoachingPortal from "./pages/dashboard/CoachingPortal";
import BookPOCheckin from "./pages/dashboard/BookPOCheckin";
import SkillBuilding from "./pages/dashboard/SkillBuilding";
import AdvancedSkills from "./pages/dashboard/AdvancedSkills";
import DirectMessages from "./pages/dashboard/DirectMessages";
import Settings from "./pages/dashboard/Settings";
import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";
import Refund from "./pages/legal/Refund";
import Disclaimer from "./pages/legal/Disclaimer";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/shop/ProductDetail";
import ShopCheckout from "./pages/shop/Checkout";
import OrderConfirmation from "./pages/shop/OrderConfirmation";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Vignette overlay for cell block atmosphere */}
      <div className="vignette-overlay" aria-hidden="true" />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/programs/membership" element={<Membership />} />
              <Route path="/programs/transformation" element={<Transformation />} />
              <Route path="/programs/coaching" element={<Coaching />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/book-call" element={<BookCall />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/access-expired" element={<AccessExpired />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/refund" element={<Refund />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/:productId" element={<ProductDetail />} />
              <Route path="/shop/checkout" element={<ShopCheckout />} />
              <Route path="/shop/confirmation" element={<OrderConfirmation />} />

            {/* Intake - requires auth but not completed intake */}
            <Route
              path="/intake"
              element={
                <ProtectedRoute requireIntake={false}>
                  <Intake />
                </ProtectedRoute>
              }
            />
            <Route
              path="/intake-complete"
              element={
                <ProtectedRoute requireIntake={false}>
                  <IntakeComplete />
                </ProtectedRoute>
              }
            />

            {/* Protected dashboard routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/start-here"
              element={
                <ProtectedRoute>
                  <StartHere />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/workouts"
              element={
                <ProtectedRoute>
                  <Workouts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/workouts/:templateId"
              element={
                <ProtectedRoute>
                  <WorkoutTemplate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/program"
              element={
                <ProtectedRoute>
                  <Program />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/discipline"
              element={
                <ProtectedRoute>
                  <Discipline />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/nutrition"
              element={
                <ProtectedRoute>
                  <Nutrition />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/check-in"
              element={
                <ProtectedRoute>
                  <CheckIn />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/faith"
              element={
                <ProtectedRoute>
                  <Faith />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/progress"
              element={
                <ProtectedRoute>
                  <Progress />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/photos"
              element={
                <ProtectedRoute>
                  <PhotoGallery />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/community"
              element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/coaching"
              element={
                <ProtectedRoute>
                  <CoachingPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/book-po-checkin"
              element={
                <ProtectedRoute>
                  <BookPOCheckin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/skills"
              element={
                <ProtectedRoute>
                  <SkillBuilding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/advanced-skills"
              element={
                <ProtectedRoute>
                  <AdvancedSkills />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/messages"
              element={
                <ProtectedRoute>
                  <DirectMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireIntake={false}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

              <Route path="*" element={<NotFound />} />
            </Routes>
            <CartDrawer />
            {/* ChatWidget for public visitors, WardenChat for logged-in users */}
            <ChatWidget />
            <WardenChat />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
