import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { 
  LinodeInstance, 
  CreateLinodeRequest, 
  ServerListResponse, 
  ServerDetailResponse, 
  ServerActionResponse,
  LinodeRegion,
  LinodeType,
  LinodeImage,
  LinodeSshKey,
  LinodeStackScript,
  LinodeBackup,
  LinodeFirewall,
  LinodeUser
} from '../types/linode';
import { MetricsData, DnsResolver, MetricPoint } from '../types/metrics';

// 创建axios实例
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api',
  timeout: 10000,
});

// 请求拦截器 - 添加认证头
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理认证错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 清除无效的认证信息
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 重定向到登录页面
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 请求拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    console.error('[API] Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API服务类
export class ApiService {
  /**
   * 获取所有服务器列表
   */
  static async getServers(): Promise<LinodeInstance[]> {
    const response = await api.get<ServerListResponse>('/servers');
    return response.data.data || [];
  }

  /**
   * 获取单个服务器详情
   */
  static async getServer(id: number): Promise<LinodeInstance> {
    const response = await api.get<ServerDetailResponse>(`/servers/${id}`);
    return response.data.data!;
  }

  /**
   * 创建新服务器
   */
  static async createServer(data: CreateLinodeRequest): Promise<LinodeInstance> {
    const response = await api.post<ServerDetailResponse>('/servers', data);
    return response.data.data!;
  }

  /**
   * 删除服务器
   */
  static async deleteServer(id: number): Promise<void> {
    await api.delete<ServerActionResponse>(`/servers/${id}`);
  }

  /**
   * 重启服务器
   */
  static async rebootServer(id: number): Promise<void> {
    await api.post<ServerActionResponse>(`/servers/${id}/reboot`);
  }

  /**
   * 启动服务器
   */
  static async bootServer(id: number): Promise<void> {
    await api.post<ServerActionResponse>(`/servers/${id}/boot`);
  }

  /**
   * 关闭服务器
   */
  static async shutdownServer(id: number): Promise<void> {
    await api.post<ServerActionResponse>(`/servers/${id}/shutdown`);
  }

  /**
   * 获取所有可用区域
   */
  static async getRegions(): Promise<LinodeRegion[]> {
    const response = await api.get<{ success: boolean; data: LinodeRegion[] }>('/servers/regions');
    if (!response.data.success) {
      throw new Error('获取区域列表失败');
    }
    return response.data.data || [];
  }

  /**
   * 获取所有可用实例类型
   */
  static async getTypes(): Promise<LinodeType[]> {
    const response = await api.get<{ success: boolean; data: LinodeType[] }>('/servers/types');
    if (!response.data.success) {
      throw new Error('获取实例类型列表失败');
    }
    return response.data.data || [];
  }

  /**
   * 获取所有可用镜像
   */
  static async getImages(): Promise<LinodeImage[]> {
    const response = await api.get<{ success: boolean; data: LinodeImage[] }>('/servers/images');
    if (!response.data.success) {
      throw new Error('获取镜像列表失败');
    }
    return response.data.data || [];
  }

  /**
   * 获取所有SSH密钥
   */
  static async getSshKeys(): Promise<LinodeSshKey[]> {
    const response = await api.get<{ success: boolean; data: LinodeSshKey[] }>('/servers/sshkeys');
    if (!response.data.success) {
      throw new Error('获取SSH密钥列表失败');
    }
    return response.data.data || [];
  }

  /**
   * 获取所有StackScripts
   */
  static async getStackScripts(): Promise<LinodeStackScript[]> {
    const response = await api.get<{ success: boolean; data: LinodeStackScript[] }>('/servers/stackscripts');
    if (!response.data.success) {
      throw new Error('获取StackScripts列表失败');
    }
    return response.data.data || [];
  }

  /**
   * 获取所有备份
   */
  static async getBackups(): Promise<LinodeBackup[]> {
    const response = await api.get<{ success: boolean; data: LinodeBackup[] }>('/servers/backups');
    if (!response.data.success) {
      throw new Error('获取备份列表失败');
    }
    return response.data.data || [];
  }

  /**
   * 获取所有防火墙
   */
  static async getFirewalls(): Promise<LinodeFirewall[]> {
    const response = await api.get<{ success: boolean; data: LinodeFirewall[] }>('/servers/firewalls');
    if (!response.data.success) {
      throw new Error('获取防火墙列表失败');
    }
    return response.data.data || [];
  }

  /**
   * 获取所有用户
   */
  static async getUsers(): Promise<LinodeUser[]> {
    const response = await api.get<{ success: boolean; data: LinodeUser[] }>('/servers/users');
    if (!response.data.success) {
      throw new Error('获取用户列表失败');
    }
    return response.data.data || [];
  }

  /**
   * 获取服务器Metrics数据
   */
  static async getServerMetrics(id: number): Promise<MetricsData> {
    const response = await api.get<{ success: boolean; data: MetricsData }>(`/servers/${id}/metrics`);
    return response.data.data;
  }

  /**
   * 获取服务器网络信息
   */
  static async getServerNetwork(id: number): Promise<{
    transfer: { used: number; limit: number; remaining: number };
    dnsResolvers: DnsResolver[];
    history: MetricPoint[];
  }> {
    const response = await api.get<{ 
      success: boolean; 
      data: {
        transfer: { used: number; limit: number; remaining: number };
        dnsResolvers: DnsResolver[];
        history: MetricPoint[];
      }
    }>(`/servers/${id}/network`);
    return response.data.data;
  }
}

export default api; 