import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { motion, AnimatePresence } from 'framer-motion';

// Import all original pages
import Index from "./pages/Index";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import NearbyStores from "./pages/NearbyStores";
import Chat from "./pages/Chat";
import HealthTips from "./pages/HealthTips";
import GovtSchemes from "./pages/GovtSchemes";
import Reminders from "./pages/Reminders";
import HealthTools from "./pages/HealthTools";
import PrescriptionResult from "./pages/PrescriptionResult";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";

// Import enhanced features
import UserOnboarding from "./components/onboarding/UserOnboarding";
import AdvancedHealthMonitor from "./components/tools/AdvancedHealthMonitor";
import SymptomChecker2 from "./components/ai/SymptomChecker2";
import EmergencyContacts from "./components/emergency/EmergencyContacts";
import MedicalID from "./components/emergency/MedicalID";
import AchievementSystem from "./components/gamification/AchievementSystem";
import FamilyHealthDashboard from "./components/family/FamilyHealthDashboard";
import WearableIntegration from "./components/wearable/WearableIntegration";

const queryClient = new QueryClient();

// Simple page wrapper without complex animations
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen">
    {children}
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Onboarding */}
            <Route path="/onboarding" element={<PageWrapper><UserOnboarding /></PageWrapper>} />
            
            {/* Main Dashboard */}
            <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
            
            {/* Original Pages */}
            <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
            <Route path="/services" element={<PageWrapper><Services /></PageWrapper>} />
            <Route path="/service/:serviceId" element={<PageWrapper><ServiceDetail /></PageWrapper>} />
            <Route path="/nearby-stores" element={<PageWrapper><NearbyStores /></PageWrapper>} />
            <Route path="/chat" element={<PageWrapper><Chat /></PageWrapper>} />
            <Route path="/health-tips" element={<PageWrapper><HealthTips /></PageWrapper>} />
            <Route path="/govt-schemes" element={<PageWrapper><GovtSchemes /></PageWrapper>} />
            <Route path="/reminders" element={<PageWrapper><Reminders /></PageWrapper>} />
            <Route path="/health-tools" element={<PageWrapper><HealthTools /></PageWrapper>} />
            <Route path="/prescription-result" element={<PageWrapper><PrescriptionResult /></PageWrapper>} />
            
            {/* Enhanced Features */}
            <Route path="/health-monitor" element={<PageWrapper><AdvancedHealthMonitor /></PageWrapper>} />
            <Route path="/symptom-checker" element={<PageWrapper><SymptomChecker2 /></PageWrapper>} />
            <Route path="/emergency-contacts" element={<PageWrapper><EmergencyContacts /></PageWrapper>} />
            <Route path="/medical-id" element={<PageWrapper><MedicalID /></PageWrapper>} />
            <Route path="/achievements" element={<PageWrapper><AchievementSystem /></PageWrapper>} />
            <Route path="/family-health" element={<PageWrapper><FamilyHealthDashboard /></PageWrapper>} />
            <Route path="/wearable-devices" element={<PageWrapper><WearableIntegration /></PageWrapper>} />
            <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
            
            {/* Fallback */}
            <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
