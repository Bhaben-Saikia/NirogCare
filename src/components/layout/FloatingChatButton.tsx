/**
 * NirogCare - Premium Floating Chat Button
 * A beautifully animated FAB for quick AI chat access
 */

import { MessageCircle, X, Sparkles, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function FloatingChatButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const { t } = useTranslation();

  // Mouse tracking for magnetic effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 15 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.1);
    y.set((e.clientY - centerY) * 0.1);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  // Hide tooltip after 5 seconds
  useState(() => {
    const timer = setTimeout(() => setShowTooltip(false), 5000);
    return () => clearTimeout(timer);
  });

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Animated tooltip */}
      <AnimatePresence>
        {showTooltip && !isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
          >
            <div className="bg-card border border-border rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="text-sm font-medium text-foreground">{t.chat.subtitle}</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowTooltip(false);
                }}
                className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* Triangle pointer */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
              <div className="border-8 border-transparent border-l-card" style={{ filter: 'drop-shadow(2px 0 2px rgba(0,0,0,0.05))' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main button */}
      <Link to="/chat">
        <motion.div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ x: xSpring, y: ySpring }}
        >
          {/* Outer pulse rings */}
          <motion.div
            className="absolute inset-0 rounded-full gradient-hero"
            animate={{
              scale: [1, 1.4, 1.8],
              opacity: [0.4, 0.2, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full gradient-hero"
            animate={{
              scale: [1, 1.3, 1.6],
              opacity: [0.3, 0.15, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: 0.5,
              ease: 'easeOut',
            }}
          />

          {/* Main button */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-14 h-14 md:w-16 md:h-16 rounded-full gradient-hero shadow-glow flex items-center justify-center overflow-hidden"
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />

            {/* Icon with animation */}
            <motion.div
              animate={isHovered ? { rotate: [0, -10, 10, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <MessageCircle className="w-6 h-6 md:w-7 md:h-7 text-primary-foreground relative z-10" />
            </motion.div>

            {/* AI indicator dot */}
            <motion.div
              className="absolute top-1 right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>

          {/* Hover expansion */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="absolute bottom-full mb-3 right-0 bg-card border border-border rounded-2xl p-3 shadow-lg min-w-[160px]"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1">
                  <Bot className="w-4 h-4 text-primary" />
                  {t.hero.aiHealthChat}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.hero.aiAvailable}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Link>
    </div>
  );
}
