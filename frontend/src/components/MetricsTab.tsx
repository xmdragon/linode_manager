import { useQuery } from 'react-query';
import { ApiService } from '../services/api';
import { MetricsData } from '../types/metrics';

interface MetricsTabProps {
  serverId: number;
}

const MetricsTab = ({ serverId }: MetricsTabProps) => {
  const { data: metrics, isLoading, error } = useQuery<MetricsData>(
    ['metrics', serverId],
    () => ApiService.getServerMetrics(serverId),
    {
      enabled: !!serverId,
      refetchInterval: 30000, // 30秒刷新一次
    }
  );

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
        <p className="text-gray-500">无法加载性能指标数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* CPU 使用率 */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">CPU (%)</h3>
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(metrics.cpu.percentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>当前: {formatPercentage(metrics.cpu.percentage)}</span>
            <span>100%</span>
          </div>
        </div>
        
        {/* CPU 统计信息 */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatPercentage(metrics.cpu.percentage)}
            </div>
            <div className="text-gray-500">当前使用率</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatPercentage(metrics.cpu.history.length > 0 ? 
                Math.max(...metrics.cpu.history.map(h => h.value)) : 0)}
            </div>
            <div className="text-gray-500">峰值</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatPercentage(metrics.cpu.history.length > 0 ? 
                metrics.cpu.history.reduce((sum, h) => sum + h.value, 0) / metrics.cpu.history.length : 0)}
            </div>
            <div className="text-gray-500">平均值</div>
          </div>
        </div>
      </div>

      {/* 内存使用率 */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">内存使用率</h3>
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(metrics.memory.percentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>已用: {formatBytes(metrics.memory.used)}</span>
            <span>总计: {formatBytes(metrics.memory.total)}</span>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatPercentage(metrics.memory.percentage)}
          </div>
          <div className="text-gray-500">内存使用率</div>
        </div>
      </div>

      {/* 磁盘 I/O */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">磁盘 I/O (blocks/s)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {metrics.disk.io.toFixed(2)}
            </div>
            <div className="text-gray-500">I/O 速率</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {metrics.disk.swap.toFixed(2)}
            </div>
            <div className="text-gray-500">Swap 速率</div>
          </div>
        </div>
      </div>

      {/* 网络流量 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IPv4 网络 */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">网络 — IPv4 (Mb/s)</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">入站流量</span>
              <span className="text-sm font-medium">{metrics.network.ipv4.in.toFixed(2)} Mb/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">出站流量</span>
              <span className="text-sm font-medium">{metrics.network.ipv4.out.toFixed(2)} Mb/s</span>
            </div>
          </div>
        </div>

        {/* IPv6 网络 */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">网络 — IPv6 (Mb/s)</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">入站流量</span>
              <span className="text-sm font-medium">{metrics.network.ipv6.in.toFixed(2)} Mb/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">出站流量</span>
              <span className="text-sm font-medium">{metrics.network.ipv6.out.toFixed(2)} Mb/s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsTab; 