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
  },
  {
    id: 'page-agency',
    title: 'Dijital Ajans',
    description: 'Yaratıcı ajanslar için modern ve dinamik sayfa.',
    category: 'page',
    icon: LayoutTemplate,
    prompt: 'Yaratıcı bir dijital ajans için modern bir web sitesi oluştur. Koyu tema ağırlıklı, büyük tipografi, hizmetler bölümü, portföy galerisi ve iletişim formu içersin. Animasyonlu hissettiren Tailwind sınıfları kullan.',
    color: 'bg-indigo-600',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-950 text-white font-sans"><div class="p-12 md:p-24 max-w-5xl mx-auto"><h1 class="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">Fikirleri <span class="text-indigo-500">Dijital</span><br/>Gerçekliğe Dönüştürüyoruz.</h1><p class="text-xl text-zinc-400 max-w-2xl mb-10">Markanız için yenilikçi web deneyimleri, mobil uygulamalar ve dijital stratejiler geliştiriyoruz.</p><div class="flex gap-4"><button class="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full font-bold transition">Projelerimiz</button><button class="px-8 py-4 bg-transparent border border-zinc-700 hover:border-zinc-500 rounded-full font-bold transition">Bize Ulaşın</button></div></div></body></html>`
  },
  {
    id: 'comp-newsletter',
    title: 'Bülten Aboneliği',
    description: 'E-posta abonelik formu.',
    category: 'component',
    icon: Code,
    prompt: 'Tailwind CSS ile şık bir e-posta bülten (newsletter) abonelik formu oluştur. Başlık, açıklama, e-posta input alanı ve "Abone Ol" butonu içersin. Input ve buton yan yana veya mobilde alt alta olsun.',
    color: 'bg-pink-500',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-50 flex items-center justify-center min-h-screen p-4"><div class="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-2xl w-full text-center border border-zinc-100"><div class="w-16 h-16 bg-pink-100 text-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div><h2 class="text-3xl font-bold text-zinc-800 mb-4">Gelişmelerden Haberdar Olun</h2><p class="text-zinc-500 mb-8">En yeni özellikler, güncellemeler ve ipuçları doğrudan gelen kutunuza gelsin.</p><form class="flex flex-col md:flex-row gap-3 max-w-md mx-auto"><input type="email" placeholder="E-posta adresiniz" class="flex-1 px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none" /><button type="button" class="px-6 py-3 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 transition shadow-lg shadow-pink-500/30">Abone Ol</button></form></div></body></html>`
  },
  {
    id: 'page-realestate',
    title: 'Emlak Listesi',
    description: 'Emlak ve gayrimenkul listeleme sayfası.',
    category: 'page',
    icon: LayoutTemplate,
    prompt: 'Tailwind CSS ile bir emlak (real estate) listeleme sayfası oluştur. Üstte arama/filtreleme çubuğu, altta ise ev ilanlarını gösteren kartlar (resim, fiyat, yatak odası, banyo, metrekare bilgileri) olsun.',
    color: 'bg-emerald-600',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-100 font-sans p-4 md:p-8"><div class="max-w-5xl mx-auto"><div class="bg-white p-4 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row gap-4"><input type="text" placeholder="Konum ara..." class="flex-1 px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500"><select class="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none"><option>Satılık</option><option>Kiralık</option></select><button class="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700">Ara</button></div><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-100 hover:shadow-md transition"><div class="h-48 bg-zinc-200 relative"><div class="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">Yeni</div></div><div class="p-5"><div class="text-2xl font-bold text-zinc-800 mb-1">₺4.500.000</div><div class="text-zinc-500 text-sm mb-4">Kadıköy, İstanbul</div><div class="flex justify-between text-sm text-zinc-600 border-t border-zinc-100 pt-4"><span>🛏️ 3 Oda</span><span>🛁 2 Banyo</span><span>📐 120 m²</span></div></div></div><div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-100 hover:shadow-md transition"><div class="h-48 bg-zinc-200"></div><div class="p-5"><div class="text-2xl font-bold text-zinc-800 mb-1">₺2.850.000</div><div class="text-zinc-500 text-sm mb-4">Beşiktaş, İstanbul</div><div class="flex justify-between text-sm text-zinc-600 border-t border-zinc-100 pt-4"><span>🛏️ 2 Oda</span><span>🛁 1 Banyo</span><span>📐 85 m²</span></div></div></div></div></div></body></html>`
  },
  {
    id: 'comp-login',
    title: 'Giriş Formu',
    description: 'Modern ve güvenli giriş ekranı.',
    category: 'component',
    icon: Code,
    prompt: 'Tailwind CSS ile modern bir kullanıcı giriş (login) formu oluştur. E-posta, şifre alanları, "Şifremi unuttum" linki, "Giriş Yap" butonu ve "Google ile Giriş" gibi sosyal medya butonları içersin. Ekranı ikiye bölüp bir tarafında görsel kullanabilirsin.',
    color: 'bg-violet-500',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-50 flex items-center justify-center min-h-screen p-4"><div class="bg-white rounded-3xl shadow-xl overflow-hidden flex max-w-4xl w-full border border-zinc-100"><div class="w-1/2 bg-violet-600 p-12 text-white hidden md:flex flex-col justify-between"><div class="text-2xl font-bold">Logo</div><div><h2 class="text-4xl font-bold mb-4">Tekrar Hoş Geldiniz!</h2><p class="text-violet-200">Hesabınıza giriş yaparak kaldığınız yerden devam edin.</p></div><div class="text-sm text-violet-300">© 2024 Tüm hakları saklıdır.</div></div><div class="w-full md:w-1/2 p-8 md:p-12"><h3 class="text-2xl font-bold text-zinc-800 mb-2">Giriş Yap</h3><p class="text-zinc-500 mb-8">Lütfen bilgilerinizi girin.</p><form class="space-y-4"><div><label class="block text-sm font-medium text-zinc-700 mb-1">E-posta</label><input type="email" class="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none" placeholder="ornek@email.com"></div><div><div class="flex justify-between mb-1"><label class="block text-sm font-medium text-zinc-700">Şifre</label><a href="#" class="text-sm text-violet-600 hover:text-violet-500">Şifremi unuttum</a></div><input type="password" class="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none" placeholder="••••••••"></div><button type="button" class="w-full py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition">Giriş Yap</button><div class="relative py-4"><div class="absolute inset-0 flex items-center"><div class="w-full border-t border-zinc-200"></div></div><div class="relative flex justify-center"><span class="bg-white px-4 text-sm text-zinc-500">veya</span></div></div><button type="button" class="w-full py-3 bg-white border border-zinc-200 text-zinc-700 font-bold rounded-xl hover:bg-zinc-50 transition flex items-center justify-center gap-2"><svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg> Google ile devam et</button></form></div></div></body></html>`
  },
  {
    id: 'page-personal-blog',
    title: 'Kişisel Blog',
    description: 'Yazarlar ve içerik üreticileri için kişisel blog.',
    category: 'page',
    icon: LayoutTemplate,
    prompt: 'Yazarlar için kişisel bir blog sitesi oluştur. Üstte yazarın kısa biyografisi ve fotoğrafı, altında ise makale listesi olsun. Makale kartlarında öne çıkan görsel, başlık, özet ve okuma süresi bulunsun.',
    color: 'bg-rose-600',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-50 font-sans"><div class="max-w-3xl mx-auto p-8"><header class="text-center mb-16 pt-12"><div class="w-24 h-24 bg-zinc-200 rounded-full mx-auto mb-4"></div><h1 class="text-3xl font-bold text-zinc-800 mb-2">Ayşe Yılmaz</h1><p class="text-zinc-500 max-w-md mx-auto">Tasarım, teknoloji ve hayat üzerine yazılar yazıyorum. Haftalık bültenime abone olmayı unutmayın.</p></header><div class="space-y-8"><article class="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-md transition cursor-pointer"><div class="text-sm text-rose-500 font-semibold mb-2">Tasarım • 5 dk okuma</div><h2 class="text-2xl font-bold text-zinc-800 mb-3">Minimalizmin Gücü</h2><p class="text-zinc-600 mb-4">Daha az şeyle daha fazla etki yaratmanın yolları üzerine düşünceler...</p><div class="text-sm text-zinc-400">12 Mayıs 2024</div></article><article class="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-md transition cursor-pointer"><div class="text-sm text-rose-500 font-semibold mb-2">Teknoloji • 8 dk okuma</div><h2 class="text-2xl font-bold text-zinc-800 mb-3">Yapay Zeka ve Gelecek</h2><p class="text-zinc-600 mb-4">AI araçlarının günlük iş akışımızı nasıl değiştireceğine dair bir inceleme...</p><div class="text-sm text-zinc-400">5 Mayıs 2024</div></article></div></div></body></html>`
  },
  {
    id: 'comp-pricing-cards',
    title: 'Fiyatlandırma Kartları',
    description: 'Aylık/Yıllık geçişli fiyatlandırma.',
    category: 'component',
    icon: Code,
    prompt: 'Tailwind CSS ile aylık ve yıllık ödeme seçeneği (toggle switch) olan bir fiyatlandırma bölümü oluştur. 3 farklı paket olsun ve yıllık seçimde indirim uygulandığını gösteren bir etiket bulunsun.',
    color: 'bg-blue-600',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-50 flex items-center justify-center min-h-screen p-4"><div class="max-w-5xl w-full"><div class="text-center mb-12"><h2 class="text-3xl font-bold text-zinc-800 mb-6">Basit ve Şeffaf Fiyatlandırma</h2><div class="flex items-center justify-center gap-3"><span class="text-zinc-500 font-medium">Aylık</span><div class="w-14 h-8 bg-blue-600 rounded-full p-1 cursor-pointer relative"><div class="w-6 h-6 bg-white rounded-full absolute right-1"></div></div><span class="text-zinc-900 font-bold">Yıllık <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full ml-1">%20 İndirim</span></span></div></div><div class="grid grid-cols-1 md:grid-cols-3 gap-8"><div class="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100"><h3 class="text-xl font-bold text-zinc-800 mb-2">Başlangıç</h3><div class="text-4xl font-bold mb-6">₺99<span class="text-lg text-zinc-400 font-normal">/ay</span></div><ul class="space-y-3 mb-8 text-zinc-600"><li class="flex items-center gap-2">✓ 1 Proje</li><li class="flex items-center gap-2">✓ Temel Destek</li></ul><button class="w-full py-3 bg-zinc-100 text-zinc-800 font-bold rounded-xl hover:bg-zinc-200 transition">Seç</button></div><div class="bg-blue-600 p-8 rounded-3xl shadow-xl text-white transform md:-translate-y-4 relative"><div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-400 to-blue-300 text-blue-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">En Popüler</div><h3 class="text-xl font-bold text-blue-100 mb-2">Pro</h3><div class="text-4xl font-bold mb-6">₺199<span class="text-lg text-blue-200 font-normal">/ay</span></div><ul class="space-y-3 mb-8 text-blue-50"><li class="flex items-center gap-2">✓ Sınırsız Proje</li><li class="flex items-center gap-2">✓ Öncelikli Destek</li><li class="flex items-center gap-2">✓ Gelişmiş Analitik</li></ul><button class="w-full py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-zinc-50 transition">Seç</button></div><div class="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100"><h3 class="text-xl font-bold text-zinc-800 mb-2">Kurumsal</h3><div class="text-4xl font-bold mb-6">₺499<span class="text-lg text-zinc-400 font-normal">/ay</span></div><ul class="space-y-3 mb-8 text-zinc-600"><li class="flex items-center gap-2">✓ Her Şey Dahil</li><li class="flex items-center gap-2">✓ 7/24 Destek</li><li class="flex items-center gap-2">✓ Özel Entegrasyon</li></ul><button class="w-full py-3 bg-zinc-100 text-zinc-800 font-bold rounded-xl hover:bg-zinc-200 transition">Seç</button></div></div></div></body></html>`
  },
  {
    id: 'comp-footer',
    title: 'Geniş Footer',
    description: 'Bağlantılar ve bülten içeren alt bilgi.',
    category: 'component',
    icon: Code,
    prompt: 'Tailwind CSS ile kapsamlı bir footer (alt bilgi) alanı oluştur. Logo, açıklama, 3-4 sütunlu bağlantı listeleri (Ürün, Şirket, Destek vb.), sosyal medya ikonları ve en altta telif hakkı yazısı bulunsun.',
    color: 'bg-zinc-800',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-100 flex flex-col min-h-screen"><div class="flex-1"></div><footer class="bg-zinc-900 text-zinc-400 py-12 px-8"><div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8"><div class="col-span-1 md:col-span-1"><div class="text-2xl font-bold text-white mb-4">Logo</div><p class="text-sm">Modern web deneyimleri inşa etmek için en iyi araçları sunuyoruz.</p></div><div><h4 class="text-white font-bold mb-4">Ürün</h4><ul class="space-y-2 text-sm"><li><a href="#" class="hover:text-white transition">Özellikler</a></li><li><a href="#" class="hover:text-white transition">Fiyatlandırma</a></li><li><a href="#" class="hover:text-white transition">Sürümler</a></li></ul></div><div><h4 class="text-white font-bold mb-4">Şirket</h4><ul class="space-y-2 text-sm"><li><a href="#" class="hover:text-white transition">Hakkımızda</a></li><li><a href="#" class="hover:text-white transition">Kariyer</a></li><li><a href="#" class="hover:text-white transition">İletişim</a></li></ul></div><div><h4 class="text-white font-bold mb-4">Yasal</h4><ul class="space-y-2 text-sm"><li><a href="#" class="hover:text-white transition">Gizlilik Politikası</a></li><li><a href="#" class="hover:text-white transition">Kullanım Şartları</a></li></ul></div></div><div class="max-w-6xl mx-auto border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm"><p>© 2024 Şirket Adı. Tüm hakları saklıdır.</p><div class="flex gap-4 mt-4 md:mt-0"><div class="w-8 h-8 bg-zinc-800 rounded-full"></div><div class="w-8 h-8 bg-zinc-800 rounded-full"></div><div class="w-8 h-8 bg-zinc-800 rounded-full"></div></div></div></footer></body></html>`
  },
  {
    id: 'comp-navbar',
    title: 'Modern Navbar',
    description: 'Responsive ve şık navigasyon menüsü.',
    category: 'component',
    icon: Code,
    prompt: 'Tailwind CSS ile modern bir navbar (navigasyon menüsü) oluştur. Sol tarafta logo, ortada menü bağlantıları, sağ tarafta ise "Giriş Yap" ve "Kayıt Ol" butonları bulunsun. Mobil cihazlar için hamburger menü ikonu ekle.',
    color: 'bg-indigo-400',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-50 font-sans"><nav class="bg-white shadow-sm border-b border-zinc-100 px-6 py-4 flex justify-between items-center"><div class="text-xl font-bold text-indigo-600">BrandLogo</div><div class="hidden md:flex gap-6 text-sm font-medium text-zinc-600"><a href="#" class="hover:text-indigo-600 transition">Ana Sayfa</a><a href="#" class="hover:text-indigo-600 transition">Özellikler</a><a href="#" class="hover:text-indigo-600 transition">Fiyatlar</a><a href="#" class="hover:text-indigo-600 transition">İletişim</a></div><div class="hidden md:flex gap-3"><button class="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-indigo-600 transition">Giriş Yap</button><button class="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Kayıt Ol</button></div><div class="md:hidden text-zinc-600"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg></div></nav></body></html>`
  },
  {
    id: 'comp-hero-section',
    title: 'Hero Bölümü',
    description: 'Etkileyici bir açılış (hero) alanı.',
    category: 'component',
    icon: Code,
    prompt: 'Tailwind CSS ile dikkat çekici bir hero (açılış) bölümü oluştur. Büyük bir başlık, alt başlık, iki adet CTA (çağrı) butonu ve sağ tarafta veya arka planda şık bir görsel/illüstrasyon alanı olsun.',
    color: 'bg-fuchsia-600',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-white font-sans"><div class="relative overflow-hidden bg-white"><div class="max-w-7xl mx-auto"><div class="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-20 px-4 sm:px-6 lg:px-8"><main class="mt-10 mx-auto max-w-7xl sm:mt-12 md:mt-16 lg:mt-20 xl:mt-28"><div class="sm:text-center lg:text-left"><h1 class="text-4xl tracking-tight font-extrabold text-zinc-900 sm:text-5xl md:text-6xl"><span class="block xl:inline">İşinizi büyütmek için</span> <span class="block text-fuchsia-600 xl:inline">en iyi araçlar</span></h1><p class="mt-3 text-base text-zinc-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">Modern, hızlı ve güvenilir altyapımızla projelerinizi hayata geçirin. Hemen ücretsiz başlayın ve farkı görün.</p><div class="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start"><div class="rounded-md shadow"><a href="#" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-fuchsia-600 hover:bg-fuchsia-700 md:py-4 md:text-lg md:px-10">Ücretsiz Başla</a></div><div class="mt-3 sm:mt-0 sm:ml-3"><a href="#" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-fuchsia-700 bg-fuchsia-100 hover:bg-fuchsia-200 md:py-4 md:text-lg md:px-10">Canlı Demo</a></div></div></div></main></div></div><div class="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2"><div class="h-56 w-full bg-zinc-200 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center text-zinc-400">Görsel Alanı</div></div></div></body></html>`
  },
  {
    id: 'page-dashboard-dark',
    title: 'Karanlık Dashboard',
    description: 'Koyu temalı, modern veri paneli.',
    category: 'page',
    icon: LayoutDashboard,
    prompt: 'Koyu tema (dark mode) kullanan modern bir dashboard arayüzü oluştur. Sol menü, üst bar, istatistik kartları ve bir grafik/tablo alanı içersin. Renk paleti olarak koyu gri/siyah ve vurgu rengi olarak neon mavi veya mor kullan.',
    color: 'bg-zinc-900',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-950 text-zinc-100 flex h-screen font-sans"><aside class="w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col"><div class="text-2xl font-bold text-indigo-400 mb-10">DarkDash</div><nav class="flex-1 space-y-2"><a href="#" class="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 text-indigo-400 rounded-xl font-medium"><span>📊</span> Genel Bakış</a><a href="#" class="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-xl transition"><span>👥</span> Kullanıcılar</a><a href="#" class="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-xl transition"><span>⚙️</span> Ayarlar</a></nav></aside><main class="flex-1 flex flex-col"><header class="h-20 border-b border-zinc-800 flex items-center justify-between px-8"><div class="relative w-64"><input type="text" placeholder="Ara..." class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition"></div><div class="flex items-center gap-4"><div class="w-10 h-10 bg-zinc-800 rounded-full"></div></div></header><div class="p-8 flex-1 overflow-y-auto"><h1 class="text-2xl font-bold mb-6">Genel Bakış</h1><div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"><div class="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl"><div class="text-zinc-400 text-sm mb-2">Toplam Gelir</div><div class="text-3xl font-bold text-white">$45,231</div><div class="text-emerald-400 text-sm mt-2 flex items-center gap-1">↑ 20.1% geçen aydan</div></div><div class="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl"><div class="text-zinc-400 text-sm mb-2">Aktif Kullanıcı</div><div class="text-3xl font-bold text-white">2,405</div><div class="text-emerald-400 text-sm mt-2 flex items-center gap-1">↑ 12.5% geçen aydan</div></div><div class="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl"><div class="text-zinc-400 text-sm mb-2">Hemen Çıkma Oranı</div><div class="text-3xl font-bold text-white">42%</div><div class="text-rose-400 text-sm mt-2 flex items-center gap-1">↓ 4.2% geçen aydan</div></div></div><div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-64 flex items-center justify-center text-zinc-500">Grafik Alanı</div></div></main></body></html>`
  },
  {
    id: 'comp-feature-grid',
    title: 'Özellikler Gridi',
    description: 'Ürün özelliklerini anlatan ikonlu kartlar.',
    category: 'component',
    icon: Code,
    prompt: 'Tailwind CSS ile bir ürünün veya hizmetin özelliklerini anlatan 3x2 (veya benzeri) bir grid yapısı oluştur. Her bir özellik için bir ikon, başlık ve kısa açıklama bulunsun.',
    color: 'bg-amber-400',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-white py-24 sm:py-32"><div class="mx-auto max-w-7xl px-6 lg:px-8"><div class="mx-auto max-w-2xl lg:text-center"><h2 class="text-base font-semibold leading-7 text-amber-600">Daha Hızlı Üretin</h2><p class="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">İhtiyacınız olan her şey burada</p><p class="mt-6 text-lg leading-8 text-zinc-600">Projelerinizi hızlandırmak ve kalitesini artırmak için tasarlanmış güçlü özellikler.</p></div><div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl"><dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16"><div class="relative pl-16"><dt class="text-base font-semibold leading-7 text-zinc-900"><div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600"><svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg></div>Bulut Yedekleme</dt><dd class="mt-2 text-base leading-7 text-zinc-600">Verileriniz otomatik olarak buluta yedeklenir, böylece hiçbir zaman veri kaybı yaşamazsınız.</dd></div><div class="relative pl-16"><dt class="text-base font-semibold leading-7 text-zinc-900"><div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600"><svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg></div>Gelişmiş Güvenlik</dt><dd class="mt-2 text-base leading-7 text-zinc-600">Uçtan uca şifreleme ve iki faktörlü kimlik doğrulama ile hesaplarınız her zaman güvende.</dd></div><div class="relative pl-16"><dt class="text-base font-semibold leading-7 text-zinc-900"><div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600"><svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg></div>Otomatik Güncellemeler</dt><dd class="mt-2 text-base leading-7 text-zinc-600">Sistem arka planda kendini günceller, böylece her zaman en son özelliklere sahip olursunuz.</dd></div><div class="relative pl-16"><dt class="text-base font-semibold leading-7 text-zinc-900"><div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600"><svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" /></svg></div>Parmak İzi Desteği</dt><dd class="mt-2 text-base leading-7 text-zinc-600">Biyometrik doğrulama ile şifre girmeden hızlı ve güvenli bir şekilde giriş yapın.</dd></div></dl></div></div></body></html>`
  },
  {
    id: 'page-event',
    title: 'Etkinlik Sayfası',
    description: 'Konferans veya etkinlik tanıtım sayfası.',
    category: 'page',
    icon: LayoutTemplate,
    prompt: 'Yaklaşan bir teknoloji konferansı için etkinlik sayfası oluştur. Etkinlik tarihi, konuşmacılar gridi, program (schedule) çizelgesi ve bilet alma butonu içersin. Canlı ve enerjik renkler kullan.',
    color: 'bg-rose-500',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-950 text-white font-sans"><div class="relative overflow-hidden"><div class="absolute inset-0 bg-gradient-to-br from-rose-600/20 to-purple-900/40 z-0"></div><div class="max-w-5xl mx-auto p-8 relative z-10 pt-20 pb-32 text-center"><div class="inline-block px-4 py-1 rounded-full bg-rose-500/20 text-rose-300 font-medium text-sm mb-6 border border-rose-500/30">15-16 Ekim 2024 • İstanbul</div><h1 class="text-6xl md:text-8xl font-black tracking-tighter mb-6">TechSummit<span class="text-rose-500">.</span></h1><p class="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">Geleceğin teknolojilerini şekillendiren liderlerle bir araya gelin. İki gün sürecek ilham verici konuşmalar ve atölyeler.</p><button class="px-8 py-4 bg-rose-600 hover:bg-rose-500 rounded-full font-bold text-lg transition shadow-[0_0_30px_rgba(225,29,72,0.4)]">Biletini Al</button></div></div><div class="max-w-5xl mx-auto p-8 -mt-16 relative z-20"><div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl"><h2 class="text-2xl font-bold mb-8 text-center">Öne Çıkan Konuşmacılar</h2><div class="grid grid-cols-2 md:grid-cols-4 gap-6"><div class="text-center"><div class="w-24 h-24 bg-zinc-800 rounded-full mx-auto mb-4"></div><h3 class="font-bold">Dr. Ayşe Yılmaz</h3><p class="text-sm text-zinc-500">Yapay Zeka Araştırmacısı</p></div><div class="text-center"><div class="w-24 h-24 bg-zinc-800 rounded-full mx-auto mb-4"></div><h3 class="font-bold">Caner Demir</h3><p class="text-sm text-zinc-500">UX Direktörü</p></div><div class="text-center"><div class="w-24 h-24 bg-zinc-800 rounded-full mx-auto mb-4"></div><h3 class="font-bold">Zeynep Kaya</h3><p class="text-sm text-zinc-500">Yazılım Mimarı</p></div><div class="text-center"><div class="w-24 h-24 bg-zinc-800 rounded-full mx-auto mb-4"></div><h3 class="font-bold">Ali Vefa</h3><p class="text-sm text-zinc-500">Girişimci</p></div></div></div></div></body></html>`
  },
  {
    id: 'comp-team',
    title: 'Ekip Üyeleri',
    description: 'Şirket çalışanlarını tanıtan bölüm.',
    category: 'component',
    icon: Code,
    prompt: 'Tailwind CSS ile "Ekibimiz" (Team) bölümü oluştur. Her ekip üyesi için bir fotoğraf, isim, unvan ve sosyal medya ikonları içeren kartlar tasarla.',
    color: 'bg-teal-600',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-white py-24 sm:py-32"><div class="mx-auto max-w-7xl px-6 lg:px-8"><div class="mx-auto max-w-2xl lg:mx-0"><h2 class="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Harika Ekibimiz</h2><p class="mt-6 text-lg leading-8 text-zinc-600">Tutkulu, yaratıcı ve deneyimli profesyonellerden oluşan ekibimizle tanışın.</p></div><ul role="list" class="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3"><li><div class="bg-zinc-50 rounded-2xl p-6 text-center border border-zinc-100"><div class="mx-auto h-40 w-40 rounded-full bg-zinc-200 mb-6"></div><h3 class="text-base font-semibold leading-7 tracking-tight text-zinc-900">Ahmet Yılmaz</h3><p class="text-sm font-semibold leading-6 text-teal-600">Kurucu & CEO</p><ul role="list" class="mt-6 flex justify-center gap-x-6"><li><a href="#" class="text-zinc-400 hover:text-zinc-500"><span class="sr-only">Twitter</span><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M11.4678 8.77491L17.2961 2H15.915L10.8543 7.88256L6.81232 2H2.15039L8.26263 10.8955L2.15039 18H3.53159L8.87581 11.7878L13.1444 18H17.8063L11.4675 8.77491H11.4678ZM9.57608 10.9738L8.95678 10.0881L4.02925 3.03974H6.15068L10.1273 8.72795L10.7466 9.61374L15.9156 17.0075H13.7942L9.57608 10.9742V10.9738Z" /></svg></a></li><li><a href="#" class="text-zinc-400 hover:text-zinc-500"><span class="sr-only">LinkedIn</span><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd" /></svg></a></li></ul></div></li><li><div class="bg-zinc-50 rounded-2xl p-6 text-center border border-zinc-100"><div class="mx-auto h-40 w-40 rounded-full bg-zinc-200 mb-6"></div><h3 class="text-base font-semibold leading-7 tracking-tight text-zinc-900">Zeynep Kaya</h3><p class="text-sm font-semibold leading-6 text-teal-600">Tasarım Direktörü</p><ul role="list" class="mt-6 flex justify-center gap-x-6"><li><a href="#" class="text-zinc-400 hover:text-zinc-500"><span class="sr-only">Twitter</span><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M11.4678 8.77491L17.2961 2H15.915L10.8543 7.88256L6.81232 2H2.15039L8.26263 10.8955L2.15039 18H3.53159L8.87581 11.7878L13.1444 18H17.8063L11.4675 8.77491H11.4678ZM9.57608 10.9738L8.95678 10.0881L4.02925 3.03974H6.15068L10.1273 8.72795L10.7466 9.61374L15.9156 17.0075H13.7942L9.57608 10.9742V10.9738Z" /></svg></a></li><li><a href="#" class="text-zinc-400 hover:text-zinc-500"><span class="sr-only">LinkedIn</span><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd" /></svg></a></li></ul></div></li><li><div class="bg-zinc-50 rounded-2xl p-6 text-center border border-zinc-100"><div class="mx-auto h-40 w-40 rounded-full bg-zinc-200 mb-6"></div><h3 class="text-base font-semibold leading-7 tracking-tight text-zinc-900">Caner Demir</h3><p class="text-sm font-semibold leading-6 text-teal-600">Baş Geliştirici</p><ul role="list" class="mt-6 flex justify-center gap-x-6"><li><a href="#" class="text-zinc-400 hover:text-zinc-500"><span class="sr-only">Twitter</span><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M11.4678 8.77491L17.2961 2H15.915L10.8543 7.88256L6.81232 2H2.15039L8.26263 10.8955L2.15039 18H3.53159L8.87581 11.7878L13.1444 18H17.8063L11.4675 8.77491H11.4678ZM9.57608 10.9738L8.95678 10.0881L4.02925 3.03974H6.15068L10.1273 8.72795L10.7466 9.61374L15.9156 17.0075H13.7942L9.57608 10.9742V10.9738Z" /></svg></a></li><li><a href="#" class="text-zinc-400 hover:text-zinc-500"><span class="sr-only">LinkedIn</span><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd" /></svg></a></li></ul></div></li></ul></div></div></body></html>`
  },
  {
    id: 'page-login-modern',
    title: 'Modern Giriş Sayfası',
    description: 'Bölünmüş ekranlı şık bir giriş sayfası.',
    category: 'page',
    icon: LayoutTemplate,
    prompt: 'Ekranın bir yarısında görsel/illüstrasyon, diğer yarısında giriş formu olan modern bir login sayfası oluştur. Formda email, şifre, "beni hatırla" ve "şifremi unuttum" seçenekleri olsun.',
    color: 'bg-indigo-600',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-white font-sans"><div class="flex min-h-screen"><div class="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24"><div class="mx-auto w-full max-w-sm lg:w-96"><div><h2 class="mt-8 text-2xl font-bold leading-9 tracking-tight text-zinc-900">Hesabınıza giriş yapın</h2><p class="mt-2 text-sm leading-6 text-zinc-500">Veya <a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500">14 günlük ücretsiz denemenizi başlatın</a></p></div><div class="mt-10"><div><form action="#" method="POST" class="space-y-6"><div><label for="email" class="block text-sm font-medium leading-6 text-zinc-900">E-posta adresi</label><div class="mt-2"><input id="email" name="email" type="email" autocomplete="email" required class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"></div></div><div><label for="password" class="block text-sm font-medium leading-6 text-zinc-900">Şifre</label><div class="mt-2"><input id="password" name="password" type="password" autocomplete="current-password" required class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"></div></div><div class="flex items-center justify-between"><div class="flex items-center"><input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600"><label for="remember-me" class="ml-3 block text-sm leading-6 text-zinc-700">Beni hatırla</label></div><div class="text-sm leading-6"><a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500">Şifrenizi mi unuttunuz?</a></div></div><div><button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Giriş Yap</button></div></form></div><div class="mt-10"></div></div></div></div><div class="relative hidden w-0 flex-1 lg:block"><div class="absolute inset-0 h-full w-full bg-indigo-600 flex items-center justify-center"><div class="text-white text-center p-12"><h2 class="text-4xl font-bold mb-4">Sisteme Hoş Geldiniz</h2><p class="text-indigo-200 text-lg">Tüm iş süreçlerinizi tek bir platformdan yönetin.</p></div></div></div></div></body></html>`
  },
  {
    id: 'comp-stats-cards',
    title: 'İstatistik Kartları',
    description: 'Özet verileri gösteren kartlar.',
    category: 'component',
    icon: Code,
    prompt: 'Tailwind CSS ile 3 veya 4 sütunlu istatistik kartları oluştur. Her kartta bir sayısal değer, başlık ve değişim oranı (ikonlu) bulunsun.',
    color: 'bg-emerald-500',
    previewCode: `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-100 p-8 font-sans"><div class="max-w-7xl mx-auto"><h3 class="text-base font-semibold leading-6 text-zinc-900 mb-5">Son 30 Gün</h3><dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"><div class="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"><dt><div class="absolute rounded-md bg-emerald-500 p-3"><svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg></div><p class="ml-16 truncate text-sm font-medium text-zinc-500">Toplam Abone</p></dt><dd class="ml-16 flex items-baseline pb-6 sm:pb-7"><p class="text-2xl font-semibold text-zinc-900">71,897</p><p class="ml-2 flex items-baseline text-sm font-semibold text-emerald-600"><svg class="h-5 w-5 flex-shrink-0 self-center text-emerald-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clip-rule="evenodd" /></svg><span class="sr-only"> Arttı </span>122</p><div class="absolute inset-x-0 bottom-0 bg-zinc-50 px-4 py-4 sm:px-6"><div class="text-sm"><a href="#" class="font-medium text-emerald-600 hover:text-emerald-500">Tümünü gör<span class="sr-only"> Toplam Abone istatistikleri</span></a></div></div></dd></div><div class="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"><dt><div class="absolute rounded-md bg-emerald-500 p-3"><svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 19.5H7.336c-.14 0-.274-.057-.373-.158L2.25 14.625l4.713-4.716c.1-.1.233-.158.373-.158h14.414c.414 0 .75.336.75.75v8.25c0 .414-.336.75-.75.75zM12 10.5h5.25M12 13.5h5.25" /></svg></div><p class="ml-16 truncate text-sm font-medium text-zinc-500">Açılma Oranı</p></dt><dd class="ml-16 flex items-baseline pb-6 sm:pb-7"><p class="text-2xl font-semibold text-zinc-900">58.16%</p><p class="ml-2 flex items-baseline text-sm font-semibold text-emerald-600"><svg class="h-5 w-5 flex-shrink-0 self-center text-emerald-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clip-rule="evenodd" /></svg><span class="sr-only"> Arttı </span>5.4%</p><div class="absolute inset-x-0 bottom-0 bg-zinc-50 px-4 py-4 sm:px-6"><div class="text-sm"><a href="#" class="font-medium text-emerald-600 hover:text-emerald-500">Tümünü gör<span class="sr-only"> Açılma Oranı istatistikleri</span></a></div></div></dd></div><div class="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"><dt><div class="absolute rounded-md bg-emerald-500 p-3"><svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.543l-1.59-1.59" /></svg></div><p class="ml-16 truncate text-sm font-medium text-zinc-500">Tıklanma Oranı</p></dt><dd class="ml-16 flex items-baseline pb-6 sm:pb-7"><p class="text-2xl font-semibold text-zinc-900">24.57%</p><p class="ml-2 flex items-baseline text-sm font-semibold text-rose-600"><svg class="h-5 w-5 flex-shrink-0 self-center text-rose-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clip-rule="evenodd" /></svg><span class="sr-only"> Azaldı </span>3.2%</p><div class="absolute inset-x-0 bottom-0 bg-zinc-50 px-4 py-4 sm:px-6"><div class="text-sm"><a href="#" class="font-medium text-emerald-600 hover:text-emerald-500">Tümünü gör<span class="sr-only"> Tıklanma Oranı istatistikleri</span></a></div></div></dd></div></dl></div></body></html>`
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
