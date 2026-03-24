import { Scale, User, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './Button';

interface NavbarProps {
  onAuthClick: () => void;
}

export function Navbar({ onAuthClick }: NavbarProps) {
  const { user, userPlan, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-navy-950/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative p-2 bg-gradient-to-br from-navy-500 to-blue-600 rounded-xl shadow-glow-sm">
              <Scale size={22} className="text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Hukuk<span className="gradient-text">AI</span>
              </span>
              <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 tracking-widest uppercase">
                Legal Intelligence
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />

            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-navy-500 to-blue-500 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">
                      {user.email?.[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white leading-none">
                      {user.email?.split('@')[0]}
                    </p>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <Sparkles size={9} className="text-gold-500" />
                      <p className="text-[10px] text-gold-600 dark:text-gold-400 font-medium leading-none">
                        {userPlan?.plan_type?.toUpperCase() || 'FREE'}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200"
                  aria-label="Çıkış Yap"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Button onClick={onAuthClick} size="sm" variant="primary">
                <User size={15} className="mr-1.5" />
                Giriş Yap
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
