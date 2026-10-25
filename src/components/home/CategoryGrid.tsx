/**
 * NirogCare - Category Grid Component
 * Professional health category cards with Lucide icons
 */

import { Link } from 'react-router-dom';
import { categoryInfo } from '@/data/healthData';
import { CategoryType } from '@/types/health';
import { useAppContext } from '@/context/AppContext';
import { useTranslation } from '@/hooks/useTranslation';
import { ChevronRight, Sparkles, Star, User, Users, Baby, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

// Professional icon mapping
const iconMap = {
  male: User,
  female: Users,
  baby: Baby,
  mental: Brain,
};

const categories: { type: CategoryType; color: string; gradient: string; shadow: string }[] = [
  {
    type: 'male',
    color: 'from-blue-500 to-indigo-600',
    gradient: 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700',
    shadow: 'hover:shadow-blue-500/30'
  },
  {
    type: 'female',
    color: 'from-pink-500 to-rose-600',
    gradient: 'bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600',
    shadow: 'hover:shadow-pink-500/30'
  },
  {
    type: 'baby',
    color: 'from-purple-500 to-violet-600',
    gradient: 'bg-gradient-to-br from-purple-500 via-violet-500 to-purple-700',
    shadow: 'hover:shadow-purple-500/30'
  },
  {
    type: 'mental',
    color: 'from-emerald-500 to-teal-600',
    gradient: 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600',
    shadow: 'hover:shadow-emerald-500/30'
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 12
    }
  }
};

interface CategoryCardProps {
  type: CategoryType;
  gradient: string;
  shadow: string;
  onClick: () => void;
}

function CategoryCard({ type, gradient, shadow, onClick }: CategoryCardProps) {
  const { t } = useTranslation();
  const info = t.categories[type] || categoryInfo[type];
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = iconMap[type];

  return (
    <motion.div variants={item}>
      <Link
        to="/services"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative overflow-hidden rounded-3xl ${gradient} p-6 md:p-8 text-white shadow-xl ${shadow} hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 block h-full min-h-[280px]`}
      >
        {/* Animated background patterns */}
        <motion.div
          className="absolute inset-0"
          animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '20px 20px',
            }}
          />
        </motion.div>

        {/* Floating orbs */}
        <motion.div
          className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-2xl"
          animate={isHovered ? { scale: 1.5, x: 20, y: -20 } : { scale: 1, x: 0, y: 0 }}
          transition={{ duration: 0.5 }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-xl"
          animate={isHovered ? { scale: 1.5, x: -20, y: 20 } : { scale: 1, x: 0, y: 0 }}
          transition={{ duration: 0.5 }}
        />

        {/* Sparkle effects */}
        {isHovered && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-4 right-4"
            >
              <Star className="w-4 h-4 text-white/60" fill="currentColor" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="absolute top-12 right-8"
            >
              <Star className="w-3 h-3 text-white/40" fill="currentColor" />
            </motion.div>
          </>
        )}

        <div className="relative h-full flex flex-col">
          {/* Professional Icon */}
          <motion.div
            className="w-16 h-16 md:w-20 md:h-20 mb-6 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
            animate={isHovered ? {
              scale: 1.1,
              rotate: [0, -5, 5, -5, 0],
              y: -5
            } : {
              scale: 1,
              rotate: 0,
              y: 0
            }}
            transition={{ duration: 0.5 }}
          >
            <IconComponent className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={1.5} />
          </motion.div>

          <div className="flex-1">
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">
              {info.title}
            </h3>
            <p className="text-white/80 font-medium text-sm md:text-base mb-4 line-clamp-2">
              {info.subtitle}
            </p>
          </div>

          {/* CTA with enhanced animation */}
          <motion.div
            className="flex items-center gap-2 text-white/90 font-semibold"
            animate={isHovered ? { x: 10 } : { x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span>{t.common.explore}</span>
            <motion.div
              animate={isHovered ? { x: [0, 5, 0] } : { x: 0 }}
              transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom border glow */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={isHovered ? { scaleX: 1, opacity: 0.5 } : { scaleX: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      </Link>
    </motion.div>
  );
}

export default function CategoryGrid() {
  const { setSelectedCategory } = useAppContext();
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-48 h-48 bg-accent/5 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-5 py-2.5 mb-6 border border-primary/20"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
            <span className="text-primary font-semibold text-sm">{t.header.services}</span>
          </motion.div>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t.categories.title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t.categories.subtitle}
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6"
        >
          {categories.map(({ type, gradient, shadow }) => (
            <CategoryCard
              key={type}
              type={type}
              gradient={gradient}
              shadow={shadow}
              onClick={() => setSelectedCategory(type)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
