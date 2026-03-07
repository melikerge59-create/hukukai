import { ArrowRight, Check } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Button } from '../components/Button';
import { legalCategories } from '../lib/categories';
import { useAuth } from '../contexts/AuthContext';

interface LandingPageProps {
  onCategorySelect: (categoryId: string) => void;
  onAuthClick: () => void;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Yapay Zeka Destekli
            <br />
            <span className="text-blue-600 dark:text-blue-400">Hukuki Danışmanlık</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Türk hukuku konusunda uzmanlaşmış yapay zeka ile hukuki sorularınıza
            anında cevap alın. 9 farklı hukuk alanında profesyonel destek.
          </p>
          {!user && (
            <Button onClick={onAuthClick} size="lg">
              Hemen Başlayın
              <ArrowRight className="ml-2" size={20} />
            </Button>
          )}
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
            Hukuk Alanları
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {legalCategories.map((category) => {
              const IconComponent = (Icons as any)[
                category.icon.split('-').map((word, i) =>
                  i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) :
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join('')
              ] || Icons.FileText;

              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 text-left"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-600 transition-colors">
                      <IconComponent
                        size={24}
                        className="text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
            Fiyatlandırma
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Free"
              price="0"
              features={['5 soru/gün', 'Temel destek', '9 hukuk alanı']}
              current={true}
            />
            <PricingCard
              name="Plus"
              price="99"
              features={['50 soru/gün', 'Öncelikli destek', 'Belge analizi', 'Detaylı yanıtlar']}
              highlighted={true}
            />
            <PricingCard
              name="Pro"
              price="349"
              features={['Sınırsız soru', 'Özel destek', 'Belge analizi', 'Premium özellikler']}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  features,
  highlighted = false,
  current = false
}: {
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
  current?: boolean;
}) {
  return (
    <div
      className={`p-8 rounded-xl ${
        highlighted
          ? 'bg-blue-600 text-white shadow-2xl scale-105'
          : 'bg-white dark:bg-gray-800 shadow-lg'
      } border-2 ${
        highlighted ? 'border-blue-600' : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <h3 className={`text-2xl font-bold mb-2 ${highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
        {name}
      </h3>
      <div className="mb-6">
        <span className={`text-4xl font-bold ${highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
          ₺{price}
        </span>
        <span className={`text-sm ${highlighted ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
          /ay
        </span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center space-x-2">
            <Check size={20} className={highlighted ? 'text-blue-200' : 'text-blue-600 dark:text-blue-400'} />
            <span className={highlighted ? 'text-blue-50' : 'text-gray-600 dark:text-gray-300'}>
              {feature}
            </span>
          </li>
        ))}
      </ul>
      {!current && (
        <Button
          variant={highlighted ? 'secondary' : 'outline'}
          className="w-full"
          disabled={current}
        >
          {current ? 'Mevcut Plan' : 'Planı Seç'}
        </Button>
      )}
    </div>
  );
}
