export interface PerformanceMetrics {
  apiLatency: number; // ms
  renderTime: number; // ms
  fps: number;
  memoryUsage?: number; // MB
  status: 'excellent' | 'good' | 'fair' | 'poor';
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics = {
    apiLatency: 0,
    renderTime: 0,
    fps: 60,
    status: 'excellent',
  };
  private listeners: ((metrics: PerformanceMetrics) => void)[] = [];
  private lastFrameTime = performance.now();
  private frameCount = 0;

  private constructor() {
    this.startFPSMonitoring();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private startFPSMonitoring() {
    const checkFPS = () => {
      const now = performance.now();
      this.frameCount++;
      if (now - this.lastFrameTime >= 1000) {
        this.metrics.fps = Math.round((this.frameCount * 1000) / (now - this.lastFrameTime));
        this.frameCount = 0;
        this.lastFrameTime = now;
        this.updateStatus();
        this.notify();
      }
      requestAnimationFrame(checkFPS);
    };
    requestAnimationFrame(checkFPS);
  }

  public recordApiLatency(duration: number) {
    // 使用滑动平均值
    this.metrics.apiLatency = Math.round(
      this.metrics.apiLatency === 0 ? duration : this.metrics.apiLatency * 0.7 + duration * 0.3,
    );
    this.updateStatus();
    this.notify();
  }

  public recordRenderTime(duration: number) {
    this.metrics.renderTime = Math.round(
      this.metrics.renderTime === 0 ? duration : this.metrics.renderTime * 0.7 + duration * 0.3,
    );
    this.updateStatus();
    this.notify();
  }

  private updateStatus() {
    const { apiLatency, renderTime, fps } = this.metrics;

    if (apiLatency > 1000 || renderTime > 500 || fps < 30) {
      this.metrics.status = 'poor';
    } else if (apiLatency > 500 || renderTime > 200 || fps < 45) {
      this.metrics.status = 'fair';
    } else if (apiLatency > 200 || renderTime > 100 || fps < 55) {
      this.metrics.status = 'good';
    } else {
      this.metrics.status = 'excellent';
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public subscribe(callback: (metrics: PerformanceMetrics) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.metrics));
  }

  public getStatusI18nKey(): string {
    const statusMap: Record<PerformanceMetrics['status'], string> = {
      excellent: 'statusExcellent',
      good: 'statusGood',
      fair: 'statusFair',
      poor: 'statusPoor',
    };
    return statusMap[this.metrics.status];
  }
}

export const perfMonitor = PerformanceMonitor.getInstance();
