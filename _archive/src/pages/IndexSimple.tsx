import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, ArrowRight, Shield, Clock, Users, Sparkles } from 'lucide-react';

export default function IndexSimple() {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl">NirogCare</span>
            </div>
            <nav className="hidden md:flex gap-6">
              <Link to="/services" className="text-muted-foreground hover:text-foreground">Services</Link>
              <Link to="/nearby-stores" className="text-muted-foreground hover:text-foreground">Pharmacy</Link>
              <Link to="/health-tips" className="text-muted-foreground hover:text-foreground">Tips</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Complete <span className="text-primary">Healthcare</span> Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Find nearby pharmacies, track your health, get AI-powered insights, and manage your family's wellness all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/dashboard">
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/nearby-stores">
                  Find Pharmacy <Shield className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need for Better Health</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From finding nearby medical stores to AI-powered health insights, we've got you covered.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card p-6 rounded-lg border">
              <Shield className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Emergency Ready</h3>
              <p className="text-sm text-muted-foreground">Medical ID and emergency contacts always accessible</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <Users className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Family Health</h3>
              <p className="text-sm text-muted-foreground">Manage health for your entire family</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <Sparkles className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">AI Insights</h3>
              <p className="text-sm text-muted-foreground">Get personalized health recommendations</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <Clock className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">24/7 Access</h3>
              <p className="text-sm text-muted-foreground">Healthcare assistance whenever you need it</p>
            </div>
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
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/nearby-stores">
                <Shield className="w-6 h-6 mb-2" />
                Find Pharmacy
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/symptom-checker">
                <Sparkles className="w-6 h-6 mb-2" />
                Check Symptoms
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/dashboard">
                <Users className="w-6 h-6 mb-2" />
                Health Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
