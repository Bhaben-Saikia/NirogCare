import { Heart, ArrowRight, Shield, Clock, Users, Sparkles, Zap, Stethoscope, Pill, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useEffect, useState } from 'react';
import FloatingParticles from '@/components/animation/FloatingParticles';
import MorphingBlob from '@/components/animation/MorphingBlob';
import GlowingOrb from '@/components/animation/GlowingOrb';

// Animated counter component
function AnimatedCounter({ value, duration = 2 }: { value: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState('0');
  const numericPart = value.replace(/\D/g, '');
  const suffix = value.replace(/\d/g, '');

  useEffect(() => {
    if (!numericPart) {
      setDisplayValue(value);
      return;
    }

    const target = parseInt(numericPart);
    const start = 0;
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * eased);

      setDisplayValue(current + suffix);

      if (progress >= 1) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, numericPart, suffix, duration]);

  return <span>{displayValue}</span>;
}

// Floating medical icons
const floatingIcons = [
  { Icon: Heart, x: 15, y: 20, delay: 0, size: 'w-8 h-8', color: 'text-white/20' },
  { Icon: Pill, x: 85, y: 15, delay: 0.5, size: 'w-6 h-6', color: 'text-white/15' },
  { Icon: Stethoscope, x: 10, y: 70, delay: 1, size: 'w-10 h-10', color: 'text-white/10' },
  { Icon: Brain, x: 90, y: 65, delay: 1.5, size: 'w-7 h-7', color: 'text-white/15' },
];

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden gradient-hero py-20 md:py-28 lg:py-36 min-h-[90vh] flex items-center">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Morphing blobs */}
        <MorphingBlob className="top-0 left-0 opacity-30" color="from-white/20 to-white/5" size="w-96 h-96" />
        <MorphingBlob className="bottom-0 right-0 opacity-20" color="from-white/10 to-transparent" size="w-[500px] h-[500px]" />

        {/* Glowing orbs */}
        <GlowingOrb className="top-1/4 left-1/4" size="lg" color="secondary" delay={0} />
        <GlowingOrb className="bottom-1/3 right-1/4" size="md" color="accent" delay={1} />
        <GlowingOrb className="top-1/2 right-1/3" size="sm" color="primary" delay={2} />

        {/* Floating particles */}
        <FloatingParticles count={30} />

        {/* Floating medical icons */}
        {floatingIcons.map(({ Icon, x, y, delay, size, color }, i) => (
          <motion.div
            key={i}
            className={`absolute ${color}`}
            style={{ left: `${x}%`, top: `${y}%` }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5 + i,
              delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Icon className={size} />
          </motion.div>
        ))}

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated Logo Badge */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-6 py-3 mb-8 border border-white/30 shadow-lg"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </motion.div>
            <span className="text-white font-semibold text-sm tracking-wide">{t.hero.badge}</span>
          </motion.div>

          {/* Main Title - Ultra Creative & Animated */}
          <motion.div className="relative mb-8 z-20">
            {/* Background Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[150%] bg-primary/20 blur-[100px] rounded-full opacity-50 pointer-events-none" />

            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="font-display text-6xl md:text-7xl lg:text-9xl font-bold leading-tight tracking-tight flex flex-wrap justify-center items-center gap-x-4 gap-y-2"
            >
              {/* "Nirog" - 3D Floating Letters */}
              <div className="flex relative">
                {['N', 'i', 'r', 'o', 'g'].map((letter, i) => (
                  <motion.span
                    key={`nirog-${i}`}
                    initial={{ y: 50, opacity: 0, rotateX: -90 }}
                    animate={{ y: 0, opacity: 1, rotateX: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 10,
                      delay: 0.1 + i * 0.05
                    }}
                    whileHover={{
                      y: -15,
                      scale: 1.1,
                      rotate: [-5, 5, 0],
                      textShadow: "0 0 20px rgba(255,255,255,0.8)"
                    }}
                    className="cursor-default relative inline-block text-white"
                    style={{ textShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
                  >
                    {letter}
                    {/* Tiny sparkle on top of letter */}
                    <motion.span
                      className="absolute -top-2 -right-2 w-2 h-2 bg-blue-300 rounded-full blur-[1px] opacity-0"
                      animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                      transition={{ duration: 2, delay: i * 0.2, repeat: Infinity, repeatDelay: 3 }}
                    />
                  </motion.span>
                ))}
              </div>

              {/* "Care" - Glowing & Heartbeat */}
              <div className="flex relative">
                {['C', 'a', 'r', 'e'].map((letter, i) => (
                  <motion.span
                    key={`care-${i}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.6 + i * 0.05
                    }}
                    className="cursor-default relative inline-block"
                  >
                    <span className="bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent transform transition-all duration-300">
                      {letter}
                    </span>
                  </motion.span>
                ))}

                {/* Floating Heart Icon next to Care */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: "spring" }}
                  className="ml-2 self-center"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      filter: ["drop-shadow(0 0 0px rgba(239, 68, 68, 0))", "drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))", "drop-shadow(0 0 0px rgba(239, 68, 68, 0))"]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Heart className="w-8 h-8 md:w-12 md:h-12 text-red-500 fill-red-500" />
                  </motion.div>
                </motion.div>

                {/* Shine effect over Care */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                />
              </div>
            </motion.h1>
          </motion.div>

          {/* Subtitle - Translated dynamically */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            {t.hero.subtitle}
          </motion.p>

          {/* CTAs with enhanced animations */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link to="/services">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/95 rounded-2xl h-14 px-8 text-lg font-bold shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.5)] transition-all group relative overflow-hidden"
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  />
                  <span className="relative flex items-center">
                    {t.hero.getStarted}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                  </span>
                </Button>
              </motion.div>
            </Link>
            <Link to="/chat">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white/15 rounded-2xl h-14 px-8 text-lg font-bold bg-white/5 backdrop-blur-sm group"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Zap className="w-5 h-5 mr-2 text-yellow-300" />
                  </motion.div>
                  {t.hero.aiHealthChat}
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Stats with animated counters */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="grid grid-cols-3 gap-6 md:gap-12 max-w-xl mx-auto"
          >
            {[
              { icon: Shield, value: '100%', label: t.hero.freeSecure },
              { icon: Clock, value: '24/7', label: t.hero.aiAvailable },
              { icon: Users, value: '9+', label: t.hero.languages },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + idx * 0.1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="text-center group cursor-pointer"
              >
                <motion.div
                  className="flex items-center justify-center mb-3"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                    <stat.icon className="w-6 h-6 text-white group-hover:text-yellow-300 transition-colors" />
                  </div>
                </motion.div>
                <p className="text-3xl md:text-4xl font-bold text-white">
                  <AnimatedCounter value={stat.value} duration={1.5} />
                </p>
                <p className="text-white/70 text-sm mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Emergency Button - Mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="mt-12 sm:hidden"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Button
                variant="destructive"
                size="lg"
                onClick={() => window.open('tel:108')}
                className="rounded-2xl h-14 px-8 font-bold text-lg shadow-lg shadow-red-500/30"
              >
                🚨 {t.hero.emergency}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <motion.path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            className="fill-background"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
        </svg>
      </div>
    </section>
  );
}
