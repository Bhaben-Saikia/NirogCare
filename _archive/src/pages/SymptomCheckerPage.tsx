import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Sparkles, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const commonSymptoms = [
    "Headache", "Fever", "Cough", "Fatigue", "Nausea", 
    "Dizziness", "Chest Pain", "Shortness of Breath", "Body Ache"
  ];

  const handleAnalyze = () => {
    if (!symptoms.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setResults({
        urgency: "moderate",
        possibleConditions: [
          { name: "Common Cold", probability: 75 },
          { name: "Flu", probability: 45 },
          { name: "Allergies", probability: 30 }
        ],
        recommendations: [
          "Rest and stay hydrated",
          "Monitor temperature regularly",
          "Consult doctor if symptoms worsen",
          "Avoid strenuous activities"
        ],
        whenToSeeDoctor: "If fever persists for more than 3 days or symptoms worsen"
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  const addSymptom = (symptom: string) => {
    if (symptoms && !symptoms.includes(symptom)) {
      setSymptoms(symptoms + ", " + symptom);
    } else if (!symptoms) {
      setSymptoms(symptom);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500';
      case 'moderate': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold">AI Symptom Checker</h1>
              </div>
            </div>
            <Badge variant="secondary">
              AI-Powered Analysis
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {!results ? (
              <div className="space-y-8">
                {/* Input Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Describe Your Symptoms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        What symptoms are you experiencing?
                      </label>
                      <Input
                        placeholder="e.g., headache, fever, cough, fatigue..."
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-3">Common symptoms (click to add):</p>
                      <div className="flex flex-wrap gap-2">
                        {commonSymptoms.map((symptom) => (
                          <Badge
                            key={symptom}
                            variant="outline"
                            className="cursor-pointer hover:bg-accent"
                            onClick={() => addSymptom(symptom)}
                          >
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={handleAnalyze} 
                      disabled={!symptoms.trim() || isAnalyzing}
                      className="w-full"
                      size="lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing Symptoms...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Analyze with AI
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          Important Disclaimer
                        </h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          This AI symptom checker is for informational purposes only and is not a substitute 
                          for professional medical advice. Always consult with a qualified healthcare provider 
                          for medical diagnosis and treatment.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Results Section */
              <div className="space-y-6">
                {/* Urgency Level */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Analysis Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-sm font-medium">Urgency Level:</span>
                      <Badge className={`${getUrgencyColor(results.urgency)} text-white`}>
                        {results.urgency.charAt(0).toUpperCase() + results.urgency.slice(1)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Possible Conditions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Possible Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {results.possibleConditions.map((condition: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium">{condition.name}</span>
                          <Badge variant="outline">
                            {condition.probability}% match
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* When to See Doctor */}
                <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                  <CardHeader>
                    <CardTitle className="text-orange-900 dark:text-orange-100">
                      When to See a Doctor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-orange-800 dark:text-orange-200">
                      {results.whenToSeeDoctor}
                    </p>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button onClick={() => setResults(null)} variant="outline" className="flex-1">
                    Check Different Symptoms
                  </Button>
                  <Button className="flex-1">
                    Find Nearby Doctor
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
