import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  LinodeInstance,
  CreateLinodeRequest,
  LinodeRegion,
  LinodeType,
  LinodeImage,
  LinodeSshKey,
  LinodeStackScript,
  LinodeBackup,
  LinodeFirewall,
  LinodeUser,
  ApiResponse
} from '../types/linode';

export class LinodeApiService {
  private api: AxiosInstance;
  private baseURL = 'https://api.linode.com/v4';

  constructor(apiToken: string) {
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        console.log(`[Linode API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error: AxiosError) => {
        console.error('[Linode API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        console.error('[Linode API] Response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * 获取所有Linode实例
   */
  async getInstances(): Promise<LinodeInstance[]> {
    try {
      const response = await this.api.get<ApiResponse<LinodeInstance[]>>('/linode/instances');
      return response.data.data || [];
    } catch (error) {
      console.error('获取实例列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取单个Linode实例详情
   */
  async getInstance(id: number): Promise<LinodeInstance> {
    try {
      const response = await this.api.get<LinodeInstance>(`/linode/instances/${id}`);
      return response.data;
    } catch (error) {
      console.error(`获取实例 ${id} 详情失败:`, error);
      throw error;
    }
  }

  /**
   * 创建新的Linode实例
   */
  async createInstance(data: CreateLinodeRequest): Promise<LinodeInstance> {
    try {
      const response = await this.api.post<LinodeInstance>('/linode/instances', data);
      return response.data;
    } catch (error) {
      console.error('创建实例失败:', error);
      throw error;
    }
  }

  /**
   * 删除Linode实例
   */
  async deleteInstance(id: number): Promise<void> {
    try {
      await this.api.delete(`/linode/instances/${id}`);
    } catch (error) {
      console.error(`删除实例 ${id} 失败:`, error);
      throw error;
    }
  }

  /**
   * 重启Linode实例
   */
  async rebootInstance(id: number): Promise<void> {
    try {
      await this.api.post(`/linode/instances/${id}/reboot`);
    } catch (error) {
      console.error(`重启实例 ${id} 失败:`, error);
      throw error;
    }
  }

  /**
   * 启动Linode实例
   */
  async bootInstance(id: number): Promise<void> {
    try {
      await this.api.post(`/linode/instances/${id}/boot`);
    } catch (error) {
      console.error(`启动实例 ${id} 失败:`, error);
      throw error;
    }
  }

  /**
   * 关闭Linode实例
   */
  async shutdownInstance(id: number): Promise<void> {
    try {
      await this.api.post(`/linode/instances/${id}/shutdown`);
    } catch (error) {
      console.error(`关闭实例 ${id} 失败:`, error);
      throw error;
    }
  }

  /**
   * 获取所有可用区域
   */
  async getRegions(): Promise<LinodeRegion[]> {
    const response = await this.api.get<ApiResponse<LinodeRegion[]>>('/regions');
    const regions = response.data.data || [];
    
    // 按地区对区域进行排序
    const regionOrder = {
      'us': 1,    // 北美
      'ca': 2,    // 加拿大
      'gb': 3,    // 欧洲
      'de': 4,    // 德国
      'nl': 5,    // 荷兰
      'se': 6,    // 瑞典
      'es': 7,    // 西班牙
      'it': 8,    // 意大利
      'sg': 9,    // 亚太
      'jp': 10,   // 日本
      'au': 11,   // 澳大利亚
      'in': 12,   // 印度
      'id': 13,   // 印度尼西亚
      'default': 999
    };
    
    return regions.sort((a, b) => {
      const orderA = regionOrder[a.country as keyof typeof regionOrder] || regionOrder.default;
      const orderB = regionOrder[b.country as keyof typeof regionOrder] || regionOrder.default;
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      // 同一地区内按标签排序
      return a.label.localeCompare(b.label);
    });
  }

  /**
   * 获取所有可用实例类型
   */
  async getTypes(): Promise<LinodeType[]> {
    const response = await this.api.get<ApiResponse<LinodeType[]>>('/linode/types');
    return response.data.data || [];
  }

    /**
   * 获取所有可用镜像
   */
  async getImages(): Promise<LinodeImage[]> {
    const response = await this.api.get<ApiResponse<LinodeImage[]>>('/images');
    // 过滤出官方的公共镜像，排除私有镜像和过时的镜像
    const publicImages = (response.data.data || []).filter(image => 
      image.is_public === true && // 必须是公共镜像
      image.id.startsWith('linode/') && // 只显示 linode 官方镜像
      !image.deprecated &&
      (image.status === 'available' || !image.status) &&
      !image.id.includes('private') // 排除私有镜像
    );
    
    // 按标签排序
    return publicImages.sort((a, b) => a.label.localeCompare(b.label));
  }

  /**
   * 获取所有SSH密钥
   */
  async getSshKeys(): Promise<LinodeSshKey[]> {
    const response = await this.api.get<ApiResponse<LinodeSshKey[]>>('/profile/sshkeys');
    return response.data.data || [];
  }

  /**
   * 获取所有StackScripts
   */
  async getStackScripts(): Promise<LinodeStackScript[]> {
    const response = await this.api.get<ApiResponse<LinodeStackScript[]>>('/linode/stackscripts');
    // 过滤出公共的StackScripts
    const publicStackScripts = (response.data.data || []).filter(script =>
      script.is_public &&
      !script.deprecated
    );
    return publicStackScripts;
  }

  /**
   * 获取所有备份
   */
  async getBackups(): Promise<LinodeBackup[]> {
    const response = await this.api.get<ApiResponse<LinodeBackup[]>>('/linode/backups');
    return response.data.data || [];
  }

  /**
   * 获取所有防火墙
   */
  async getFirewalls(): Promise<LinodeFirewall[]> {
    const response = await this.api.get<ApiResponse<LinodeFirewall[]>>('/networking/firewalls');
    return response.data.data || [];
  }

  /**
   * 获取所有用户
   */
  async getUsers(): Promise<LinodeUser[]> {
    const response = await this.api.get<ApiResponse<LinodeUser[]>>('/account/users');
    return response.data.data || [];
  }

  /**
   * 获取Linode实例性能指标
   */
  async getLinodeMetrics(id: number): Promise<any> {
    try {
      const response = await this.api.get(`/linode/instances/${id}/stats`);
      const stats = response.data;

      // 模拟性能指标数据
      return {
        cpu: {
          percentage: Math.random() * 100,
          history: Array.from({ length: 24 }, (_, i) => ({
            timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
            value: Math.random() * 100
          }))
        },
        disk: {
          io: Math.random() * 20,
          swap: Math.random() * 0.1,
          history: Array.from({ length: 24 }, (_, i) => ({
            timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
            value: Math.random() * 20
          }))
        },
        network: {
          ipv4: {
            in: Math.random() * 10,
            out: Math.random() * 10,
            history: Array.from({ length: 24 }, (_, i) => ({
              timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
              value: Math.random() * 10
            }))
          },
          ipv6: {
            in: Math.random() * 2,
            out: Math.random() * 2,
            history: Array.from({ length: 24 }, (_, i) => ({
              timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
              value: Math.random() * 2
            }))
          },
          transfer: {
            used: Math.random() * 1000 * 1024 * 1024 * 1024, // 转换为字节 (GB -> 字节)
            limit: 2000 * 1024 * 1024 * 1024, // 转换为字节 (2TB)
            remaining: (2000 - Math.random() * 1000) * 1024 * 1024 * 1024, // 转换为字节
            history: Array.from({ length: 30 }, (_, i) => ({
              timestamp: new Date(Date.now() - (29 - i) * 86400000).toISOString(),
              value: Math.random() * 5
            }))
          },
          history: Array.from({ length: 30 }, (_, i) => ({
            timestamp: new Date(Date.now() - (29 - i) * 86400000).toISOString(),
            value: Math.random() * 5
          }))
        },
        memory: {
          used: Math.random() * 2048 * 1024 * 1024, // 转换为字节
          total: 2048 * 1024 * 1024, // 转换为字节 (2GB)
          percentage: Math.random() * 100,
          history: Array.from({ length: 24 }, (_, i) => ({
            timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
            value: Math.random() * 100
          }))
        }
      };
    } catch (error) {
      console.error(`获取实例 ${id} 性能指标失败:`, error);
      throw error;
    }
  }

  /**
   * 获取Linode实例网络信息
   */
  async getLinodeNetwork(id: number): Promise<any> {
    try {
      // 模拟网络数据
      return {
        transfer: {
          used: Math.random() * 1000 * 1024 * 1024 * 1024, // 转换为字节 (GB -> 字节)
          limit: 2000 * 1024 * 1024 * 1024, // 转换为字节 (2TB)
          remaining: (2000 - Math.random() * 1000) * 1024 * 1024 * 1024 // 转换为字节
        },
        dnsResolvers: [
          { ipv4: '139.162.11.5', ipv6: '2400:8901::5' },
          { ipv4: '139.162.13.5', ipv6: '2400:8901::4' },
          { ipv4: '139.162.14.5', ipv6: '2400:8901::b' },
          { ipv4: '139.162.15.5', ipv6: '2400:8901::3' },
          { ipv4: '139.162.16.5', ipv6: '2400:8901::9' },
          { ipv4: '139.162.21.5', ipv6: '2400:8901::2' },
          { ipv4: '139.162.27.5', ipv6: '2400:8901::8' },
          { ipv4: '103.3.60.18', ipv6: '2400:8901::7' },
          { ipv4: '103.3.60.19', ipv6: '2400:8901::c' },
          { ipv4: '103.3.60.20', ipv6: '2400:8901::6' }
        ],
        history: Array.from({ length: 30 }, (_, i) => ({
          timestamp: new Date(Date.now() - (29 - i) * 86400000).toISOString(),
          value: Math.random() * 5
        }))
      };
    } catch (error) {
      console.error(`获取实例 ${id} 网络信息失败:`, error);
      throw error;
    }
  }
} 