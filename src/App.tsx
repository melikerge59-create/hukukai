import { useState, useEffect } from 'react';
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
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
