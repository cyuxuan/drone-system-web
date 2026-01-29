import React, { useState, useEffect, useCallback } from 'react';
import { X, RefreshCw, ShieldCheck, Scan, Target } from 'lucide-react';
import { httpClient } from '../services/httpClient';
import { notify } from '../utils/notify';

interface CustomCaptchaProps {
  onSuccess: (verification: string) => void;
  onClose: () => void;
}

interface CaptchaData {
  originalImageBase64: string;
  wordsToClick: string[];
  token: string;
  secretKey: string;
}

interface ClickPoint {
  x: number;
  y: number;
  displayX: number;
  displayY: number;
  t: number;
}

const CustomClickCaptcha: React.FC<CustomCaptchaProps> = ({ onSuccess, onClose }) => {
  const [captchaData, setCaptchaData] = useState<CaptchaData | null>(null);
  const [userPoints, setUserPoints] = useState<ClickPoint[]>([]);
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCaptcha = useCallback(async () => {
    setIsLoading(true);
    setStatus('idle');
    setUserPoints([]);
    try {
      const res = await httpClient.get<{
        code: number;
        data: CaptchaData;
      }>('/admin/captcha/get');
      if (res.code === 200 && res.data) {
        setCaptchaData(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch captcha:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (status === 'success' || status === 'verifying' || !captchaData) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const displayWidth = rect.width;
    const displayHeight = rect.height;

    // 后端原始尺寸
    const originalWidth = 310;
    const originalHeight = 155;

    // 计算缩放后的坐标，映射回原始尺寸
    const x = Math.round(((e.clientX - rect.left) / displayWidth) * originalWidth);
    const y = Math.round(((e.clientY - rect.top) / displayHeight) * originalHeight);

    // 为了在前端正确显示点击位置，我们需要保存显示坐标
    const displayX = Math.round(e.clientX - rect.left);
    const displayY = Math.round(e.clientY - rect.top);

    const newPoints = [...userPoints, { x, y, displayX, displayY, t: Date.now() }];
    setUserPoints(newPoints);

    if (newPoints.length === (captchaData.wordsToClick?.length || 3)) {
      verifyCaptcha(newPoints);
    }
  };

  const verifyCaptcha = async (points: ClickPoint[]) => {
    if (!captchaData) return;
    setStatus('verifying');

    try {
      const res = await httpClient.post<{
        code: number;
        data: {
          captchaVerification: string;
        };
      }>('/admin/captcha/check', {
        token: captchaData.token,
        pointJson: JSON.stringify(points.map((p) => ({ x: p.x, y: p.y }))),
      });

      if (res.code === 200) {
        setStatus('success');
        notify.success('验证成功');
        setTimeout(() => {
          onSuccess(res.data.captchaVerification);
        }, 500);
      } else {
        setStatus('error');
        notify.error('验证失败，请重试');
        setTimeout(() => {
          fetchCaptcha();
        }, 1000);
      }
    } catch {
      setStatus('error');
      notify.error('验证服务异常');
      setTimeout(() => fetchCaptcha(), 1000);
    }
  };

  const resetPoints = () => {
    if (status === 'verifying' || status === 'success') return;
    setUserPoints([]);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden">
      {/* 现代感背景遮罩 */}
      <div
        className="animate-in fade-in absolute inset-0 bg-slate-950/40 backdrop-blur-xl duration-300"
        onClick={onClose}
      />

      <div className="animate-in zoom-in-95 slide-in-from-bottom-5 relative w-[420px] overflow-hidden rounded-[2.5rem] bg-white/90 p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] ring-1 ring-white/20 duration-300 dark:bg-slate-900/90 dark:ring-white/10">
        {/* 动态装饰背景 */}
        <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px]" />

        {/* 顶部标题栏 */}
        <div className="relative mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 shadow-inner dark:bg-blue-500/20">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                安全身份验证
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">
                  Secure Human Verification
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="group flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 transition-all hover:bg-rose-500 hover:text-white dark:bg-slate-800 dark:hover:bg-rose-500"
          >
            <X size={20} className="transition-transform duration-300 group-hover:rotate-90" />
          </button>
        </div>

        {/* 文字提示区：卡片风格 */}
        <div className="relative mb-6 overflow-hidden rounded-4xl bg-slate-950 px-6 py-5 shadow-2xl">
          <div className="relative flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
                <Target size={14} className="text-blue-500" />
                请依次点击下列文字
              </div>
              <button
                onClick={fetchCaptcha}
                disabled={isLoading || status === 'verifying'}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-white/10 hover:text-white disabled:opacity-30"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="flex justify-center gap-4">
              {captchaData?.wordsToClick?.map((word, index) => (
                <div
                  key={`${word}-${index}`}
                  className={`relative flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black transition-all duration-300 ${
                    userPoints.length > index
                      ? 'bg-white/5 text-white/50 ring-1 ring-white/10'
                      : 'bg-white/10 text-white shadow-[0_8px_20px_rgba(0,0,0,0.4)] ring-1 ring-white/20'
                  }`}
                >
                  {word}
                  {userPoints.length > index && (
                    <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white shadow-lg">
                      {index + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 验证图片区 */}
        <div className="group relative aspect-video w-full cursor-crosshair overflow-hidden rounded-4xl bg-slate-100 shadow-inner dark:bg-slate-800">
          {isLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-900/50">
              <div className="relative">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Scan size={24} className="animate-pulse text-blue-500" />
                </div>
              </div>
              <span className="text-xs font-black tracking-[0.3em] text-slate-400 uppercase">
                Init Scanning...
              </span>
            </div>
          ) : captchaData ? (
            <>
              <img
                src={`data:image/png;base64,${captchaData.originalImageBase64}`}
                alt="captcha"
                className="pointer-events-none h-full w-full object-cover select-none"
                onClick={handleImageClick}
              />
              <div className="absolute inset-0 z-10" onClick={handleImageClick} />

              {/* 点击标记：数字化定位点 */}
              {userPoints.map((point, index) => (
                <div
                  key={point.t}
                  style={{ left: point.displayX - 16, top: point.displayY - 16 }}
                  className="absolute z-20 flex h-8 w-8 items-center justify-center"
                >
                  <div className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-white bg-blue-500 text-xs font-black text-white shadow-[0_0_20px_rgba(59,130,246,0.8)]">
                    {index + 1}
                  </div>
                </div>
              ))}
            </>
          ) : null}
        </div>

        {/* 底部控制区 */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex gap-1.5">
              {[...Array(captchaData?.wordsToClick?.length || 3)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    userPoints.length > i
                      ? 'w-6 bg-blue-500'
                      : userPoints.length === i
                        ? 'w-2 bg-slate-300 dark:bg-slate-500'
                        : 'w-2 bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
              Progress: {userPoints.length} / {captchaData?.wordsToClick?.length || 3}
            </span>
          </div>

          <button
            onClick={resetPoints}
            disabled={userPoints.length === 0 || status === 'verifying' || status === 'success'}
            className="group flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-500 transition-all hover:bg-blue-500 hover:text-white disabled:opacity-30 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-blue-500 dark:hover:text-white"
          >
            <RefreshCw
              size={14}
              className="transition-transform duration-500 group-hover:-rotate-180"
            />
            重置
          </button>
        </div>

        <div className="-mx-8 mt-8 -mb-8 bg-slate-50 px-8 py-4 dark:bg-slate-950/50">
          <p className="text-center text-[9px] font-bold tracking-[0.3em] text-slate-400 uppercase">
            Drone Secure Protocol v2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomClickCaptcha;
