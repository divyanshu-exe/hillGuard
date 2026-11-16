import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Square, Radio, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageCode } from '../../i18n/translations';

// Spoken scripts tailored for each language
const VOICE_SCRIPTS: Record<LanguageCode, { text: string; langTag: string }> = {
  en: {
    text: 'HillGuard Mountain Advisory. Monitoring 5 major passes. Critical warning: Sela Tunnel to Tawang route has rockfall blockage at kilometer 48. Soil moisture elevated. Normal passes permitted with caution.',
    langTag: 'en-IN'
  },
  hi: {
    text: 'हिलगार्ड पर्वतीय मार्ग बुलेटिन। अरुणाचल के पाँच प्रमुख दर्रों की निगरानी की जा रही है। सेला टनल से तवांग मार्ग पर किलोमीटर 48 पर चट्टान गिरने से रास्ता बंद है। कृपया सावधानी बरतें और सुरक्षित यात्रा करें।',
    langTag: 'hi-IN'
  },
  as: {
    text: 'হিলগাৰ্ড পাহাৰীয়া পথ সতৰ্কতা। বৰ্তমান ৫টা ঘাইপথৰ নিৰীক্ষণ চলি আছে। চেলা সুৰংগৰ পৰা তাৱাং পথত ৪৮ নং কিলোমিটাৰত শিল পৰি পথ বন্ধ হৈ আছে। সাৱধানে যাত্ৰা কৰক।',
    langTag: 'as-IN'
  },
  bn: {
    text: 'হিলগার্ড পাহাড়ি রাস্তা বুলেটিন। ৫টি প্রধান গিরিপথ নজরদারিতে রয়েছে। সেলা টানেল থেকে তাওয়াং রুটে কিমি ৪৮-এ পাথর ধসে রাস্তা বন্ধ। সাবধানে গাড়ি চালান।',
    langTag: 'bn-IN'
  },
  ta: {
    text: 'ஹில்கார்ட் சாலை பாதுகாப்பு அறிக்கை. சேலா சுரங்கம் முதல் தவாங் வரை கி.மீ 48ல் பாறை விழுந்து பாதை மூடப்பட்டுள்ளது. எச்சரிக்கையுடன் பயணிக்கவும்.',
    langTag: 'ta-IN'
  },
  te: {
    text: 'హిల్ గార్డ్ రహదారి భద్రతా ప్రకటన. సేలా టన్నెల్ నుండి తవాంగ్ మార్గంలో కి.మీ 48 వద్ద రాతిపతనం కారణంగా రహదారి మూసివేయబడింది. జాగ్రత్తగా ప్రయాణించండి.',
    langTag: 'te-IN'
  },
  mr: {
    text: 'हिलगार्ड रस्ता सुरक्षा सूचना. सेला बोगदा ते तवांग मार्गावर कि.मी 48 वर दरड कोसळल्याने रस्ता बंद आहे. कृपया काळजीपूर्वक प्रवास करा.',
    langTag: 'mr-IN'
  },
  ne: {
    text: 'हिलगार्ड सडक सुरक्षा बुलेटिन। सेला सुरुङदेखि तवाङ मार्गमा कि.मी 48 मा चट्टान खसेर बाटो बन्द छ। कृपया सावधानीपूर्वक यात्रा गर्नुहोस्।',
    langTag: 'ne-NP'
  },
  gu: {
    text: 'હિલગાર્ડ રસ્તા સુરક્ષા બુલેટિન. સેલા ટનલથી તવાંગ માર્ગ પર કિ.મી 48 પર ખડક પડવાથી રસ્તો બંધ છે. સાવચેતીપૂર્વક મુસાફરી કરો.',
    langTag: 'gu-IN'
  },
  pa: {
    text: 'ਹਿੱਲਗਾਰਡ ਸੜਕ ਸੁਰੱਖਿਆ ਬੁਲੇਟਿਨ। ਸੇਲਾ ਸੁਰੰਗ ਤੋਂ ਤਵਾਂਗ ਰਸਤੇ ਤੇ ਕਿਲੋਮੀਟਰ 48 ਤੇ ਚੱਟਾਨ ਡਿੱਗਣ ਕਾਰਨ ਰਸਤਾ ਬੰਦ ਹੈ। ਸਾਵਧਾਨੀ ਨਾਲ ਯਾਤਰਾ ਕਰੋ।',
    langTag: 'pa-IN'
  },
  kn: {
    text: 'ಹಿಲ್‌ಗಾರ್ಡ್ ರಸ್ತೆ ಸುರಕ್ಷತಾ ಪ್ರಕಟಣೆ. ಸೇಲಾ ಸುರಂಗದಿಂದ ತವಾಂಗ್ ಮಾರ್ಗದಲ್ಲಿ ಕಿ.ಮೀ 48 ರಲ್ಲಿ ಬಂಡೆ ಕುಸಿತದಿಂದ ರಸ್ತೆ ಮುಚ್ಚಲಾಗಿದೆ. ಜಾಗರೂಕರಾಗಿರಿ.',
    langTag: 'kn-IN'
  },
  ml: {
    text: 'ഹിൽഗാർഡ് റോഡ് സുരക്ഷാ അറിയിപ്പ്. സേലാ ടണൽ മുതൽ തവാങ് വരെയുള്ള റൂട്ടിൽ കി.മീ 48-ൽ പാറ വീണു റോഡ് തടസ്സപ്പെട്ടിരിക്കുന്നു. ശ്രദ്ധയോടെ യാത്ര ചെയ്യുക.',
    langTag: 'ml-IN'
  },
  or: {
    text: 'ହିଲଗାର୍ଡ ରାସ୍ତା ସୁରକ୍ଷା ବୁଲେଟିନ। ସେଲା ଟନେଲରୁ ତାୱାଙ୍ଗ ମାର୍ଗରେ କି.ମି ୪୮ରେ ଶିଳା ଖସି ରାସ୍ତା ବନ୍ଦ ଅଛି। ସାବଧାନରେ ଯାତ୍ରା କରନ୍ତୁ।',
    langTag: 'or-IN'
  },
  ur: {
    text: 'ہل گارڈ روڈ الرٹ۔ سیلا ٹنل سے تاوانگ راستے پر کلومیٹر 48 پر چٹان گرنے کی وجہ سے سڑک بند ہے۔ احتیاط سے سفر کریں۔',
    langTag: 'ur-IN'
  }
};

