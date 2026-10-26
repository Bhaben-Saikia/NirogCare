/**
 * NirogCare - AI Prescription Scanner with Smart Automation
 * 
 * Features:
 * - AI-powered prescription analysis (Doctor, Patient, Medicines, Causes)
 * - Real nearby pharmacies with location
 * - Smart reminders linked to main Reminders page
 * - AI suggestions based on actual medicines
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Camera, Loader2, Sparkles,
  CheckCircle2, X, Pill, Clock, Info,
  MapPin, Bell, MessageCircle, AlertTriangle, Calendar, ImageIcon,
  Phone, Navigation, ChevronRight, Zap, User, Stethoscope,
  ExternalLink, ChevronDown, Edit2, Check, FileText, Shield, CheckSquare, Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { analyzePrescription } from '@/lib/aiService';
import { compressImageForOcr } from '@/lib/imageCompressor';
import { searchNearbyPharmacies, openDirections, callPharmacy, type Pharmacy } from '@/lib/placesService';
import { useReminderStore, generateReminderTimes, formatTime12Hour } from '@/stores/reminderStore';
import { toast } from 'sonner';
import { useAppContext } from '@/context/AppContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';

// Interfaces
interface MedicineInfo {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  type?: string;
  sideEffects?: string;
  usage?: string;
  confidence?: number;
  isLowConfidence?: boolean;
}

interface ScanResult {
  medicines: MedicineInfo[];
  doctorName?: string;
  patientName?: string;
  date?: string;
  notes?: string;
  rawText?: string;
  overallConfidence?: number;
  hasLowConfidenceItems?: boolean;
}

/**
 * Professional Buffering Animation - Clean loading effect
 */
