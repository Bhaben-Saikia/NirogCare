import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowRight, Shield, Clock, Users, Sparkles, Zap, Phone, MapPin, Activity } from 'lucide-react';

// Import working pages
import PharmacyPage from "./pages/PharmacyPage";
import SymptomCheckerPage from "./pages/SymptomCheckerPage";
import DashboardPage from "./pages/DashboardPage";
import EmergencyPage from "./pages/EmergencyPage";

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl">NirogCare</span>
            </div>
            <nav className="hidden md:flex gap-6">
              <Button variant="ghost" size="sm">Services</Button>
              <Button variant="ghost" size="sm">Pharmacy</Button>
              <Button variant="ghost" size="sm">Dashboard</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6" variant="secondary">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered Healthcare Platform
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            Your Complete <span className="text-primary">Healthcare</span> Platform
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Find nearby pharmacies, track your health metrics, get AI-powered insights, 
            and manage your family's wellness—all in one intelligent platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="text-lg px-8 py-6" onClick={() => {
              document.getElementById('quick-actions')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Get Started <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" onClick={() => {
              window.location.href = '/pharmacy';
            }}>
              <MapPin className="w-5 h-5 mr-2" />
              Find Pharmacy
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>Family Friendly</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span>Real-time Insights</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for Better Health
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From emergency preparedness to AI-powered insights, we've got your health covered.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-xl">Emergency Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Medical ID, emergency contacts, and one-tap emergency calling always accessible when you need them most.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">Family Health</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Manage health profiles for your entire family with permission controls and coordinated care tracking.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl">AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Get personalized health recommendations, symptom analysis, and predictive insights powered by advanced AI.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Activity className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl">Health Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Monitor vital signs, medications, and health metrics with comprehensive tracking and trend analysis.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-xl">24/7 Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Healthcare assistance, pharmacy finder, and emergency support available whenever you need them.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 bg-cyan-100 dark:bg-cyan-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Phone className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
                </div>
                <CardTitle className="text-xl">Voice Control</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Control the app with voice commands for hands-free operation and accessibility features.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section id="quick-actions" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Quick Actions</h2>
            <p className="text-xl text-muted-foreground">Get started with our most popular features</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Button variant="outline" className="h-24 flex-col gap-2 text-lg" size="lg" onClick={() => {
              window.location.href = '/pharmacy';
            }}>
              <MapPin className="w-6 h-6" />
              Find Pharmacy
            </Button>
            
            <Button variant="outline" className="h-24 flex-col gap-2 text-lg" size="lg" onClick={() => {
              window.location.href = '/symptom-checker';
            }}>
              <Sparkles className="w-6 h-6" />
              Check Symptoms
            </Button>
            
            <Button variant="outline" className="h-24 flex-col gap-2 text-lg" size="lg" onClick={() => {
              window.location.href = '/dashboard';
            }}>
              <Activity className="w-6 h-6" />
              Health Dashboard
            </Button>
            
            <Button variant="outline" className="h-24 flex-col gap-2 text-lg" size="lg" onClick={() => {
              window.location.href = '/emergency';
            }}>
              <Phone className="w-6 h-6" />
              Emergency
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of users who trust NirogCare for their healthcare needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8" onClick={() => {
              alert('🚀 Welcome to NirogCare! This would start your free onboarding process to set up your health profile.');
            }}>
              Start Free Setup
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" onClick={() => {
              document.getElementById('quick-actions')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              View Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-6 h-6 text-primary" />
                <span className="font-bold text-xl">NirogCare</span>
              </div>
              <p className="text-muted-foreground">
                Your trusted healthcare companion for better health management.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Health Monitoring</li>
                <li>AI Symptom Checker</li>
                <li>Family Health</li>
                <li>Gamification</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Emergency</li>
                <li>Settings</li>
                <li>Health Tips</li>
                <li>Schemes</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>About Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 NirogCare. All rights reserved. Your health, our priority.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pharmacy" element={<PharmacyPage />} />
      <Route path="/symptom-checker" element={<SymptomCheckerPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/emergency" element={<EmergencyPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
