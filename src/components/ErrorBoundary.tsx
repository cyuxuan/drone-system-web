import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  t: (key: string) => string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoBack = () => {
    window.history.back();
    setTimeout(() => {
      this.setState({ hasError: false, error: null });
    }, 100);
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="relative flex min-h-[700px] flex-1 items-center justify-center overflow-hidden p-6">
          {/* Background Elements */}
          <div className="absolute inset-0 z-0">
            <motion.div
              animate={{
                opacity: [0.03, 0.08, 0.03],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 blur-[120px]"
            />
            <div className="bg-brand-500/5 absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full blur-[100px]" />
            <div
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
              style={{
                backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="glass-hud rounded-6xl border-brand-500/10 streaming-border relative z-10 w-full max-w-4xl p-1 shadow-2xl"
          >
            <div className="relative flex flex-col items-center gap-16 overflow-hidden rounded-[3.8rem] bg-white/40 p-12 backdrop-blur-3xl md:flex-row md:p-20 dark:bg-slate-900/40">
              {/* Left Side: Visual Anomaly */}
              <div className="relative shrink-0">
                <div className="relative flex h-48 w-48 items-center justify-center rounded-full md:h-64 md:w-64">
                  {/* Rotating Rings */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-2 border-dashed border-red-500/20"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                    className="border-brand-500/20 absolute inset-4 rounded-full border"
                  />

                  {/* Scanning Effect */}
                  <motion.div
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 z-20 h-1 w-full bg-linear-to-r from-transparent via-red-500/40 to-transparent"
                  />

                  {/* Core Icon */}
                  <div className="relative z-10 flex h-32 w-32 items-center justify-center md:h-40 md:w-40">
                    <AlertTriangle className="h-20 w-20 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)] md:h-24 md:w-24" />
                  </div>

                  {/* Pulsing Glow & Multiple Ripple Layers */}
                  {/* Core Glow */}
                  <motion.div
                    animate={{
                      opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-0 rounded-full bg-red-500 blur-2xl"
                  />

                  {/* Ripple Layer 1 */}
                  <motion.div
                    initial={{ scale: 1, opacity: 0.3 }}
                    animate={{
                      scale: 2,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="absolute inset-0 rounded-full bg-red-500/20 blur-xl"
                  />

                  {/* Ripple Layer 2 */}
                  <motion.div
                    initial={{ scale: 1, opacity: 0.3 }}
                    animate={{
                      scale: 2.5,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: [0.25, 0.1, 0.25, 1],
                      delay: 1.5,
                    }}
                    className="absolute inset-0 rounded-full bg-red-500/10 blur-2xl"
                  />
                </div>
              </div>

              {/* Right Side: Content & Actions */}
              <div className="flex-1 text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1.5">
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="h-1.5 w-1.5 rounded-full bg-red-500"
                    />
                    <span className="text-[10px] font-black tracking-[0.2em] text-red-500 uppercase">
                      Anomaly Detected
                    </span>
                  </div>

                  <h2 className="mb-6 text-4xl leading-tight font-black tracking-tighter text-slate-900 uppercase md:text-5xl dark:text-white">
                    {this.props.t('systemLinkFailure')}
                  </h2>

                  <p className="mb-10 max-w-md text-lg leading-relaxed font-medium text-slate-500 dark:text-slate-400">
                    {this.props.t('systemErrorDesc')}
                  </p>

                  {/* Terminal-style Error Log */}
                  <div className="group relative mb-10 rounded-3xl border border-white/5 bg-slate-950/80 p-6 text-left font-mono dark:bg-black/40">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500/50" />
                      <div className="h-2 w-2 rounded-full bg-amber-500/50" />
                      <div className="h-2 w-2 rounded-full bg-emerald-500/50" />
                    </div>
                    <p className="mb-1 text-[11px] tracking-widest text-red-400/80 uppercase">
                      Critical Failure Log:
                    </p>
                    <p className="text-[13px] leading-relaxed break-all text-slate-300">
                      {this.state.error?.name || 'UNKNOWN_CORE_FAILURE'}:{' '}
                      {this.state.error?.message ||
                        'The system encountered an unrecoverable exception in the tactical execution layer.'}
                    </p>
                  </div>

                  <div className="no-scrollbar flex flex-row items-center justify-center gap-3 overflow-x-auto pb-2 md:justify-start md:gap-4 md:pb-0">
                    <button
                      onClick={this.handleReset}
                      className="btn-jade group flex h-14 shrink-0 items-center justify-center gap-2 rounded-2xl px-6 text-[11px] font-black tracking-[0.2em] text-white uppercase transition-all hover:scale-[1.02] active:scale-95 md:gap-3 md:px-10"
                    >
                      <RefreshCw className="h-4.5 w-4.5 transition-transform duration-700 group-hover:rotate-180" />
                      <span className="whitespace-nowrap">{this.props.t('reInitialize')}</span>
                    </button>

                    <button
                      onClick={this.handleGoBack}
                      className="glass-hud border-brand-500/20 text-brand-600 dark:text-brand-400 hover:bg-brand-500/10 group flex h-14 shrink-0 items-center justify-center gap-2 rounded-2xl border px-6 text-[11px] font-black tracking-[0.2em] uppercase transition-all md:gap-3 md:px-8"
                    >
                      <ArrowLeft className="h-4.5 w-4.5 transition-transform group-hover:-translate-x-1" />
                      <span className="whitespace-nowrap">{this.props.t('returnPrevious')}</span>
                    </button>

                    <a
                      href="/"
                      className="glass-hud border-brand-500/20 text-brand-500 hover:bg-brand-500/10 group flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-all"
                      title={this.props.t('returnDashboard')}
                    >
                      <Home className="h-5.5 w-5.5 transition-transform group-hover:scale-110" />
                    </a>
                  </div>
                </motion.div>
              </div>

              {/* Decorative Corner Accents */}
              <div className="pointer-events-none absolute top-0 right-0 p-8 opacity-20">
                <div className="h-24 w-24 rounded-tr-3xl border-t-2 border-r-2 border-red-500" />
              </div>
              <div className="pointer-events-none absolute bottom-0 left-0 p-8 opacity-20">
                <div className="border-brand-500 h-24 w-24 rounded-bl-3xl border-b-2 border-l-2" />
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
