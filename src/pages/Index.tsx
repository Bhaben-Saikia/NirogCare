/**
 * NirogCare - Enhanced Home Page
 * Premium landing page with smooth animations and polished UI
 */

import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import HeroSection from '@/components/home/HeroSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import QuickTools from '@/components/home/QuickTools';
import PrescriptionScanner from '@/components/home/PrescriptionScanner';
import FloatingChatButton from '@/components/layout/FloatingChatButton';
import EmergencyBanner from '@/components/layout/EmergencyBanner';
import Footer from '@/components/layout/Footer';
import { pageTransition, staggerContainer } from '@/lib/animations';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';

const MotionLink = motion.create(Link);

export default function Index() {
  return (
    <motion.div
      className="min-h-screen bg-background"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageTransition}
    >
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:top-4 focus:left-4"
      >
        Skip to main content
      </a>

      <Header />

      <motion.main
        id="main-content"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <HeroSection />
        <CategoryGrid />
        <PrescriptionScanner />
        <QuickTools />
        <CTASection />
      </motion.main>

      <Footer />
      <FloatingChatButton />
      <EmergencyBanner />
    </motion.div>
  );
}

/**
 * Call to Action Section
 */
function CTASection() {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[2rem] overflow-hidden"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 gradient-hero" />

          {/* Decorative elements */}
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], x: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Content */}
          <div className="relative z-10 py-16 md:py-24 px-6 md:px-12 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2.5 mb-6"
            >
              <span className="text-lg">🚀</span>
              <span className="text-white font-semibold text-sm">{t.hero.badge}</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            >
              {t.hero.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-10"
            >
              {t.hero.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <MotionLink
                to="/dashboard"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-primary font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-2"
              >
                <span>{t.hero.getStarted}</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  →
                </motion.span>
              </MotionLink>

              <MotionLink
                to="/chat"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white font-bold px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all inline-flex items-center gap-2"
              >
                <span>💬</span>
                <span>{t.hero.aiHealthChat}</span>
              </MotionLink>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/70 text-sm"
            >
              <span className="flex items-center gap-2">
                <span>🔒</span> {t.hero.freeSecure}
              </span>
              <span className="flex items-center gap-2">
                <span>🆓</span> {t.hero.aiAvailable}
              </span>
              <span className="flex items-center gap-2">
                <span>🇮🇳</span> Made in India
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
