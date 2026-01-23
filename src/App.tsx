import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";
import Refund from "./pages/legal/Refund";
import Disclaimer from "./pages/legal/Disclaimer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/programs/membership" element={<Membership />} />
          <Route path="/programs/transformation" element={<Transformation />} />
          <Route path="/programs/coaching" element={<Coaching />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/intake" element={<Intake />} />
          <Route path="/intake-complete" element={<IntakeComplete />} />
          <Route path="/book-call" element={<BookCall />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/start-here" element={<StartHere />} />
          <Route path="/dashboard/workouts" element={<Workouts />} />
          <Route path="/dashboard/workouts/:templateId" element={<WorkoutTemplate />} />
          <Route path="/dashboard/program" element={<Program />} />
          <Route path="/dashboard/discipline" element={<Discipline />} />
          <Route path="/dashboard/nutrition" element={<Nutrition />} />
          <Route path="/dashboard/check-in" element={<CheckIn />} />
          <Route path="/dashboard/faith" element={<Faith />} />
          <Route path="/dashboard/progress" element={<Progress />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
