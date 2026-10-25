/**
 * NirogCare - Premium Footer Component
 * A comprehensive footer with links, social media, and app download sections
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Heart,
    MapPin,
    Phone,
    Mail,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Github,
    ArrowUpRight,
    Sparkles
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppContext } from '@/context/AppContext';

const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Github, href: '#', label: 'GitHub' },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const { t } = useTranslation();
    const { t: appT } = useAppContext();

    const footerLinks = {
        product: [
            { label: t.hero.aiHealthChat, href: '/chat' },
            { label: t.nearbyStores.title, href: '/nearby-stores' },
            { label: t.quickTools.healthTools, href: '/health-tools' },
            { label: 'Symptom Checker', href: '/symptom-checker' },
        ],
        resources: [
            { label: t.quickTools.healthTips, href: '/health-tips' },
            { label: t.quickTools.govtSchemes, href: '/govt-schemes' },
            { label: appT.dashboard, href: '/dashboard' },
            { label: appT.settings, href: '/settings' },
        ],
        company: [
            { label: 'About Us', href: '#' },
            { label: 'Careers', href: '#' },
            { label: 'Blog', href: '#' },
            { label: 'Contact', href: '#' },
        ],
        legal: [
            { label: 'Privacy Policy', href: '#' },
            { label: 'Terms of Service', href: '#' },
            { label: 'Cookie Policy', href: '#' },
            { label: 'Disclaimer', href: '#' },
        ],
    };

    return (
        <footer className="bg-gradient-to-b from-background to-muted/30 border-t border-border/50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
                    animate={{ y: [0, -30, 0] }}
                    transition={{ duration: 10, repeat: Infinity }}
                />
                <motion.div
                    className="absolute top-0 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl"
                    animate={{ y: [0, 30, 0] }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
            </div>

            <div className="container mx-auto px-4 relative">
                {/* Newsletter Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="py-10 md:py-14 border-b border-border/50"
                >
                    <div className="max-w-2xl mx-auto text-center">
                        <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                            {t.healthTips.title}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            {t.healthTips.subtitle}
                        </p>
                        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-5 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-6 py-3 rounded-xl gradient-hero text-white font-semibold shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
                            >
                                Subscribe
                            </motion.button>
                        </form>
                    </div>
                </motion.div>

                {/* Main Footer Content */}
                <div className="py-12 md:py-16">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-6">
                        {/* Brand Column */}
                        <div className="col-span-2">
                            <Link to="/" className="inline-flex items-center gap-3 mb-5">
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    className="w-12 h-12 rounded-2xl gradient-hero flex items-center justify-center shadow-glow"
                                >
                                    <Heart className="w-6 h-6 text-primary-foreground" fill="currentColor" />
                                </motion.div>
                                <div>
                                    <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                                        {t.hero.title}
                                        <Sparkles className="w-4 h-4 text-primary" />
                                    </h2>
                                    <p className="text-xs text-muted-foreground">{t.hero.badge}</p>
                                </div>
                            </Link>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                                {t.hero.subtitle}
                            </p>

                            {/* Contact Info */}
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <a href="mailto:bhabens170@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                                    <Mail className="w-4 h-4" />
                                    bhabens170@gmail.com
                                </a>
                                <a href="tel:+916000580631" className="flex items-center gap-2 hover:text-primary transition-colors">
                                    <Phone className="w-4 h-4" />
                                    +91 6000580631
                                </a>
                                <p className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Itanagar, Nirjuli, India
                                </p>
                            </div>
                        </div>

                        {/* Links Columns */}
                        <div>
                            <h4 className="font-semibold text-foreground mb-4">{t.header.services}</h4>
                            <ul className="space-y-2.5">
                                {footerLinks.product.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            to={link.href}
                                            className="text-muted-foreground text-sm hover:text-primary transition-colors inline-flex items-center gap-1 group"
                                        >
                                            {link.label}
                                            <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-foreground mb-4">{t.quickTools.title}</h4>
                            <ul className="space-y-2.5">
                                {footerLinks.resources.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            to={link.href}
                                            className="text-muted-foreground text-sm hover:text-primary transition-colors inline-flex items-center gap-1 group"
                                        >
                                            {link.label}
                                            <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-foreground mb-4">Company</h4>
                            <ul className="space-y-2.5">
                                {footerLinks.company.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-muted-foreground text-sm hover:text-primary transition-colors"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
                            <ul className="space-y-2.5">
                                {footerLinks.legal.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-muted-foreground text-sm hover:text-primary transition-colors"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="py-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Copyright */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-muted-foreground text-sm text-center md:text-left"
                    >
                        © {currentYear} NirogCare. All rights reserved. Made with{' '}
                        <motion.span
                            className="text-red-500 inline-block"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            ❤️
                        </motion.span>
                        {' '}in India
                    </motion.p>

                    {/* Social Links */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-2"
                    >
                        {socialLinks.map((social, index) => {
                            const Icon = social.icon;
                            return (
                                <motion.a
                                    key={social.label}
                                    href={social.href}
                                    aria-label={social.label}
                                    initial={{ opacity: 0, scale: 0 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.15, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-10 h-10 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center text-muted-foreground transition-colors"
                                >
                                    <Icon className="w-4 h-4" />
                                </motion.a>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </footer>
    );
}
