import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Activity, TrendingUp, Shield, Navigation, Clock } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import ChinaMap, { GeoFeature } from './components/ChinaMap';
import SidebarPanel from './components/SidebarPanel';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import noiseBg from '../../assets/images/noise.svg';

const VisualDashboard: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<GeoFeature | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`dark relative h-screen w-full overflow-hidden bg-[#020617] transition-all duration-700 select-none ${isFullscreen ? 'fixed inset-0 z-100' : 'border-brand-500/20 rounded-[40px] border'}`}
    >
      {/* 3D Map Background Layer - Now takes full container space */}
      <div className="absolute inset-0 z-0">
        <Canvas
          dpr={1}
          frameloop="demand"
          performance={{ min: 0.5 }}
          gl={{
            antialias: false,
            alpha: false,
            stencil: false,
            depth: true,
            powerPreference: 'high-performance',
            precision: 'lowp',
            preserveDrawingBuffer: false,
          }}
        >
          <color attach="background" args={['#020617']} />
          <PerspectiveCamera makeDefault position={[0, 0, 60]} fov={40} />
          <OrbitControls
            enablePan={true}
            maxPolarAngle={Math.PI}
            minPolarAngle={0}
            minDistance={20}
            maxDistance={150}
            dampingFactor={0.05}
            target={[0, 0, 0]}
          />
          <ambientLight intensity={1.5} />
          <pointLight position={[20, 30, 10]} intensity={2} />
          <spotLight position={[-20, 40, 20]} angle={0.25} penumbra={1} intensity={3} />
          <Suspense fallback={null}>
            <ChinaMap selectedProvince={selectedProvince} onProvinceClick={setSelectedProvince} />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Overlay Layer - All UI components float on top */}
      <div className="pointer-events-none relative z-10 flex h-full w-full flex-col">
        <Suspense
          fallback={
            <div className="absolute inset-0 z-100 flex flex-col items-center justify-center bg-[#020617]">
              <div className="border-brand-500 mb-4 h-24 w-24 animate-spin rounded-full border-t-2" />
              <p className="text-brand-500 animate-pulse font-black tracking-[0.5em] uppercase">
                Initializing Strategic View
              </p>
            </div>
          }
        >
          {/* Background Effects Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.1),transparent_70%)]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
            style={{ backgroundImage: `url(${noiseBg})` }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] bg-size-[4rem_4rem] opacity-20" />

          {/* Header - Floating at top */}
          <div className="pointer-events-auto">
            <Header isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} />
          </div>

          {/* Main Layout Area */}
          <div className="relative flex flex-1">
            {/* Left Stats Panel */}
            <div className="pointer-events-auto hidden h-full lg:block">
              <SidebarPanel side="left">
                <StatsOverview />
                <div className="glass-hud border-brand-500/10 mt-6 rounded-3xl border p-6">
                  <h3 className="text-brand-500 mb-4 flex items-center gap-2 text-xs font-black tracking-widest uppercase">
                    <Activity className="h-4 w-4" />
                    实时任务流
                  </h3>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-brand-500/5 border-brand-500/5 hover:border-brand-500/20 group flex gap-4 rounded-2xl border p-3 transition-all"
                      >
                        <div className="bg-brand-500/10 text-brand-500 flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
                          <Navigation className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-slate-200">Task #TX-00{i}</p>
                          <p className="mt-1 text-[9px] font-bold text-slate-500 uppercase">
                            Status: In Progress
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SidebarPanel>
            </div>

            {/* Center Area (Empty for map interaction, but holds return button) */}
            <div className="relative flex-1">
              <AnimatePresence>
                {selectedProvince && (
                  <motion.button
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    onClick={() => setSelectedProvince(null)}
                    className="glass-hud border-brand-500/20 text-brand-500 hover:bg-brand-500/10 group pointer-events-auto absolute top-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-2xl border px-6 py-3 transition-all"
                  >
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    <span className="text-xs font-black tracking-widest uppercase">
                      返回全国地图
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Map Overlay Info - Positioned at the bottom center */}
              <div className="pointer-events-none absolute bottom-8 left-1/2 w-full max-w-2xl -translate-x-1/2 px-8">
                <div className="flex items-end justify-between">
                  <div className="glass-hud border-brand-500/10 pointer-events-auto rounded-3xl border p-6">
                    <p className="text-brand-500 mb-1 text-[10px] font-black tracking-widest uppercase">
                      当前区域
                    </p>
                    <h2 className="text-2xl font-black tracking-tighter text-white uppercase">
                      {selectedProvince ? selectedProvince.properties.name : '中华人民共和国'}
                    </h2>
                  </div>
                  <div className="flex gap-4">
                    <div className="glass-hud border-brand-500/10 pointer-events-auto flex items-center gap-4 rounded-2xl border p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
                          系统安全等级
                        </p>
                        <p className="text-sm font-black text-emerald-500 uppercase">Class Alpha</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Stats Panel */}
            <div className="hidden h-full lg:block">
              <SidebarPanel side="right">
                <div className="glass-hud border-brand-500/10 rounded-3xl border p-6">
                  <h3 className="text-brand-500 mb-6 flex items-center gap-2 text-xs font-black tracking-widest uppercase">
                    <TrendingUp className="h-4 w-4" />
                    业务趋势分析
                  </h3>
                  <div className="space-y-6">
                    {[
                      { label: '订单增长率', value: 78, color: 'bg-brand-500' },
                      { label: '无人机活跃度', value: 92, color: 'bg-emerald-500' },
                      { label: '系统响应速度', value: 64, color: 'bg-amber-500' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="mb-2 flex justify-between">
                          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                            {item.label}
                          </span>
                          <span className="text-[10px] font-black text-slate-200">
                            {item.value}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className={`h-full ${item.color} shadow-[0_0:10px_rgba(var(--brand-500-rgb),0.5)]`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-hud border-brand-500/10 mt-6 rounded-3xl border p-6">
                  <h3 className="text-brand-500 mb-4 flex items-center gap-2 text-xs font-black tracking-widest uppercase">
                    <Clock className="h-4 w-4" />
                    最近调度记录
                  </h3>
                  <div className="space-y-4">
                    {[
                      { time: '14:20', loc: '北京', type: '巡检' },
                      { time: '13:55', loc: '上海', type: '测绘' },
                      { time: '13:12', loc: '深圳', type: '物流' },
                    ].map((log, i) => (
                      <div
                        key={i}
                        className="border-brand-500/5 flex items-center justify-between border-b py-2 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-brand-500 text-[10px] font-black">{log.time}</span>
                          <span className="text-[11px] font-black text-slate-300">{log.loc}</span>
                        </div>
                        <span className="bg-brand-500/10 text-brand-500 rounded-md px-2 py-0.5 text-[9px] font-black tracking-widest uppercase">
                          {log.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </SidebarPanel>
            </div>
          </div>
        </Suspense>
      </div>
    </div>
  );
};

export default VisualDashboard;
