import { useState } from 'react';
import {
  ArrowRight, Check, Sparkles, Shield, Zap, Users, Star,
  Brain, Clock, Lock, FileText, MessageSquare, BarChart3,
  Building2, Scale, ChevronDown, ChevronUp,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { Button } from '../components/Button';
import { legalCategories } from '../lib/categories';
import { useAuth } from '../contexts/AuthContext';

interface LandingPageProps {
  onCategorySelect: (categoryId: string) => void;
  onAuthClick: () => void;
}

function getIconComponent(iconName: string) {
  const name = iconName
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
  return (Icons as any)[name] || Icons.FileText;
}

export function LandingPage({ onCategorySelect, onAuthClick }: LandingPageProps) {
  const { user } = useAuth();

  const handleCategoryClick = (categoryId: string) => {
    if (!user) {
      onAuthClick();
    } else {
      onCategorySelect(categoryId);
    }
  };

  const stats = [
    { value: '10K+', label: 'Aktif Kullanıcı', icon: Users },
    { value: '500K+', label: 'Soru Yanıtlandı', icon: Zap },
    { value: '9', label: 'Hukuk Alanı', icon: Shield },
    { value: '4.9', label: 'Kullanıcı Puanı', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark overflow-hidden">

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Background blobs */}
        <div className="absolute inset-0 hero-gradient pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-navy-500/10 to-blue-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-navy-600/8 to-purple-500/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-navy-50 dark:bg-navy-500/10 border border-navy-200 dark:border-navy-400/20 mb-8 animate-fade-up animate-fill-both">
            <Sparkles size={14} className="text-navy-500 dark:text-navy-300" />
            <span className="text-sm font-semibold text-navy-600 dark:text-navy-300">
              Türkiye'nin #1 Hukuki Yapay Zeka Platformu
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 animate-fade-up animate-fill-both animation-delay-100">
            Hukuki Sorularınıza
            <br />
            <span className="relative inline-block mt-1">
              <span className="gradient-text">Anında Cevap</span>
              {/* Underline decoration */}
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 400 12" fill="none">
                <path d="M2 10 Q200 2 398 10" stroke="url(#underline-grad)" strokeWidth="3" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="underline-grad" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#4f46e5"/>
                    <stop offset="100%" stopColor="#3b82f6"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up animate-fill-both animation-delay-200">
            Türk hukuku konusunda uzmanlaşmış yapay zeka ile karmaşık hukuki meseleleri kolayca anlayın.
            9 farklı hukuk alanında profesyonel düzeyde destek.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up animate-fill-both animation-delay-300">
            {!user ? (
              <>
                <Button onClick={onAuthClick} size="xl" variant="primary">
                  Ücretsiz Başlayın
                  <ArrowRight size={20} />
                </Button>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Kredi kartı gerekmez · 5 soru/gün ücretsiz
                </p>
              </>
            ) : (
              <p className="text-base text-gray-600 dark:text-gray-400 font-medium">
                Aşağıdan bir hukuk alanı seçin ve danışmaya başlayın.
              </p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="relative max-w-4xl mx-auto mt-20 animate-fade-up animate-fill-both animation-delay-400">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map(({ value, label, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center p-5 rounded-2xl bg-white/70 dark:bg-white/5 border border-gray-200/80 dark:border-white/8 backdrop-blur-sm shadow-card"
              >
                <div className="p-2 rounded-xl bg-navy-50 dark:bg-navy-500/10 mb-2">
                  <Icon size={18} className="text-navy-500 dark:text-navy-300" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 text-center">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/60 dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary-500 dark:text-primary-300 uppercase tracking-widest mb-3">
              Neden HukukAI?
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
              Yapay Zekanın Gücüyle
              <span className="gradient-text"> Hukuki Destek</span>
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Geleneksel hukuk danışmanlığına kıyasla daha hızlı, daha erişilebilir ve daha uygun fiyatlı.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: 'Türk Hukukuna Özel AI',
                desc: 'Türk Medeni Kanunu, İş Kanunu ve diğer mevzuata göre eğitilmiş uzman yapay zeka modeli.',
              },
              {
                icon: Clock,
                title: 'Anında Yanıt',
                desc: 'Randevu beklemeye son. Sorularınıza saniyeler içinde kapsamlı ve doğru cevaplar alın.',
              },
              {
                icon: Lock,
                title: 'Gizlilik Güvencesi',
                desc: 'Tüm konuşmalarınız şifreli ve gizli. Verileriniz asla üçüncü taraflarla paylaşılmaz.',
              },
              {
                icon: FileText,
                title: 'Belge Analizi',
                desc: 'Sözleşme, ihtarname veya hukuki metinlerinizi yükleyin; AI anında analiz etsin.',
              },
              {
                icon: MessageSquare,
                title: 'Sohbet Geçmişi',
                desc: 'Önceki danışmalarınıza geri dönün, konuşmaları kategorilere göre organize edin.',
              },
              {
                icon: BarChart3,
                title: 'Sürekli Güncelleme',
                desc: 'Kanun değişiklikleri ve yeni Yargıtay kararları ile model sürekli güncellenmektedir.',
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                style={{ animationDelay: `${i * 80}ms` }}
                className="feature-card animate-fade-up animate-fill-both"
              >
                <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 w-fit mb-4">
                  <Icon size={22} className="text-primary-600 dark:text-primary-300" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Who Uses It ─── */}
      <section id="who-uses" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary-500 dark:text-primary-300 uppercase tracking-widest mb-3">
              Kimler Kullanır?
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
              Herkese Uygun
              <span className="gradient-text"> Çözüm</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: 'Bireyler',
                color: 'from-blue-500 to-primary-600',
                items: [
                  'İş sözleşmesi anlaşmazlıkları',
                  'Kiracı/ev sahibi hakları',
                  'Tüketici sorunları',
                  'Aile hukuku (boşanma, nafaka)',
                ],
              },
              {
                icon: Building2,
                title: 'KOBİ & Şirketler',
                color: 'from-accent-500 to-accent-400',
                items: [
                  'Ticari sözleşme incelemesi',
                  'Çalışan hakları ve yükümlülükleri',
                  'Vergi cezası itirazları',
                  'Fikri mülkiyet sorunları',
                ],
              },
              {
                icon: Scale,
                title: 'Hukuk Profesyonelleri',
                color: 'from-primary-500 to-blue-600',
                items: [
                  'Hızlı mevzuat araştırması',
                  'Belge taslağı hazırlama',
                  'Emsal karar özeti',
                  'Müvekkil ön değerlendirmesi',
                ],
              },
            ].map(({ icon: Icon, title, color, items }) => (
              <div key={title} className="card card-hover p-6">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} w-fit mb-5 shadow-card`}>
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">{title}</h3>
                <ul className="space-y-2.5">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                      <Check size={14} className="text-primary-600 dark:text-primary-300 mt-0.5 shrink-0" strokeWidth={3} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/60 dark:bg-white/[0.02] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary-500 dark:text-primary-300 uppercase tracking-widest mb-3">
              Kullanıcı Yorumları
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
              Kullanıcılarımız
              <span className="gradient-text"> Ne Diyor?</span>
            </h2>
          </div>

          {/* Marquee */}
          <div className="relative overflow-hidden">
            <div className="testimonial-track">
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                <div
                  key={i}
                  className="shrink-0 w-72 sm:w-80 p-5 rounded-2xl bg-white dark:bg-surface-dcard border border-border-light dark:border-border-dark shadow-card"
                >
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} size={13} className="text-accent-500 fill-accent-500" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">{t.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Fade edges */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-gray-50/80 dark:from-surface-dark to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-gray-50/80 dark:from-surface-dark to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary-500 dark:text-primary-300 uppercase tracking-widest mb-3">
              SSS
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
              Sık Sorulan
              <span className="gradient-text"> Sorular</span>
            </h2>
          </div>
          <FaqSection />
        </div>
      </section>

      {/* ─── Legal Categories ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/60 dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-navy-500 dark:text-navy-300 uppercase tracking-widest mb-3">
              Uzmanlık Alanları
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
              Hangi Alanda Yardım
              <span className="gradient-text"> Arıyorsunuz?</span>
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Türk hukukunun 9 temel alanında yapay zeka destekli rehberlik alın.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {legalCategories.map((category, index) => {
              const IconComponent = getIconComponent(category.icon);
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  style={{ animationDelay: `${index * 60}ms` }}
                  className="group relative p-6 rounded-2xl bg-white dark:bg-white/3 border border-gray-200/80 dark:border-white/8
                    hover:border-navy-400/60 dark:hover:border-navy-400/40
                    shadow-card hover:shadow-card-hover
                    transition-all duration-300 hover:-translate-y-1
                    text-left overflow-hidden
                    animate-fade-up animate-fill-both"
                >
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-navy-500/0 to-blue-500/0 group-hover:from-navy-500/5 group-hover:to-blue-500/5 transition-all duration-300 rounded-2xl" />

                  <div className="relative flex items-start space-x-4">
                    {/* Icon */}
                    <div className="shrink-0 p-3 rounded-xl bg-navy-50 dark:bg-navy-500/10 group-hover:bg-gradient-to-br group-hover:from-navy-500 group-hover:to-blue-600 transition-all duration-300">
                      <IconComponent
                        size={22}
                        className="text-navy-600 dark:text-navy-300 group-hover:text-white transition-colors duration-300"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-navy-600 dark:group-hover:text-navy-300 transition-colors">
                          {category.name}
                        </h3>
                        <ArrowRight
                          size={16}
                          className="text-gray-300 dark:text-gray-600 group-hover:text-navy-500 dark:group-hover:text-navy-400 group-hover:translate-x-1 transition-all duration-300 shrink-0"
                        />
                      </div>
                      <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/80 dark:bg-white/2">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-navy-500 dark:text-navy-300 uppercase tracking-widest mb-3">
              Fiyatlandırma
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
              Size Uygun
              <span className="gradient-text"> Planı Seçin</span>
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              İhtiyacınıza göre esneklik. İstediğiniz zaman yükseltin veya iptal edin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <PricingCard
              name="Free"
              price="0"
              description="Başlamak için mükemmel"
              features={['5 soru / gün', '9 hukuk alanı', 'Temel yanıtlar']}
              ctaLabel="Ücretsiz Başla"
              onCtaClick={onAuthClick}
              current={!!user}
            />
            <PricingCard
              name="Plus"
              price="99"
              description="Daha fazlasına ihtiyacınız varsa"
              features={['50 soru / gün', '9 hukuk alanı', 'Belge analizi', 'Detaylı yanıtlar', 'Öncelikli destek']}
              highlighted
              ctaLabel="Plus'a Geç"
              onCtaClick={onAuthClick}
            />
            <PricingCard
              name="Pro"
              price="349"
              description="Profesyoneller için"
              features={['Sınırsız soru', '9 hukuk alanı', 'Belge analizi', 'Premium yanıtlar', 'Özel destek hattı']}
              ctaLabel="Pro'ya Geç"
              onCtaClick={onAuthClick}
            />
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      {!user && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative p-10 rounded-3xl bg-gradient-to-br from-navy-600 to-blue-700 shadow-glow-lg overflow-hidden">
              <div className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)'
                }}
              />
              <div className="relative">
                <Sparkles size={32} className="text-gold-300 mx-auto mb-4" />
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Hukuki Güvenceniz Bir Tık Uzakta
                </h2>
                <p className="text-blue-100 mb-8 text-lg">
                  Binlerce kullanıcı gibi siz de HukukAI ile hukuki sorularınıza anında cevap bulun.
                </p>
                <Button onClick={onAuthClick} variant="gold" size="xl">
                  Hemen Ücretsiz Başlayın
                  <ArrowRight size={20} />
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-gray-900 dark:text-white">Hukuk<span className="gradient-text">AI</span></span>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">© 2026</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
            Bu platform genel bilgi amaçlıdır. Hukuki tavsiye niteliği taşımaz. Önemli konular için avukatınıza danışın.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ─── Testimonials data ─── */
const TESTIMONIALS = [
  { name: 'Ahmet Y.', role: 'Yazılım Mühendisi', text: 'Kira sözleşmemi anlamak için saatler harcıyordum. HukukAI dakikalar içinde her maddeyi açıkladı.' },
  { name: 'Fatma K.', role: 'İşletme Sahibi', text: 'Çalışanımla yaşadığım iş uyuşmazlığında haklarımı öğrendim. Avukata gitmeye gerek kalmadı.' },
  { name: 'Murat S.', role: 'Serbest Avukat', text: 'Emsal karar araştırmalarımı çok hızlandırdı. Müvekkil ön değerlendirmelerinde harika bir araç.' },
  { name: 'Elif D.', role: 'Muhasebeci', text: 'Vergi cezası itirazı için ne yapacağımı bilmiyordum. HukukAI adım adım rehberlik etti.' },
  { name: 'Kemal A.', role: 'Esnaf', text: 'Müşterimden alacağım için icra takibi sürecini öğrendim. Çok açıklayıcı ve anlaşılır.' },
  { name: 'Zeynep M.', role: 'Öğretmen', text: 'Boşanma sürecinde haklarım konusunda güvenilir bilgi aldım. Psikolojik olarak da rahatlattı.' },
];

/* ─── FAQ Section ─── */
const FAQ_ITEMS = [
  {
    q: 'HukukAI gerçek bir avukat hizmeti mi?',
    a: 'Hayır. HukukAI, Türk hukuku konusunda bilgi sağlayan bir yapay zeka platformudur. Verilen bilgiler genel rehberlik amaçlıdır; hukuki tavsiye niteliği taşımaz. Kritik kararlar için mutlaka bir avukana danışın.',
  },
  {
    q: 'Verilerim güvende mi?',
    a: 'Evet. Tüm konuşmalarınız uçtan uca şifreli olarak saklanır. Verileriniz hiçbir üçüncü tarafla paylaşılmaz ve reklam amacıyla kullanılmaz.',
  },
  {
    q: 'Ücretsiz planda ne kadar soru sorabilirim?',
    a: 'Ücretsiz planda günlük 5 soru hakkınız bulunmaktadır. Plus planda 50, Pro planda ise sınırsız soru sorabilirsiniz.',
  },
  {
    q: 'Hangi hukuk alanlarında destek sunuluyor?',
    a: 'İş hukuku, kira hukuku, tüketici hukuku, aile hukuku, trafik hukuku, ceza hukuku, icra hukuku, miras hukuku ve vergi hukuku olmak üzere 9 temel alanda hizmet sunulmaktadır.',
  },
  {
    q: 'Belge yükleyebilir miyim?',
    a: 'Evet. Plus ve Pro plan kullanıcıları sözleşme, ihtarname, dilekçe gibi metin belgelerini yükleyerek AI\'ın analiz etmesini sağlayabilir.',
  },
];

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="card overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
          >
            <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
              {item.q}
            </span>
            {open === i
              ? <ChevronUp size={18} className="shrink-0 text-primary-600 dark:text-primary-300" />
              : <ChevronDown size={18} className="shrink-0 text-gray-400 dark:text-gray-500" />
            }
          </button>
          <div className={`accordion-content ${open === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
            <p className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {item.a}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── PricingCard ─── */
function PricingCard({
  name,
  price,
  description,
  features,
  highlighted = false,
  current = false,
  ctaLabel,
  onCtaClick,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  current?: boolean;
  ctaLabel: string;
  onCtaClick: () => void;
}) {
  return (
    <div
      className={`relative flex flex-col p-7 rounded-2xl border transition-all duration-300 ${
        highlighted
          ? 'bg-gradient-to-b from-navy-600 to-blue-700 border-navy-500 shadow-glow-md scale-[1.02]'
          : 'bg-white dark:bg-white/3 border-gray-200 dark:border-white/8 shadow-card hover:shadow-card-hover hover:-translate-y-1'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-gold-400 text-xs font-bold text-gray-900 shadow-glow-gold">
            <Star size={10} fill="currentColor" />
            <span>En Popüler</span>
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className={`text-xl font-bold mb-1 ${highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
          {name}
        </h3>
        <p className={`text-sm mb-5 ${highlighted ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
          {description}
        </p>
        <div className="flex items-end gap-1">
          <span className={`text-4xl font-bold ${highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
            ₺{price}
          </span>
          <span className={`text-sm pb-1 ${highlighted ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
            /ay
          </span>
        </div>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center space-x-3">
            <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
              highlighted ? 'bg-white/20' : 'bg-navy-50 dark:bg-navy-500/10'
            }`}>
              <Check size={12} className={highlighted ? 'text-white' : 'text-navy-600 dark:text-navy-300'} strokeWidth={3} />
            </div>
            <span className={`text-sm ${highlighted ? 'text-blue-50' : 'text-gray-600 dark:text-gray-300'}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {!current && (
        <Button
          onClick={onCtaClick}
          variant={highlighted ? 'gold' : 'outline'}
          className="w-full"
        >
          {ctaLabel}
          <ArrowRight size={16} />
        </Button>
      )}
      {current && (
        <div className="text-center text-sm font-medium text-gray-400 dark:text-gray-500 py-2">
          Mevcut Planınız
        </div>
      )}
    </div>
  );
}
