import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">🏥</span>
              </div>
              <h1 className="text-2xl font-bold">NirogCare</h1>
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
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4" variant="secondary">✨ AI-Powered Healthcare</Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Your Complete <span className="text-primary">Healthcare</span> Platform
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Find nearby pharmacies, track your health, get AI-powered insights, and manage your family's wellness.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8">
              Get Started →
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Find Pharmacy
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need for Better Health</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From finding nearby medical stores to AI-powered health insights, we've got you covered.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🚨</span>
                </div>
                <CardTitle>Emergency Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Medical ID and emergency contacts always accessible
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">👨‍👩‍👧‍👦</span>
                </div>
                <CardTitle>Family Health</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage health for your entire family
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <CardTitle>AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get personalized health recommendations
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">⌚</span>
                </div>
                <CardTitle>24/7 Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Healthcare assistance whenever you need it
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Quick Actions</h2>
            <p className="text-muted-foreground">Get started with our most popular features</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Button variant="outline" className="h-20 flex-col" size="lg">
              <span className="text-2xl mb-2">🏥</span>
              Find Pharmacy
            </Button>
            <Button variant="outline" className="h-20 flex-col" size="lg">
              <span className="text-2xl mb-2">🤖</span>
              Check Symptoms
            </Button>
            <Button variant="outline" className="h-20 flex-col" size="lg">
              <span className="text-2xl mb-2">📊</span>
              Health Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 NirogCare. Your trusted healthcare companion.
          </p>
        </div>
      </footer>
    </div>
  );
}

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
