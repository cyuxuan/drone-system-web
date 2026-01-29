import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Lock,
  ShieldCheck,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Globe,
  Cpu,
  Zap,
  Bell,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomClickCaptcha from '../../components/CustomClickCaptcha';
import { httpClient } from '../../services/httpClient';
import { notify } from '../../utils/notify';

interface LoginResponse {
  code: number;
  data: {
    accessToken: string;
    expiresIn?: number;
    tokenType?: string;
    userInfo?: {
      userId: string;
      userType?: string;
      identity?: string;
      nickname?: string;
      avatarUrl?: string;
      phone?: string;
      email?: string;
      mfaEnabled?: boolean;
      phoneVerified?: boolean;
      emailVerified?: boolean;
      realNameVerified?: boolean;
      [key: string]: unknown;
    };
    requireMfa?: boolean;
    mfaTempToken?: string;
  };
  message?: string;
}

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaVerification, setCaptchaVerification] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!username || !password) {
      notify.error('请填写用户名和密码');
      return;
    }

    if (!captchaVerification) {
      setShowCaptcha(true);
      return;
    }

    await executeLogin(captchaVerification);
  };

  const executeLogin = async (_verification: string) => {
    setIsLoading(true);
    try {
      const res = await httpClient.post<LoginResponse>('/auth/login', {
        loginType: 'USERNAME_PASSWORD',
        username,
        password,
      });

      if (res.code === 200) {
        if (res.data.requireMfa) {
          notify.error('需要进行 MFA 验证');
          setCaptchaVerification('');
          return;
        }
        localStorage.setItem('token', res.data.accessToken);
        if (res.data.userInfo) {
          localStorage.setItem('user', JSON.stringify(res.data.userInfo));
        }
        setIsSuccess(true);
        notify.success('登录成功');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setCaptchaVerification('');
        notify.error(res.message || '登录失败，请重试');
      }
    } catch (error) {
      setCaptchaVerification('');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onCaptchaSuccess = (verification: string) => {
    if (verification) {
      setCaptchaVerification(verification);
      setShowCaptcha(false);
      executeLogin(verification);
    } else {
      console.error('Captcha response error');
      notify.error('验证码回调异常');
    }
  };

  return (
    <div className="selection:bg-brand-500/30 relative flex min-h-screen overflow-hidden bg-slate-50 font-sans transition-colors duration-500 dark:bg-slate-950">
      {/* 装饰背景 - 烟雨青/水墨感 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />

        {/* 抽象水墨山影感渐变 */}
        <div className="from-brand-500/5 dark:from-brand-500/10 absolute -bottom-[20%] -left-[10%] h-[800px] w-[800px] rounded-full bg-linear-to-tr to-transparent blur-[120px]" />
        <div className="absolute -top-[10%] -right-[5%] h-[600px] w-[600px] rounded-full bg-linear-to-bl from-blue-500/5 to-transparent blur-[100px] dark:from-blue-500/10" />

        {/* 云纹/网格装饰 */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 86c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm66 3c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm-46-45c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm26 26c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM71 11c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-44 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM92 71c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM21 44c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z' fill='%2314b8a6' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* 布局容器 (61.8% : 38.2%) */}
      <div className="relative z-10 flex w-full">
        {/* 左侧：品牌展示与公告区 */}
        <div className="hidden flex-1 flex-col justify-between p-16 lg:flex">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4">
              <div className="bg-brand-500 shadow-brand-500/20 flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  云<span className="text-brand-500">Go</span>
                  <span className="ring-brand-500/20 bg-brand-500/10 text-brand-500 flex h-6 items-center rounded-md px-1.5 text-[10px] font-bold ring-1 ring-inset">
                    领航版
                  </span>
                </h2>
                <p className="text-[10px] font-bold tracking-[0.3em] text-slate-400 uppercase dark:text-white/40">
                  CloudGo Management System
                </p>
              </div>
            </div>
          </motion.div>

          <div className="max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-6xl leading-tight font-black tracking-tighter text-slate-900 dark:text-white"
            >
              智慧领航 <br />
              <span className="from-brand-500 bg-linear-to-r to-emerald-400 bg-clip-text text-transparent">
                定义低空经济新高度
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-8 text-lg leading-relaxed text-slate-500 dark:text-white/50"
            >
              融合 AI
              调度与数字孪生技术，为政企提供全方位无人机集群监管、航线规划及数据智能分析服务。
              践行“大道至简”的东方管理智慧，构建高效、安全的云端指挥中枢。
            </motion.p>

            {/* 核心特性展示 */}
            <div className="mt-12 grid grid-cols-2 gap-8">
              {[
                {
                  icon: <Globe className="h-5 w-5" />,
                  title: '全球协同',
                  desc: '跨区域实时指挥调度',
                },
                { icon: <Cpu className="h-5 w-5" />, title: '智能避障', desc: '毫秒级决策响应' },
                { icon: <Zap className="h-5 w-5" />, title: '极速解析', desc: '多维数据深度感知' },
                { icon: <Bell className="h-5 w-5" />, title: '预警闭环', desc: '全流程自动化管控' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10">
                    <div className="text-brand-500">{item.icon}</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="mt-1 text-sm text-slate-400 dark:text-white/30">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="max-w-md"
          >
            <div className="rounded-2xl border border-slate-200/50 bg-white/40 p-6 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-900 uppercase dark:text-white">
                  <Bell className="text-brand-500 h-3.5 w-3.5" />
                  系统公告 // ANNOUNCEMENTS
                </h4>
                <span className="text-[10px] font-medium text-slate-400">2026.01.19</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="bg-brand-500 h-1 w-1 rounded-full" />
                  <p className="text-xs text-slate-600 dark:text-white/60">
                    云Go 2.4.0 版本现已发布，优化了大规模无人机群调度算法。
                  </p>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-brand-500 h-1 w-1 rounded-full" />
                  <p className="text-xs text-slate-600 dark:text-white/60">
                    安全中心升级：全面启用多重身份认证与加密传输链路。
                  </p>
                </li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-6"
          >
            <div className="h-px w-12 bg-slate-200 dark:bg-white/10" />
            <p className="text-xs font-medium text-slate-400 dark:text-white/20">
              © 2026 云Go科技 • 智慧空域 赋能未来
            </p>
          </motion.div>
        </div>

        {/* 右侧：登录表单区 (黄金分割小区) */}
        <div className="relative flex w-full items-center justify-center bg-white px-8 transition-colors duration-500 lg:w-[460px] lg:shrink-0 dark:bg-slate-900/10 dark:backdrop-blur-3xl">
          {/* 背景装饰线 (深色模式下弱化) */}
          <div className="absolute inset-y-0 left-0 hidden w-px bg-linear-to-b from-transparent via-slate-100 to-transparent lg:block dark:via-white/5" />

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-[340px]"
          >
            <div className="mb-10 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="shadow-brand-500/20 bg-brand-500 h-10 w-10 rounded-xl shadow-lg" />
                <h2 className="text-xl font-black dark:text-white">云Go</h2>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                欢迎登录
              </h3>
              <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                请使用您的管理员凭证访问指挥系统
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                  Account
                </label>
                <div className="group relative">
                  <div className="group-focus-within:text-brand-500 absolute inset-y-0 left-4 flex items-center text-slate-400 transition-colors dark:text-slate-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入账号"
                    className="focus:border-brand-500 focus:ring-brand-500/10 w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pr-4 pl-11 text-sm font-medium transition-all outline-none focus:bg-white focus:ring-4 dark:border-white/5 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-600 dark:focus:bg-white/10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                  Password
                </label>
                <div className="group relative">
                  <div className="group-focus-within:text-brand-500 absolute inset-y-0 left-4 flex items-center text-slate-400 transition-colors dark:text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="focus:border-brand-500 focus:ring-brand-500/10 w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pr-4 pl-11 text-sm font-medium transition-all outline-none focus:bg-white focus:ring-4 dark:border-white/5 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-600 dark:focus:bg-white/10"
                    required
                  />
                </div>
              </div>

              <AnimatePresence>
                {captchaVerification && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-[13px] font-bold text-emerald-600 dark:bg-emerald-500/5 dark:text-emerald-400/90"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>身份安全验证已通过</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                disabled={isLoading || isSuccess}
                className={`relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl py-4 text-sm font-bold tracking-widest text-white uppercase transition-all active:scale-[0.98] ${
                  isSuccess
                    ? 'bg-emerald-500'
                    : captchaVerification
                      ? 'bg-brand-500 shadow-brand-500/20 shadow-lg'
                      : 'dark:bg-brand-500 dark:hover:bg-brand-600 dark:shadow-brand-500/10 bg-slate-900 shadow-lg shadow-slate-900/10 hover:bg-slate-800 dark:shadow-lg'
                } disabled:opacity-70`}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isSuccess ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <>
                    <span>{captchaVerification ? '进入指挥系统' : '验证并登录'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 text-center lg:hidden">
              <p className="text-[10px] font-bold text-slate-400 uppercase dark:text-white/20">
                Secure Access Gateway • 2026
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 行为验证弹窗 */}
      {showCaptcha && (
        <CustomClickCaptcha onSuccess={onCaptchaSuccess} onClose={() => setShowCaptcha(false)} />
      )}
    </div>
  );
};

export default Login;