export const VoiceStatusAnnouncement: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop when language switches
  useEffect(() => {
    if (isPlaying && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, [language]);

  const handleSpeak = () => {
    if (!isSupported) {
      toast.error('Voice playback is not supported on this browser.');
      return;
    }

    const synth = window.speechSynthesis;

    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
      toast('Voice announcement stopped', { icon: '⏹️' });
      return;
    }

    synth.cancel(); // Stop any pending speech

    const config = VOICE_SCRIPTS[language] || VOICE_SCRIPTS.en;
    const utterance = new SpeechSynthesisUtterance(config.text);
    utteranceRef.current = utterance;

    utterance.lang = config.langTag;
    utterance.rate = 0.92; // Slightly measured rate for clear road safety advisories
    utterance.pitch = 1.0;

    // Try finding a matching voice if available
    const voices = synth.getVoices();
    const matchingVoice = voices.find(
      (v) => v.lang.startsWith(config.langTag.slice(0, 2)) || v.lang.includes(config.langTag)
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      toast.success('Playing audio road safety bulletin...', { icon: '🔊', duration: 3000 });
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = (e) => {
      setIsPlaying(false);
      // Some browsers report cancel as error, ignore cancel
      if (e.error !== 'canceled') {
        console.warn('Speech synthesis error:', e);
      }
    };

    synth.speak(utterance);
  };

  return (
    <div
      className={`inline-flex items-center gap-2 p-1.5 px-3 rounded-full bg-emerald-900/10 hover:bg-emerald-900/20 border border-emerald-600/30 text-emerald-900 transition backdrop-blur-xs ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
        <span className="text-xs font-semibold tracking-tight text-emerald-950">
          Audio Road Bulletin
        </span>
      </div>

      <button
        onClick={handleSpeak}
        type="button"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 ${
          isPlaying
            ? 'bg-red-600 text-white animate-pulse hover:bg-red-700'
            : 'bg-emerald-600 text-white hover:bg-emerald-700'
        }`}
        title="Hear live mountain road status spoken aloud"
      >
        {isPlaying ? (
          <>
            <Square className="w-3 h-3 fill-current" />
            <span>Stop Audio</span>
            {/* Equalizer animation bars */}
            <span className="flex items-end gap-0.5 h-3 ml-1">
              <span className="w-0.5 h-full bg-white rounded-full animate-bounce" />
              <span className="w-0.5 h-2/3 bg-white rounded-full animate-bounce delay-75" />
              <span className="w-0.5 h-full bg-white rounded-full animate-bounce delay-150" />
            </span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5" />
            <span>Suno / Listen Status</span>
          </>
        )}
      </button>
    </div>
  );
};
