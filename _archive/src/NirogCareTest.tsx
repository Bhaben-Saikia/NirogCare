import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowRight, Shield, Clock, Users, Sparkles, Zap, Phone, MapPin, Activity } from 'lucide-react';

// Test homepage first
function TestHomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl">NirogCare</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold mb-6">
          Your Complete <span className="text-primary">Healthcare</span> Platform
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Find nearby pharmacies, track your health, get AI-powered insights.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="text-lg px-8">
            Get Started
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8">
            Find Pharmacy
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Medical ID and emergency contacts always accessible
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get personalized health recommendations
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Family Health</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Manage health for your entire family
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<TestHomePage />} />
      <Route path="*" element={<TestHomePage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
