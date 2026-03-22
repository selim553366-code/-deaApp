import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'tr' | 'en-us' | 'en-uk';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translations = {
  premium: {
    tr: 'Premium',
    'en-us': 'Premium',
    'en-uk': 'Premium',
  },
  help: {
    tr: 'Yardım',
    'en-us': 'Help',
    'en-uk': 'Help',
  },
  login: {
    tr: 'Giriş',
    'en-us': 'Login',
    'en-uk': 'Login',
  },
  signup: {
    tr: 'Kayıt',
    'en-us': 'Sign Up',
    'en-uk': 'Sign Up',
  },
  logout: {
    tr: 'Çıkış Yap',
    'en-us': 'Logout',
    'en-uk': 'Logout',
  },
  credits: {
    tr: 'Kredi',
    'en-us': 'Credits',
    'en-uk': 'Credits',
  },
  templates: {
    tr: 'Şablonlar',
    'en-us': 'Templates',
    'en-uk': 'Templates',
  },
  projects: {
    tr: 'Projelerim',
    'en-us': 'My Projects',
    'en-uk': 'My Projects',
  },
  home: {
    tr: 'Ana Sayfa',
    'en-us': 'Home',
    'en-uk': 'Home',
  },
  aiAssistant: {
    tr: 'Yardımcı AI',
    'en-us': 'AI Assistant',
    'en-uk': 'AI Assistant',
  },
  expand: {
    tr: 'Genişlet',
    'en-us': 'Expand',
    'en-uk': 'Expand',
  },
  collapse: {
    tr: 'Daralt',
    'en-us': 'Collapse',
    'en-uk': 'Collapse',
  },
  upgrade: {
    tr: "Premium'a Geç",
    'en-us': 'Upgrade to Premium',
    'en-uk': 'Upgrade to Premium',
  },
  upgradeDesc: {
    tr: 'Sınırsız güncelleme ve yayınlama hakkı kazan.',
    'en-us': 'Get unlimited updates and publishing rights.',
    'en-uk': 'Get unlimited updates and publishing rights.',
  },
  upgradeButton: {
    tr: 'Yükselt (399 TL/ay)',
    'en-us': 'Upgrade (399 TL/mo)',
    'en-uk': 'Upgrade (399 TL/mo)',
  },
  noProjects: {
    tr: 'Henüz proje oluşturmadınız.',
    'en-us': "You haven't created any projects yet.",
    'en-uk': "You haven't created any projects yet.",
  },
  newProject: {
    tr: 'Yeni Proje',
    'en-us': 'New Project',
    'en-uk': 'New Project',
  },
  placeholder: {
    tr: 'Web sitesi fikrinizi buraya yazın...',
    'en-us': 'Type your website idea here...',
    'en-uk': 'Type your website idea here...',
  },
  generate: {
    tr: 'Sihri Başlat',
    'en-us': 'Start Magic',
    'en-uk': 'Start Magic',
  },
  updating: {
    tr: 'Güncelleniyor...',
    'en-us': 'Updating...',
    'en-uk': 'Updating...',
  },
  analyzing: {
    tr: 'Analiz ediliyor...',
    'en-us': 'Analyzing...',
    'en-uk': 'Analyzing...',
  },
  mainTitle: {
    tr: 'Düşünceni Gerçeğe Çevir.',
    'en-us': 'Turn Your Idea Into Reality.',
    'en-uk': 'Turn Your Idea Into Reality.',
  },
  subTitle: {
    tr: 'Ne oluşturmak istersin?',
    'en-us': 'What would you like to create?',
    'en-uk': 'What would you like to create?',
  },
  startCreating: {
    tr: 'Oluşturmaya Başla',
    'en-us': 'Start Creating',
    'en-uk': 'Start Creating',
  },
  preparing: {
    tr: 'Hazırlanıyor...',
    'en-us': 'Preparing...',
    'en-uk': 'Preparing...',
  },
  importGemini: {
    tr: "Gemini'dan Aktar",
    'en-us': 'Import from Gemini',
    'en-uk': 'Import from Gemini',
  },
  importGeminiTitle: {
    tr: 'Gemini Geçmişinden İçe Aktar',
    'en-us': 'Import from Gemini History',
    'en-uk': 'Import from Gemini History',
  },
  importGeminiDesc: {
    tr: 'Gemini.google.com\'daki konuşma geçmişinizi kopyalayıp buraya yapıştırın. Yapay zeka, bu geçmişi analiz ederek istediğiniz web sitesini oluşturacaktır.',
    'en-us': 'Copy and paste your conversation history from Gemini.google.com here. The AI will analyze this history to create the website you want.',
    'en-uk': 'Copy and paste your conversation history from Gemini.google.com here. The AI will analyze this history to create the website you want.',
  },
  importGeminiPlaceholder: {
    tr: 'Gemini konuşma geçmişinizi buraya yapıştırın...',
    'en-us': 'Paste your Gemini conversation history here...',
    'en-uk': 'Paste your Gemini conversation history here...',
  },
  cancel: {
    tr: 'İptal',
    'en-us': 'Cancel',
    'en-uk': 'Cancel',
  },
  importAndContinue: {
    tr: 'İçe Aktar ve Devam Et',
    'en-us': 'Import and Continue',
    'en-uk': 'Import and Continue',
  },
  detailsTitle: {
    tr: 'Detayları Belirleyelim',
    'en-us': "Let's Define the Details",
    'en-uk': "Let's Define the Details",
  },
  preparingQuestions: {
    tr: 'Projeniz için en iyi sorular hazırlanıyor...',
    'en-us': 'Preparing the best questions for your project...',
    'en-uk': 'Preparing the best questions for your project...',
  },
  question: {
    tr: 'Soru',
    'en-us': 'Question',
    'en-uk': 'Question',
  },
  answerPlaceholder: {
    tr: 'Cevabınızı buraya yazın...',
    'en-us': 'Type your answer here...',
    'en-uk': 'Type your answer here...',
  },
  skipQuestions: {
    tr: 'Soruları Atla',
    'en-us': 'Skip Questions',
    'en-uk': 'Skip Questions',
  },
  nextQuestion: {
    tr: 'Sonraki Soru',
    'en-us': 'Next Question',
    'en-uk': 'Next Question',
  },
  preview: {
    tr: 'Önizleme',
    'en-us': 'Preview',
    'en-uk': 'Preview',
  },
  aiThinking: {
    tr: 'AI düşünüyor...',
    'en-us': 'AI is thinking...',
    'en-uk': 'AI is thinking...',
  },
  noResponse: {
    tr: 'Cevap alınamadı.',
    'en-us': 'No response received.',
    'en-uk': 'No response received.',
  },
  errorOccurred: {
    tr: 'Bir hata oluştu.',
    'en-us': 'An error occurred.',
    'en-uk': 'An error occurred.',
  },
  templatesTitle: {
    tr: 'Şablon Galerisi',
    'en-us': 'Template Gallery',
    'en-uk': 'Template Gallery',
  },
  templatesDesc: {
    tr: 'Projenize hızlıca başlamak için hazır şablonları kullanın.',
    'en-us': 'Use ready-made templates to quickly start your project.',
    'en-uk': 'Use ready-made templates to quickly start your project.',
  },
  searchPlaceholder: {
    tr: 'Şablon ara...',
    'en-us': 'Search templates...',
    'en-uk': 'Search templates...',
  },
  all: {
    tr: 'Tümü',
    'en-us': 'All',
    'en-uk': 'All',
  },
  pages: {
    tr: 'Sayfalar',
    'en-us': 'Pages',
    'en-uk': 'Pages',
  },
  buttons: {
    tr: 'Butonlar',
    'en-us': 'Buttons',
    'en-uk': 'Buttons',
  },
  components: {
    tr: 'Bileşenler',
    'en-us': 'Components',
    'en-uk': 'Components',
  },
  useTemplate: {
    tr: 'Şablonu Kullan',
    'en-us': 'Use Template',
    'en-uk': 'Use Template',
  },
  previewTemplate: {
    tr: 'Önizle',
    'en-us': 'Preview',
    'en-uk': 'Preview',
  },
  close: {
    tr: 'Kapat',
    'en-us': 'Close',
    'en-uk': 'Close',
  },
  startFromScratch: {
    tr: 'Sıfırdan Başla',
    'en-us': 'Start from Scratch',
    'en-uk': 'Start from Scratch',
  },
  startFromScratchDesc: {
    tr: 'Bu şablonu kullanarak yepyeni bir proje oluşturun.',
    'en-us': 'Create a brand new project using this template.',
    'en-uk': 'Create a brand new project using this template.',
  },
  createNewProject: {
    tr: 'Yeni Proje Oluştur',
    'en-us': 'Create New Project',
    'en-uk': 'Create New Project',
  },
  importToExisting: {
    tr: 'Mevcut Projeye Aktar',
    'en-us': 'Import to Existing Project',
    'en-uk': 'Import to Existing Project',
  },
  importToExistingDesc: {
    tr: 'Bu şablonu var olan bir projenize ekleyin.',
    'en-us': 'Add this template to one of your existing projects.',
    'en-uk': 'Add this template to one of your existing projects.',
  },
  selectProject: {
    tr: 'Proje Seçin...',
    'en-us': 'Select Project...',
    'en-uk': 'Select Project...',
  },
  importToSelected: {
    tr: 'Seçili Projeye Aktar',
    'en-us': 'Import to Selected Project',
    'en-uk': 'Import to Selected Project',
  },
  noProjectsYet: {
    tr: 'Henüz hiç projeniz yok.',
    'en-us': 'You don\'t have any projects yet.',
    'en-uk': 'You don\'t have any projects yet.',
  },
  or: {
    tr: 'veya',
    'en-us': 'or',
    'en-uk': 'or',
  },
  previewLabel: {
    tr: 'Önizleme',
    'en-us': 'Preview',
    'en-uk': 'Preview',
  },
  page: {
    tr: 'Sayfa',
    'en-us': 'Page',
    'en-uk': 'Page',
  },
  button: {
    tr: 'Buton',
    'en-us': 'Button',
    'en-uk': 'Button',
  },
  component: {
    tr: 'Bileşen',
    'en-us': 'Component',
    'en-uk': 'Component',
  },
  noResults: {
    tr: 'Sonuç bulunamadı',
    'en-us': 'No results found',
    'en-uk': 'No results found',
  },
  noResultsDesc: {
    tr: 'Arama kriterlerinize uygun şablon bulamadık. Lütfen farklı kelimeler deneyin.',
    'en-us': 'We couldn\'t find any templates matching your search criteria. Please try different words.',
    'en-uk': 'We couldn\'t find any templates matching your search criteria. Please try different words.',
  },
  previewAndUse: {
    tr: 'Önizle ve Kullan',
    'en-us': 'Preview and Use',
    'en-uk': 'Preview and Use',
  },
  projectSettings: {
    tr: 'Proje Ayarları',
    'en-us': 'Project Settings',
    'en-uk': 'Project Settings',
  },
  publishingStatus: {
    tr: 'Yayın Durumu',
    'en-us': 'Publishing Status',
    'en-uk': 'Publishing Status',
  },
  published: {
    tr: 'Yayında',
    'en-us': 'Published',
    'en-uk': 'Published',
  },
  notPublished: {
    tr: 'Yayında Değil',
    'en-us': 'Not Published',
    'en-uk': 'Not Published',
  },
  publishedDesc: {
    tr: 'Siteniz şu anda herkes tarafından görüntülenebilir.',
    'en-us': 'Your site is currently visible to everyone.',
    'en-uk': 'Your site is currently visible to everyone.',
  },
  notPublishedDesc: {
    tr: 'Siteniz gizli ve sadece sizin tarafınızdan görülebilir.',
    'en-us': 'Your site is private and only visible to you.',
    'en-uk': 'Your site is private and only visible to you.',
  },
  unpublish: {
    tr: 'Yayından Kaldır',
    'en-us': 'Unpublish',
    'en-uk': 'Unpublish',
  },
  publish: {
    tr: 'Yayınla',
    'en-us': 'Publish',
    'en-uk': 'Publish',
  },
  copy: {
    tr: 'Kopyala',
    'en-us': 'Copy',
    'en-uk': 'Copy',
  },
  goToSite: {
    tr: 'Siteye Git',
    'en-us': 'Go to Site',
    'en-uk': 'Go to Site',
  },
  changeProjectName: {
    tr: 'Proje İsmini Değiştir',
    'en-us': 'Change Project Name',
    'en-uk': 'Change Project Name',
  },
  payToChangeName: {
    tr: 'Proje ismini değiştirmek için 50.99 TL ödemeniz gerekmektedir. (Premium üyeler için ücretsizdir)',
    'en-us': 'You need to pay 50.99 TL to change the project name. (Free for Premium members)',
    'en-uk': 'You need to pay 50.99 TL to change the project name. (Free for Premium members)',
  },
  payAmount: {
    tr: '50.99 TL Öde',
    'en-us': 'Pay 50.99 TL',
    'en-uk': 'Pay 50.99 TL',
  },
  save: {
    tr: 'Kaydet',
    'en-us': 'Save',
    'en-uk': 'Save',
  },
  nameUpdated: {
    tr: 'İsim güncellendi!',
    'en-us': 'Name updated!',
    'en-uk': 'Name updated!',
  },
  analytics: {
    tr: 'Analizler',
    'en-us': 'Analytics',
    'en-uk': 'Analytics',
  },
  totalViews: {
    tr: 'Toplam Görüntülenme',
    'en-us': 'Total Views',
    'en-uk': 'Total Views',
  },
  uniqueVisitors: {
    tr: 'Tekil Ziyaretçi',
    'en-us': 'Unique Visitors',
    'en-uk': 'Unique Visitors',
  },
  comingSoon: {
    tr: 'Yakında',
    'en-us': 'Coming Soon',
    'en-uk': 'Coming Soon',
  },
  secrets: {
    tr: 'Ortam Değişkenleri (Secrets)',
    'en-us': 'Environment Variables (Secrets)',
    'en-uk': 'Environment Variables (Secrets)',
  },
  secretsDesc: {
    tr: 'API anahtarları ve gizli değişkenleri buradan yönetebilirsiniz. (Bu özellik yakında eklenecektir)',
    'en-us': 'You can manage API keys and secret variables from here. (This feature will be added soon)',
    'en-uk': 'You can manage API keys and secret variables from here. (This feature will be added soon)',
  },
  welcomeTitle: {
    tr: "İdea Ai",
    'en-us': "İdea Ai",
    'en-uk': "İdea Ai",
  },
  welcomeSubTitle: {
    tr: "Türkiye'nin Tek Güvenilir Web Sitesi Oluşturucusu",
    'en-us': "Turkey's Only Reliable Website Builder",
    'en-uk': "Turkey's Only Reliable Website Builder",
  },
  welcomeDesc: {
    tr: 'Fikirlerinizi saniyeler içinde çalışan prototiplere dönüştürün. Yapay zeka destekli geliştirme asistanınızla hemen üretmeye başlayın.',
    'en-us': 'Turn your ideas into working prototypes in seconds. Start producing immediately with your AI-powered development assistant.',
    'en-uk': 'Turn your ideas into working prototypes in seconds. Start producing immediately with your AI-powered development assistant.',
  },
  manageIdeasTitle: {
    tr: 'Fikirlerinizi Yönetin',
    'en-us': 'Manage Your Ideas',
    'en-uk': 'Manage Your Ideas',
  },
  manageIdeasDesc: {
    tr: 'Projelerinizi tek bir merkezden düzenleyin, geliştirin ve takip edin.',
    'en-us': 'Organize, develop, and track your projects from a single center.',
    'en-uk': 'Organize, develop, and track your projects from a single center.',
  },
  fastPrototypingTitle: {
    tr: 'Hızlı Prototipleme',
    'en-us': 'Fast Prototyping',
    'en-uk': 'Fast Prototyping',
  },
  fastPrototypingDesc: {
    tr: 'Düşüncelerinizi anında görselleştirin ve çalışan uygulamalara çevirin.',
    'en-us': 'Instantly visualize your thoughts and turn them into working applications.',
    'en-uk': 'Instantly visualize your thoughts and turn them into working applications.',
  },
  aiCodingTitle: {
    tr: 'AI Destekli Kodlama',
    'en-us': 'AI Powered Coding',
    'en-uk': 'AI Powered Coding',
  },
  aiCodingDesc: {
    tr: 'Gelişmiş yapay zeka asistanımızla kod yazma sürecini otomatikleştirin.',
    'en-us': 'Automate the coding process with our advanced AI assistant.',
    'en-uk': 'Automate the coding process with our advanced AI assistant.',
  },
  upgradeToPremium: {
    tr: "Premium'a Geçin",
    'en-us': 'Upgrade to Premium',
    'en-uk': 'Upgrade to Premium',
  },
  premiumDesc: {
    tr: 'Sınırsız web sitesi oluşturma, güncelleme ve yayınlama özelliklerine erişin.',
    'en-us': 'Access unlimited website creation, updating, and publishing features.',
    'en-uk': 'Access unlimited website creation, updating, and publishing features.',
  },
  featureUnlimitedSites: {
    tr: 'Sınırsız web sitesi oluşturma',
    'en-us': 'Unlimited website creation',
    'en-uk': 'Unlimited website creation',
  },
  featureUnlimitedUpdates: {
    tr: 'Oluşturulan siteleri sınırsız güncelleme',
    'en-us': 'Unlimited updates to created sites',
    'en-uk': 'Unlimited updates to created sites',
  },
  featurePublishing: {
    tr: 'Siteleri yayınlama fırsatı',
    'en-us': 'Opportunity to publish sites',
    'en-uk': 'Opportunity to publish sites',
  },
  featurePrioritySupport: {
    tr: 'Öncelikli yapay zeka desteği',
    'en-us': 'Priority AI support',
    'en-uk': 'Priority AI support',
  },
  premiumPrice: {
    tr: 'Aylık 399 TL - Hemen Başla',
    'en-us': '399 TL Monthly - Start Now',
    'en-uk': '399 TL Monthly - Start Now',
  },
  cancelAnytime: {
    tr: 'İstediğiniz zaman iptal edebilirsiniz.',
    'en-us': 'You can cancel anytime.',
    'en-uk': 'You can cancel anytime.',
  },
  helpAndSupport: {
    tr: 'Yardım ve Destek',
    'en-us': 'Help and Support',
    'en-uk': 'Help and Support',
  },
  helpPlaceholder: {
    tr: 'Sorununuzu veya önerinizi buraya yazın...',
    'en-us': 'Write your problem or suggestion here...',
    'en-uk': 'Write your problem or suggestion here...',
  },
  send: {
    tr: 'Gönder',
    'en-us': 'Send',
    'en-uk': 'Send',
  },
  messageSent: {
    tr: 'Mesajınız gönderildi!',
    'en-us': 'Your message has been sent!',
    'en-uk': 'Your message has been sent!',
  },
  siteCredits: {
    tr: 'Site',
    'en-us': 'Site',
    'en-uk': 'Site',
  },
  updateCredits: {
    tr: 'Güncelleme',
    'en-us': 'Update',
    'en-uk': 'Update',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved as Language) || 'tr';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  const t = (key: string) => {
    if (!translations[key]) return key;
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
