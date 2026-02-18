// components/LanguageSwitcher.tsx
'use client';

import { useLocale } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from '@/i18n/navigation';
import "flag-icons/css/flag-icons.min.css";

const languages = [
  { code: 'pt', name: 'Português', flag: <span className="fi fi-pt"></span> },
  { code: 'en', name: 'English', flag: <span className="fi fi-us"></span> },
];

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLanguage = (locale: string) => {
    router.replace(pathname, { locale });
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-0 right-6 z-50" ref={dropdownRef}>
      {/* Main button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-black/10 backdrop-blur-md 
                   hover:bg-black/20 text-white px-4 py-1 rounded-t-md
                   border border-white/20 shadow-lg transition-all
                   hover:scale-105 active:scale-95"
        aria-label="Select language"
      >
        <span className="text-xl">
          {currentLanguage.flag}
        </span>
        {/* <span className="font-medium">{currentLanguage.name}</span> */}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full right-0 mb-2 w-48
                       bg-black/20 backdrop-blur-md rounded-2xl
                       border border-white/20 shadow-xl overflow-hidden"
          >
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => switchLanguage(language.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left
                           transition-colors hover:bg-white/10
                           ${currentLocale === language.code ? 'bg-white/5' : ''}
                           ${language.code !== languages[languages.length - 1].code ? 'border-b border-white/10' : ''}`}
              >
                <span className="text-xl">
                  {language.flag}
                </span>
                <span className="flex-1 font-medium text-white">
                  {language.name}
                </span>
                {currentLocale === language.code && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}