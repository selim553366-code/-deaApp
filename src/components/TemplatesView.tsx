import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, LayoutTemplate, MousePointerClick, LayoutDashboard, FileText, ShoppingCart, Image as ImageIcon, ArrowRight, Code, X } from 'lucide-react';
import { Project } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface Template {
  id: string;
  title: string;
  description: string;
  category: 'page' | 'button' | 'component';
  icon: React.ElementType;
  prompt: string;
  color: string;
  previewCode?: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'agri-calendar',
    title: 'Tarım Takvimi',
    description: 'Ekim, dikim ve hasat zamanlarını takip edin.',
    category: 'page',
    icon: LayoutTemplate,
    prompt: 'Tarım ve çiftçilik için bir takvim uygulaması oluştur. Ekim, dikim ve hasat zamanlarını takip etmeyi sağlayan bir arayüz, hava durumu entegrasyonu ve aylık görünüm olsun.',
    color: 'bg-emerald-600',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-emerald-50 font-sans p-4"><div class="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6"><h1 class="text-2xl font-bold text-emerald-900 mb-4">Tarım Takvimi</h1><div class="grid grid-cols-7 gap-2 text-center text-sm mb-4"><div class="text-zinc-400">P</div><div class="text-zinc-400">S</div><div class="text-zinc-400">Ç</div><div class="text-zinc-400">P</div><div class="text-zinc-400">C</div><div class="text-zinc-400">C</div><div class="text-zinc-400">P</div></div><div class="grid grid-cols-7 gap-2"><div class="h-10 bg-emerald-100 rounded-lg flex items-center justify-center font-bold text-emerald-800">1</div><div class="h-10 bg-emerald-100 rounded-lg flex items-center justify-center font-bold text-emerald-800">2</div><div class="h-10 bg-emerald-500 text-white rounded-lg flex items-center justify-center font-bold">3</div></div></div></body></html>`
  },
  {
    id: 'astro-diary',
    title: 'Astroloji Günlüğü',
    description: 'Günlük burç yorumları ve astrolojik notlar.',
    category: 'page',
    icon: LayoutTemplate,
    prompt: 'Astroloji meraklıları için günlük burç yorumları, gökyüzü olayları ve kişisel notlar içeren bir astroloji günlüğü uygulaması oluştur.',
    color: 'bg-indigo-700',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-indigo-950 text-indigo-100 font-sans p-4"><div class="max-w-md mx-auto bg-indigo-900 rounded-2xl shadow-lg p-6"><h1 class="text-2xl font-bold text-indigo-200 mb-2">Astroloji Günlüğü</h1><p class="text-indigo-300 mb-6">Bugün gökyüzü ne diyor?</p><div class="bg-indigo-800 p-4 rounded-xl mb-4"><h3 class="font-bold text-white">Koç Burcu</h3><p class="text-sm">Bugün enerjiniz yüksek, yeni başlangıçlar için ideal!</p></div><textarea class="w-full bg-indigo-950 p-3 rounded-lg text-sm" placeholder="Notunuzu buraya yazın..."></textarea></div></body></html>`
  },
  {
    id: 'landing-modern',
    title: 'Modern Landing Page',
    description: 'Şık, minimalist ve dönüşüm odaklı bir açılış sayfası.',
    category: 'page',
    icon: LayoutTemplate,
    prompt: 'Modern, minimalist ve dönüşüm odaklı bir landing page (açılış sayfası) oluştur. Koyu tema (dark mode) destekli, hero bölümü, özellikler gridi, referanslar ve footer içersin. Tailwind CSS kullan.',
    color: 'bg-blue-500',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-900 text-white font-sans"><div class="max-w-4xl mx-auto p-8"><nav class="flex justify-between items-center mb-16"><div class="text-xl font-bold">Logo</div><ul class="flex gap-6 text-sm text-zinc-400"><li class="hover:text-white cursor-pointer transition">Özellikler</li><li class="hover:text-white cursor-pointer transition">Fiyatlar</li></ul></nav><main class="text-center space-y-6 py-20"><h1 class="text-5xl font-extrabold tracking-tight">Geleceği İnşa Edin</h1><p class="text-xl text-zinc-400 max-w-2xl mx-auto">Modern araçlarla işinizi büyütün ve daha hızlı sonuç alın.</p><button class="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-zinc-200 transition active:scale-95">Hemen Başla</button></main></div></body></html>`
  },
  {
    id: 'portfolio-creative',
    title: 'Kreatif Portfolyo',
    description: 'Tasarımcılar ve geliştiriciler için etkileyici portfolyo.',
    category: 'page',
    icon: ImageIcon,
    prompt: 'Kreatif profesyoneller için bir portfolyo sitesi oluştur. Masonry grid yapısında projeler, yetenekler bölümü ve iletişim formu olsun. Animasyonlu geçişler ve modern tipografi kullan.',
    color: 'bg-purple-500',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-50 font-sans p-8"><div class="max-w-3xl mx-auto"><header class="mb-12"><h1 class="text-4xl font-bold text-zinc-800 mb-2">Merhaba, Ben Alex</h1><p class="text-zinc-500">Dijital Ürün Tasarımcısı</p></header><div class="grid grid-cols-2 gap-4"><div class="bg-purple-100 h-48 rounded-2xl p-4 hover:shadow-lg transition cursor-pointer flex items-end"><span class="font-bold text-purple-900">Proje 1</span></div><div class="bg-blue-100 h-32 rounded-2xl p-4 hover:shadow-lg transition cursor-pointer flex items-end"><span class="font-bold text-blue-900">Proje 2</span></div><div class="bg-emerald-100 h-32 rounded-2xl p-4 hover:shadow-lg transition cursor-pointer flex items-end"><span class="font-bold text-emerald-900">Proje 3</span></div><div class="bg-rose-100 h-48 rounded-2xl p-4 hover:shadow-lg transition cursor-pointer flex items-end"><span class="font-bold text-rose-900">Proje 4</span></div></div></div></body></html>`
  },
  {
    id: 'ecommerce-store',
    title: 'E-Ticaret Mağazası',
    description: 'Ürün listeleme ve sepet detayları olan mağaza tasarımı.',
    category: 'page',
    icon: ShoppingCart,
    prompt: 'Modern bir e-ticaret mağazası arayüzü oluştur. Ürün kartları (resim, fiyat, sepete ekle butonu), filtreleme sidebar\'ı ve üstte sepet ikonu olan bir navbar içersin.',
    color: 'bg-emerald-500',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-50 font-sans"><nav class="bg-white p-4 shadow-sm flex justify-between items-center"><div class="font-bold text-lg">Mağaza</div><div class="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium cursor-pointer">Sepet (2)</div></nav><div class="p-8 max-w-4xl mx-auto grid grid-cols-2 gap-6"><div class="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition"><div class="bg-zinc-100 h-40 rounded-lg mb-4"></div><h3 class="font-bold">Premium Sneaker</h3><p class="text-zinc-500 mb-4">$120</p><button class="w-full bg-zinc-900 text-white py-2 rounded-lg hover:bg-zinc-800 active:scale-95 transition">Sepete Ekle</button></div><div class="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition"><div class="bg-zinc-100 h-40 rounded-lg mb-4"></div><h3 class="font-bold">Klasik Saat</h3><p class="text-zinc-500 mb-4">$250</p><button class="w-full bg-zinc-900 text-white py-2 rounded-lg hover:bg-zinc-800 active:scale-95 transition">Sepete Ekle</button></div></div></body></html>`
  },
  {
    id: 'dashboard-admin',
    title: 'Admin Dashboard',
    description: 'Veri görselleştirme ve yönetim paneli.',
    category: 'page',
    icon: LayoutDashboard,
    prompt: 'Kapsamlı bir admin dashboard arayüzü oluştur. Sol tarafta menü (sidebar), üstte arama ve profil, ana alanda istatistik kartları ve veri tablosu olsun.',
    color: 'bg-indigo-500',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-100 flex h-screen font-sans"><aside class="w-48 bg-zinc-900 text-white p-4"><div class="font-bold mb-8 opacity-80">Admin</div><ul class="space-y-4 text-sm opacity-70"><li class="hover:opacity-100 cursor-pointer">Dashboard</li><li class="hover:opacity-100 cursor-pointer">Kullanıcılar</li><li class="hover:opacity-100 cursor-pointer">Ayarlar</li></ul></aside><main class="flex-1 p-8"><div class="grid grid-cols-3 gap-4 mb-8"><div class="bg-white p-4 rounded-xl shadow-sm"><div class="text-zinc-500 text-sm">Toplam Satış</div><div class="text-2xl font-bold">$12,450</div></div><div class="bg-white p-4 rounded-xl shadow-sm"><div class="text-zinc-500 text-sm">Aktif Kullanıcı</div><div class="text-2xl font-bold">1,204</div></div><div class="bg-white p-4 rounded-xl shadow-sm"><div class="text-zinc-500 text-sm">Büyüme</div><div class="text-2xl font-bold text-emerald-500">+15%</div></div></div><div class="bg-white p-4 rounded-xl shadow-sm h-48 flex items-center justify-center text-zinc-400">Grafik Alanı</div></main></body></html>`
  },
  {
    id: 'blog-minimal',
    title: 'Minimal Blog',
    description: 'Okuma odaklı, temiz ve sade blog tasarımı.',
    category: 'page',
    icon: FileText,
    prompt: 'Okuma deneyimine odaklanan minimal bir blog sitesi oluştur. Büyük tipografi, geniş boşluklar (whitespace), makale listesi ve yazar profili içersin.',
    color: 'bg-rose-500',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-white text-zinc-800 font-serif"><div class="max-w-2xl mx-auto p-8 py-20"><h1 class="text-4xl font-bold mb-4">Tasarımın Geleceği</h1><div class="text-zinc-500 mb-12 text-sm font-sans">12 Mayıs 2024 • 5 dk okuma</div><p class="text-lg leading-relaxed mb-6">Minimalizm sadece az şey kullanmak değil, doğru şeyleri kullanmaktır. Tasarımda boşlukların gücü...</p><p class="text-lg leading-relaxed">Kullanıcı deneyimini artırmak için karmaşadan uzak durmalıyız.</p></div></body></html>`
  },
  {
    id: 'btn-gradient',
    title: 'Gradient Buton',
    description: 'Modern ve dikkat çekici renk geçişli buton.',
    category: 'button',
    icon: MousePointerClick,
    prompt: 'Tailwind CSS ile modern, hover efektli, renk geçişli (gradient) bir buton bileşeni oluştur. Tıklama (active) animasyonu da olsun.',
    color: 'bg-gradient-to-r from-pink-500 to-orange-400',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="flex items-center justify-center h-screen bg-zinc-900"><button class="px-8 py-4 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold rounded-full transition-transform transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-pink-500/50">Tıkla Bana</button></body></html>`
  },
  {
    id: 'btn-neumorphic',
    title: 'Neumorphic Buton',
    description: 'Yumuşak gölgeli, 3 boyutlu hissiyatlı buton.',
    category: 'button',
    icon: MousePointerClick,
    prompt: 'Tailwind CSS kullanarak neumorphic (soft UI) tarzında bir buton oluştur. Hem basılmamış hem de basılmış (pressed) durumlarını göster.',
    color: 'bg-zinc-300 text-zinc-800',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="flex items-center justify-center h-screen bg-[#e0e5ec]"><button class="px-8 py-4 bg-[#e0e5ec] text-zinc-600 font-bold rounded-2xl transition-all duration-200 shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] hover:shadow-[inset_6px_6px_10px_0_rgba(163,177,198,0.7),inset_-6px_-6px_10px_0_rgba(255,255,255,0.8)] active:shadow-[inset_6px_6px_10px_0_rgba(163,177,198,0.7),inset_-6px_-6px_10px_0_rgba(255,255,255,0.8)]">Neumorphic</button></body></html>`
  },
  {
    id: 'btn-outline',
    title: 'Outline Buton',
    description: 'Sade, kenarlıklı ve hover durumunda dolan buton.',
    category: 'button',
    icon: MousePointerClick,
    prompt: 'Tailwind CSS ile şık bir outline (sadece kenarlık) buton oluştur. Üzerine gelindiğinde (hover) arka planı dolsun ve metin rengi değişsin.',
    color: 'bg-transparent border-2 border-indigo-500 text-indigo-500',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="flex items-center justify-center h-screen bg-white"><button class="px-8 py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-600 hover:text-white transition-colors duration-300 active:scale-95">Outline Buton</button></body></html>`
  },
  {
    id: 'btn-glow',
    title: 'Glow Buton',
    description: 'Neon parlama efektli dikkat çekici buton.',
    category: 'button',
    icon: MousePointerClick,
    prompt: 'Tailwind CSS ile etrafında neon parlama (glow) efekti olan, karanlık temaya uygun dikkat çekici bir buton oluştur.',
    color: 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="flex items-center justify-center h-screen bg-zinc-950"><button class="relative px-8 py-3 bg-cyan-500 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] hover:bg-cyan-400 transition-all duration-300 active:scale-95">Glow Efekti</button></body></html>`
  },
  {
    id: 'comp-pricing',
    title: 'Fiyatlandırma Tablosu',
    description: '3 farklı paket içeren fiyatlandırma kartları.',
    category: 'component',
    icon: Code,
    prompt: 'Tailwind CSS ile 3 farklı plan (Temel, Pro, Kurumsal) içeren modern bir fiyatlandırma tablosu oluştur. Pro planı vurgulanmış (highlighted) olsun.',
    color: 'bg-teal-500',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-50 flex items-center justify-center min-h-screen p-4"><div class="flex gap-4 max-w-3xl w-full"><div class="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 text-center"><h3 class="font-bold text-zinc-600">Temel</h3><div class="text-3xl font-bold my-4">$9<span class="text-sm text-zinc-400">/ay</span></div><button class="w-full py-2 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition">Seç</button></div><div class="flex-1 bg-teal-600 text-white p-6 rounded-2xl shadow-xl text-center transform scale-105"><h3 class="font-bold text-teal-100">Pro</h3><div class="text-3xl font-bold my-4">$29<span class="text-sm text-teal-200">/ay</span></div><button class="w-full py-2 bg-white text-teal-600 font-bold rounded-lg hover:bg-zinc-50 transition active:scale-95">Seç</button></div><div class="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 text-center"><h3 class="font-bold text-zinc-600">Kurumsal</h3><div class="text-3xl font-bold my-4">$99<span class="text-sm text-zinc-400">/ay</span></div><button class="w-full py-2 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition">Seç</button></div></div></body></html>`
  },
  {
    id: 'comp-faq',
    title: 'Sıkça Sorulan Sorular',
    description: 'Açılır kapanır (accordion) SSS bölümü.',
    category: 'component',
    icon: Code,
    prompt: 'Tailwind CSS ile modern bir Sıkça Sorulan Sorular (FAQ) akordeon bileşeni oluştur. Sorulara tıklandığında cevaplar yumuşak bir animasyonla açılsın.',
    color: 'bg-amber-500',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-50 flex items-center justify-center min-h-screen p-4"><div class="w-full max-w-md space-y-4"><details class="group bg-white p-4 rounded-xl shadow-sm border border-zinc-100 cursor-pointer"><summary class="font-medium list-none flex justify-between items-center">Nasıl iade edebilirim? <span class="transition group-open:rotate-180">▼</span></summary><p class="mt-4 text-zinc-500 text-sm">İadelerinizi 14 gün içinde faturanızla birlikte mağazalarımızdan veya kargo ile yapabilirsiniz.</p></details><details class="group bg-white p-4 rounded-xl shadow-sm border border-zinc-100 cursor-pointer"><summary class="font-medium list-none flex justify-between items-center">Kargo ücreti ne kadar? <span class="transition group-open:rotate-180">▼</span></summary><p class="mt-4 text-zinc-500 text-sm">500 TL üzeri alışverişlerde kargo ücretsizdir. Altındaki siparişler için 39 TL'dir.</p></details></div></body></html>`
  },
  {
    id: 'page-saas',
    title: 'SaaS Landing Page',
    description: 'Yazılım ürünleri için modern tanıtım sayfası.',
    category: 'page',
    icon: LayoutTemplate,
    prompt: 'Bir SaaS (Hizmet olarak yazılım) ürünü için modern bir landing page oluştur. Hero bölümü, özellikler, nasıl çalışır, fiyatlandırma ve footer içersin. Canlı renkler ve temiz bir tipografi kullan.',
    color: 'bg-cyan-600',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-white font-sans"><div class="bg-cyan-900 text-white p-8 text-center"><h1 class="text-4xl font-bold mb-4">İş akışınızı hızlandırın</h1><p class="text-cyan-200 mb-6">Takımınız için en iyi proje yönetim aracı.</p><button class="bg-cyan-400 text-cyan-950 px-6 py-2 rounded-lg font-bold hover:bg-cyan-300 transition">Ücretsiz Dene</button></div><div class="p-8 grid grid-cols-3 gap-4 text-center"><div class="p-4"><div class="w-10 h-10 bg-cyan-100 rounded-full mx-auto mb-2"></div><h3 class="font-bold">Hızlı</h3></div><div class="p-4"><div class="w-10 h-10 bg-cyan-100 rounded-full mx-auto mb-2"></div><h3 class="font-bold">Güvenli</h3></div><div class="p-4"><div class="w-10 h-10 bg-cyan-100 rounded-full mx-auto mb-2"></div><h3 class="font-bold">Kolay</h3></div></div></body></html>`
  },
  {
    id: 'page-restaurant',
    title: 'Restoran Menü Sitesi',
    description: 'Kafeler ve restoranlar için menü ve rezervasyon sayfası.',
    category: 'page',
    icon: LayoutTemplate,
    prompt: 'Şık bir restoran/kafe web sitesi oluştur. Menü kategorileri (başlangıçlar, ana yemekler, tatlılar), rezervasyon formu ve iletişim bilgileri içersin. Sıcak renk tonları kullan.',
    color: 'bg-orange-600',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-orange-50 font-serif"><div class="bg-orange-900 text-orange-50 p-12 text-center"><h1 class="text-5xl font-bold mb-2">La Trattoria</h1><p class="italic opacity-80">Gerçek İtalyan Lezzetleri</p></div><div class="max-w-2xl mx-auto p-8"><h2 class="text-2xl font-bold text-orange-900 mb-6 text-center border-b border-orange-200 pb-2">Ana Yemekler</h2><div class="space-y-4"><div class="flex justify-between items-center border-b border-orange-200 border-dashed pb-2"><div><h3 class="font-bold text-lg">Margherita Pizza</h3><p class="text-sm text-orange-700">Domates sosu, mozzarella, fesleğen</p></div><span class="font-bold text-orange-900">250 ₺</span></div><div class="flex justify-between items-center border-b border-orange-200 border-dashed pb-2"><div><h3 class="font-bold text-lg">Fettuccine Alfredo</h3><p class="text-sm text-orange-700">Krema, parmesan, tavuk</p></div><span class="font-bold text-orange-900">280 ₺</span></div></div></div></body></html>`
  },
  {
    id: 'btn-3d',
    title: '3D Basılabilir Buton',
    description: 'Fiziksel bir buton gibi hissettiren 3D buton.',
    category: 'button',
    icon: MousePointerClick,
    prompt: 'Tailwind CSS ile 3 boyutlu (3D) görünen, tıklandığında aşağı doğru basılma hissi veren (transform translateY) eğlenceli bir buton bileşeni oluştur.',
    color: 'bg-red-500',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="flex items-center justify-center h-screen bg-zinc-100"><button class="px-8 py-4 bg-red-500 text-white font-bold rounded-xl border-b-[6px] border-red-700 hover:bg-red-400 hover:border-red-600 active:border-b-0 active:translate-y-[6px] transition-all">3D Buton</button></body></html>`
  },
  {
    id: 'btn-glass',
    title: 'Glassmorphism Buton',
    description: 'Buzlu cam efektli şık buton.',
    category: 'button',
    icon: MousePointerClick,
    prompt: 'Tailwind CSS kullanarak glassmorphism (buzlu cam) efektine sahip, yarı saydam ve arka planı bulanıklaştıran (backdrop-blur) şık bir buton oluştur.',
    color: 'bg-sky-400',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="flex items-center justify-center h-screen bg-gradient-to-br from-sky-400 to-indigo-600"><button class="px-8 py-3 bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold rounded-xl shadow-lg hover:bg-white/30 transition-all active:scale-95">Glass Buton</button></body></html>`
  },
  {
    id: 'comp-testimonial',
    title: 'Müşteri Yorumları',
    description: 'Kullanıcı yorumlarını gösteren kartlar.',
    category: 'component',
    icon: Code,
    prompt: 'Tailwind CSS ile şık bir müşteri yorumları (testimonials) bölümü oluştur. 3 adet yorum kartı yan yana dizilsin, her kartta kullanıcı fotoğrafı, ismi, yıldız derecelendirmesi ve yorum metni olsun.',
    color: 'bg-fuchsia-500',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-50 flex items-center justify-center min-h-screen p-4"><div class="flex gap-4 max-w-3xl w-full"><div class="bg-white p-6 rounded-2xl shadow-sm flex-1"><div class="flex text-amber-400 mb-2">★★★★★</div><p class="text-zinc-600 text-sm mb-4">"Harika bir hizmet, kesinlikle tavsiye ederim!"</p><div class="flex items-center gap-3"><div class="w-10 h-10 bg-zinc-200 rounded-full"></div><div><div class="font-bold text-sm">Ahmet Y.</div><div class="text-xs text-zinc-400">Müşteri</div></div></div></div><div class="bg-white p-6 rounded-2xl shadow-sm flex-1"><div class="flex text-amber-400 mb-2">★★★★★</div><p class="text-zinc-600 text-sm mb-4">"Tasarımlar çok modern ve kullanımı kolay."</p><div class="flex items-center gap-3"><div class="w-10 h-10 bg-zinc-200 rounded-full"></div><div><div class="font-bold text-sm">Ayşe K.</div><div class="text-xs text-zinc-400">Tasarımcı</div></div></div></div></div></body></html>`
  },
  {
    id: 'comp-stats',
    title: 'İstatistik Sayaçları',
    description: 'Sayılarla başarıları gösteren bölüm.',
    category: 'component',
    icon: Code,
    prompt: 'Tailwind CSS ile 4 kolonlu bir istatistik (stats) bölümü oluştur. Her kolonda büyük bir sayı ve altında açıklama (örn: "Mutlu Müşteri", "Tamamlanan Proje") olsun. İkonlar da içersin.',
    color: 'bg-lime-500',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-900 flex items-center justify-center min-h-screen p-4"><div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl w-full text-center"><div class="p-4"><div class="text-4xl font-extrabold text-lime-400 mb-2">99%</div><div class="text-zinc-400 text-sm font-medium uppercase tracking-wider">Müşteri Memnuniyeti</div></div><div class="p-4"><div class="text-4xl font-extrabold text-lime-400 mb-2">24/7</div><div class="text-zinc-400 text-sm font-medium uppercase tracking-wider">Canlı Destek</div></div><div class="p-4"><div class="text-4xl font-extrabold text-lime-400 mb-2">10k+</div><div class="text-zinc-400 text-sm font-medium uppercase tracking-wider">Aktif Kullanıcı</div></div><div class="p-4"><div class="text-4xl font-extrabold text-lime-400 mb-2">500+</div><div class="text-zinc-400 text-sm font-medium uppercase tracking-wider">Tamamlanan Proje</div></div></div></body></html>`
  },
  {
    id: 'page-fitness',
    title: 'Fitness Takipçisi',
    description: 'Antrenman ve sağlık verilerinizi takip edin.',
    category: 'page',
    icon: LayoutDashboard,
    prompt: 'Modern bir fitness takip uygulaması oluştur. Günlük adım sayısı, yakılan kalori, aktif süre gibi istatistik kartları, haftalık aktivite grafiği ve son antrenmanlar listesi olsun. Canlı ve enerjik renkler kullan.',
    color: 'bg-orange-500',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-50 p-4 font-sans"><div class="max-w-md mx-auto space-y-4"><div class="flex justify-between items-center"><h1 class="text-2xl font-bold">Aktivite</h1><div class="w-10 h-10 bg-orange-100 rounded-full"></div></div><div class="grid grid-cols-2 gap-4"><div class="bg-white p-4 rounded-2xl shadow-sm"><div class="text-zinc-400 text-xs uppercase">Adımlar</div><div class="text-xl font-bold">8,432</div></div><div class="bg-white p-4 rounded-2xl shadow-sm"><div class="text-zinc-400 text-xs uppercase">Kalori</div><div class="text-xl font-bold">450 kcal</div></div></div><div class="bg-orange-500 text-white p-6 rounded-3xl shadow-lg shadow-orange-200"><h3 class="font-bold mb-2">Günlük Hedef</h3><div class="h-2 bg-white/30 rounded-full overflow-hidden"><div class="h-full bg-white w-3/4"></div></div><p class="text-sm mt-2 opacity-90">Hedefine %75 ulaştın!</p></div></div></body></html>`
  },
  {
    id: 'page-recipe',
    title: 'Yemek Tarifleri',
    description: 'Lezzetli tarifler ve adım adım hazırlık rehberi.',
    category: 'page',
    icon: LayoutTemplate,
    prompt: 'Kullanıcı dostu bir yemek tarifi uygulaması oluştur. Tarif kartları (resim, süre, zorluk), malzeme listesi ve hazırlama adımları olsun. İştah açıcı görseller ve temiz bir düzen kullan.',
    color: 'bg-emerald-500',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-50 p-4 font-sans"><div class="max-w-md mx-auto space-y-6"><div class="relative h-48 bg-emerald-100 rounded-3xl overflow-hidden flex items-center justify-center"><span class="text-emerald-800 font-bold">Yemek Görseli</span></div><div class="space-y-2"><h1 class="text-2xl font-bold">Avokadolu Tost</h1><div class="flex gap-4 text-sm text-zinc-500"><span>🕒 15 dk</span><span>🔥 Kolay</span></div></div><div class="bg-white p-6 rounded-3xl shadow-sm"><h3 class="font-bold mb-4">Malzemeler</h3><ul class="space-y-2 text-sm text-zinc-600"><li>• 2 dilim tam buğday ekmeği</li><li>• 1 olgun avokado</li><li>• Zeytinyağı ve baharatlar</li></ul></div></div></body></html>`
  },
  {
    id: 'page-ai-chat',
    title: 'AI Sohbet Arayüzü',
    description: 'Modern ve akıcı bir yapay zeka sohbet deneyimi.',
    category: 'page',
    icon: LayoutTemplate,
    prompt: 'Modern bir AI sohbet arayüzü oluştur. Sol tarafta geçmiş konuşmalar (sidebar), sağda ise mesajlaşma alanı olsun. Mesaj balonları, kod blokları ve alt kısımda şık bir input alanı içersin.',
    color: 'bg-blue-600',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-950 text-white font-sans h-screen flex flex-col"><div class="flex-1 overflow-y-auto p-4 space-y-6"><div class="flex gap-4"><div class="w-8 h-8 bg-blue-600 rounded-lg flex-shrink-0"></div><div class="bg-zinc-900 p-4 rounded-2xl rounded-tl-none max-w-[80%] text-sm">Merhaba! Size nasıl yardımcı olabilirim?</div></div><div class="flex gap-4 flex-row-reverse"><div class="w-8 h-8 bg-zinc-800 rounded-lg flex-shrink-0"></div><div class="bg-blue-600 p-4 rounded-2xl rounded-tr-none max-w-[80%] text-sm">Bana bir React bileşeni örneği verir misin?</div></div></div><div class="p-4 border-t border-zinc-800"><div class="bg-zinc-900 p-2 rounded-2xl flex gap-2"><input class="flex-1 bg-transparent px-4 py-2 outline-none text-sm" placeholder="Mesajınızı yazın..."><button class="bg-blue-600 p-2 rounded-xl">🚀</button></div></div></body></html>`
  },
  {
    id: 'page-tasks',
    title: 'Görev Yönetimi',
    description: 'İşlerinizi organize edin ve verimliliğinizi artırın.',
    category: 'page',
    icon: LayoutDashboard,
    prompt: 'Kişisel görev yönetim uygulaması oluştur. "Yapılacaklar", "Devam Edenler" ve "Tamamlananlar" sütunları olan bir Kanban board veya liste görünümü olsun. Görev ekleme butonu ve öncelik etiketleri içersin.',
    color: 'bg-violet-600',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-50 p-4 font-sans"><div class="max-w-md mx-auto space-y-6"><div class="flex justify-between items-center"><h1 class="text-2xl font-bold">Görevlerim</h1><button class="bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-bold">+</button></div><div class="space-y-3"><div class="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-amber-400"><div class="text-xs text-amber-600 font-bold mb-1">Yüksek Öncelik</div><div class="font-medium">Sunum hazırlığı</div></div><div class="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-blue-400"><div class="text-xs text-blue-600 font-bold mb-1">Normal</div><div class="font-medium">E-postaları yanıtla</div></div></div></div></body></html>`
  },
  {
    id: 'page-travel',
    title: 'Gezi Rehberi',
    description: 'Dünyayı keşfetmek için ilham verici gezi rotaları.',
    category: 'page',
    icon: LayoutTemplate,
    prompt: 'Gezginler için modern bir gezi rehberi uygulaması oluştur. Popüler destinasyonlar, gezi ipuçları, harita entegrasyonu (görsel olarak) ve kullanıcı yorumları olsun. Macera ruhunu yansıtan canlı görseller ve tipografi kullan.',
    color: 'bg-sky-500',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-50 p-4 font-sans"><div class="max-w-md mx-auto space-y-6"><div class="relative h-56 bg-sky-100 rounded-3xl overflow-hidden"><img src="https://picsum.photos/seed/travel/800/600" class="w-full h-full object-cover" referrerPolicy="no-referrer"><div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6"><h1 class="text-2xl font-bold text-white">Bali, Endonezya</h1></div></div><div class="grid grid-cols-3 gap-2 text-center"><div class="bg-white p-3 rounded-2xl shadow-sm"><div class="text-lg">🏝️</div><div class="text-[10px] uppercase text-zinc-500">Plaj</div></div><div class="bg-white p-3 rounded-2xl shadow-sm"><div class="text-lg">⛰️</div><div class="text-[10px] uppercase text-zinc-500">Doğa</div></div><div class="bg-white p-3 rounded-2xl shadow-sm"><div class="text-lg">⛩️</div><div class="text-[10px] uppercase text-zinc-500">Kültür</div></div></div><div class="bg-white p-6 rounded-3xl shadow-sm"><h3 class="font-bold mb-2">Hakkında</h3><p class="text-sm text-zinc-600 leading-relaxed">Bali, muhteşem plajları, yemyeşil pirinç terasları ve canlı kültürüyle her gezginin hayalidir.</p></div></div></body></html>`
  },
  {
    id: 'page-finance',
    title: 'Finans Takip',
    description: 'Gelir ve giderlerinizi akıllıca yönetin.',
    category: 'page',
    icon: LayoutDashboard,
    prompt: 'Kişisel finans yönetimi uygulaması oluştur. Toplam bakiye, aylık harcama grafiği, kategori bazlı harcama dağılımı ve son işlemler listesi olsun. Güven veren, temiz ve profesyonel bir arayüz tasarla.',
    color: 'bg-emerald-600',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-950 text-white p-4 font-sans"><div class="max-w-md mx-auto space-y-6"><div class="text-center py-8"><div class="text-zinc-400 text-sm mb-1">Toplam Bakiye</div><div class="text-4xl font-bold">₺45,250.00</div></div><div class="grid grid-cols-2 gap-4"><div class="bg-zinc-900 p-4 rounded-2xl border border-zinc-800"><div class="text-emerald-500 text-xs mb-1">Gelir</div><div class="text-lg font-bold">+₺12,000</div></div><div class="bg-zinc-900 p-4 rounded-2xl border border-zinc-800"><div class="text-rose-500 text-xs mb-1">Gider</div><div class="text-lg font-bold">-₺8,400</div></div></div><div class="bg-zinc-900 p-6 rounded-3xl border border-zinc-800"><h3 class="font-bold mb-4">Son İşlemler</h3><div class="space-y-4"><div class="flex justify-between items-center"><div class="flex items-center gap-3"><div class="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">🛒</div><div><div class="text-sm font-medium">Market</div><div class="text-xs text-zinc-500">Bugün</div></div></div><div class="font-bold">-₺450</div></div></div></div></div></body></html>`
  },
  {
    id: 'page-education',
    title: 'Online Kurs',
    description: 'Yeni beceriler öğrenmek için eğitim platformu.',
    category: 'page',
    icon: LayoutTemplate,
    prompt: 'Bir online eğitim platformu (LMS) arayüzü oluştur. Kurs kategorileri, popüler kurslar, devam eden derslerim bölümü ve eğitmen profilleri olsun. Öğrenmeyi teşvik eden, düzenli ve modern bir yapı kur.',
    color: 'bg-blue-600',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-50 p-4 font-sans"><div class="max-w-md mx-auto space-y-6"><div class="flex justify-between items-center"><h1 class="text-2xl font-bold">Öğrenmeye Devam Et</h1><div class="w-10 h-10 bg-blue-100 rounded-full"></div></div><div class="bg-white p-4 rounded-3xl shadow-sm flex gap-4 items-center"><div class="w-20 h-20 bg-blue-600 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-bold text-xs text-center p-2">UI Tasarım Temelleri</div><div class="flex-1"><h3 class="font-bold text-sm">Bölüm 4: Renk Teorisi</h3><div class="h-1.5 bg-zinc-100 rounded-full mt-2 overflow-hidden"><div class="h-full bg-blue-600 w-2/3"></div></div><div class="text-[10px] text-zinc-400 mt-1">%65 tamamlandı</div></div></div><h2 class="font-bold text-lg">Popüler Kurslar</h2><div class="grid grid-cols-2 gap-4"><div class="bg-white rounded-2xl shadow-sm overflow-hidden"><div class="h-24 bg-zinc-200"></div><div class="p-3"><h4 class="font-bold text-xs mb-1">React Geliştirme</h4><div class="text-[10px] text-zinc-500">12 Saat • 4.8 ⭐</div></div></div></div></div></body></html>`
  },
  {
    id: 'page-health',
    title: 'Sağlık Takibi',
    description: 'Vital bulgularınızı ve randevularınızı yönetin.',
    category: 'page',
    icon: LayoutDashboard,
    prompt: 'Kişisel sağlık takip uygulaması oluştur. Nabız, uyku kalitesi, su tüketimi gibi metrikler, ilaç hatırlatıcıları ve doktor randevuları takvimi olsun. Temiz, ferah ve güven veren bir tasarım kullan.',
    color: 'bg-rose-500',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-rose-50 p-4 font-sans"><div class="max-w-md mx-auto space-y-6"><div class="flex justify-between items-center"><h1 class="text-2xl font-bold text-rose-900">Sağlık Özeti</h1><div class="w-10 h-10 bg-rose-200 rounded-full"></div></div><div class="bg-white p-6 rounded-3xl shadow-sm border border-rose-100"><div class="flex items-center gap-4"><div class="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-2xl">❤️</div><div><div class="text-zinc-500 text-xs">Nabız</div><div class="text-2xl font-bold text-rose-600">72 <span class="text-sm font-normal text-zinc-400">bpm</span></div></div></div></div><div class="grid grid-cols-2 gap-4"><div class="bg-white p-4 rounded-2xl shadow-sm border border-rose-100"><div class="text-xs text-zinc-400 mb-1">Su</div><div class="font-bold">1.5 / 2.5 L</div></div><div class="bg-white p-4 rounded-2xl shadow-sm border border-rose-100"><div class="text-xs text-zinc-400 mb-1">Uyku</div><div class="font-bold">7s 20dk</div></div></div></div></body></html>`
  },
  {
    id: 'comp-hero-modern',
    title: 'Modern Hero Bölümü',
    description: 'Web siteleri için etkileyici giriş alanı.',
    category: 'component',
    icon: Code,
    prompt: 'Tailwind CSS ile modern, büyük tipografili, görsel destekli ve etkileyici bir hero (giriş) bölümü oluştur. CTA butonları ve sosyal kanıt (social proof) öğeleri içersin.',
    color: 'bg-zinc-900',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-white font-sans"><section class="py-20 px-6 text-center max-w-4xl mx-auto space-y-8"><div class="inline-block px-4 py-1.5 bg-zinc-100 rounded-full text-xs font-bold text-zinc-600 uppercase tracking-widest">Yeni Nesil Çözümler</div><h1 class="text-6xl font-black tracking-tight text-zinc-900">Fikirlerinizi <span class="text-indigo-600">Gerçeğe</span> Dönüştürün</h1><p class="text-xl text-zinc-500 max-w-2xl mx-auto">En gelişmiş araçlarla projelerinizi bir üst seviyeye taşıyın. Hızlı, güvenli ve ölçeklenebilir.</p><div class="flex gap-4 justify-center"><button class="px-8 py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition shadow-xl">Hemen Başla</button><button class="px-8 py-4 bg-white border border-zinc-200 text-zinc-900 font-bold rounded-2xl hover:bg-zinc-50 transition">Daha Fazla Bilgi</button></div></section></body></html>`
  },
  {
    id: 'btn-pixel',
    title: 'Pixel Retro Buton',
    description: '8-bit oyun tarzında retro buton.',
    category: 'button',
    icon: MousePointerClick,
    prompt: 'Tailwind CSS ile 8-bit video oyunlarını andıran, keskin kenarlı (pixel art tarzı) ve tıklandığında içeri göçen bir retro buton oluştur.',
    color: 'bg-yellow-400',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="flex items-center justify-center h-screen bg-zinc-800"><button class="px-6 py-3 bg-yellow-400 text-zinc-900 font-bold uppercase tracking-widest border-4 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:bg-yellow-500 transition-all">Başlat</button></body></html>`
  },
  {
    id: 'btn-cyberpunk',
    title: 'Cyberpunk Buton',
    description: 'Gelecekçi, keskin ve neon detaylı buton.',
    category: 'button',
    icon: MousePointerClick,
    prompt: 'Tailwind CSS ile Cyberpunk 2077 tarzında, asimetrik kesimli, neon sarı ve siyah renkli, glitch efektli bir buton bileşeni oluştur.',
    color: 'bg-yellow-300 text-black',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="flex items-center justify-center h-screen bg-black"><button class="relative px-10 py-4 bg-yellow-300 text-black font-black uppercase italic tracking-tighter border-r-8 border-b-4 border-cyan-400 hover:bg-cyan-400 hover:text-black hover:border-yellow-300 transition-all duration-300 group"><span class="absolute top-0 left-0 w-2 h-2 bg-black"></span><span class="absolute bottom-0 right-0 w-4 h-1 bg-black"></span>SİSTEME GİRİŞ</button></body></html>`
  },
  {
    id: 'btn-magnetic',
    title: 'Manyetik Buton',
    description: 'Mouse hareketine duyarlı, akışkan buton.',
    category: 'button',
    icon: MousePointerClick,
    prompt: 'Tailwind CSS ile mouse üzerine geldiğinde hafifçe o yöne doğru esneyen (manyetik etki), yumuşak geçişli ve modern bir buton oluştur.',
    color: 'bg-zinc-900 text-white',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="flex items-center justify-center h-screen bg-white"><button class="px-10 py-4 bg-zinc-900 text-white font-medium rounded-full hover:scale-110 hover:-translate-y-1 transition-all duration-500 ease-out shadow-xl hover:shadow-zinc-300 active:scale-95">Keşfet</button></body></html>`
  },
  {
    id: 'btn-loading',
    title: 'Yükleme Butonu',
    description: 'İşlem sırasında yükleme animasyonu gösteren buton.',
    category: 'button',
    icon: MousePointerClick,
    prompt: 'Tailwind CSS ile tıklandığında içinde dönen bir yükleme ikonu (spinner) beliren ve metni değişen fonksiyonel bir buton tasarımı oluştur.',
    color: 'bg-indigo-600',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="flex items-center justify-center h-screen bg-zinc-50"><button class="flex items-center gap-3 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all active:scale-95"><svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Gönderiliyor...</button></body></html>`
  },
  {
    id: 'btn-social-group',
    title: 'Sosyal Paylaşım Grubu',
    description: 'Şık sosyal medya ikon butonları grubu.',
    category: 'button',
    icon: MousePointerClick,
    prompt: 'Tailwind CSS ile yan yana dizilmiş, her biri farklı renkte (marka renkleri), hover durumunda büyüyen ve parlayan sosyal medya paylaşım butonları grubu oluştur.',
    color: 'bg-zinc-100',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="flex items-center justify-center h-screen bg-white"><div class="flex gap-4"><button class="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:scale-110 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-90">f</button><button class="w-12 h-12 bg-sky-400 text-white rounded-full flex items-center justify-center hover:scale-110 hover:shadow-lg hover:shadow-sky-200 transition-all active:scale-90">t</button><button class="w-12 h-12 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white rounded-full flex items-center justify-center hover:scale-110 hover:shadow-lg hover:shadow-red-200 transition-all active:scale-90">i</button></div></body></html>`
  }
];

const getDefaultPreview = (template: Template) => {
  return `
    <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-zinc-50 flex items-center justify-center min-h-screen p-8 font-sans">
        <div class="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center space-y-6 border border-zinc-100">
          <div class="w-20 h-20 mx-auto ${template.color} rounded-2xl flex items-center justify-center shadow-lg mb-6">
            <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 class="text-3xl font-extrabold text-zinc-800 tracking-tight">${template.title}</h1>
          <p class="text-zinc-500 text-lg">${template.description}</p>
          <div class="pt-8 space-y-4">
            <div class="h-3 bg-zinc-100 rounded-full w-3/4 mx-auto"></div>
            <div class="h-3 bg-zinc-100 rounded-full w-1/2 mx-auto"></div>
            <div class="h-3 bg-zinc-100 rounded-full w-5/6 mx-auto"></div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export function TemplatesView({ 
  projects,
  onSelectForNewProject,
  onSelectForExistingProject
}: { 
  projects: Project[],
  onSelectForNewProject: (prompt: string) => void,
  onSelectForExistingProject: (projectId: string, prompt: string) => void
}) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'page' | 'button' | 'component'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            template.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div className="text-center space-y-4 pt-4">
        <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900">
          {t('templatesTitle')}
        </h2>
        <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
          {t('templatesDesc')}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-zinc-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {(['all', 'page', 'button', 'component'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === category
                  ? 'bg-zinc-900 text-white shadow-md'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {category === 'all' && t('all')}
              {category === 'page' && t('pages')}
              {category === 'button' && t('buttons')}
              {category === 'component' && t('components')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group bg-white rounded-3xl border border-zinc-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className={`h-32 ${template.color} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                <template.icon className="w-12 h-12 text-white/90 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                    {template.category === 'page' ? t('page') : template.category === 'button' ? t('button') : t('component')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">{template.title}</h3>
                <p className="text-zinc-500 text-sm mb-6 flex-1">{template.description}</p>
                <button
                  onClick={() => setSelectedTemplate(template)}
                  className="w-full py-3 bg-zinc-50 hover:bg-indigo-600 text-zinc-700 hover:text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 group/btn"
                >
                  {t('previewAndUse')}
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">{t('noResults')}</h3>
            <p className="text-zinc-500">{t('noResultsDesc')}</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-5xl max-h-[95vh] md:max-h-[90vh] h-[90vh] md:h-[800px] overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
            >
              {/* Mobile Close Button */}
              <button 
                onClick={() => setSelectedTemplate(null)}
                className="absolute top-4 right-4 z-50 p-2 bg-black/20 backdrop-blur-md hover:bg-black/30 rounded-full text-white md:hidden transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Left: Preview */}
              <div className="h-[40vh] md:h-auto md:flex-1 bg-zinc-100 relative border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col">
                <div className="bg-zinc-200/80 px-4 py-3 text-xs font-mono text-zinc-500 flex items-center gap-2 border-b border-zinc-300/50">
                  <div className="hidden md:flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <span className="md:ml-2 font-medium">{t('previewLabel')}: {selectedTemplate.title}</span>
                </div>
                <div className="flex-1 relative bg-white">
                  <iframe 
                    srcDoc={(selectedTemplate.previewCode || getDefaultPreview(selectedTemplate)) + `
<script>
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link) {
      e.preventDefault();
    }
  });
  document.addEventListener('submit', function(e) {
    e.preventDefault();
  });
</script>`} 
                    className="absolute inset-0 w-full h-full border-none" 
                    title="Template Preview"
                  />
                </div>
              </div>
              
              {/* Right: Details & Actions */}
              <div className="flex-1 md:w-96 p-6 md:p-8 flex flex-col bg-white overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider rounded-lg mb-3">
                      {selectedTemplate.category === 'page' ? t('page') : selectedTemplate.category === 'button' ? t('button') : t('component')}
                    </span>
                    <h3 className="text-2xl font-extrabold text-zinc-900 leading-tight">{selectedTemplate.title}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedTemplate(null)}
                    className="hidden md:flex p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full text-zinc-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-zinc-600 mb-8 leading-relaxed text-sm md:text-base">{selectedTemplate.description}</p>
                
                <div className="space-y-6 md:space-y-8 mt-auto">
                  <div className="space-y-3 bg-indigo-50/50 p-4 md:p-5 rounded-2xl border border-indigo-100">
                    <h4 className="font-bold text-sm text-indigo-900 flex items-center gap-2">
                      <LayoutTemplate className="w-4 h-4" />
                      {t('startFromScratch')}
                    </h4>
                    <p className="text-[10px] md:text-xs text-indigo-700/70 mb-3">{t('startFromScratchDesc')}</p>
                    <button 
                      onClick={() => {
                        onSelectForNewProject(selectedTemplate.prompt);
                        setSelectedTemplate(null);
                      }} 
                      className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-sm transition-all hover:shadow-md text-sm md:text-base"
                    >
                      {t('createNewProject')}
                    </button>
                  </div>
                  
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-zinc-200"></div>
                    <span className="flex-shrink-0 mx-4 text-zinc-400 text-[10px] md:text-xs font-medium uppercase tracking-wider">{t('or')}</span>
                    <div className="flex-grow border-t border-zinc-200"></div>
                  </div>

                  <div className="space-y-3 bg-zinc-50 p-5 rounded-2xl border border-zinc-200">
                    <h4 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      {t('importToExisting')}
                    </h4>
                    <p className="text-xs text-zinc-500 mb-3">{t('importToExistingDesc')}</p>
                    
                    {projects.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        <select 
                          className="w-full p-3 bg-white border border-zinc-300 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none"
                          value={selectedProjectId}
                          onChange={(e) => setSelectedProjectId(e.target.value)}
                        >
                          <option value="">{t('selectProject')}</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.title || 'İsimsiz Proje'}</option>
                          ))}
                        </select>
                        <button 
                          disabled={!selectedProjectId}
                          onClick={() => {
                            onSelectForExistingProject(selectedProjectId, selectedTemplate.prompt);
                            setSelectedTemplate(null);
                          }} 
                          className="w-full py-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 font-medium disabled:opacity-50 transition-all"
                        >
                          {t('importToSelected')}
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 bg-zinc-100 rounded-xl text-center border border-zinc-200 border-dashed">
                        <p className="text-sm text-zinc-500">{t('noProjectsYet')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
