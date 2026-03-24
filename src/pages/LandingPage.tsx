import { ArrowRight, Check, Sparkles, Shield, Zap, Users, Star } from 'lucide-react';
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

      {/* ─── Legal Categories ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
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
