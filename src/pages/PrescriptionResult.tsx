import { useAppContext } from '@/context/AppContext';
import Header from '@/components/layout/Header';
import FloatingChatButton from '@/components/layout/FloatingChatButton';
import { ArrowLeft, MapPin, Pill, AlertTriangle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function PrescriptionResult() {
  const navigate = useNavigate();
  const { prescriptionData, setUploadedImage, setPrescriptionData } = useAppContext();

  const handleBack = () => {
    setUploadedImage(null);
    setPrescriptionData(null);
    navigate('/');
  };

  if (!prescriptionData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground mb-4">No prescription data found</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 md:py-10">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-primary font-medium mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          वापस जाएं / Go Back
        </button>

        {/* Result Card */}
        <div className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-6 md:p-8">
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
              📋 प्रिस्क्रिप्शन विवरण
            </h1>
            <p className="text-primary-foreground/80">Prescription Details</p>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Doctor Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <p className="text-blue-900 font-medium">
                डॉक्टर / Doctor: <span className="font-bold">{prescriptionData.doctorName}</span>
              </p>
              <p className="text-blue-800">तारीख / Date: {prescriptionData.date}</p>
            </div>

            {/* Medications */}
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Pill className="w-6 h-6 text-primary" />
                दवाएं / Medicines
              </h2>
              <div className="space-y-4">
                {prescriptionData.medications.map((med, idx) => (
                  <div
                    key={idx}
                    className="bg-secondary/30 border border-primary/20 rounded-2xl p-4"
                  >
                    <h3 className="font-bold text-lg text-primary mb-2">
                      💊 {idx + 1}. {med.name}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-foreground">
                        <span className="font-medium">खुराक / Dosage:</span> {med.dosage}
                      </p>
                      <p className="text-foreground">
                        <span className="font-medium">अवधि / Duration:</span> {med.duration}
                      </p>
                      <p className="text-foreground">
                        <span className="font-medium">उपयोग / Purpose:</span> {med.purpose}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                महत्वपूर्ण निर्देश / Important Instructions
              </h3>
              <p className="text-amber-800 whitespace-pre-wrap">
                {prescriptionData.instructions}
              </p>
            </div>

            {/* Clinical Safety Disclaimer */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  चिकित्सीय चेतावनी / Clinical Safety Warning:
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  यह विवरण स्वचालित OCR द्वारा पढ़ा गया है। दवा की खुराक, अवधि या विकल्प बदलने से पहले हमेशा अपने डॉक्टर या फार्मासिस्ट से पुष्टि करें।
                  <br />
                  <em>Always confirm dosage and medicines with your doctor or pharmacist before consumption.</em>
                </p>
              </div>
            </div>

            {/* Find Stores Button */}
            <Link to="/nearby-stores">
              <Button className="w-full gradient-hero rounded-2xl h-14 text-lg">
                <MapPin className="w-5 h-5 mr-2" />
                पास की दवा दुकान खोजें / Find Nearby Medical Stores
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <FloatingChatButton />
    </div>
  );
}
