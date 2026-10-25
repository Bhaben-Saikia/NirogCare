import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { govtSchemes } from '@/data/healthData';
import Header from '@/components/layout/Header';
import FloatingChatButton from '@/components/layout/FloatingChatButton';
import { ArrowLeft, CheckCircle2, Landmark, Sparkles, Search, ExternalLink, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

export default function GovtSchemes() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedScheme, setExpandedScheme] = useState<number | null>(null);

  const filteredSchemes = govtSchemes.filter(scheme =>
    scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scheme.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-3xl p-6 md:p-8 text-white mb-6"
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
              <Landmark className="w-8 h-8" />
            </motion.div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
                {t.govtSchemes.title}
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </h1>
              <p className="text-white/80">{t.govtSchemes.subtitle}</p>
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
            placeholder={t.govtSchemes.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-border/50 h-12"
          />
        </motion.div>

        {/* Schemes count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-4"
        >
          <Users className="w-4 h-4 text-amber-500" />
          <span>
            <span className="font-semibold text-foreground">{filteredSchemes.length}</span>
            {' '}{t.govtSchemes.schemesAvailable}
          </span>
        </motion.div>

        {/* Schemes */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredSchemes.map((scheme, index) => (
              <motion.div
                key={scheme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                layout
                className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden"
              >
                {/* Scheme header */}
                <motion.div
                  className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200/50 p-5 cursor-pointer"
                  onClick={() => setExpandedScheme(expandedScheme === scheme.id ? null : scheme.id)}
                  whileHover={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <motion.div
                        className="p-2 bg-amber-500/10 rounded-xl"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Landmark className="w-5 h-5 text-amber-600" />
                      </motion.div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-amber-900">
                          {scheme.name}
                        </h3>
                        <p className="text-amber-700 font-medium text-sm">{scheme.subtitle}</p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedScheme === scheme.id ? 180 : 0 }}
                      className="text-amber-500"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Scheme content */}
                <AnimatePresence>
                  {expandedScheme === scheme.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 space-y-4">
                        <p className="text-foreground leading-relaxed">{scheme.description}</p>

                        <div>
                          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            Key Benefits
                          </h4>
                          <div className="grid gap-2">
                            {scheme.benefits.map((benefit, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex items-center gap-3 bg-primary/5 rounded-xl p-3"
                              >
                                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                <span className="text-sm text-foreground">{benefit}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-4">
                          <p className="text-sm">
                            <span className="font-semibold text-amber-800">Eligibility: </span>
                            <span className="text-amber-700">{scheme.eligibility}</span>
                          </p>
                        </div>

                        <Button className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Learn More
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {filteredSchemes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-muted-foreground"
          >
            <Landmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No schemes found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </motion.div>
        )}
      </main>
      <FloatingChatButton />
    </div>
  );
}
