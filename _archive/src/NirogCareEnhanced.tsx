import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowRight, Shield, Clock, Users, Sparkles, Zap, Phone, MapPin, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import working pages
import PharmacyPage from "./pages/PharmacyPage";
import SymptomCheckerPage from "./pages/SymptomCheckerPage";
import DashboardPage from "./pages/DashboardPage";
import EmergencyPage from "./pages/EmergencyPage";


// Animated page wrapper
const AnimatedPage = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Animated Header */}
      <motion.header
        className="border-b bg-card sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Heart className="w-5 h-5 text-primary-foreground" />
              </motion.div>
              <span className="font-bold text-xl">NirogCare</span>
            </motion.div>
            <motion.nav
              className="hidden md:flex gap-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm">Services</Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm">Pharmacy</Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm">Dashboard</Button>
              </motion.div>
            </motion.nav>
          </div>
        </div>
      </motion.header>

      {/* Animated Hero Section */}
      <motion.section
        className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Animated background elements */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Badge className="mb-6" variant="secondary">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-3 h-3 mr-1" />
              </motion.div>
              AI-Powered Healthcare Platform
            </Badge>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Your Complete{" "}
            <motion.span
              className="text-primary bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Healthcare
            </motion.span>{" "}
            Platform
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Find nearby pharmacies, track your health metrics, get AI-powered insights,
            and manage your family's wellness—all in one intelligent platform.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Button
              size="lg"
              className="text-lg px-8 py-6 relative overflow-hidden group"
              onClick={() => document.getElementById('quick-actions')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"
                initial={{ x: "-100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10">
                Get Started <ArrowRight className="w-5 h-5 ml-2 inline-block" />
              </span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 group"
              onClick={() => window.location.href = '/pharmacy'}
            >
              <MapPin className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Find Pharmacy
            </Button>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {[
              { icon: Shield, text: "HIPAA Compliant" },
              { icon: Users, text: "Family Friendly" },
              { icon: Zap, text: "Real-time Insights" }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Animated Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for Better Health
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From emergency preparedness to AI-powered insights, we've got your health covered.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Emergency Ready",
                description: "Medical ID, emergency contacts, and one-tap emergency calling always accessible when you need them most.",
                color: "red"
              },
              {
                icon: Users,
                title: "Family Health",
                description: "Manage health profiles for your entire family with permission controls and coordinated care tracking.",
                color: "blue"
              },
              {
                icon: Sparkles,
                title: "AI Insights",
                description: "Get personalized health recommendations, symptom analysis, and predictive insights powered by advanced AI.",
                color: "purple"
              },
              {
                icon: Activity,
                title: "Health Tracking",
                description: "Monitor vital signs, medications, and health metrics with comprehensive tracking and trend analysis.",
                color: "green"
              },
              {
                icon: Clock,
                title: "24/7 Access",
                description: "Healthcare assistance, pharmacy finder, and emergency support available whenever you need them.",
                color: "orange"
              },
              {
                icon: Phone,
                title: "Voice Control",
                description: "Control the app with voice commands for hands-free operation and accessibility features.",
                color: "cyan"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                    <CardHeader>
                      <motion.div
                        className={`w-14 h-14 bg-${feature.color}-100 dark:bg-${feature.color}-900/20 rounded-xl flex items-center justify-center mb-4`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <feature.icon className={`w-7 h-7 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                      </motion.div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Animated Quick Actions */}
      <motion.section
        id="quick-actions"
        className="py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Quick Actions</h2>
            <p className="text-xl text-muted-foreground">Get started with our most popular features</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: MapPin, label: "Find Pharmacy", href: "/pharmacy", color: "blue" },
              { icon: Sparkles, label: "Check Symptoms", href: "/symptom-checker", color: "purple" },
              { icon: Activity, label: "Health Dashboard", href: "/dashboard", color: "green" },
              { icon: Phone, label: "Emergency", href: "/emergency", color: "red" }
            ].map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2 text-lg group relative overflow-hidden"
                  size="lg"
                  onClick={() => window.location.href = action.href}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <action.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  {action.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Animated CTA Section */}
      <motion.section
        className="py-20 bg-gradient-to-r from-primary to-purple-600 text-white relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <motion.div
          className="absolute inset-0 bg-black/20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Ready to Take Control of Your Health?
          </motion.h2>
          <motion.p
            className="text-xl mb-8 max-w-2xl mx-auto opacity-90"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Join thousands of users who trust NirogCare for their healthcare needs.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 bg-white text-primary hover:bg-gray-100"
              onClick={() => alert('🚀 Welcome to NirogCare! This would start your free onboarding process.')}
            >
              Start Free Setup
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-white text-white hover:bg-white hover:text-primary"
              onClick={() => document.getElementById('quick-actions')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Dashboard
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-6 h-6 text-primary" />
                <span className="font-bold text-xl">NirogCare</span>
              </div>
              <p className="text-muted-foreground">
                Your trusted healthcare companion for better health management.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Health Monitoring</li>
                <li>AI Symptom Checker</li>
                <li>Family Health</li>
                <li>Gamification</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Emergency</li>
                <li>Settings</li>
                <li>Health Tips</li>
                <li>Schemes</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>About Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact</li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            className="border-t pt-8 text-center text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p>&copy; 2024 NirogCare. All rights reserved. Your health, our priority.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}

const App = () => (
  <BrowserRouter>
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<AnimatedPage><HomePage /></AnimatedPage>} />
        <Route path="/pharmacy" element={<AnimatedPage><PharmacyPage /></AnimatedPage>} />
        <Route path="/symptom-checker" element={<AnimatedPage><SymptomCheckerPage /></AnimatedPage>} />
        <Route path="/dashboard" element={<AnimatedPage><DashboardPage /></AnimatedPage>} />
        <Route path="/emergency" element={<AnimatedPage><EmergencyPage /></AnimatedPage>} />
        <Route path="*" element={<AnimatedPage><HomePage /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>

  </BrowserRouter>
);

export default App;
