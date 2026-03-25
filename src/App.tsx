import { useState, useEffect } from 'react';
import { Scale } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './pages/LandingPage';
import { ChatPage } from './pages/ChatPage';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'chat'>('landing');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { loading } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const plan = params.get('plan');

    if (payment === 'success' && plan) {
      alert(`${plan.toUpperCase()} planınız başarıyla aktif edildi!`);
      window.history.replaceState({}, '', '/');
    } else if (payment === 'failed') {
      alert('Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.');
      window.history.replaceState({}, '', '/');
    } else if (payment === 'error') {
      alert('Ödeme işlemi sırasında bir hata oluştu.');
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentView('chat');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setSelectedCategory('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-surface-dark">
        <div className="flex flex-col items-center space-y-5">
          {/* Animated logo */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-navy-500 to-blue-600 flex items-center justify-center shadow-glow-md animate-glow-pulse">
              <Scale size={28} className="text-white" />
            </div>
            {/* Spinner ring */}
            <div className="absolute -inset-1.5 rounded-2xl border-2 border-transparent border-t-navy-400 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-gray-900 dark:text-white">
              Hukuk<span className="gradient-text">AI</span>
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar onAuthClick={() => setShowAuthModal(true)} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {currentView === 'landing' ? (
        <LandingPage
          onCategorySelect={handleCategorySelect}
          onAuthClick={() => setShowAuthModal(true)}
        />
      ) : (
        <ChatPage
          categoryId={selectedCategory}
          onBack={handleBackToLanding}
          onUpgrade={handleBackToLanding}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
