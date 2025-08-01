import { useQuery } from 'react-query';
import { Copy } from 'lucide-react';
import { ApiService } from '../services/api';

interface NetworkTabProps {
  serverId: number;
}

const NetworkTab = ({ serverId }: NetworkTabProps) => {
  const { data: networkData, isLoading, error } = useQuery(
    ['network', serverId],
    () => ApiService.getServerNetwork(serverId),
    {
      enabled: !!serverId,
      refetchInterval: 60000, // 60秒刷新一次
    }
  );

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // 这里可以添加一个toast通知
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !networkData) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
        <p className="text-gray-500">无法加载网络数据</p>
      </div>
    );
  }

  const { transfer, dnsResolvers, history } = networkData;
  const usedPercentage = (transfer.used / transfer.limit) * 100;

  return (
    <div className="space-y-6">
      {/* 月度网络传输 */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">月度网络传输</h3>
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(usedPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>已用: {formatBytes(transfer.used)}</span>
            <span>总计: {formatBytes(transfer.limit)}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-700">
              已使用 ({formatBytes(transfer.used)} - {usedPercentage.toFixed(1)}%)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span className="text-sm text-gray-700">
              剩余 ({formatBytes(transfer.remaining)})
            </span>
          </div>
        </div>
      </div>

      {/* 网络传输历史 */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">网络传输历史 (Mb/s)</h3>
        <div className="text-sm text-gray-500 mb-4">
          &lt; 最近30天 &gt;
        </div>
        
        {history && history.length > 0 ? (
          <div className="h-64 bg-gray-50 rounded-lg p-4">
            <div className="flex items-end justify-between h-full space-x-1">
              {history.slice(-30).map((point, index) => {
                const height = (point.value / Math.max(...history.map(h => h.value))) * 100;
                return (
                  <div key={index} className="flex-1 bg-green-500 rounded-t" 
                       style={{ height: `${Math.max(height, 2)}%` }}>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0 Mb/s</span>
              <span>{Math.max(...history.map(h => h.value)).toFixed(1)} Mb/s</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            暂无历史数据
          </div>
        )}
      </div>

      {/* DNS 解析器 */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">DNS 解析器</h3>
        <div className="space-y-2">
          {dnsResolvers.map((resolver, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{resolver.ipv4}</div>
                    <div className="text-xs text-gray-500">IPv4</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{resolver.ipv6}</div>
                    <div className="text-xs text-gray-500">IPv6</div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => copyToClipboard(resolver.ipv4)}
                  className="text-gray-400 hover:text-gray-600"
                  title="复制IPv4地址"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => copyToClipboard(resolver.ipv6)}
                  className="text-gray-400 hover:text-gray-600"
                  title="复制IPv6地址"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 网络统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h4 className="text-md font-medium text-gray-900 mb-3">传输统计</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">已使用</span>
              <span className="text-sm font-medium">{formatBytes(transfer.used)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">限制</span>
              <span className="text-sm font-medium">{formatBytes(transfer.limit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">剩余</span>
              <span className="text-sm font-medium">{formatBytes(transfer.remaining)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h4 className="text-md font-medium text-gray-900 mb-3">使用率</h4>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {usedPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">月度使用率</div>
          </div>
        </div>

        <div className="card">
          <h4 className="text-md font-medium text-gray-900 mb-3">DNS 服务器</h4>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {dnsResolvers.length}
            </div>
            <div className="text-sm text-gray-500">可用解析器</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkTab; 