import { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu as MenuIcon,
  Moon,
  Sun,
  LogOut,
  Search,
  Hexagon,
  Terminal,
  CircleDashed,
  ChevronDown,
  ChevronRight,
  Languages,
} from 'lucide-react';
import { translations, Language, TranslationKey } from './i18n';
import { INITIAL_MENU, ICON_MAP } from './constants';
import { AppContext, useAppContext, MessageOptions } from './context';
import MessageModal from './components/MessageModal';
import NotificationContainer from './components/NotificationContainer';
import ErrorBoundary from './components/ErrorBoundary';
import CommandPalette from './components/CommandPalette';
import { perfMonitor, PerformanceMetrics } from './utils/performance';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const RoleManagement = lazy(() => import('./pages/RoleManagement'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const MenuManagement = lazy(() => import('./pages/MenuManagement'));
const OrderManagement = lazy(() => import('./pages/OrderManagement'));
const ProjectManagement = lazy(() => import('./pages/ProjectManagement'));
const ProjectCategory = lazy(() => import('./pages/ProjectCategory'));
const VisualDashboard = lazy(() => import('./pages/VisualDashboard'));
const CustomerManagement = lazy(() => import('./pages/CustomerManagement'));
const ServiceHall = lazy(() => import('./pages/ServiceHall'));

const Sidebar = () => {
  const { t, isSidebarCollapsed, setIsSidebarCollapsed } = useAppContext();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>(() => {
    const activeItem = INITIAL_MENU.find(
      (m) =>
        m.parentId && (m.path === location.pathname || location.pathname.startsWith(m.path + '/')),
    );
    return activeItem?.parentId ? [activeItem.parentId] : [];
  });
  const [hoveredMenuId, setHoveredMenuId] = useState<string | null>(null);
  const [prevPathname, setPrevPathname] = useState(location.pathname);

  // Automatically expand the menu containing the current route when path changes
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    const activeItem = INITIAL_MENU.find(
      (m) =>
        m.parentId && (m.path === location.pathname || location.pathname.startsWith(m.path + '/')),
    );
    setOpenMenus(activeItem?.parentId ? [activeItem.parentId] : []);
  }

  const menuTree = useMemo(() => {
    const roots = INITIAL_MENU.filter((m) => !m.parentId);
    return roots.map((root) => ({
      ...root,
      children: INITIAL_MENU.filter((m) => m.parentId === root.id),
    }));
  }, []);

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) => (prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]));
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarCollapsed ? 96 : 280 }}
      onMouseLeave={() => setHoveredMenuId(null)}
      className={`glass-hud rounded-5xl border-brand-500/10 fixed top-6 bottom-6 left-6 z-50 flex flex-col ${isSidebarCollapsed ? '' : 'overflow-hidden'}`}
    >
      <div
        className={`relative flex h-32 shrink-0 items-center overflow-hidden ${isSidebarCollapsed ? 'justify-center px-0' : 'px-8'}`}
      >
        <div
          className={`relative z-10 flex w-full items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}
        >
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed && (
              <motion.div
                key="logo-expanded"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex min-w-0 items-center gap-4"
              >
                <div className="group relative shrink-0">
                  <Hexagon className="text-brand-500 fill-brand-500/5 h-11 w-11 transition-transform duration-700 group-hover:rotate-90" />
                  <Terminal className="text-brand-600 dark:text-brand-400 absolute inset-0 m-auto h-4.5 w-4.5" />
                </div>
                <div className="truncate">
                  <span className="block truncate text-lg leading-none font-black tracking-tighter text-slate-900 uppercase dark:text-slate-100">
                    云Go
                  </span>
                  <span className="text-brand-500 mt-2 block truncate text-[9px] font-black tracking-[0.4em] uppercase">
                    {t('skylineSystem')}
                  </span>
                </div>
              </motion.div>
            )}
            {isSidebarCollapsed && (
              <motion.div
                key="logo-collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="mx-auto"
              >
                <div className="group relative shrink-0">
                  <Hexagon className="text-brand-500 fill-brand-500/5 h-11 w-11 transition-transform duration-700 group-hover:rotate-90" />
                  <Terminal className="text-brand-600 dark:text-brand-400 absolute inset-0 m-auto h-4.5 w-4.5" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hover:bg-brand-500/10 hover:text-brand-600 ml-2 shrink-0 rounded-xl p-2.5 text-slate-400 transition-all outline-none dark:text-slate-500"
            >
              <MenuIcon className="h-4.5 w-4.5" />
            </button>
          )}
        </div>

        {isSidebarCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
            title={t('expandSidebar')}
          />
        )}
      </div>

      <nav
        className={`flex-1 ${isSidebarCollapsed ? 'flex flex-col items-center overflow-visible' : 'overflow-y-auto'} custom-scrollbar space-y-3 px-4 py-6`}
      >
        {menuTree.map((item) => {
          const Icon = ICON_MAP[item.icon];
          const hasChildren = item.children.length > 0;
          const isExpanded = openMenus.includes(item.id);
          const isActive =
            location.pathname === item.path ||
            item.children.some((c) => c.path === location.pathname);

          return (
            <div
              key={item.id}
              className="group/navitem relative"
              onMouseEnter={() => isSidebarCollapsed && setHoveredMenuId(item.id)}
            >
              {/* Collapsed State Hover Pod (Tactical Floating Pod) */}
              {isSidebarCollapsed && (
                <AnimatePresence>
                  {hoveredMenuId === item.id && (
                    <motion.div
                      initial={{ opacity: 0, x: -10, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="pointer-events-auto absolute top-0 left-full ml-4"
                      onMouseEnter={() => setHoveredMenuId(item.id)}
                      onMouseLeave={() => setHoveredMenuId(null)}
                    >
                      {/* Interaction Bridge: ensures hover state is maintained */}
                      <div className="absolute top-0 bottom-0 -left-4 w-4 bg-transparent" />

                      <div className="glass-hud border-brand-500/30 streaming-border min-w-[240px] overflow-hidden rounded-4xl border-2 p-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
                        <div className="border-brand-500/10 bg-brand-500/5 mb-1 border-b px-5 py-4">
                          <span className="text-[11px] font-black tracking-widest text-slate-900 uppercase dark:text-white">
                            {t(item.label)}
                          </span>
                          {hasChildren && (
                            <p className="text-brand-500 mt-1 text-[8px] font-bold tracking-widest uppercase">
                              {t('subSystemReady')}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1 p-1">
                          {hasChildren ? (
                            item.children.map((child) => {
                              const ChildIcon = ICON_MAP[child.icon];
                              const isChildActive = location.pathname === child.path;
                              return (
                                <Link
                                  key={child.id}
                                  to={child.path}
                                  onClick={() => setHoveredMenuId(null)}
                                  className={`flex items-center justify-between gap-3 rounded-2xl border px-5 py-3.5 transition-all duration-300 outline-none ${isChildActive ? 'btn-jade text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]' : 'hover:bg-brand-500/10 hover:text-brand-600 border-transparent text-slate-500 dark:text-slate-400'}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <ChildIcon
                                      className={`h-3.5 w-3.5 ${isChildActive ? 'text-white' : 'text-brand-500/60'}`}
                                    />
                                    <span className="text-[10px] font-black tracking-widest uppercase">
                                      {t(child.label)}
                                    </span>
                                  </div>
                                  <ChevronRight
                                    className={`h-3 w-3 transition-all ${isChildActive ? 'text-white' : 'opacity-0 group-hover/sub:translate-x-1 group-hover/sub:opacity-100'}`}
                                  />
                                </Link>
                              );
                            })
                          ) : (
                            <Link
                              to={item.path}
                              onClick={() => setHoveredMenuId(null)}
                              className={`flex items-center gap-3 rounded-2xl border px-5 py-3.5 transition-all duration-300 outline-none ${isActive ? 'btn-jade text-white' : 'hover:bg-brand-500/10 border-transparent text-slate-500 dark:text-slate-400'}`}
                            >
                              <Icon className="h-4 w-4" />
                              <span className="text-[10px] font-black tracking-widest uppercase">
                                {t('directAccessConsole')}
                              </span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {/* Normal Sidebar Content */}
              {hasChildren && !isSidebarCollapsed ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`group flex w-full items-center gap-4 rounded-3xl border px-6 py-4 transition-all duration-300 outline-none ${isActive ? 'bg-brand-500/10 border-brand-500/20 text-brand-600 dark:text-brand-400' : 'hover:bg-brand-500/5 border-transparent text-slate-500 dark:text-slate-400'}`}
                  >
                    <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <span className="flex-1 text-left text-[12px] font-black tracking-widest uppercase">
                      {t(item.label)}
                    </span>
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-brand-500/10 mt-2 ml-6 space-y-1 overflow-hidden border-l-2 pl-2"
                      >
                        {item.children.map((child) => {
                          const ChildIcon = ICON_MAP[child.icon];
                          const isChildActive = location.pathname === child.path;
                          return (
                            <Link
                              key={child.id}
                              to={child.path}
                              className={`group flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-300 outline-none ${isChildActive ? 'btn-jade text-white shadow-lg' : 'hover:bg-brand-500/5 border-transparent text-slate-500 dark:text-slate-400'}`}
                            >
                              <ChildIcon className="h-4 w-4" />
                              <span className="text-[10px] font-black tracking-widest uppercase">
                                {t(child.label)}
                              </span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`group relative flex items-center gap-4 overflow-hidden rounded-3xl border px-6 py-4 transition-all duration-300 outline-none ${isActive ? 'btn-jade text-white shadow-lg' : 'hover:bg-brand-500/5 border-transparent text-slate-500 dark:text-slate-400'} ${isSidebarCollapsed ? 'mx-auto w-16 justify-center px-0' : ''}`}
                >
                  <Icon className={`h-5 w-5 transition-transform group-hover:rotate-12`} />
                  {!isSidebarCollapsed && (
                    <span className="text-[12px] font-black tracking-widest uppercase">
                      {t(item.label)}
                    </span>
                  )}
                  {!isSidebarCollapsed && isActive && (
                    <motion.div
                      layoutId="sidebar-pill"
                      className="ml-auto h-2 w-2 rounded-full bg-white shadow-lg"
                    />
                  )}
                  {isSidebarCollapsed && isActive && (
                    <div className="absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white" />
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-brand-500/10 bg-brand-500/5 shrink-0 border-t p-6">
        <div
          className={`flex items-center gap-4 ${isSidebarCollapsed ? 'flex-col justify-center gap-6' : ''}`}
        >
          <div className="group relative">
            <div className="bg-brand-500/20 absolute -inset-2 animate-pulse rounded-full opacity-0 blur-lg transition-opacity group-hover:opacity-100"></div>
            <div className="border-brand-500/20 text-brand-600 dark:text-brand-400 group-hover:border-brand-500/50 relative flex h-11 w-11 items-center justify-center rounded-full border bg-white text-[10px] font-black shadow-lg transition-all dark:bg-slate-900">
              ADM
            </div>
          </div>
          {!isSidebarCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-[11px] font-black tracking-widest text-slate-900 uppercase dark:text-slate-100">
                Overwatch_01
              </p>
              <p className="mt-1.5 text-[8px] font-black tracking-[0.2em] text-slate-500 uppercase opacity-80 dark:text-slate-500">
                {t('skylineCommander')}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

const Header = () => {
  const {
    t,
    theme,
    setTheme,
    isSidebarCollapsed,
    language,
    setLanguage,
    setIsSearchOpen,
    confirm,
  } = useAppContext();
  const [metrics, setMetrics] = useState<PerformanceMetrics>(perfMonitor.getMetrics());
  const navigate = useNavigate();

  useEffect(() => {
    return perfMonitor.subscribe((newMetrics) => {
      setMetrics({ ...newMetrics });
    });
  }, []);

  const handleLogout = async () => {
    const isConfirmed = await confirm(t('confirmLogout'), {
      title: t('logout'),
      confirmText: t('confirm'),
      cancelText: t('cancel'),
    });

    if (isConfirmed) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const getStatusColor = (status: PerformanceMetrics['status']) => {
    switch (status) {
      case 'excellent':
        return 'text-emerald-500 dark:text-emerald-400';
      case 'good':
        return 'text-brand-500 dark:text-brand-400';
      case 'fair':
        return 'text-amber-500 dark:text-amber-400';
      case 'poor':
        return 'text-rose-500 dark:text-rose-400';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <header
      className="glass-hud rounded-5xl border-brand-500/10 fixed top-6 right-6 z-40 flex h-24 items-center justify-between px-10 shadow-lg transition-all duration-500"
      style={{ left: isSidebarCollapsed ? '132px' : '312px' }}
    >
      <div className="flex flex-1 items-center">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="group hover:bg-brand-500/5 relative flex items-center gap-3 rounded-xl px-3 py-1.5 transition-all duration-300 active:scale-95"
        >
          <Search className="group-hover:text-brand-500 h-5 w-5 text-slate-400 transition-colors duration-300" />

          <span className="text-sm font-medium text-slate-500 transition-colors duration-300 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200">
            {t('search')}
          </span>

          <div className="ml-2 flex items-center gap-1">
            <kbd className="group-hover:border-brand-500/30 group-hover:text-brand-600 dark:group-hover:text-brand-400 flex h-6 min-w-[24px] items-center justify-center rounded-md border border-slate-200 bg-white px-1.5 text-[11px] font-medium text-slate-400 shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
              ⌘
            </kbd>
            <kbd className="group-hover:border-brand-500/30 group-hover:text-brand-600 dark:group-hover:text-brand-400 flex h-6 min-w-[24px] items-center justify-center rounded-md border border-slate-200 bg-white px-1.5 text-[11px] font-medium text-slate-400 shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
              K
            </kbd>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-5">
        <Link
          to="/system/logs"
          className="bg-brand-500/5 border-brand-500/15 group hover:bg-brand-500/10 hidden items-center gap-3 rounded-3xl border px-6 py-2.5 shadow-inner transition-all active:scale-95 lg:flex"
        >
          <div className="relative">
            <CircleDashed
              className={`animate-spin-slow h-4 w-4 ${getStatusColor(metrics.status)}`}
            />
            <div
              className={`bg-brand-500/20 absolute inset-0 animate-pulse rounded-full blur-sm`}
            ></div>
          </div>
          <span className="text-brand-600 dark:text-brand-400 text-[9px] font-black tracking-[0.25em] uppercase">
            {t('systemStatusText')}
            <span className={getStatusColor(metrics.status)}>
              {t(perfMonitor.getStatusI18nKey())}
            </span>
          </span>
        </Link>

        {/* Language Switcher */}
        <div className="group relative">
          <button className="bg-brand-500/5 border-brand-500/15 hover:bg-brand-500/10 group/btn flex items-center gap-3 rounded-3xl border px-6 py-2.5 shadow-inner transition-all outline-none active:scale-95">
            <div className="relative">
              <Languages className="text-brand-500 h-4 w-4 transition-transform group-hover/btn:rotate-12" />
              <div className="bg-brand-500/20 absolute inset-0 rounded-full opacity-0 blur-sm transition-opacity group-hover/btn:opacity-100"></div>
            </div>
            <span className="text-brand-600 dark:text-brand-400 text-[9px] font-black tracking-[0.25em] uppercase">
              {language === 'zh' ? '中文' : 'English'}
            </span>
          </button>

          <div className="invisible absolute top-full right-0 z-50 mt-3 translate-y-2 pt-2 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
            <div className="glass-hud border-brand-500/10 min-w-[140px] overflow-hidden rounded-3xl border p-2 shadow-2xl">
              <div className="border-brand-500/5 mb-1 border-b px-4 py-2">
                <span className="text-[8px] font-black tracking-[0.2em] text-slate-400 uppercase">
                  {t('languageSelect')}
                </span>
              </div>
              <button
                onClick={() => setLanguage('zh')}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-[10px] font-black tracking-widest uppercase transition-all ${language === 'zh' ? 'bg-brand-500/10 text-brand-600 shadow-inner' : 'hover:bg-brand-500/5 text-slate-500'}`}
              >
                中文
                {language === 'zh' && (
                  <motion.div
                    layoutId="lang-active"
                    className="bg-brand-500 h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(var(--brand-500-rgb),0.6)]"
                  />
                )}
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-[10px] font-black tracking-widest uppercase transition-all ${language === 'en' ? 'bg-brand-500/10 text-brand-600 shadow-inner' : 'hover:bg-brand-500/5 text-slate-500'}`}
              >
                English
                {language === 'en' && (
                  <motion.div
                    layoutId="lang-active"
                    className="bg-brand-500 h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(var(--brand-500-rgb),0.6)]"
                  />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Theme Switcher */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="bg-brand-500/5 border-brand-500/15 hover:bg-brand-500/10 group/theme flex items-center gap-3 rounded-3xl border px-5 py-2.5 shadow-inner transition-all outline-none active:scale-95"
          title={theme === 'dark' ? t('switchToLight') : t('switchToDark')}
        >
          <div className="relative">
            {theme === 'dark' ? (
              <Sun className="text-brand-500 h-4 w-4 transition-transform duration-500 group-hover/theme:rotate-90" />
            ) : (
              <Moon className="text-brand-500 h-4 w-4 transition-transform duration-500 group-hover/theme:-rotate-12" />
            )}
            <div className="bg-brand-500/20 absolute inset-0 rounded-full opacity-0 blur-sm transition-opacity group-hover/theme:opacity-100"></div>
          </div>
        </button>

        <button
          onClick={handleLogout}
          className="group/logout flex items-center gap-3 rounded-3xl border border-rose-500/20 bg-rose-500/5 px-6 py-2.5 text-[9px] font-black tracking-[0.25em] text-rose-600 uppercase shadow-inner transition-all outline-none hover:border-rose-500 hover:bg-rose-500 hover:text-white dark:text-rose-500"
        >
          <div className="relative">
            <LogOut className="h-4 w-4 transition-transform group-hover/logout:-translate-x-1" />
            <div className="absolute inset-0 rounded-full bg-rose-500/20 opacity-0 blur-sm transition-opacity group-hover/logout:opacity-100"></div>
          </div>
          <span className="hidden xl:inline">{t('logout')}</span>
        </button>
      </div>
    </header>
  );
};

const AppContent = () => {
  const location = useLocation();
  const { isSidebarCollapsed, t } = useAppContext();

  const token = localStorage.getItem('token');
  const isLoginPage = location.pathname === '/login';

  // 1. 未登录且不在登录页 -> 跳转登录页
  if (!token && !isLoginPage) {
    return <Navigate to="/login" replace />;
  }

  // 2. 已登录且在登录页 -> 跳转首页
  if (token && isLoginPage) {
    return <Navigate to="/" replace />;
  }

  if (isLoginPage) {
    return (
      <ErrorBoundary t={t}>
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-[#050505]">
              <div className="relative">
                <div className="border-brand-500/20 border-t-brand-500 h-16 w-16 animate-spin rounded-full border-4" />
              </div>
            </div>
          }
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar />
      <div
        className="flex min-h-screen flex-1 flex-col transition-all duration-500"
        style={{ marginLeft: isSidebarCollapsed ? '96px' : '280px' }}
      >
        <Header />
        <main className="flex flex-1 flex-col px-12 pt-40 pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="mx-auto flex w-full max-w-[1700px] flex-1 flex-col"
            >
              <ErrorBoundary t={t}>
                <Suspense
                  fallback={
                    <div className="flex min-h-[400px] flex-1 items-center justify-center">
                      <div className="relative">
                        <div className="border-brand-500/20 border-t-brand-500 h-16 w-16 animate-spin rounded-full border-4" />
                        <div className="border-brand-500/20 border-b-brand-500 animate-spin-slow absolute inset-0 m-auto h-8 w-8 rounded-full border-4" />
                      </div>
                    </div>
                  }
                >
                  <Routes location={location}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/system/users" element={<UserManagement />} />
                    <Route path="/system/roles" element={<RoleManagement />} />
                    <Route path="/system/logs" element={<AuditLogs />} />
                    <Route path="/system/menu" element={<MenuManagement />} />
                    <Route path="/system/customers" element={<CustomerManagement />} />
                    <Route path="/services/orders" element={<OrderManagement />} />
                    <Route path="/services/hall" element={<ServiceHall />} />
                    <Route path="/services/projects" element={<ProjectManagement />} />
                    <Route path="/services/categories" element={<ProjectCategory />} />
                    <Route path="/services/visual-dashboard" element={<VisualDashboard />} />
                    {/* Catch-all redirect to ensure Console is default */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
};

const App = () => {
  const [language, setLanguage] = useState<Language>('zh');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const cached = localStorage.getItem('theme') as 'light' | 'dark';
    if (cached) return cached;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [messageOptions, setMessageOptions] = useState<MessageOptions | null>(null);

  // Global Command+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const t = useCallback(
    (key: TranslationKey | string, params?: Record<string, string | number>): string => {
      const langData = (translations[language] || translations['en']) as Record<string, string>;
      const value = langData[key as string];
      let text = typeof value === 'string' ? value : String(key);

      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }

      return text;
    },
    [language],
  );

  const showMessage = useCallback((options: MessageOptions) => {
    setMessageOptions(options);
  }, []);

  const confirm = useCallback(
    (message: string, options?: Partial<MessageOptions>): Promise<boolean> => {
      return new Promise((resolve) => {
        setMessageOptions({
          type: 'confirm',
          title: options?.title || t('confirmDirective'),
          message,
          confirmText: options?.confirmText,
          cancelText: options?.cancelText,
          onConfirm: () => {
            setMessageOptions(null);
            resolve(true);
          },
          onCancel: () => {
            setMessageOptions(null);
            resolve(false);
          },
        });
      });
    },
    [t],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      theme,
      setTheme,
      t,
      isSidebarCollapsed,
      setIsSidebarCollapsed,
      isSearchOpen,
      setIsSearchOpen,
      showMessage,
      confirm,
    }),
    [language, theme, isSidebarCollapsed, isSearchOpen, t, showMessage, confirm],
  );

  return (
    <AppContext.Provider value={value}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
      <MessageModal
        isOpen={!!messageOptions}
        type={messageOptions?.type || 'alert'}
        title={messageOptions?.title || ''}
        message={messageOptions?.message || ''}
        confirmText={messageOptions?.confirmText}
        cancelText={messageOptions?.cancelText}
        onConfirm={() => {
          messageOptions?.onConfirm?.();
          setMessageOptions(null);
        }}
        onCancel={() => {
          messageOptions?.onCancel?.();
          setMessageOptions(null);
        }}
      />
      <NotificationContainer />
    </AppContext.Provider>
  );
};

export default App;
