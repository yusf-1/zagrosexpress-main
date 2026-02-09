import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Home, PlusCircle, Package, MapPin } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  // Hide bottom nav on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { path: '/home', icon: Home, label: t('home') },
    { path: '/place-order', icon: PlusCircle, label: t('placeOrder') },
    { path: '/my-orders', icon: Package, label: t('myOrders') },
    { path: '/track-order', icon: MapPin, label: t('whereIsMyOrder') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors px-1 ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              type="button"
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'fill-primary/20' : ''}`} />
              <span className="text-[10px] mt-1 font-medium text-center leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
