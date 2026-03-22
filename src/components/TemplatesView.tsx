import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, LayoutTemplate, MousePointerClick, LayoutDashboard, FileText, ShoppingCart, Image as ImageIcon, ArrowRight, Code, X } from 'lucide-react';
import { Project } from '../types';

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
          Şablon Galerisi
        </h2>
        <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
          İhtiyacınıza uygun hazır tasarım şablonlarını seçin ve yapay zeka ile anında hayata geçirin.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-zinc-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Şablonlarda ara..."
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
              {category === 'all' && 'Tümü'}
              {category === 'page' && 'Sayfalar'}
              {category === 'button' && 'Butonlar'}
              {category === 'component' && 'Bileşenler'}
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
                    {template.category === 'page' ? 'Sayfa' : template.category === 'button' ? 'Buton' : 'Bileşen'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">{template.title}</h3>
                <p className="text-zinc-500 text-sm mb-6 flex-1">{template.description}</p>
                <button
                  onClick={() => setSelectedTemplate(template)}
                  className="w-full py-3 bg-zinc-50 hover:bg-indigo-600 text-zinc-700 hover:text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 group/btn"
                >
                  Önizle ve Kullan
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
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">Sonuç bulunamadı</h3>
            <p className="text-zinc-500">Arama kriterlerinize uygun şablon bulamadık. Lütfen farklı kelimeler deneyin.</p>
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
              className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] h-[800px] overflow-hidden flex flex-col md:flex-row shadow-2xl"
            >
              {/* Left: Preview */}
              <div className="flex-1 bg-zinc-100 relative border-r border-zinc-200 flex flex-col">
                <div className="bg-zinc-200/80 px-4 py-3 text-xs font-mono text-zinc-500 flex items-center gap-2 border-b border-zinc-300/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <span className="ml-2 font-medium">Önizleme: {selectedTemplate.title}</span>
                </div>
                <div className="flex-1 relative bg-white">
                  <iframe 
                    srcDoc={selectedTemplate.previewCode || getDefaultPreview(selectedTemplate)} 
                    className="absolute inset-0 w-full h-full border-none" 
                    title="Template Preview"
                  />
                </div>
              </div>
              
              {/* Right: Details & Actions */}
              <div className="w-full md:w-96 p-8 flex flex-col bg-white overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider rounded-lg mb-3">
                      {selectedTemplate.category === 'page' ? 'Sayfa' : selectedTemplate.category === 'button' ? 'Buton' : 'Bileşen'}
                    </span>
                    <h3 className="text-2xl font-extrabold text-zinc-900 leading-tight">{selectedTemplate.title}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedTemplate(null)}
                    className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full text-zinc-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-zinc-600 mb-8 leading-relaxed">{selectedTemplate.description}</p>
                
                <div className="space-y-8 mt-auto">
                  <div className="space-y-3 bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                    <h4 className="font-bold text-sm text-indigo-900 flex items-center gap-2">
                      <LayoutTemplate className="w-4 h-4" />
                      Sıfırdan Başla
                    </h4>
                    <p className="text-xs text-indigo-700/70 mb-3">Bu şablonu kullanarak yepyeni bir proje oluşturun.</p>
                    <button 
                      onClick={() => {
                        onSelectForNewProject(selectedTemplate.prompt);
                        setSelectedTemplate(null);
                      }} 
                      className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-sm transition-all hover:shadow-md"
                    >
                      Yeni Proje Oluştur
                    </button>
                  </div>
                  
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-zinc-200"></div>
                    <span className="flex-shrink-0 mx-4 text-zinc-400 text-xs font-medium uppercase tracking-wider">veya</span>
                    <div className="flex-grow border-t border-zinc-200"></div>
                  </div>

                  <div className="space-y-3 bg-zinc-50 p-5 rounded-2xl border border-zinc-200">
                    <h4 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Mevcut Projeye Aktar
                    </h4>
                    <p className="text-xs text-zinc-500 mb-3">Bu şablonu var olan bir projenize ekleyin.</p>
                    
                    {projects.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        <select 
                          className="w-full p-3 bg-white border border-zinc-300 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none"
                          value={selectedProjectId}
                          onChange={(e) => setSelectedProjectId(e.target.value)}
                        >
                          <option value="">Proje Seçin...</option>
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
                          Seçili Projeye Aktar
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 bg-zinc-100 rounded-xl text-center border border-zinc-200 border-dashed">
                        <p className="text-sm text-zinc-500">Henüz hiç projeniz yok.</p>
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
