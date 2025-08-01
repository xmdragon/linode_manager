import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Server, Plus, Activity, AlertCircle } from 'lucide-react';
import { ApiService } from '../services/api';
import { LinodeInstance } from '../types/linode';

const Dashboard = () => {
  const { data: servers, isLoading, error } = useQuery<LinodeInstance[]>(
    'servers',
    ApiService.getServers,
    {
      refetchInterval: 30000, // 每30秒刷新一次
    }
  );

  const runningServers = servers?.filter(s => s.status === 'running') || [];
  const offlineServers = servers?.filter(s => s.status === 'offline') || [];
  const otherServers = servers?.filter(s => !['running', 'offline'].includes(s.status)) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">加载失败</h3>
        <p className="mt-1 text-sm text-gray-500">无法加载服务器数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">仪表板</h1>
          <p className="mt-1 text-sm text-gray-500">
            管理您的Linode服务器实例
          </p>
        </div>
        <Link
          to="/servers/create"
          className="btn btn-primary inline-flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          创建服务器
        </Link>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Server className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">总服务器</p>
              <p className="text-2xl font-semibold text-gray-900">
                {servers?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">运行中</p>
              <p className="text-2xl font-semibold text-gray-900">
                {runningServers.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">离线</p>
              <p className="text-2xl font-semibold text-gray-900">
                {offlineServers.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">其他状态</p>
              <p className="text-2xl font-semibold text-gray-900">
                {otherServers.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 最近服务器 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">最近服务器</h2>
          <Link
            to="/servers"
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            查看全部
          </Link>
        </div>
        
        {servers && servers.length > 0 ? (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    区域
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP地址
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {servers.slice(0, 5).map((server) => (
                  <tr key={server.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/servers/${server.id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-500"
                      >
                        {server.label}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          server.status === 'running'
                            ? 'bg-green-100 text-green-800'
                            : server.status === 'offline'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {server.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {server.region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {server.ipv4[0] || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Server className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无服务器</h3>
            <p className="mt-1 text-sm text-gray-500">
              开始创建您的第一个Linode服务器
            </p>
            <div className="mt-6">
              <Link
                to="/servers/create"
                className="btn btn-primary inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                创建服务器
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 