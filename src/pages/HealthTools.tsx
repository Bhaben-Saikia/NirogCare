/**
 * NirogCare - Health Tools Page
 * Comprehensive health tracking tools including BMI, water, steps, sleep, heart rate, 
 * calories, meditation, eye care, period tracker, and symptom checker
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import FloatingChatButton from '@/components/layout/FloatingChatButton';
import {
  ArrowLeft, Scale, Droplets, Footprints, Moon, Sparkles, Activity, TrendingUp,
  ChevronRight, Heart, Flame, Timer, Brain, Eye, Calendar, Stethoscope, Plus, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import WaterTracker from '@/components/tools/WaterTracker';
import StepCounter from '@/components/tools/StepCounter';
import SleepTracker from '@/components/tools/SleepTracker';
import { useAppContext } from '@/context/AppContext';

type ActiveTool = 'bmi' | 'water' | 'steps' | 'sleep' | 'heartrate' | 'calories' | 'meditation' | 'eyecare' | 'period' | 'symptoms' | null;

// Heart Rate Tool Component
function HeartRateTracker() {
  const [bpm, setBpm] = useState('');
  const [readings, setReadings] = useState<{ bpm: number, time: string }[]>([
    { bpm: 72, time: '8:00 AM' },
    { bpm: 78, time: '12:00 PM' },
    { bpm: 68, time: '6:00 PM' },
  ]);

  const addReading = () => {
    if (bpm && parseInt(bpm) > 0) {
      setReadings(prev => [...prev, {
        bpm: parseInt(bpm),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }]);
      setBpm('');
    }
  };

  const getHeartRateStatus = (rate: number) => {
    if (rate < 60) return { label: 'Low', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (rate <= 100) return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-100' };
    return { label: 'High', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const avgBpm = readings.length > 0
    ? Math.round(readings.reduce((a, b) => a + b.bpm, 0) / readings.length)
    : 0;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 rounded-2xl p-6 text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500 flex items-center justify-center"
        >
          <Heart className="w-10 h-10 text-white" />
        </motion.div>
        <p className="text-4xl font-bold text-foreground">{avgBpm || '--'}</p>
        <p className="text-muted-foreground">Average BPM</p>
      </div>

      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Enter current BPM"
          value={bpm}
          onChange={(e) => setBpm(e.target.value)}
          className="rounded-xl h-12"
        />
        <Button onClick={addReading} className="rounded-xl h-12 px-6 gradient-hero">
          Add
        </Button>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-foreground">Today's Readings</h4>
        {readings.map((reading, i) => {
          const status = getHeartRateStatus(reading.bpm);
          return (
            <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="font-medium">{reading.bpm} BPM</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
                <span className="text-sm text-muted-foreground">{reading.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Calorie Tracker Component
function CalorieTracker() {
  const [calories] = useState(1450);
  const goal = 2000;
  const percentage = Math.min((calories / goal) * 100, 100);

  const meals = [
    { name: 'Breakfast', calories: 450, icon: '🍳' },
    { name: 'Lunch', calories: 650, icon: '🍱' },
    { name: 'Snacks', calories: 200, icon: '🍎' },
    { name: 'Dinner', calories: 150, icon: '🍽️' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-2xl p-6 text-center">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="56" className="stroke-muted fill-none" strokeWidth="12" />
            <motion.circle
              cx="64" cy="64" r="56"
              className="stroke-orange-500 fill-none"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={352}
              initial={{ strokeDashoffset: 352 }}
              animate={{ strokeDashoffset: 352 - (352 * percentage / 100) }}
              transition={{ duration: 1 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Flame className="w-6 h-6 text-orange-500 mb-1" />
            <span className="text-2xl font-bold">{calories}</span>
            <span className="text-xs text-muted-foreground">/{goal} kcal</span>
          </div>
        </div>
        <p className="text-muted-foreground">{goal - calories} calories remaining</p>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-foreground">Today's Meals</h4>
        {meals.map((meal, i) => (
          <motion.div
            key={meal.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{meal.icon}</span>
              <span className="font-medium">{meal.name}</span>
            </div>
            <span className="text-sm text-muted-foreground">{meal.calories} kcal</span>
          </motion.div>
        ))}
      </div>

      <Button className="w-full rounded-xl h-12 gradient-hero">
        <Plus className="w-5 h-5 mr-2" />
        Log Food
      </Button>
    </div>
  );
}

// Meditation Timer Component
function MeditationTimer() {
  const [minutes, setMinutes] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5 * 60);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setIsRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  const sessions = [
    { name: 'Quick Calm', duration: 3, icon: '🧘' },
    { name: 'Stress Relief', duration: 5, icon: '😌' },
    { name: 'Deep Focus', duration: 10, icon: '🎯' },
    { name: 'Sleep Well', duration: 15, icon: '😴' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-6 text-center">
        <motion.div
          animate={isRunning ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center"
        >
          <Brain className="w-12 h-12 text-white" />
        </motion.div>
        <p className="text-4xl font-bold text-foreground">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </p>
        <p className="text-muted-foreground mt-2">
          {isRunning ? 'Breathe deeply...' : timeLeft === 0 ? 'Session complete 🙏' : 'Ready to meditate'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {sessions.map((session) => (
          <motion.button
            key={session.name}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setIsRunning(false);
              setMinutes(session.duration);
              setTimeLeft(session.duration * 60);
            }}
            className={`p-4 rounded-xl border text-left transition-colors ${minutes === session.duration
                ? 'border-primary bg-primary/5'
                : 'border-border hover:bg-muted'
              }`}
          >
            <span className="text-2xl mb-1 block">{session.icon}</span>
            <span className="font-medium text-sm">{session.name}</span>
            <span className="text-xs text-muted-foreground block">{session.duration} min</span>
          </motion.button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => {
            if (timeLeft === 0) setTimeLeft(minutes * 60);
            setIsRunning(!isRunning);
          }}
          className="flex-1 rounded-xl h-12 gradient-hero"
        >
          <Timer className="w-5 h-5 mr-2" />
          {isRunning ? 'Pause' : timeLeft === 0 ? 'Restart' : 'Start Meditation'}
        </Button>
        <Button
          variant="outline"
          className="rounded-xl h-12"
          onClick={() => {
            setIsRunning(false);
            setTimeLeft(minutes * 60);
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}

// Eye Care Component
function EyeCareTracker() {
  const tips = [
    { title: '20-20-20 Rule', desc: 'Every 20 min, look at something 20 feet away for 20 seconds', icon: '👀' },
    { title: 'Blink Often', desc: 'Blink 15-20 times per minute to keep eyes moist', icon: '😌' },
    { title: 'Adjust Brightness', desc: 'Match screen brightness to surroundings', icon: '☀️' },
    { title: 'Take Breaks', desc: 'Rest eyes for 15 minutes after 2 hours of screen time', icon: '⏰' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 rounded-2xl p-6 text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center"
        >
          <Eye className="w-10 h-10 text-white" />
        </motion.div>
        <h3 className="text-xl font-bold text-foreground mb-2">Protect Your Eyes</h3>
        <p className="text-muted-foreground">Follow these tips for healthy vision</p>
      </div>

      <div className="space-y-3">
        {tips.map((tip, i) => (
          <motion.div
            key={tip.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 bg-muted/50 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{tip.icon}</span>
              <div>
                <h4 className="font-semibold text-foreground">{tip.title}</h4>
                <p className="text-sm text-muted-foreground">{tip.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Button className="w-full rounded-xl h-12 gradient-hero">
        <Timer className="w-5 h-5 mr-2" />
        Set 20-20-20 Reminder
      </Button>
    </div>
  );
}

// Period Tracker Component
function PeriodTracker() {
  const todayISO = () => new Date().toISOString().split('T')[0];
  const [lastPeriod, setLastPeriod] = useState<string>(
    () => localStorage.getItem('nirogcare_last_period') || todayISO()
  );
  const [cycleLength, setCycleLength] = useState<number>(
    () => parseInt(localStorage.getItem('nirogcare_cycle_length') || '28') || 28
  );

  useEffect(() => {
    localStorage.setItem('nirogcare_last_period', lastPeriod);
    localStorage.setItem('nirogcare_cycle_length', String(cycleLength));
  }, [lastPeriod, cycleLength]);

  const calculateNextPeriod = () => {
    const lastDate = new Date(lastPeriod);
    lastDate.setDate(lastDate.getDate() + cycleLength);
    return lastDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const calculateOvulation = () => {
    const lastDate = new Date(lastPeriod);
    lastDate.setDate(lastDate.getDate() + cycleLength - 14);
    return lastDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const daysUntilNext = () => {
    const nextDate = new Date(lastPeriod);
    nextDate.setDate(nextDate.getDate() + cycleLength);
    const today = new Date();
    const diff = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 rounded-2xl p-6 text-center">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center"
        >
          <Calendar className="w-12 h-12 text-white" />
        </motion.div>
        <p className="text-3xl font-bold text-foreground">{daysUntilNext()} days</p>
        <p className="text-muted-foreground">until next period</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-pink-50 dark:bg-pink-950/30 rounded-xl">
          <p className="text-xs text-muted-foreground mb-1">Next Period</p>
          <p className="font-bold text-pink-600 dark:text-pink-400">{calculateNextPeriod()}</p>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
          <p className="text-xs text-muted-foreground mb-1">Ovulation</p>
          <p className="font-bold text-purple-600 dark:text-purple-400">{calculateOvulation()}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Last Period Start Date</label>
          <Input
            type="date"
            value={lastPeriod}
            onChange={(e) => setLastPeriod(e.target.value)}
            className="rounded-xl h-12"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Average Cycle Length (days)</label>
          <Input
            type="number"
            value={cycleLength}
            onChange={(e) => setCycleLength(parseInt(e.target.value) || 28)}
            className="rounded-xl h-12"
            min={21}
            max={35}
          />
        </div>
      </div>

      <Button className="w-full rounded-xl h-12 gradient-hero" onClick={() => setLastPeriod(todayISO())}>
        <Calendar className="w-5 h-5 mr-2" />
        Log Period Started Today
      </Button>
    </div>
  );
}

// Symptom Checker Component
function SymptomChecker() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const commonSymptoms = [
    { id: 'headache', label: 'Headache', icon: '🤕' },
    { id: 'fever', label: 'Fever', icon: '🤒' },
    { id: 'cough', label: 'Cough', icon: '😷' },
    { id: 'fatigue', label: 'Fatigue', icon: '😫' },
    { id: 'nausea', label: 'Nausea', icon: '🤢' },
    { id: 'body-pain', label: 'Body Pain', icon: '💪' },
    { id: 'sore-throat', label: 'Sore Throat', icon: '🗣️' },
    { id: 'runny-nose', label: 'Runny Nose', icon: '🤧' },
    { id: 'stomach-ache', label: 'Stomach Ache', icon: '😣' },
    { id: 'dizziness', label: 'Dizziness', icon: '😵' },
  ];

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
    setShowResults(false);
  };

  const getPossibleConditions = () => {
    // Simple logic for demo - in real app, this would use AI/ML
    if (selectedSymptoms.includes('fever') && selectedSymptoms.includes('cough')) {
      return ['Common Cold', 'Flu (Influenza)', 'Viral Infection'];
    }
    if (selectedSymptoms.includes('headache') && selectedSymptoms.includes('fatigue')) {
      return ['Tension Headache', 'Dehydration', 'Stress'];
    }
    if (selectedSymptoms.includes('stomach-ache') && selectedSymptoms.includes('nausea')) {
      return ['Food Poisoning', 'Gastritis', 'Stomach Flu'];
    }
    return ['Please consult a doctor for proper diagnosis'];
  };

  const { t } = useAppContext();

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 rounded-2xl p-6 text-center">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center"
        >
          <Stethoscope className="w-10 h-10 text-white" />
        </motion.div>
        <h3 className="text-xl font-bold text-foreground mb-2">Symptom Checker</h3>
        <p className="text-muted-foreground text-sm">Select your symptoms for guidance</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {commonSymptoms.map((symptom) => (
          <motion.button
            key={symptom.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleSymptom(symptom.id)}
            className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${selectedSymptoms.includes(symptom.id)
                ? 'border-primary bg-primary/10 shadow-sm'
                : 'border-border hover:bg-muted'
              }`}
          >
            <span className="text-xl">{symptom.icon}</span>
            <span className="text-sm font-medium">{symptom.label}</span>
            {selectedSymptoms.includes(symptom.id) && (
              <Check className="w-4 h-4 text-primary ml-auto" />
            )}
          </motion.button>
        ))}
      </div>

      <Button
        onClick={() => setShowResults(true)}
        disabled={selectedSymptoms.length === 0}
        className="w-full rounded-xl h-12 gradient-hero"
      >
        <Stethoscope className="w-5 h-5 mr-2" />
        Check Symptoms ({selectedSymptoms.length} selected)
      </Button>

      <AnimatePresence>
        {showResults && selectedSymptoms.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl"
          >
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Possible Conditions:</h4>
            <ul className="space-y-1 mb-3">
              {getPossibleConditions().map((condition, i) => (
                <li key={i} className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {condition}
                </li>
              ))}
            </ul>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              ⚠️ This is for informational purposes only. Please consult a healthcare professional for proper diagnosis.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HealthTools() {
  const navigate = useNavigate();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const { t } = useAppContext();

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (w > 0 && h > 0) {
      setIsCalculating(true);
      setTimeout(() => {
        setBmi(parseFloat((w / (h * h)).toFixed(1)));
        setIsCalculating(false);
      }, 500);
    }
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-300' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-300' };
    return { label: 'Obese', color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-300' };
  };

  const tools = [
    {
      id: 'water' as const,
      icon: Droplets,
      title: t.waterTracker,
      description: 'Track daily water intake. Goal: 8 glasses/day',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'steps' as const,
      icon: Footprints,
      title: t.stepCounter,
      description: 'Monitor your steps. Goal: 6000 daily',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      id: 'sleep' as const,
      icon: Moon,
      title: t.sleepMonitor,
      description: 'Track sleep pattern. Goal: 7-8 hours/night',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      id: 'heartrate' as const,
      icon: Heart,
      title: t.heartRate,
      description: 'Log and track your heart rate readings',
      gradient: 'from-red-500 to-pink-500',
    },
    {
      id: 'calories' as const,
      icon: Flame,
      title: t.calorieTracker,
      description: 'Track daily calorie intake',
      gradient: 'from-orange-500 to-amber-500',
    },
    {
      id: 'period' as const,
      icon: Calendar,
      title: 'Period Tracker',
      description: 'Track menstrual cycle and ovulation',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      id: 'symptoms' as const,
      icon: Stethoscope,
      title: 'Symptom Checker',
      description: 'Check symptoms and get guidance',
      gradient: 'from-teal-500 to-emerald-500',
    },
    {
      id: 'meditation' as const,
      icon: Brain,
      title: t.meditation,
      description: 'Guided meditation sessions',
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      id: 'eyecare' as const,
      icon: Eye,
      title: t.eyeCare,
      description: '20-20-20 rule reminders',
      gradient: 'from-cyan-500 to-blue-500',
    },
  ];

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'water': return <WaterTracker />;
      case 'steps': return <StepCounter />;
      case 'sleep': return <SleepTracker />;
      case 'heartrate': return <HeartRateTracker />;
      case 'calories': return <CalorieTracker />;
      case 'meditation': return <MeditationTimer />;
      case 'eyecare': return <EyeCareTracker />;
      case 'period': return <PeriodTracker />;
      case 'symptoms': return <SymptomChecker />;
      default: return null;
    }
  };

  const getActiveToolTitle = () => {
    const tool = tools.find(t => t.id === activeTool);
    return tool?.title || '';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => activeTool ? setActiveTool(null) : navigate('/')}
          className="flex items-center gap-2 text-primary font-medium mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          {activeTool ? t.back : t.back + ' ' + t.home}
        </motion.button>

        <AnimatePresence mode="wait">
          {activeTool ? (
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">{getActiveToolTitle()}</h1>
              </div>
              {renderActiveTool()}
            </motion.div>
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Hero Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 rounded-3xl p-6 md:p-8 text-white mb-6"
              >
                <motion.div
                  className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <div className="relative flex items-start gap-4">
                  <motion.div
                    className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                  >
                    <Activity className="w-8 h-8" />
                  </motion.div>
                  <div>
                    <h1 className="font-display text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
                      {t.healthTools}
                      <Sparkles className="w-6 h-6 text-amber-300" />
                    </h1>
                    <p className="text-white/80">Track your health across 9+ dimensions</p>
                  </div>
                </div>
              </motion.div>

              {/* BMI Calculator - Featured */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden mb-6"
              >
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border-b border-rose-200/50 dark:border-rose-800/50 p-5">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="p-2 bg-rose-500/10 rounded-xl"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Scale className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-lg text-rose-900 dark:text-rose-100">{t.bmiCalculator}</h3>
                      <p className="text-rose-700 dark:text-rose-300 text-sm">Body Mass Index</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Weight (kg)</label>
                      <Input
                        type="number"
                        placeholder="e.g., 65"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="rounded-xl h-12 border-border/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Height (cm)</label>
                      <Input
                        type="number"
                        placeholder="e.g., 170"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="rounded-xl h-12 border-border/50"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={calculateBMI}
                    disabled={isCalculating || !weight || !height}
                    className="w-full rounded-xl h-12 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                  >
                    {isCalculating ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <TrendingUp className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <>
                        <Scale className="w-5 h-5 mr-2" />
                        Calculate BMI
                      </>
                    )}
                  </Button>

                  <AnimatePresence mode="wait">
                    {bmi !== null && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`rounded-xl p-5 text-center border ${getBMICategory(bmi).bg} ${getBMICategory(bmi).border}`}
                      >
                        <p className="text-sm text-muted-foreground mb-1">Your BMI</p>
                        <motion.p
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200 }}
                          className="text-4xl font-bold text-foreground mb-2"
                        >
                          {bmi}
                        </motion.p>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getBMICategory(bmi).color} ${getBMICategory(bmi).bg}`}>
                          {getBMICategory(bmi).label}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Other Tools Grid */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  More {t.healthTools} ({tools.length})
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tools.map((tool, index) => (
                    <motion.div
                      key={tool.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      onClick={() => setActiveTool(tool.id)}
                      className="group bg-card rounded-2xl border border-border/50 shadow-sm p-4 cursor-pointer hover:shadow-md transition-all hover:-translate-y-1"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${tool.gradient}`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <tool.icon className="w-6 h-6 text-white" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {tool.title}
                          </h3>
                          <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{tool.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <FloatingChatButton />
    </div>
  );
}
