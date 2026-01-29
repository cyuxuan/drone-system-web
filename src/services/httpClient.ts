import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { notify } from '../utils/notify';
import { perfMonitor } from '../utils/performance';

// 定义扩展的请求配置，包含性能统计字段
interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _startTime?: number;
}

// 定义通用的响应结构
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

// 定义分页数据结构
export interface PageData<T> {
  pageNum: number;
  pageSize: number;
  total: number;
  pages: number;
  list: T[];
}

// 埋点数据结构定义
export interface TrackingData {
  url: string;
  method: string;
  duration: number;
  status: number;
  success: boolean;
  requestId?: string;
}

class HttpClient {
  private instance: AxiosInstance;
  private baseURL: string = '/api';

  constructor() {
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 前置处理：请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const customConfig = config as CustomInternalAxiosRequestConfig;
        // 1. 添加公共请求头
        customConfig.headers['X-Platform'] = 'Drone-Booking-Admin';
        customConfig.headers['X-Request-ID'] = Math.random().toString(36).substring(2, 15);

        // 处理 CSRF Token
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
        };
        const xsrfToken = getCookie('XSRF-TOKEN');
        if (xsrfToken) {
          customConfig.headers['X-XSRF-TOKEN'] = xsrfToken;
        }

        const token = localStorage.getItem('token');
        if (token) {
          customConfig.headers['satoken'] = token;
          customConfig.headers['Authorization'] = token;
        }

        // 2. 注入请求开始时间，用于性能埋点
        customConfig._startTime = Date.now();

        // 3. 可以在这里触发埋点：请求发起
        this.trackRequest(customConfig, 'start');

        return customConfig;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // 后置处理：响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const customConfig = response.config as CustomInternalAxiosRequestConfig;
        const startTime = customConfig._startTime || Date.now();
        const duration = Date.now() - startTime;

        // 1. 触发埋点：请求成功
        this.trackResponse(response, duration, true);

        // 2. 统一处理业务逻辑（例如 code 非 0 时的错误提示）
        const { data } = response;
        if (data && data.code !== undefined && data.code !== 0 && data.code !== 200) {
          // 业务错误提示
          notify.error(data.message || '业务请求失败');
          return Promise.reject(data);
        }

        return data;
      },
      (error) => {
        const customConfig = error.config as CustomInternalAxiosRequestConfig;
        const startTime = customConfig?._startTime;
        const duration = startTime ? Date.now() - startTime : 0;

        // 1. 触发埋点：请求失败
        this.trackResponse(error.response, duration, false);

        // 2. 统一处理 HTTP 错误（401, 500 等）
        if (error.response) {
          const { status, data } = error.response;
          const errorMessage = data?.message || error.message || '请求发生错误';

          switch (status) {
            case 401:
              notify.error('会话已过期，请重新登录');
              localStorage.removeItem('token');
              break;
            case 403:
              notify.error('您没有权限访问该资源');
              break;
            case 404:
              notify.error('请求的资源不存在');
              break;
            case 500:
              notify.error('服务器内部错误，请稍后再试');
              break;
            default:
              notify.error(errorMessage);
              break;
          }
        } else if (error.request) {
          // 请求发送成功但未收到响应
          notify.error('网络连接超时，请检查您的网络设置');
        } else {
          // 发送请求时发生错误
          notify.error('发送请求失败，请检查配置');
        }

        return Promise.reject(error);
      },
    );
  }

  // 模拟埋点处理逻辑
  private trackRequest(_config: InternalAxiosRequestConfig, _type: 'start') {
    // 实际项目中可以调用埋点 SDK
  }

  private trackResponse(response: AxiosResponse | undefined, duration: number, success: boolean) {
    const tracking: TrackingData = {
      url: response?.config?.url || 'unknown',
      method: response?.config?.method || 'unknown',
      duration,
      status: response?.status || 0,
      success,
      requestId: response?.config?.headers?.['X-Request-ID'] as string,
    };

    // 记录 API 耗时到性能监控器
    perfMonitor.recordApiLatency(duration);

    // 实际项目中可以使用 tracking 变量进行上报
    // console.log('[Tracking]', tracking);
    void tracking;
  }

  public get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config);
  }

  public post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config);
  }

  public put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put(url, data, config);
  }

  public delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config);
  }
}

export const httpClient = new HttpClient();
