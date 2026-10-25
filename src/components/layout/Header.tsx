/**
 * NirogCare - Premium Header Component
 * Features: Dark mode toggle, Language selector, smooth animations
 */

import { Heart, Menu, Globe, MessageSquare, Sparkles, X, ChevronRight, Home, Briefcase, MapPin, Lightbulb, Settings, User, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import LanguageSelector from './LanguageSelector';
import { useThemeContext } from '@/components/ui/ThemeProvider';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppContext } from '@/context/AppContext';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  const { selectedLanguage, t: appT } = useAppContext();

  // Theme context for dark mode
  const { updateTheme, isDarkMode } = useThemeContext();

  const navLinks = [
    { href: '/', label: t.header.home, icon: Home },
    { href: '/services', label: t.header.services, icon: Briefcase },
    { href: '/nearby-stores', label: t.header.nearbyStores, icon: MapPin },
    { href: '/health-tips', label: t.healthTips.title, icon: Lightbulb },
  ];

  const quickLinks = [
    { href: '/dashboard', label: appT.dashboard || 'Dashboard', icon: User },
    { href: '/settings', label: appT.settings || 'Settings', icon: Settings },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    updateTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${isScrolled
            ? 'bg-background/90 backdrop-blur-md border-b border-border shadow-sm'
            : 'bg-background/80 backdrop-blur-sm'
          }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-2xl gradient-hero flex items-center justify-center shadow-sm"
              >
                <Heart className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" fill="currentColor" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display font-bold text-lg md:text-xl text-foreground leading-tight flex items-center gap-2">
                  {t.hero.title}
                  <Sparkles className="w-4 h-4 text-primary" />
                </h1>
                <p className="text-xs text-muted-foreground">{t.hero.badge}</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl relative"
                onClick={toggleDarkMode}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>

              {/* Language Button with Active Language Label */}
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-1.5 text-xs sm:text-sm font-semibold border-primary/20 hover:bg-primary/10"
                onClick={() => setShowLangModal(true)}
                title={t.header.chooseLanguage}
              >
                <Globe className="w-4 h-4 text-primary" />
                <span>{selectedLanguage}</span>
              </Button>

              {/* AI Chat Button - Desktop */}
              <Link to="/chat" className="hidden md:block">
                <Button className="rounded-xl gradient-hero shadow-sm hover:opacity-95 transition-all gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>{t.header.aiChat}</span>
                </Button>
              </Link>

              {/* Mobile Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0 border-l border-border">
                  <div className="flex flex-col h-full">
                    {/* Sheet Header */}
                    <div className="p-6 border-b border-border bg-gradient-to-br from-primary/5 to-transparent">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center shadow-md">
                          <Heart className="w-6 h-6 text-primary-foreground" fill="currentColor" />
                        </div>
                        <div>
                          <h2 className="font-display font-bold text-lg flex items-center gap-2">
                            {t.hero.title}
                            <Sparkles className="w-4 h-4 text-primary" />
                          </h2>
                          <p className="text-xs text-muted-foreground">{t.hero.badge}</p>
                        </div>
                      </div>

                      {/* Theme Toggle in Mobile Menu */}
                      <div className="mt-4 flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                        <span className="text-sm font-medium text-foreground">Dark Mode</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleDarkMode}
                          className="rounded-lg h-8 px-3"
                        >
                          {isDarkMode ? (
                            <><Sun className="w-4 h-4 mr-2 text-yellow-500" /> Light</>
                          ) : (
                            <><Moon className="w-4 h-4 mr-2" /> Dark</>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                      {navLinks.map((link) => {
                        const isActive = location.pathname === link.href;
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.href}
                            to={link.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                              isActive
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-foreground hover:bg-muted'
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                            <span className="flex-1">{link.label}</span>
                            <ChevronRight className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                          </Link>
                        );
                      })}

                      {/* Divider */}
                      <div className="py-4">
                        <div className="h-px bg-border" />
                      </div>

                      {/* Quick Links */}
                      <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {t.quickTools.title}
                      </p>
                      {quickLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.href}
                            to={link.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-muted transition-colors"
                          >
                            <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="flex-1">{link.label}</span>
                          </Link>
                        );
                      })}
                    </nav>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-border space-y-3 bg-muted/30">
                      {/* Language Selector Button */}
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowLangModal(true);
                          setIsOpen(false);
                        }}
                        className="w-full rounded-xl h-12 text-base font-semibold"
                      >
                        <Globe className="w-5 h-5 mr-2" />
                        {t.header.chooseLanguage} ({selectedLanguage})
                      </Button>

                      <Link to="/chat" onClick={() => setIsOpen(false)}>
                        <Button className="w-full rounded-xl gradient-hero gap-2 h-12 text-base font-semibold shadow-md">
                          <MessageSquare className="w-5 h-5" />
                          <span>{t.hero.aiHealthChat}</span>
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        className="w-full rounded-xl h-12 text-base font-semibold"
                        onClick={() => window.open('tel:108')}
                      >
                        <span className="flex items-center gap-2">
                          🚨 {t.hero.emergency}
                        </span>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <LanguageSelector open={showLangModal} onOpenChange={setShowLangModal} />
    </>
  );
}
