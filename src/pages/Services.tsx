import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import { useTranslation } from '@/hooks/useTranslation';
import { servicesByCategory, categoryInfo } from '@/data/healthData';
import Header from '@/components/layout/Header';
import FloatingChatButton from '@/components/layout/FloatingChatButton';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Landmark, Lightbulb, Sparkles, Layers, User, Users, Baby, Brain, type LucideIcon } from 'lucide-react';
import { CategoryType } from '@/types/health';

const categoryIcons: Record<string, LucideIcon> = { User, Users, Baby, Brain };
const CategoryIcon = ({ name, className }: { name: string; className?: string }) => {
  const Icon = categoryIcons[name] ?? Layers;
  return <Icon className={className} />;
};

export default function Services() {
  const { selectedCategory, setSelectedCategory } = useAppContext();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // If no category selected, show category selection
  if (!selectedCategory) {
    const categories = Object.entries(categoryInfo);
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-primary font-medium mb-6 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.common.backToHome}
          </motion.button>

          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden gradient-hero rounded-3xl p-6 md:p-8 text-white mb-6"
          >
            {/* Background decorations */}
            <motion.div
              className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl"
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <div className="relative flex items-start gap-4">
              <motion.div
                className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Layers className="w-8 h-8" />
              </motion.div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
                  {t.services.title}
                  <Sparkles className="w-6 h-6 text-amber-300" />
                </h1>
                <p className="text-white/80">{t.services.subtitle}</p>
              </div>
            </div>
          </motion.div>

          {/* Category cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map(([type, info], index) => {
              const translatedCat = t.categories[type as CategoryType] || info;
              return (
                <motion.button
                  key={type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedCategory(type as any)}
                  className={`group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br ${info.gradient} text-white text-left shadow-lg hover:shadow-xl transition-all`}
                >
                  {/* Background glow */}
                  <motion.div
                    className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  
                  <motion.span 
                    className="text-4xl block mb-3"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <CategoryIcon name={info.iconComponent} className="w-10 h-10" />
                  </motion.span>
                  <h3 className="font-display text-xl font-bold mb-1">{translatedCat.title}</h3>
                  <p className="text-white/80 text-sm">{translatedCat.subtitle}</p>
                  
                  <motion.div
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ x: -10 }}
                  whileHover={{ x: 0 }}
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.div>
              </motion.button>
              );
            })}
          </div>
        </main>
        <FloatingChatButton />
      </div>
    );
  }

  const info = categoryInfo[selectedCategory];
  const services = servicesByCategory[selectedCategory] || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => {
            setSelectedCategory(null);
          }}
          className="flex items-center gap-2 text-primary font-medium mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </motion.button>

        {/* Category Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${info.gradient} p-6 md:p-8 text-white mb-6`}
        >
          {/* Background decorations */}
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          <div className="relative flex items-start gap-4">
            <motion.span 
              className="text-5xl md:text-6xl"
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              <CategoryIcon name={info.iconComponent} className="w-12 h-12 md:w-14 md:h-14" />
            </motion.span>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold mb-1 flex items-center gap-2">
                {info.title}
                <Sparkles className="w-6 h-6 text-amber-300" />
              </h1>
              <p className="text-white/90">{info.subtitle}</p>
            </div>
          </div>
        </motion.div>

        {/* Services List */}
        <div className="space-y-3">
          <AnimatePresence>
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/service/${service.id}`}
                  className="group block bg-card rounded-2xl p-5 border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-primary font-medium text-sm">
                        {service.subtitle}
                      </p>
                    </div>
                    <motion.div
                      className="p-2 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors"
                      whileHover={{ scale: 1.1, x: 5 }}
                    >
                      <ChevronRight className="w-5 h-5 text-primary" />
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pt-6 border-t border-border mt-8"
        >
          <p className="text-muted-foreground text-sm mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Quick Links
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/govt-schemes"
              className="group flex items-center gap-3 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 text-amber-700 rounded-xl p-4 hover:shadow-md transition-all"
            >
              <motion.div
                className="p-2 bg-amber-500/10 rounded-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Landmark className="w-5 h-5" />
              </motion.div>
              <span className="font-medium text-sm">Govt Schemes</span>
            </Link>
            <Link
              to="/health-tips"
              className="group flex items-center gap-3 bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-200/50 text-sky-700 rounded-xl p-4 hover:shadow-md transition-all"
            >
              <motion.div
                className="p-2 bg-sky-500/10 rounded-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Lightbulb className="w-5 h-5" />
              </motion.div>
              <span className="font-medium text-sm">Health Tips</span>
            </Link>
          </div>
        </motion.div>
      </main>
      <FloatingChatButton />
    </div>
  );
}
