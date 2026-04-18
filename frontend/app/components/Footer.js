"use client";
import Link from "next/link";
import { Key } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../../translations";

export default function Footer() {
  const { settings } = useSettings();
  const { lang, dir } = useLanguage();
  const t = translations[lang].footer;

  return (
    <footer className="border-t border-white/5 mt-20 pt-16 pb-8 px-6" dir={dir}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 max-w-7xl mx-auto">
        <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center transform group-hover:-translate-y-1 transition-all">
                    <Key className="text-white rotate-45" size={20} />
                </div>
                <span className="text-2xl font-black tracking-tighter text-white">{settings?.platformName || "KeeStore"}</span>
            </Link>
            <p className="text-gray-400 max-w-sm">
                {settings?.footerText || "The most secure, lightning-fast platform designed to deliver premium digital keys and software assets directly to you 24/7."}
            </p>
        </div>
        
        <div>
            <h4 className="font-bold mb-6 text-white uppercase tracking-widest text-xs opacity-50">{t.platform}</h4>
            <ul className="flex flex-col gap-4 text-gray-400">
                <li><Link href="/" className="hover:text-primary transition-colors">{translations[lang].nav.products}</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary transition-colors">{translations[lang].nav.dashboard}</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">{translations[lang].nav.about}</Link></li>
            </ul>
        </div>

        <div>
            <h4 className="font-bold mb-6 text-white uppercase tracking-widest text-xs opacity-50">{t.support}</h4>
            <ul className="flex flex-col gap-4 text-gray-400">
                <li><Link href="/faq" className="hover:text-primary transition-colors">{t.faq}</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">{translations[lang].nav.contact}</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">{t.privacy}</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">{t.terms}</Link></li>
                <li><Link href="/refund" className="hover:text-primary transition-colors">{t.refund}</Link></li>
            </ul>
        </div>
      </div>
      
      <div className="border-t border-white/5 pt-8 text-center text-gray-500 text-sm flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} {settings?.platformName || "KeeStore"}. All Rights Reserved.</p>
        <p className="font-bold text-gray-400">{t.developedBy} <span className="text-primary italic">Yassin Khaled</span></p>
        <p>{t.secure}</p>
      </div>
    </footer>
  );
}
