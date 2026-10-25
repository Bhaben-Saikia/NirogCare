import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-primary">🏥 NirogCare</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Your Complete <span className="text-primary">Healthcare</span> Platform
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Find nearby pharmacies, track your health, get AI-powered insights.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => alert('Dashboard clicked!')}>
            Get Started →
          </Button>
          <Button size="lg" variant="outline" onClick={() => alert('Pharmacy clicked!')}>
            Find Pharmacy
          </Button>
        </div>

        <div className="mt-12 p-8 bg-muted rounded-lg">
          <h3 className="text-2xl font-bold mb-4">✅ Testing Button Component</h3>
          <p className="text-muted-foreground mb-4">
            If you can see this page with styled buttons, the Button component works!
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </div>
      </main>
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
