import { useState, useEffect } from 'react';
import { Scale, Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './Button';

interface NavbarProps {
  onAuthClick: (mode?: 'login' | 'register') => void;
  onScrollTo?: (section: string) => void;
}

const NAV_LINKS = [
  { label: 'Özellikler', href: '#features' },
  { label: 'Kimler Kullanır', href: '#who-uses' },
  { label: 'Yorumlar', href: '#testimonials' },
  { label: 'Fiyatlandırma', href: '#pricing' },
];

export function Navbar({ onAuthClick, onScrollTo }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleNav = (href: string) => {
    setMobileOpen(false);
    if (onScrollTo) {
      onScrollTo(href.replace('#', ''));
      return;
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-xl
        border-b border-transparent dark:border-transparent transition-all duration-300
        ${scrolled ? 'navbar-shadow border-border-light dark:border-border-dark' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-primary-600 rounded-lg">
              <Scale size={20} className="text-white" />
            </div>
            <span className="font-serif text-2xl font-bold text-primary-600 dark:text-white tracking-tight">
              HukukAI
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center space-x-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className="relative px-4 py-2 text-sm font-medium text-gray-500 dark:text-slate-300
                  hover:text-primary-600 dark:hover:text-white transition-colors group"
              >
                {link.label}
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary-600 rounded-full
                  scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </button>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center space-x-2.5">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => onAuthClick('login')}>
              Giriş Yap
            </Button>
            <Button variant="primary" size="sm" onClick={() => onAuthClick('register')}>
              Ücretsiz Dene
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl text-gray-500 dark:text-slate-400
                hover:bg-surface-card2 dark:hover:bg-white/5 transition-colors"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-surface-dcard border-t border-border-light dark:border-border-dark px-4 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNav(link.href)}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium
                text-gray-500 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-white/5
                hover:text-primary-600 dark:hover:text-white transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 flex flex-col space-y-2">
            <Button variant="secondary" size="sm" onClick={() => { setMobileOpen(false); onAuthClick('login'); }}>
              Giriş Yap
            </Button>
            <Button variant="primary" size="sm" onClick={() => { setMobileOpen(false); onAuthClick('register'); }}>
              Ücretsiz Dene
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
