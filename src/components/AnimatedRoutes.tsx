import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTransition from "@/components/PageTransition";
import { Loader2 } from "lucide-react";

// Lazy loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

// Public pages — lazy loaded
const Index = lazy(() => import("@/pages/Index"));
const About = lazy(() => import("@/pages/About"));
const Programs = lazy(() => import("@/pages/Programs"));
const Membership = lazy(() => import("@/pages/programs/Membership"));
const Transformation = lazy(() => import("@/pages/programs/Transformation"));
const Coaching = lazy(() => import("@/pages/programs/Coaching"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const CheckoutSuccess = lazy(() => import("@/pages/CheckoutSuccess"));
const Intake = lazy(() => import("@/pages/Intake"));
const IntakeComplete = lazy(() => import("@/pages/IntakeComplete"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const BookCall = lazy(() => import("@/pages/BookCall"));
const Login = lazy(() => import("@/pages/Login"));
const AccessExpired = lazy(() => import("@/pages/AccessExpired"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const FreeWorldIntake = lazy(() => import("@/pages/FreeWorldIntake"));

// Dashboard pages — lazy loaded
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const StartHere = lazy(() => import("@/pages/dashboard/StartHere"));
const Workouts = lazy(() => import("@/pages/dashboard/Workouts"));
const WorkoutTemplate = lazy(() => import("@/pages/dashboard/WorkoutTemplate"));
const Program = lazy(() => import("@/pages/dashboard/Program"));
const Discipline = lazy(() => import("@/pages/dashboard/Discipline"));
const Nutrition = lazy(() => import("@/pages/dashboard/Nutrition"));
const CheckIn = lazy(() => import("@/pages/dashboard/CheckIn"));
const Faith = lazy(() => import("@/pages/dashboard/Faith"));
const Progress = lazy(() => import("@/pages/dashboard/Progress"));
const PhotoGallery = lazy(() => import("@/pages/dashboard/PhotoGallery"));
const Community = lazy(() => import("@/pages/dashboard/Community"));
const CoachingPortal = lazy(() => import("@/pages/dashboard/CoachingPortal"));
const BookPOCheckin = lazy(() => import("@/pages/dashboard/BookPOCheckin"));
const SkillBuilding = lazy(() => import("@/pages/dashboard/SkillBuilding"));
const AdvancedSkills = lazy(() => import("@/pages/dashboard/AdvancedSkills"));
const DirectMessages = lazy(() => import("@/pages/dashboard/DirectMessages"));
const Settings = lazy(() => import("@/pages/dashboard/Settings"));
const Help = lazy(() => import("@/pages/dashboard/Help"));
const CustomProgram = lazy(() => import("@/pages/dashboard/CustomProgram"));

// Legal pages — lazy loaded
const Terms = lazy(() => import("@/pages/legal/Terms"));
const Privacy = lazy(() => import("@/pages/legal/Privacy"));
const Refund = lazy(() => import("@/pages/legal/Refund"));
const Disclaimer = lazy(() => import("@/pages/legal/Disclaimer"));

// Shop pages — lazy loaded
const Shop = lazy(() => import("@/pages/Shop"));
const ProductDetail = lazy(() => import("@/pages/shop/ProductDetail"));
const ShopCheckout = lazy(() => import("@/pages/shop/Checkout"));
const OrderConfirmation = lazy(() => import("@/pages/shop/OrderConfirmation"));

// Admin pages — lazy loaded
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AuditReport = lazy(() => import("@/pages/admin/AuditReport"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/programs" element={<PageTransition><Programs /></PageTransition>} />
          <Route path="/programs/membership" element={<PageTransition><Membership /></PageTransition>} />
          <Route path="/programs/transformation" element={<PageTransition><Transformation /></PageTransition>} />
          <Route path="/programs/coaching" element={<PageTransition><Coaching /></PageTransition>} />
          <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
          <Route path="/checkout/success" element={<PageTransition><CheckoutSuccess /></PageTransition>} />
          <Route path="/book-call" element={<PageTransition><BookCall /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
          <Route path="/access-expired" element={<PageTransition><AccessExpired /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
          <Route path="/refund" element={<PageTransition><Refund /></PageTransition>} />
          <Route path="/disclaimer" element={<PageTransition><Disclaimer /></PageTransition>} />
          <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
          <Route path="/shop/:productId" element={<PageTransition><ProductDetail /></PageTransition>} />
          <Route path="/shop/checkout" element={<PageTransition><ShopCheckout /></PageTransition>} />
          <Route path="/shop/confirmation" element={<PageTransition><OrderConfirmation /></PageTransition>} />

          {/* Intake - requires auth but not completed intake */}
          <Route
            path="/intake"
            element={
              <ProtectedRoute requireIntake={false}>
                <PageTransition><Intake /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/intake-complete"
            element={
              <ProtectedRoute requireIntake={false}>
                <PageTransition><IntakeComplete /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireIntake={false}>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freeworld-intake"
            element={
              <ProtectedRoute requireIntake={false}>
                <FreeWorldIntake />
              </ProtectedRoute>
            }
          />

          {/* Protected dashboard routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PageTransition><Dashboard /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/start-here"
            element={
              <ProtectedRoute>
                <PageTransition><StartHere /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/workouts"
            element={
              <ProtectedRoute>
                <PageTransition><Workouts /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/workouts/:templateId"
            element={
              <ProtectedRoute>
                <PageTransition><WorkoutTemplate /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/program"
            element={
              <ProtectedRoute>
                <PageTransition><Program /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/discipline"
            element={
              <ProtectedRoute>
                <PageTransition><Discipline /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/nutrition"
            element={
              <ProtectedRoute>
                <PageTransition><Nutrition /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/check-in"
            element={
              <ProtectedRoute>
                <PageTransition><CheckIn /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/faith"
            element={
              <ProtectedRoute>
                <PageTransition><Faith /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/progress"
            element={
              <ProtectedRoute>
                <PageTransition><Progress /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/photos"
            element={
              <ProtectedRoute>
                <PageTransition><PhotoGallery /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/community"
            element={
              <ProtectedRoute>
                <PageTransition><Community /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/coaching"
            element={
              <ProtectedRoute>
                <PageTransition><CoachingPortal /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/book-po-checkin"
            element={
              <ProtectedRoute>
                <PageTransition><BookPOCheckin /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/skills"
            element={
              <ProtectedRoute>
                <PageTransition><SkillBuilding /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/advanced-skills"
            element={
              <ProtectedRoute>
                <PageTransition><AdvancedSkills /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/messages"
            element={
              <ProtectedRoute>
                <PageTransition><DirectMessages /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <PageTransition><Settings /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/help"
            element={
              <ProtectedRoute>
                <PageTransition><Help /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/custom-program"
            element={
              <ProtectedRoute>
                <PageTransition><CustomProgram /></PageTransition>
              </ProtectedRoute>
            }
          />

          {/* Admin routes - require admin role */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireIntake={false} requireAdmin={true}>
                <PageTransition><AdminDashboard /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <ProtectedRoute requireIntake={false} requireAdmin={true}>
                <PageTransition><AuditReport /></PageTransition>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

export default AnimatedRoutes;
