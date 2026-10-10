export type Language = 'en' | 'ta' | 'hi';

export interface Translations {
  [key: string]: {
    en: string;
    ta: string;
    hi: string;
  };
}

export const translations: Translations = {
  // Navigation & Core Sections
  dashboard: {
    en: 'Dashboard',
    ta: 'டாஷ்போர்டு',
    hi: 'डैशबोर्ड',
  },
  browseBooks: {
    en: 'Browse Books',
    ta: 'புத்தகங்களை உலாவு',
    hi: 'किताबें ब्राउज़ करें',
  },
  myBooks: {
    en: 'My Books',
    ta: 'எனது புத்தகங்கள்',
    hi: 'मेरी पुस्तकें',
  },
  addBook: {
    en: 'Add Book',
    ta: 'புத்தகம் சேர்க்க',
    hi: 'किताब जोड़ें',
  },
  marketIntelligence: {
    en: 'Market Intelligence',
    ta: 'சந்தை நுண்ணறிவு',
    hi: 'मार्केट इंटेलिजेंस',
  },
  rentBooks: {
    en: 'Rent Books',
    ta: 'வாடகை புத்தகங்கள்',
    hi: 'किराये की पुस्तकें',
  },
  donations: {
    en: 'Book Donations',
    ta: 'புத்தக தானம்',
    hi: 'पुस्तक दान',
  },
  exchange: {
    en: 'Exchange',
    ta: 'பரிமாற்றம்',
    hi: 'पुस्तक विनिमय',
  },
  chatMessages: {
    en: 'Chat / Messages',
    ta: 'உரையாடல் / செய்திகள்',
    hi: 'चैट / संदेश',
  },
  deliveryTracking: {
    en: 'Delivery Tracking',
    ta: 'டெலிவரி கண்காணிப்பு',
    hi: 'डिलीवरी ट्रैकिंग',
  },
  apiAccess: {
    en: 'API Access',
    ta: 'ஏபிஐ அணுகல்',
    hi: 'एपीआई एक्सेस',
  },
  settings: {
    en: 'Settings',
    ta: 'அமைப்புகள்',
    hi: 'सेटिंग्स',
  },
  logout: {
    en: 'Log Out',
    ta: 'வெளியேறு',
    hi: 'लॉग आउट',
  },
  recentlyAccessed: {
    en: 'Recently Accessed Books',
    ta: 'சமீபத்தில் பார்த்த புத்தகங்கள்',
    hi: 'हाल ही में देखी गई पुस्तकें',
  },
  quickView: {
    en: 'Quick View',
    ta: 'விரைவு பார்வை',
    hi: 'त्वरित दृश्य',
  },
  fairPrice: {
    en: 'AI Fair Resale Price',
    ta: 'AI நியாயமான மறுவிற்பனை விலை',
    hi: 'एआई उचित पुनर्विक्रय मूल्य',
  },
  available: {
    en: 'Available',
    ta: 'கிடைக்கக்கூடியது',
    hi: 'उपलब्ध',
  },
  inTransit: {
    en: 'In Transit',
    ta: 'வழியில் உள்ளது',
    hi: 'रास्ते में है',
  },
  delivered: {
    en: 'Delivered',
    ta: 'வழங்கப்பட்டது',
    hi: 'वितरित',
  },
  searchPlaceholder: {
    en: 'Search by title, author, or ISBN...',
    ta: 'தலைப்பு, ஆசிரியர் அல்லது ISBN மூலம் தேடுங்கள்...',
    hi: 'शीर्षक, लेखक या ISBN से खोजें...',
  },
  welcomeBack: {
    en: 'Welcome back',
    ta: 'மீண்டும் நல்வரவு',
    hi: 'वापसी पर स्वागत है',
  },
  platformTagline: {
    en: 'Intelligent Second-Hand Academic Book Marketplace & Cyclic Barter Rings',
    ta: 'அறிவுசார் பழைய கல்விப் புத்தக சந்தை மற்றும் சுழற்சி பரிமாற்றம்',
    hi: 'स्मार्ट सेकंड-हैंड अकादमिक पुस्तक बाज़ार और चक्रीय विनिमय प्रणाली',
  },
};

export function getTranslation(key: string, lang: Language = 'en'): string {
  if (translations[key] && translations[key][lang]) {
    return translations[key][lang];
  }
  return key;
}
