import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { healthTips } from '@/data/healthData';
import Header from '@/components/layout/Header';
import FloatingChatButton from '@/components/layout/FloatingChatButton';
import { ArrowLeft, Lightbulb, Sparkles, Heart, MessageCircle, Search } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

export default function HealthTips() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTip, setExpandedTip] = useState<number | null>(null);

  const filteredTips = healthTips.filter(tip =>
    tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tip.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, y: 0 }}
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
          className="relative overflow-hidden bg-gradient-to-br from-sky-500 via-cyan-500 to-teal-500 rounded-3xl p-6 md:p-8 text-white mb-6"
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
              <Lightbulb className="w-8 h-8" />
            </motion.div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
                {t.healthTips.title}
                <Sparkles className="w-6 h-6 text-amber-300" />
              </h1>
              <p className="text-white/80">{t.healthTips.subtitle}</p>
            </div>
          </div>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-6"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t.healthTips.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-border/50 h-12"
          />
        </motion.div>

        {/* Tips count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-4"
        >
          <Heart className="w-4 h-4 text-primary" />
          <span>
            <span className="font-semibold text-foreground">{filteredTips.length}</span>
            {' '}{t.healthTips.tipsFound}
          </span>
        </motion.div>

        {/* Tips Grid */}
        <div className="grid gap-4">
          <AnimatePresence>
            {filteredTips.map((tip, index) => (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                layout
                onClick={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
                className={`group bg-card rounded-2xl border shadow-sm p-5 md:p-6 cursor-pointer transition-all duration-300 ${
                  expandedTip === tip.id ? 'border-primary/30 shadow-md' : 'border-border/50 hover:shadow-md hover:border-primary/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <motion.span 
                    className="text-4xl md:text-5xl"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {tip.icon}
                  </motion.span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                      {tip.title}
                    </h3>
                    <p className="text-primary font-medium text-sm mb-2">
                      {tip.subtitle}
                    </p>
                    <motion.div
                      initial={false}
                      animate={{ height: expandedTip === tip.id ? 'auto' : '48px' }}
                      className="overflow-hidden"
                    >
                      <p className="text-muted-foreground leading-relaxed">
                        {tip.content}
                      </p>
                    </motion.div>
                    {tip.content.length > 100 && (
                      <span className="text-xs text-primary mt-2 inline-block">
                        {expandedTip === tip.id ? 'Tap to collapse' : 'Tap to read more'}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {filteredTips.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-muted-foreground"
          >
            <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No tips found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </motion.div>
        )}

        {/* CTA section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 bg-gradient-to-br from-primary/5 via-primary/10 to-accent/10 rounded-2xl border border-primary/20"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Need Personalized Advice?</h3>
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            Chat with our Health Assistant for tips tailored to your specific needs
          </p>
          <Link to="/chat">
            <Button className="w-full rounded-xl gradient-hero">
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Health Chat
            </Button>
          </Link>
        </motion.div>
      </main>
      <FloatingChatButton />
    </div>
  );
}
