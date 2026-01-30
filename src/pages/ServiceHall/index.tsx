import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  MapPin,
  Globe,
  Link as LinkIcon,
  UserCheck,
  Zap,
  Radar,
  Loader2,
  ChevronRight,
  Clock,
  Wifi,
  Activity,
} from 'lucide-react';
import { useAppContext } from '../../context';
import { INITIAL_USERS, INITIAL_ORDERS } from '../../constants';
import { UserRole, OrderStatus, DroneOrder, User } from '../../types';

const ServiceHall = () => {
  const { t } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'matches' | 'pending' | 'pilots'>('pending');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pilots = useMemo(
    () => INITIAL_USERS.filter((u) => u.role === UserRole.PILOT && u.status === 0),
    [],
  );

  const matchedOrders = useMemo(
    () => INITIAL_ORDERS.filter((o) => o.pilotId && o.status !== OrderStatus.COMPLETED),
    [],
  );

  const pendingOrders = useMemo(
    () => INITIAL_ORDERS.filter((o) => !o.pilotId && o.status === OrderStatus.PENDING),
    [],
  );

  const filteredData = useMemo(() => {
    const searchStr = searchTerm.toLowerCase();
    if (activeTab === 'matches') {
      return matchedOrders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(searchStr) ||
          o.clientName.toLowerCase().includes(searchStr) ||
          o.projectName.toLowerCase().includes(searchStr) ||
          o.pilotName?.toLowerCase().includes(searchStr),
      );
    } else if (activeTab === 'pending') {
      return pendingOrders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(searchStr) ||
          o.projectName.toLowerCase().includes(searchStr) ||
          o.clientName.toLowerCase().includes(searchStr),
      );
    } else {
      return pilots.filter(
        (p) =>
          p.username.toLowerCase().includes(searchStr) ||
          p.location?.toLowerCase().includes(searchStr),
      );
    }
  }, [activeTab, matchedOrders, pendingOrders, pilots, searchTerm]);

  const tabs = [
    {
      id: 'pending',
      label: t('matchingOrders'),
      count: pendingOrders.length,
      icon: Search,
      color: 'amber',
    },
    {
      id: 'matches',
      label: t('matchedInProgress'),
      count: matchedOrders.length,
      icon: LinkIcon,
      color: 'brand',
    },
    {
      id: 'pilots',
      label: t('activePilots'),
      count: pilots.length,
      icon: UserCheck,
      color: 'emerald',
    },
  ] as const;

  return (
    <div className="relative flex flex-1 flex-col space-y-12 pb-32">
      {/* Background Decor */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="bg-brand-500/5 absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[30%] w-[30%] rounded-full bg-amber-500/5 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(var(--color-brand-500) 0.5px, transparent 0.5px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Header Section */}
      <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div className="flex items-center gap-6">
          <div className="group relative">
            <div className="from-brand-500 absolute -inset-1 rounded-3xl bg-linear-to-r to-emerald-500 opacity-25 blur transition duration-1000 group-hover:opacity-50 group-hover:duration-200"></div>
            <div className="glass-hud border-brand-500/20 group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl shadow-xl">
              <div className="from-brand-500/10 absolute inset-0 bg-linear-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <ShoppingBag className="text-brand-500 h-8 w-8 transition-transform duration-500 group-hover:scale-110" />
            </div>
          </div>
          <div>
            <h1 className="flex items-center gap-4 text-4xl font-black tracking-tighter text-slate-900 uppercase dark:text-white">
              {t('serviceHall')}
              <span className="bg-brand-500/10 text-brand-500 border-brand-500/20 animate-pulse rounded-lg border px-2 py-1 text-[10px] font-black tracking-widest">
                LIVE
              </span>
            </h1>
            <div className="mt-2 flex items-center gap-6">
              <p className="text-brand-600 dark:text-brand-500 flex items-center gap-2 text-[10px] font-black tracking-[0.4em] uppercase">
                <Zap className="h-3 w-3 text-amber-500" /> {t('missionControlCenter')}
              </p>
              <div className="hidden h-3 w-px bg-slate-200 sm:block dark:bg-slate-800" />
              <p className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-slate-400 uppercase">
                <Clock className="h-3 w-3" />
                {time.toLocaleTimeString([], { hour12: false })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-hud border-brand-500/10 flex items-center gap-4 rounded-2xl px-4 py-2">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase">
                Uplink Status
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase">
                <Wifi className="h-3 w-3" /> Secure
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase">
                Active Nodes
              </span>
              <span className="text-[10px] font-black text-slate-900 tabular-nums dark:text-white">
                12/12
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher & Filter Row */}
      <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="glass-hud border-brand-500/5 flex items-center gap-1 rounded-2xl p-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative flex items-center gap-3 rounded-xl px-6 py-3 text-[9px] font-black tracking-widest uppercase transition-all duration-300 active:scale-95 ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'hover:bg-brand-500/5 hover:text-brand-500 text-slate-500 dark:text-slate-400'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="bg-brand-500 shadow-brand-500/20 absolute inset-0 rounded-xl shadow-lg will-change-transform"
                  transition={{
                    type: 'spring',
                    bounce: 0.2,
                    duration: 0.6,
                  }}
                />
              )}
              <span className="relative z-10 flex items-center gap-3">
                <tab.icon
                  className={`h-3.5 w-3.5 ${activeTab === tab.id ? 'text-white' : 'text-brand-500/60'}`}
                />
                {tab.label}
                <span
                  className={`rounded-md px-2 py-0.5 text-[8px] ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-brand-500/10 text-brand-500'
                  }`}
                >
                  {tab.count}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="flex w-full items-center gap-4 md:w-auto">
          <div className="group relative w-full md:w-72">
            <div className="from-brand-500/20 absolute -inset-0.5 rounded-2xl bg-linear-to-r to-emerald-500/20 opacity-0 blur transition duration-500 group-focus-within:opacity-100"></div>
            <div className="relative">
              <Search className="group-focus-within:text-brand-500 absolute top-1/2 left-4 z-10 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors dark:text-slate-500" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-tactical-small border-brand-500/10 focus:border-brand-500/30 w-full rounded-2xl py-3.5 pr-4 pl-10 text-[10px] font-black tracking-widest text-slate-900 outline-none dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* High Density Content Area */}
      <div className="relative z-10 flex-1">
        <div className="mx-auto max-w-[1700px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{
                duration: 0.4,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              {activeTab === 'matches' && (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {(filteredData as DroneOrder[]).map((order) => {
                    const pilot = INITIAL_USERS.find((u) => String(u.id) === order.pilotId);
                    return (
                      <div
                        key={order.id}
                        className="group animate-in fade-in slide-in-from-bottom-4 hover:border-brand-500/30 relative flex items-center gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 transition-[background-color,border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-[transform,opacity] dark:border-slate-800 dark:bg-slate-900"
                      >
                        {/* Glass Overlay on Hover */}
                        <div className="from-brand-500/0 to-brand-500/2 pointer-events-none absolute inset-0 bg-linear-to-br opacity-0 transition-opacity group-hover:opacity-100" />

                        <div
                          className="pointer-events-none absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
                          style={{
                            backgroundImage: `radial-gradient(circle, var(--color-brand-500) 1px, transparent 1px)`,
                            backgroundSize: '16px 16px',
                          }}
                        />

                        {/* Success Badge */}
                        <div className="absolute top-0 right-0 z-20 p-1">
                          <div className="bg-brand-500/10 border-brand-500/20 rounded-bl-lg border-b border-l px-2 py-0.5 backdrop-blur-md">
                            <span className="text-brand-500 flex items-center gap-1 text-[7px] font-black tracking-widest uppercase">
                              <CheckCircle2 className="h-2 w-2" /> {t('success')}
                            </span>
                          </div>
                        </div>

                        {/* Order Side */}
                        <div className="relative z-10 min-w-0 flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <div className="relative">
                              <div className="bg-brand-500/20 group-hover:bg-brand-500/40 absolute inset-0 rounded-lg blur-sm transition-colors" />
                              <div className="bg-brand-500 shadow-brand-500/20 relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white shadow-lg">
                                {order.clientName.slice(0, 1)}
                              </div>
                            </div>
                            <div className="min-w-0">
                              <h4 className="truncate text-[12px] font-black tracking-tight text-slate-900 uppercase dark:text-white">
                                {order.clientName}
                              </h4>
                              <p className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                                {order.orderNumber}
                              </p>
                            </div>
                          </div>
                          <div className="ml-1 flex w-fit items-center gap-1.5 rounded-md border border-slate-200/50 bg-slate-100/50 px-2 py-0.5 dark:border-slate-700/50 dark:bg-slate-800/50">
                            <MapPin className="text-brand-500/70 h-2.5 w-2.5" />
                            <p className="truncate text-[9px] font-bold text-slate-500 dark:text-slate-400">
                              {order.location}
                            </p>
                          </div>
                        </div>

                        {/* Connection Visual */}
                        <div className="relative z-10 flex shrink-0 flex-col items-center gap-1 px-4">
                          <div className="relative">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="bg-brand-500/20 absolute inset-0 rounded-full blur-md"
                            />
                            <div className="bg-brand-500 shadow-brand-500/30 ring-brand-500/10 relative flex h-8 w-8 items-center justify-center rounded-full text-white shadow-lg ring-4">
                              <Activity className="h-4 w-4" />
                            </div>
                          </div>
                          <div className="from-brand-500 relative h-6 w-[2px] overflow-hidden bg-linear-to-b to-transparent">
                            <motion.div
                              animate={{ y: [-20, 20] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                              className="absolute inset-0 h-1/2 bg-white opacity-40"
                            />
                          </div>
                        </div>

                        {/* Pilot Side */}
                        <div className="relative z-10 min-w-0 flex-1 text-right">
                          <div className="mb-2 flex items-center justify-end gap-3">
                            <div className="min-w-0">
                              <h4 className="truncate text-[12px] font-black tracking-tight text-slate-900 uppercase dark:text-white">
                                {order.pilotName}
                              </h4>
                              <div className="flex items-center justify-end gap-1.5">
                                <span className="text-[8px] font-black tracking-widest text-emerald-500 uppercase">
                                  {t('operational')}
                                </span>
                                <div className="relative flex h-1.5 w-1.5">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                </div>
                              </div>
                            </div>
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-xs font-black text-slate-600 uppercase dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                              {order.pilotName?.slice(0, 2)}
                            </div>
                          </div>
                          <div className="mr-1 ml-auto flex w-fit items-center justify-end gap-1.5 rounded-md border border-slate-200/50 bg-slate-100/50 px-2 py-0.5 dark:border-slate-700/50 dark:bg-slate-800/50">
                            <p className="truncate text-[9px] font-bold text-slate-500 dark:text-slate-400">
                              {pilot?.location}
                            </p>
                            <Globe className="h-2.5 w-2.5 text-slate-400" />
                          </div>
                        </div>

                        {/* Stats & Actions */}
                        <div className="relative z-10 flex shrink-0 items-center gap-4 border-l border-slate-100 pl-4 dark:border-slate-800">
                          <div className="hidden text-right sm:block">
                            <p className="mb-1 text-[8px] leading-none font-black tracking-widest text-slate-400 uppercase">
                              {t('protocol')}
                            </p>
                            <p className="text-brand-500 text-[11px] font-black tracking-tighter uppercase">
                              {t('active')}
                            </p>
                          </div>
                          <button className="hover:bg-brand-500 dark:hover:bg-brand-500 group/btn relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-slate-900 text-white shadow-lg transition-all hover:scale-105 hover:text-white active:scale-95 dark:bg-white dark:text-slate-900 dark:hover:text-white">
                            <div className="absolute inset-0 bg-linear-to-tr from-white/20 to-transparent opacity-0 transition-opacity group-hover/btn:opacity-100" />
                            <LinkIcon className="relative z-10 h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'pending' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                  {(filteredData as DroneOrder[]).map((order) => (
                    <div
                      key={order.id}
                      className="group animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-[background-color,border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-[transform,opacity] hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5 dark:border-slate-800 dark:bg-slate-900"
                    >
                      {/* Scanning Animation Overlay */}
                      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                        <motion.div
                          animate={{ y: ['-100%', '200%'] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                          className="h-1/2 w-full bg-linear-to-b from-transparent via-amber-500/5 to-transparent"
                        />
                        <div className="animate-scan absolute top-0 left-0 h-px w-full bg-amber-500/20" />
                      </div>

                      {/* Background Pattern */}
                      <div
                        className="pointer-events-none absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
                        style={{
                          backgroundImage: `radial-gradient(circle, var(--color-amber-500) 1px, transparent 1px)`,
                          backgroundSize: '12px 12px',
                        }}
                      />

                      <div className="relative z-10 mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500 shadow-inner transition-all duration-500 group-hover:bg-amber-500 group-hover:text-white">
                              <Radar className="group-hover:animate-spin-slow h-5 w-5" />
                            </div>
                            <motion.div
                              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute inset-0 rounded-xl border-2 border-amber-500/30"
                            />
                          </div>
                          <div>
                            <span className="mb-0.5 block text-[8px] font-black tracking-widest text-amber-500 uppercase">
                              {t('signalScanning')}
                            </span>
                            <h4 className="text-[13px] leading-none font-black tracking-tight text-slate-900 uppercase dark:text-white">
                              ¥{order.amount}
                            </h4>
                          </div>
                        </div>
                      </div>

                      <div className="relative z-10 space-y-4">
                        <div>
                          <h4 className="truncate text-[12px] leading-tight font-black tracking-tight text-slate-900 uppercase transition-colors group-hover:text-amber-600 dark:text-white">
                            {order.projectName}
                          </h4>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[8px] font-black tracking-widest text-slate-500 uppercase dark:border-slate-700 dark:bg-slate-800">
                              {order.orderNumber}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 transition-colors group-hover:border-amber-500/10 dark:border-slate-800 dark:bg-slate-950/50">
                          <div className="flex items-center gap-2">
                            <div className="flex h-5 w-5 items-center justify-center rounded bg-white shadow-xs dark:bg-slate-900">
                              <MapPin className="h-3 w-3 text-amber-500/60" />
                            </div>
                            <span className="truncate text-[9px] font-bold text-slate-600 uppercase dark:text-slate-400">
                              {order.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex h-5 w-5 items-center justify-center rounded bg-white shadow-xs dark:bg-slate-900">
                              <Loader2 className="h-3 w-3 animate-spin text-amber-500/60" />
                            </div>
                            <span className="animate-pulse text-[9px] font-black tracking-widest text-amber-600/80 uppercase dark:text-amber-400/80">
                              {t('searchingNearby')}
                            </span>
                          </div>
                        </div>

                        <button className="group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-slate-900 py-2.5 text-[9px] font-black tracking-widest text-white uppercase shadow-lg transition-all hover:bg-amber-500 hover:text-white active:scale-95 dark:bg-white dark:text-slate-900 dark:hover:bg-amber-500 dark:hover:text-white">
                          <div className="absolute inset-0 bg-linear-to-tr from-white/20 to-transparent opacity-0 transition-opacity group-hover/btn:opacity-100" />
                          <span className="relative z-10">{t('manualMatch')}</span>
                          <ChevronRight className="relative z-10 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'pilots' && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {(filteredData as User[]).map((pilot) => (
                    <div
                      key={pilot.id}
                      className="group animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-center transition-[background-color,border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-[transform,opacity] hover:border-emerald-500/30 dark:border-slate-800 dark:bg-slate-900"
                    >
                      {/* Background Decoration */}
                      <div className="absolute top-0 right-0 h-20 w-20 translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-2xl transition-colors group-hover:bg-emerald-500/10" />

                      <div className="relative mb-4 inline-block">
                        <div className="relative transition-transform duration-500 group-hover:scale-105">
                          <div className="absolute -inset-1.5 rounded-2xl bg-emerald-500/20 opacity-0 blur transition-opacity group-hover:opacity-100" />
                          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-xl font-black text-slate-900 uppercase shadow-sm transition-all duration-500 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-500/20 dark:bg-slate-800 dark:text-white">
                            {pilot.username.slice(0, 2)}
                          </div>
                        </div>
                        <div className="absolute -right-1 -bottom-1 h-5 w-5 rounded-full border-[3px] border-white bg-emerald-500 shadow-sm dark:border-slate-900" />
                      </div>

                      <h4 className="mb-1.5 text-sm font-black tracking-tight text-slate-900 uppercase transition-colors group-hover:text-emerald-500 dark:text-white">
                        {pilot.username}
                      </h4>
                      <div className="mb-6 flex items-center justify-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 py-1.5 text-slate-400 dark:border-slate-800 dark:bg-slate-800/50">
                        <MapPin className="h-3 w-3 text-emerald-500/50" />
                        <span className="max-w-[100px] truncate text-[9px] font-black tracking-widest uppercase">
                          {pilot.location}
                        </span>
                      </div>

                      <button className="group/btn flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-[9px] font-black tracking-widest text-slate-500 uppercase transition-all hover:border-emerald-500/50 hover:text-emerald-500 dark:border-slate-800">
                        {t('viewProfile')}
                        <UserCheck className="h-3.5 w-3.5 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ServiceHall;
