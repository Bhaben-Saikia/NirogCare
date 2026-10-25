import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

// Import working pages
import IndexWorking from "./pages/IndexWorking";
import Services from "./pages/Services";
import NearbyStores from "./pages/NearbyStores";
import HealthTips from "./pages/HealthTips";
import GovtSchemes from "./pages/GovtSchemes";
import Reminders from "./pages/Reminders";
import HealthTools from "./pages/HealthTools";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Import working enhanced features
import SymptomChecker2 from "./components/ai/SymptomChecker2";
import EmergencyContacts from "./components/emergency/EmergencyContacts";
import MedicalID from "./components/emergency/MedicalID";
import AchievementSystem from "./components/gamification/AchievementSystem";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Main Homepage */}
            <Route path="/" element={<IndexWorking />} />
            
            {/* Core Features */}
            <Route path="/services" element={<Services />} />
            <Route path="/nearby-stores" element={<NearbyStores />} />
            <Route path="/health-tips" element={<HealthTips />} />
            <Route path="/govt-schemes" element={<GovtSchemes />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/health-tools" element={<HealthTools />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Enhanced Features */}
            <Route path="/symptom-checker" element={<SymptomChecker2 />} />
            <Route path="/emergency-contacts" element={<EmergencyContacts />} />
            <Route path="/medical-id" element={<MedicalID />} />
            <Route path="/achievements" element={<AchievementSystem />} />
            
            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
