"use client";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function Breadcrumbs({ items = [] }) {
    const { lang, dir } = useLanguage();

    return (
        <nav className="flex mb-8 overflow-x-auto no-scrollbar py-2" aria-label="Breadcrumb" dir={dir}>
            <ol className="flex items-center space-x-1 md:space-x-3 whitespace-nowrap">
                <li className="inline-flex items-center">
                    <Link href="/" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-colors">
                        <Home className="w-4 h-4 mr-2.5" />
                        {lang === 'ar' ? 'الرئيسية' : 'Home'}
                    </Link>
                </li>
                
                {items.map((item, index) => (
                    <li key={index}>
                        <div className="flex items-center">
                            <ChevronRight className={`w-4 h-4 text-slate-400 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                            {item.href ? (
                                <Link 
                                    href={item.href} 
                                    className="ml-1 md:ml-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors max-w-[150px] truncate"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="ml-1 md:ml-2 text-sm font-black text-slate-900 border-b-2 border-primary/20 pb-0.5">
                                    {item.label}
                                </span>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
