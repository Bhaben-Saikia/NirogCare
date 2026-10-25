import { Link } from 'react-router-dom';
import { Landmark, Lightbulb, Bell, Activity, ArrowUpRight, MapPin, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { 
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
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

interface ToolItem {
  icon: any;
  title: string;
  subtitle: string;
  href: string;
  gradient: string;
  iconBg: string;
  glow: string;
}

function ToolCard({ tool }: { tool: ToolItem }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div variants={item}>
      <Link
        to={tool.href}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative bg-card rounded-3xl p-6 shadow-lg hover:shadow-2xl ${tool.glow} transition-all duration-500 hover:-translate-y-2 border border-border/50 block h-full overflow-hidden`}
      >
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
        />

        <motion.div
          className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${tool.gradient} opacity-10`}
          animate={isHovered ? { scale: 1.5, opacity: 0.15 } : { scale: 1, opacity: 0.1 }}
          transition={{ duration: 0.4 }}
        />
        
        <div className="relative">
          <motion.div 
            animate={isHovered ? { scale: 1.1, rotate: 5, y: -5 } : { scale: 1, rotate: 0, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`w-14 h-14 ${tool.iconBg} rounded-2xl flex items-center justify-center mb-5 shadow-lg`}
          >
            <tool.icon className="w-7 h-7 text-white" />
          </motion.div>
          
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-bold text-foreground text-lg mb-1.5 group-hover:text-primary transition-colors">
                {tool.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {tool.subtitle}
              </p>
            </div>
            <motion.div
              animate={isHovered ? { x: 3, y: -3, opacity: 1 } : { x: 0, y: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ArrowUpRight className="w-5 h-5 text-primary" />
            </motion.div>
          </div>
        </div>

        <motion.div
          className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${tool.gradient}`}
          initial={{ scaleX: 0 }}
          animate={isHovered ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: 'left' }}
        />
      </Link>
    </motion.div>
  );
}

export default function QuickTools() {
  const { t } = useTranslation();

  const tools: ToolItem[] = [
    {
      icon: Landmark,
      title: t.quickTools.govtSchemes,
      subtitle: t.quickTools.govtSchemesSubtitle,
      href: '/govt-schemes',
      gradient: 'from-amber-500 to-orange-600',
      iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
      glow: 'group-hover:shadow-amber-500/40',
    },
    {
      icon: Lightbulb,
      title: t.quickTools.healthTips,
      subtitle: t.quickTools.healthTipsSubtitle,
      href: '/health-tips',
      gradient: 'from-sky-500 to-blue-600',
      iconBg: 'bg-gradient-to-br from-sky-400 to-blue-500',
      glow: 'group-hover:shadow-sky-500/40',
    },
    {
      icon: Bell,
      title: t.quickTools.reminders,
      subtitle: t.quickTools.remindersSubtitle,
      href: '/reminders',
      gradient: 'from-violet-500 to-purple-600',
      iconBg: 'bg-gradient-to-br from-violet-400 to-purple-500',
      glow: 'group-hover:shadow-violet-500/40',
    },
    {
      icon: Activity,
      title: t.quickTools.healthTools,
      subtitle: t.quickTools.healthToolsSubtitle,
      href: '/health-tools',
      gradient: 'from-rose-500 to-pink-600',
      iconBg: 'bg-gradient-to-br from-rose-400 to-pink-500',
      glow: 'group-hover:shadow-rose-500/40',
    },
    {
      icon: MapPin,
      title: t.nearbyStores.title,
      subtitle: t.nearbyStores.subtitle,
      href: '/nearby-stores',
      gradient: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-500',
      glow: 'group-hover:shadow-emerald-500/40',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl"
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-10 w-64 h-64 bg-accent/5 rounded-full blur-3xl"
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
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
            className="inline-flex items-center gap-2 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full px-5 py-2.5 mb-6 border border-accent/20"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-accent" />
            </motion.div>
            <span className="text-accent font-semibold text-sm">{t.quickTools.title}</span>
          </motion.div>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t.quickTools.title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t.quickTools.subtitle}
          </p>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5"
        >
          {tools.map((tool) => (
            <ToolCard key={tool.href} tool={tool} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
