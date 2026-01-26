import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTransition from "@/components/PageTransition";

// Public pages
import Index from "@/pages/Index";
import About from "@/pages/About";
import Programs from "@/pages/Programs";
import Membership from "@/pages/programs/Membership";
import Transformation from "@/pages/programs/Transformation";
import Coaching from "@/pages/programs/Coaching";
import Checkout from "@/pages/Checkout";
import Intake from "@/pages/Intake";
import IntakeComplete from "@/pages/IntakeComplete";
import Onboarding from "@/pages/Onboarding";
import BookCall from "@/pages/BookCall";
import Login from "@/pages/Login";
import AccessExpired from "@/pages/AccessExpired";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

// Dashboard pages
import Dashboard from "@/pages/dashboard/Dashboard";
import StartHere from "@/pages/dashboard/StartHere";
import Workouts from "@/pages/dashboard/Workouts";
import WorkoutTemplate from "@/pages/dashboard/WorkoutTemplate";
import Program from "@/pages/dashboard/Program";
import Discipline from "@/pages/dashboard/Discipline";
import Nutrition from "@/pages/dashboard/Nutrition";
import CheckIn from "@/pages/dashboard/CheckIn";
import Faith from "@/pages/dashboard/Faith";
import Progress from "@/pages/dashboard/Progress";
import PhotoGallery from "@/pages/dashboard/PhotoGallery";
import Community from "@/pages/dashboard/Community";
import CoachingPortal from "@/pages/dashboard/CoachingPortal";
import BookPOCheckin from "@/pages/dashboard/BookPOCheckin";
import SkillBuilding from "@/pages/dashboard/SkillBuilding";
import AdvancedSkills from "@/pages/dashboard/AdvancedSkills";
import DirectMessages from "@/pages/dashboard/DirectMessages";
import Settings from "@/pages/dashboard/Settings";
import Help from "@/pages/dashboard/Help";
import CustomProgram from "@/pages/dashboard/CustomProgram";

// Legal pages
import Terms from "@/pages/legal/Terms";
import Privacy from "@/pages/legal/Privacy";
import Refund from "@/pages/legal/Refund";
import Disclaimer from "@/pages/legal/Disclaimer";

// Shop pages
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/shop/ProductDetail";
import ShopCheckout from "@/pages/shop/Checkout";
import OrderConfirmation from "@/pages/shop/OrderConfirmation";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AuditReport from "@/pages/admin/AuditReport";
import NotFound from "@/pages/NotFound";

export function AnimatedRoutes() {
  const location = useLocation();

  return (
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

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireIntake={false}>
              <PageTransition><AdminDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit"
          element={
            <ProtectedRoute requireIntake={false}>
              <PageTransition><AuditReport /></PageTransition>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default AnimatedRoutes;
