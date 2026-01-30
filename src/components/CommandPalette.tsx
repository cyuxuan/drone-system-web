import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Command,
  CornerDownLeft,
  LogOut,
  Sun,
  Moon,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context';
import { useAuth } from '../context/AuthContext';
import { MenuItem } from '../types';

interface SearchItem {
  id: string;
  title: string;
  description?: string;
  icon: LucideIcon | string;
  category: string;
  action: () => void;
  shortcut?: string[];
}

const normalizeIconName = (iconName?: string): IconName => {
  if (!iconName) return 'layout-dashboard';
  const normalized = iconName.replace(/Icon$/, '');
  return normalized
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .replace(/\s+/g, '-')
    .toLowerCase() as IconName;
};

const CommandPalette: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, t, theme, setTheme } = useAppContext();
  const { menus, hasPermission } = useAuth();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      window.addEventListener('keydown', handleKeyDown);
      inputRef.current?.focus();
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  // Reset query and index when opening
  useEffect(() => {
    if (isSearchOpen) {
      // Use requestAnimationFrame to avoid synchronous setState in effect
      requestAnimationFrame(() => {
        setQuery('');
        setActiveIndex(0);
        inputRef.current?.focus();
      });
    }
  }, [isSearchOpen]);

  const items = useMemo(() => {
    const searchItems: SearchItem[] = [];

    // Add Pages from Menu
    const addMenuItems = (menuList: MenuItem[]) => {
      menuList.forEach((menu) => {
        // Check permission if it exists
        if (menu.permission && !hasPermission(menu.permission)) return;

        searchItems.push({
          id: `page-${menu.id}`,
          title: t(menu.label),
          description: menu.path,
          icon: menu.icon || 'layout-dashboard',
          category: t('consoleModule'),
          action: () => {
            navigate(menu.path);
            setIsSearchOpen(false);
          },
        });

        // Recursively add children
        if (menu.children && menu.children.length > 0) {
          addMenuItems(menu.children);
        }
      });
    };

    addMenuItems(menus);

    // Add Quick Actions
    searchItems.push({
      id: 'action-theme',
      title: theme === 'dark' ? t('switchToLight') : t('switchToDark'),
      description: t('systemSettings'),
      icon: theme === 'dark' ? Sun : Moon,
      category: t('quickActions'),
      action: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        setIsSearchOpen(false);
      },
    });

    searchItems.push({
      id: 'action-logout',
      title: t('logout'),
      description: t('security'),
      icon: LogOut,
      category: t('quickActions'),
      action: () => {
        // Implement logout logic if needed
        console.log('Logging out...');
        setIsSearchOpen(false);
      },
    });

    return searchItems;
  }, [t, theme, navigate, setIsSearchOpen, setTheme, menus, hasPermission]);

  const filteredItems = useMemo<SearchItem[]>(() => {
    if (!query) return items;
    const lowerQuery = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery),
    );
  }, [items, query]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[activeIndex]) {
        filteredItems[activeIndex].action();
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const activeElement = scrollContainerRef.current?.children[activeIndex] as HTMLElement;
    if (activeElement) {
      activeElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeIndex]);

  if (!isSearchOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsSearchOpen(false)}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md dark:bg-black/60"
      />

      {/* Command Palette */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="glass-hud border-brand-500/20 relative w-full max-w-2xl overflow-hidden rounded-3xl border shadow-2xl dark:bg-slate-900/90"
      >
        {/* Search Input Area */}
        <div className="border-brand-500/10 flex items-center border-b px-6 py-5">
          <Search className="text-brand-500 mr-4 h-5 w-5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('searchPlaceholder')}
            className="flex-1 bg-transparent text-lg font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
          />
          <div className="bg-brand-500/10 border-brand-500/20 flex items-center gap-1.5 rounded-lg border px-2 py-1">
            <kbd className="text-brand-500 text-xs font-black">ESC</kbd>
          </div>
        </div>

        {/* Results Area */}
        <div ref={scrollContainerRef} className="custom-scrollbar max-h-[50vh] overflow-y-auto p-2">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = index === activeIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`group relative flex cursor-pointer items-center gap-4 rounded-2xl px-4 py-3.5 transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500/10 border-brand-500/20 shadow-lg'
                      : 'hover:bg-brand-500/5 border-transparent'
                  } border`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-brand-500 shadow-brand-500/30 text-white shadow-lg'
                        : 'bg-brand-500/5 text-brand-500 group-hover:bg-brand-500/10'
                    }`}
                  >
                    {typeof Icon === 'string' ? (
                      <DynamicIcon name={normalizeIconName(Icon)} className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold tracking-tight transition-colors ${
                          isActive
                            ? 'text-brand-600 dark:text-brand-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.title}
                      </span>
                      <span className="text-brand-500/40 text-[10px] font-black tracking-widest uppercase">
                        {item.category}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                      {item.description}
                    </p>
                  </div>

                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-slate-400"
                    >
                      <CornerDownLeft className="h-3.5 w-3.5" />
                    </motion.div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Zap className="text-brand-500/20 mb-4 h-12 w-12 animate-pulse" />
              <p className="text-slate-500 dark:text-slate-400">{t('noDataDesc')}</p>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="border-brand-500/5 bg-brand-500/5 flex items-center justify-between border-t px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <kbd className="bg-brand-500/10 flex h-5 w-5 items-center justify-center rounded border border-slate-500/20 font-sans">
                ↑
              </kbd>
              <kbd className="bg-brand-500/10 flex h-5 w-5 items-center justify-center rounded border border-slate-500/20 font-sans">
                ↓
              </kbd>
              <span>{t('toNavigate')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <kbd className="bg-brand-500/10 flex h-7 w-10 items-center justify-center rounded border border-slate-500/20 font-sans">
                Enter
              </kbd>
              <span>{t('toSelect')}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Command className="h-3 w-3 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400">COMMAND PALETTE</span>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
};

export default CommandPalette;
