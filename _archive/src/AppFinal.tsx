import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

// Import all pages
import IndexWorking from "./pages/IndexWorking";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Onboarding */}
            <Route path="/onboarding" element={<UserOnboarding />} />
            
            {/* Main Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Original Pages */}
            <Route path="/" element={<IndexWorking />} />
            <Route path="/services" element={<Services />} />
            <Route path="/service/:serviceId" element={<ServiceDetail />} />
            <Route path="/nearby-stores" element={<NearbyStores />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/health-tips" element={<HealthTips />} />
            <Route path="/govt-schemes" element={<GovtSchemes />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/health-tools" element={<HealthTools />} />
            <Route path="/prescription-result" element={<PrescriptionResult />} />
            
            {/* New Enhanced Features */}
            <Route path="/health-monitor" element={<AdvancedHealthMonitor />} />
            <Route path="/symptom-checker" element={<SymptomChecker2 />} />
            <Route path="/emergency-contacts" element={<EmergencyContacts />} />
            <Route path="/medical-id" element={<MedicalID />} />
            <Route path="/achievements" element={<AchievementSystem />} />
            <Route path="/family-health" element={<FamilyHealthDashboard />} />
            <Route path="/wearable-devices" element={<WearableIntegration />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
