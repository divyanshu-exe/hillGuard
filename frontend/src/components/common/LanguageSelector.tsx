import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageCode } from '../../i18n/translations';

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  compact = true,
  className = ''
}) => {
  const { language, setLanguage, languages, currentLanguageOption } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[#0b251a] hover:bg-[#164330] text-slate-200 hover:text-white border border-emerald-900 text-xs font-medium transition cursor-pointer shadow-xs active:scale-95"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Change Language / भाषा बदलें"
      >
        <Globe className="w-4 h-4 text-emerald-400" />
        {!compact && (
          <span className="font-semibold tracking-wide">
            {currentLanguageOption.nativeLabel}
          </span>
        )}
        {compact && (
          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
            {language}
          </span>
        )}
        <ChevronDown
          className={`w-3 h-3 text-emerald-400/80 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl shadow-slate-900/20 border border-slate-200 py-1.5 z-[60] animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
            <span>Select Language</span>
            <span className="text-[10px] text-emerald-600 font-semibold">भाषा चुनें</span>
          </div>

          <div className="py-1 max-h-72 overflow-y-auto">
            {languages.map((item) => {
              const isSelected = item.code === language;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelect(item.code)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm leading-none">{item.flag}</span>
                    <div>
                      <div className="font-semibold text-slate-900">{item.nativeLabel}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{item.label}</div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