const ScanningAnimation = () => {
  const [stage, setStage] = useState(0);
  const stages = [
    'Reading prescription...',
    'Extracting text...',
    'Identifying medicines...',
    'Analyzing dosages...',
    'Generating insights...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStage(prev => (prev + 1) % stages.length);
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-2xl">
      {/* Main buffering container */}
      <div className="flex flex-col items-center gap-6">

        {/* Circular buffering animation */}
        <div className="relative w-24 h-24">
          {/* Outer spinning ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-primary/20"
            style={{ borderTopColor: 'rgb(16, 185, 129)', borderRightColor: 'rgb(16, 185, 129)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />

          {/* Middle ring */}
          <motion.div
            className="absolute inset-2 rounded-full border-4 border-emerald-500/20"
            style={{ borderBottomColor: 'rgb(52, 211, 153)', borderLeftColor: 'rgb(52, 211, 153)' }}
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />

          {/* Inner pulsing circle */}
          <motion.div
            className="absolute inset-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center"
            animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>

          {/* Orbiting dots */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-lg shadow-emerald-500/50"
              style={{ top: '50%', left: '50%' }}
              animate={{
                x: [0, Math.cos((i * 90 + 45) * Math.PI / 180) * 44, 0],
                y: [0, Math.sin((i * 90 + 45) * Math.PI / 180) * 44, 0],
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>

        {/* Status text */}
        <div className="text-center">
          <motion.p
            key={stage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-white font-semibold text-lg"
          >
            {stages[stage]}
          </motion.p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-3">
            {stages.map((_, i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${i <= stage ? 'bg-emerald-400' : 'bg-white/30'
                  }`}
                animate={i === stage ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 3.5, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Generate AI suggestions based on actual medicines
 */
function generateAISuggestions(medicines: MedicineInfo[]): string[] {
  const suggestions: string[] = [];

  // Medicine-specific suggestions
  medicines.forEach(med => {
    const name = med.name;
    const type = med.type?.toLowerCase() || '';
    const usage = med.usage?.toLowerCase() || '';

    // Side effects query
    if (med.sideEffects) {
      suggestions.push(`What should I do if I experience ${med.sideEffects.split(',')[0].trim()} from ${name}?`);
    }

    // Food interactions
    if (type.includes('antibiotic')) {
      suggestions.push(`What foods should I avoid while taking ${name}?`);
      suggestions.push(`Can I drink milk with ${name}?`);
    }

    // Safe storage and general timing questions (never suggest drug substitution or dosage changes)
    suggestions.push(`How should ${name} generally be stored at home?`);

    // Usage-specific
    if (usage.includes('infection')) {
      suggestions.push(`What general rest and hydration habits help during recovery while taking ${name}?`);
    }
    if (usage.includes('fever') || usage.includes('pain')) {
      suggestions.push(`Should ${name} generally be taken with food or water as written on my prescription?`);
    }
  });

  // General suggestions
  if (medicines.length > 1) {
    suggestions.push(`What questions should I ask my doctor or pharmacist about my prescription schedule?`);
  }

  // Return unique suggestions, max 6
  return [...new Set(suggestions)].slice(0, 6);
}

export default function PrescriptionScanner() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoadingPharmacies, setIsLoadingPharmacies] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<string[]>([]);
  const [showAllPharmacies, setShowAllPharmacies] = useState(false);
  const [hasHealthConsent, setHasHealthConsent] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('nirogcare_ocr_consent');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });
  const [isVerifiedByUser, setIsVerifiedByUser] = useState(false);
  const [showRawText, setShowRawText] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setUploadedImage, t, selectedLanguage } = useAppContext();
  const { t: i18n } = useTranslation();
  const navigate = useNavigate();

  // Reminder store
  const { addMultipleReminders } = useReminderStore();

  // Load nearby pharmacies when result is ready
  useEffect(() => {
    if (scanResult && scanResult.medicines.length > 0) {
      loadNearbyPharmacies();
      setAISuggestions(generateAISuggestions(scanResult.medicines));
    }
  }, [scanResult]);

  const loadNearbyPharmacies = async () => {
    setIsLoadingPharmacies(true);
    try {
      const results = await searchNearbyPharmacies();
      setPharmacies(results);
    } catch (error) {
      console.error('Error loading pharmacies:', error);
    } finally {
      setIsLoadingPharmacies(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type.toLowerCase()) && !file.type.startsWith('image/')) {
        toast.error('Invalid file type', {
          description: 'Please upload an image (JPG, PNG, WEBP) or PDF document'
        });
        return;
      }
      try {
        const base64 = await compressImageForOcr(file);
        setSelectedImage(base64);
        setUploadedImage(base64);
        setScanResult(null);
        setIsVerifiedByUser(false);
        setPharmacies([]);
        setAISuggestions([]);
      } catch (err: any) {
        toast.error('Image processing failed', {
          description: err?.message || 'Could not process the selected image.'
        });
      }
    }
  };

  const processWithAI = async () => {
    if (!selectedImage) return;
    if (!hasHealthConsent) {
      toast.error('Consent required', {
        description: 'Please check the health data privacy consent before scanning.'
      });
      return;
    }
    try {
      localStorage.setItem('nirogcare_ocr_consent', 'true');
    } catch {
      // Ignore storage error
    }
    setIsScanning(true);

    try {
      const result = await analyzePrescription(selectedImage, selectedLanguage);

      if (result && result.medicines && result.medicines.length > 0) {
        setScanResult(result as ScanResult);
        setIsVerifiedByUser(false);
        toast.success('Prescription Analyzed!', {
          description: `Found ${result.medicines.length} medicines. Please review and confirm details before use.`,
          icon: <CheckCircle2 className="w-4 h-4 text-green-500" />
        });
      } else {
        toast.error('Could not read prescription', {
          description: 'Please try with a clearer or higher contrast image'
        });
      }

    } catch {
      toast.error('Analysis failed', {
        description: 'Please try again with a clearer image'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const updateMedicineField = (index: number, field: keyof MedicineInfo, val: string) => {
    if (!scanResult) return;
    const updated = [...scanResult.medicines];
    updated[index] = { ...updated[index], [field]: val };
    setScanResult({ ...scanResult, medicines: updated });
  };

  const clearScan = () => {
    setSelectedImage(null);
    setScanResult(null);
    setIsVerifiedByUser(false);
    setPharmacies([]);
    setAISuggestions([]);
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Add all reminders and navigate to Reminders page
  const handleAddReminders = () => {
    if (!scanResult) return;

    if (!isVerifiedByUser) {
      toast.warning('Verification required', {
        description: 'Please review the medicines and check "I confirm these medicines" before setting reminders.'
      });
      return;
    }

    const newReminders = scanResult.medicines.flatMap(med => {
      const times = generateReminderTimes(med.frequency);
      return times.map(time => ({
        medicine: med.name,
        dosage: med.dosage,
        time: time,
        frequency: med.frequency,
        active: true,
        source: 'prescription' as const,
        prescriptionDate: new Date().toISOString()
      }));
    });

    addMultipleReminders(newReminders);

    toast.success('Reminders Added!', {
      description: `${newReminders.length} verified reminders scheduled`,
      action: {
        label: 'View All',
        onClick: () => navigate('/reminders')
      }
    });

    // Navigate to reminders page
    navigate('/reminders');
  };

  // Navigate to chat with suggestion (gated behind user verification)
  const handleAISuggestion = (suggestion: string) => {
    if (!isVerifiedByUser) {
      toast.warning('Verification required', {
        description: 'Please review and confirm your extracted medicines before asking AI questions about them.'
      });
      return;
    }
    navigate('/chat', { state: { initialMessage: suggestion } });
  };

  const displayedPharmacies = showAllPharmacies ? pharmacies : pharmacies.slice(0, 3);

  return (
    <section className="py-16 md:py-24 relative overflow-hidden" id="prescription-scanner">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-60 h-60 bg-accent/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-6 py-3 mb-6 border border-primary/20"
          >
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-primary font-semibold">{t.aiPowered}</span>
          </motion.div>

          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            {i18n.prescription.title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {i18n.prescription.subtitle}
          </p>
        </motion.div>

        {/* Main Scanner Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl overflow-hidden">
            <div className="p-6 md:p-8">

              <AnimatePresence mode="wait">
                {/* Upload State */}
                {!selectedImage ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="border-2 border-dashed border-primary/30 rounded-2xl p-12 text-center hover:border-primary/60 transition-all cursor-pointer group bg-gradient-to-br from-muted/30 to-muted/10"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      capture="environment"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <motion.div
                      className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/30"
                      whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Upload className="w-12 h-12 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2">{i18n.prescription.uploadBtn}</h3>
                    <p className="text-muted-foreground mb-8">{i18n.prescription.dragDrop}</p>
                    <div className="flex justify-center gap-4">
                      <Button variant="outline" className="rounded-xl gap-2 pointer-events-none h-12 px-6">
                        <ImageIcon className="w-5 h-5" /> Gallery
                      </Button>
                      <Button variant="outline" className="rounded-xl gap-2 pointer-events-none h-12 px-6">
                        <Camera className="w-5 h-5" /> Camera
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Image Preview with Scanning Animation */}
                    <div className="relative rounded-2xl overflow-hidden bg-black/10 dark:bg-black/40 border border-border/50">
                      <img
                        src={selectedImage}
                        alt="Prescription"
                        className="w-full max-h-[400px] object-contain mx-auto"
                      />

                      {/* The Buffering Scan Animation */}
                      {isScanning && <ScanningAnimation />}

                      {/* Close Button */}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-3 right-3 rounded-full shadow-lg"
                        onClick={clearScan}
                        disabled={isScanning}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Health Data Privacy Notice */}
                    {!scanResult && !isScanning && (
                      <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3 text-xs text-muted-foreground">
                        <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <label className="flex items-start gap-2 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={hasHealthConsent}
                            onChange={(e) => setHasHealthConsent(e.target.checked)}
                            className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span>
                            <strong className="text-foreground">Health Data Privacy Consent:</strong> Prescriptions contain sensitive medical data. NirogCare processes this image privately via Google Cloud Vision OCR for text extraction only. Raw documents are not stored or logged.
                          </span>
                        </label>
                      </div>
                    )}

                    {/* Analyze Button */}
                    {!scanResult && !isScanning && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Button
                          onClick={processWithAI}
                          className="w-full rounded-2xl h-14 text-lg font-bold bg-gradient-to-r from-primary via-emerald-500 to-teal-500 hover:opacity-90 shadow-xl shadow-primary/30"
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          {i18n.prescription.scanBtn}
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ========== RESULTS SECTION ========== */}
          <AnimatePresence>
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 space-y-6"
              >
                {/* ===== PRESCRIPTION DETAILS ===== */}
                <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-lg">Prescription Analysis Complete</h3>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 font-medium">
                              OCR Quality: {Math.round((scanResult.overallConfidence || 0.88) * 100)}%
                            </span>
                          </div>
                          <p className="text-white/80 text-sm">
                            {scanResult.medicines.length} medicine{scanResult.medicines.length > 1 ? 's' : ''} identified
                            {scanResult.hasLowConfidenceItems && ' • ⚠️ Review flagged items'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {scanResult.rawText && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowRawText(!showRawText)}
                            className="rounded-xl bg-white/20 hover:bg-white/30 text-white border-0 text-xs"
                          >
                            <FileText className="w-3.5 h-3.5 mr-1" />
                            {showRawText ? 'Hide Raw Text' : 'View Raw OCR'}
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={clearScan}
                          className="rounded-xl bg-white/20 hover:bg-white/30 text-white border-0 text-xs"
                        >
                          Scan Another
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Raw OCR Text Expandable Panel */}
                  {showRawText && scanResult.rawText && (
                    <div className="p-4 bg-muted/70 border-b border-border/50 text-xs">
                      <div className="flex items-center justify-between mb-1.5 font-semibold text-muted-foreground">
                        <span>Google Cloud Vision OCR Extracted Text:</span>
                      </div>
                      <pre className="font-mono bg-background/80 p-3 rounded-lg border max-h-40 overflow-y-auto whitespace-pre-wrap text-[11px] leading-relaxed text-foreground">
                        {scanResult.rawText}
                      </pre>
                    </div>
                  )}

                  {/* Doctor & Patient Info */}
                  <div className="p-5 border-b border-border/50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {scanResult.doctorName && (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                          <Stethoscope className="w-5 h-5 text-blue-500 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Doctor</p>
                            <p className="font-semibold text-sm">{scanResult.doctorName}</p>
                          </div>
                        </div>
                      )}
                      {scanResult.patientName && (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                          <User className="w-5 h-5 text-green-500 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Patient</p>
                            <p className="font-semibold text-sm">{scanResult.patientName}</p>
                          </div>
                        </div>
                      )}
                      {scanResult.date && (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                          <Calendar className="w-5 h-5 text-purple-500 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Date</p>
                            <p className="font-semibold text-sm">{scanResult.date}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                        <Pill className="w-5 h-5 text-rose-500 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Medicines</p>
                          <p className="font-semibold text-sm">{scanResult.medicines.length} items</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medicines List */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-lg flex items-center gap-2">
                        <Pill className="w-5 h-5 text-primary" />
                        Prescribed Medicines
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Click "Edit" to adjust ambiguous handwriting
                      </p>
                    </div>

                    <div className="space-y-4">
                      {scanResult.medicines.map((med, index) => {
                        const isEditing = editingIndex === index;
                        const isLow = med.isLowConfidence || (med.confidence !== undefined && med.confidence < 0.8);

                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-4 border transition-all ${
                              isLow ? 'border-amber-500/60 bg-amber-500/5' : 'border-border/50'
                            }`}
                          >
                            {/* Low Confidence Warning Pill */}
                            {isLow && (
                              <div className="mb-3 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2 font-medium">
                                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                                <span>
                                  Low OCR Confidence ({Math.round((med.confidence || 0.65) * 100)}%) — Doctor handwriting is ambiguous. Please verify against prescription.
                                </span>
                              </div>
                            )}

                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex items-start gap-3 flex-1">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                  med.type?.toLowerCase().includes('antibiotic') ? 'bg-red-100 dark:bg-red-900/30' :
                                  med.type?.toLowerCase().includes('pain') || med.type?.toLowerCase().includes('analgesic') ? 'bg-blue-100 dark:bg-blue-900/30' :
                                    'bg-purple-100 dark:bg-purple-900/30'
                                }`}>
                                  <Pill className={`w-5 h-5 ${
                                    med.type?.toLowerCase().includes('antibiotic') ? 'text-red-600' :
                                    med.type?.toLowerCase().includes('pain') || med.type?.toLowerCase().includes('analgesic') ? 'text-blue-600' :
                                      'text-purple-600'
                                  }`} />
                                </div>

                                {isEditing ? (
                                  <div className="space-y-2 flex-1">
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={med.name}
                                        onChange={(e) => updateMedicineField(index, 'name', e.target.value)}
                                        placeholder="Medicine name"
                                        className="px-2.5 py-1 text-sm rounded border bg-background flex-1 font-semibold"
                                      />
                                      <input
                                        type="text"
                                        value={med.dosage}
                                        onChange={(e) => updateMedicineField(index, 'dosage', e.target.value)}
                                        placeholder="Dosage (e.g. 500mg)"
                                        className="px-2.5 py-1 text-sm rounded border bg-background w-32"
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={med.frequency}
                                        onChange={(e) => updateMedicineField(index, 'frequency', e.target.value)}
                                        placeholder="Frequency (e.g. Twice daily)"
                                        className="px-2.5 py-1 text-xs rounded border bg-background flex-1"
                                      />
                                      <input
                                        type="text"
                                        value={med.duration}
                                        onChange={(e) => updateMedicineField(index, 'duration', e.target.value)}
                                        placeholder="Duration (e.g. 5 days)"
                                        className="px-2.5 py-1 text-xs rounded border bg-background w-32"
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <h5 className="font-bold text-foreground flex items-center gap-2">
                                      {med.name}
                                      {med.confidence && (
                                        <span className="text-[11px] font-normal text-muted-foreground">
                                          ({Math.round(med.confidence * 100)}% confidence)
                                        </span>
                                      )}
                                    </h5>
                                    <p className="text-sm text-muted-foreground">{med.dosage}</p>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {med.type && !isEditing && (
                                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                                    {med.type}
                                  </span>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingIndex(isEditing ? null : index)}
                                  className="h-8 px-2 text-xs"
                                >
                                  {isEditing ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Done
                                    </>
                                  ) : (
                                    <>
                                      <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>

                            {!isEditing && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                                <div className="flex items-center gap-1.5 text-xs bg-background/50 px-2.5 py-1.5 rounded-lg">
                                  <Clock className="w-3.5 h-3.5 text-primary" />
                                  <span>{med.frequency}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs bg-background/50 px-2.5 py-1.5 rounded-lg">
                                  <Calendar className="w-3.5 h-3.5 text-primary" />
                                  <span>{med.duration}</span>
                                </div>
                                {med.instructions && (
                                  <div className="flex items-center gap-1.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2.5 py-1.5 rounded-lg col-span-2">
                                    <Info className="w-3.5 h-3.5" />
                                    <span>{med.instructions}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Usage & Side Effects */}
                            <div className="flex flex-wrap gap-2">
                              {med.usage && (
                                <div className="flex items-center gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-2.5 py-1.5 rounded-lg">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>For: {med.usage}</span>
                                </div>
                              )}
                              {med.sideEffects && (
                                <div className="flex items-center gap-1.5 text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-2.5 py-1.5 rounded-lg">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Side effects: {med.sideEffects}</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Doctor's Notes */}
                    {scanResult.notes && (
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-2">
                          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Doctor's Notes</p>
                            <p className="text-sm text-blue-800 dark:text-blue-200">{scanResult.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mandatory Clinical Verification Gate */}
                    <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/30 space-y-2">
                      <div className="flex items-start gap-2.5">
                        <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-1.5">
                          <p className="text-xs font-bold text-amber-950 dark:text-amber-200">
                            Clinical Safety Guidance & Mandatory Verification
                          </p>
                          <p className="text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
                            OCR text recognition is an automated assistance tool, not a doctor or pharmacist. Never alter dosages, schedule, or medications based on automated text recognition alone. Always confirm with your physician or licensed pharmacist.
                          </p>
                          <label className="flex items-center gap-2 cursor-pointer pt-2">
                            <input
                              type="checkbox"
                              checked={isVerifiedByUser}
                              onChange={(e) => setIsVerifiedByUser(e.target.checked)}
                              className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300"
                            />
                            <span className="text-xs font-semibold text-foreground">
                              I have verified these extracted medicines against my physical prescription paper.
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ===== NEARBY PHARMACIES ===== */}
                <div className="bg-card rounded-2xl border border-border/50 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-emerald-500" />
                      Nearby Pharmacies
                    </h4>
                    {isLoadingPharmacies && (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    )}
                  </div>

                  {pharmacies.length > 0 ? (
                    <>
                      <div className="grid gap-3">
                        {displayedPharmacies.map((pharmacy, index) => (
                          <motion.div
                            key={pharmacy.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/50 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${pharmacy.isOpen ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'
                                }`}>
                                <MapPin className={`w-5 h-5 ${pharmacy.isOpen ? 'text-emerald-600' : 'text-red-600'}`} />
                              </div>
                              <div>
                                <h5 className="font-semibold">{pharmacy.name}</h5>
                                <p className="text-xs text-muted-foreground">{pharmacy.address}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs font-medium text-primary">{pharmacy.distance}</span>
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pharmacy.isOpen
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                    }`}>
                                    {pharmacy.openingHours || (pharmacy.isOpen ? 'Open' : 'Closed')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {pharmacy.phone && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-lg h-9 px-3"
                                  onClick={() => callPharmacy(pharmacy.phone!)}
                                >
                                  <Phone className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                className="rounded-lg h-9 px-3 bg-primary"
                                onClick={() => openDirections(pharmacy)}
                              >
                                <Navigation className="w-4 h-4 mr-1" />
                                Go
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      {pharmacies.length > 3 && (
                        <Button
                          variant="ghost"
                          className="w-full mt-3 rounded-xl"
                          onClick={() => setShowAllPharmacies(!showAllPharmacies)}
                        >
                          {showAllPharmacies ? 'Show Less' : `Show ${pharmacies.length - 3} More`}
                          <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showAllPharmacies ? 'rotate-180' : ''}`} />
                        </Button>
                      )}
                    </>
                  ) : isLoadingPharmacies ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                      <p>Finding pharmacies near you...</p>
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">No pharmacies found nearby</p>
                  )}
                </div>

                {/* ===== REMINDERS SECTION ===== */}
                <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl border border-violet-500/20 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-lg flex items-center gap-2">
                      <Bell className="w-5 h-5 text-violet-500" />
                      Medicine Reminders
                    </h4>
                    <span className="text-xs bg-violet-500/10 text-violet-600 dark:text-violet-300 px-2 py-1 rounded-full">
                      {scanResult.medicines.length} medicines
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {scanResult.medicines.map((med, index) => {
                      const times = generateReminderTimes(med.frequency);
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                              <Pill className="w-4 h-4 text-violet-500" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{med.name}</p>
                              <p className="text-xs text-muted-foreground">{med.dosage}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {times.slice(0, 2).map((time, i) => (
                              <span key={i} className="text-xs bg-muted px-2 py-1 rounded-md flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime12Hour(time)}
                              </span>
                            ))}
                            {times.length > 2 && (
                              <span className="text-xs text-muted-foreground">+{times.length - 2}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    className="w-full rounded-xl h-12 bg-gradient-to-r from-violet-500 to-purple-500 hover:opacity-90 text-white font-semibold"
                    onClick={handleAddReminders}
                  >
                    <Bell className="w-5 h-5 mr-2" />
                    Set All Reminders & View Schedule
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {/* ===== AI SUGGESTIONS ===== */}
                {aiSuggestions.length > 0 && (
                  <div className="bg-card rounded-2xl border border-border/50 p-5">
                    <h4 className="font-bold text-lg flex items-center gap-2 mb-4">
                      <MessageCircle className="w-5 h-5 text-blue-500" />
                      Ask AI About Your Medicines
                    </h4>

                    <div className="grid gap-2">
                      {aiSuggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl border border-blue-100 dark:border-blue-800 transition-all flex items-center justify-between group"
                          onClick={() => handleAISuggestion(suggestion)}
                        >
                          <span className="text-sm text-blue-800 dark:text-blue-200">{suggestion}</span>
                          <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                      ))}
                    </div>

                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      Click any question to get AI-powered answers
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
