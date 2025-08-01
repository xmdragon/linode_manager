import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { Server, Plus, Play, Square, RotateCcw, Trash2 } from 'lucide-react';
import { ApiService } from '../services/api';
import { LinodeInstance } from '../types/linode';

const ServerList = () => {
  const queryClient = useQueryClient();
  
  const { data: servers, isLoading, error, refetch } = useQuery<LinodeInstance[]>(
    'servers',
    ApiService.getServers,
    {
      refetchInterval: 30000, // 每30秒刷新一次
    }
  );

  // 删除服务器
  const deleteMutation = useMutation(
    (serverId: number) => ApiService.deleteServer(serverId),
    {
      onSuccess: () => {
        // 删除成功后刷新服务器列表
        queryClient.invalidateQueries('servers');
      },
      onError: (error) => {
        console.error('删除服务器失败:', error);
        alert('删除服务器失败，请重试');
      },
    }
  );

  // 启动服务器
  const bootMutation = useMutation(
    (serverId: number) => ApiService.bootServer(serverId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('servers');
      },
      onError: (error) => {
        console.error('启动服务器失败:', error);
        alert('启动服务器失败，请重试');
      },
    }
  );

  // 关闭服务器
  const shutdownMutation = useMutation(
    (serverId: number) => ApiService.shutdownServer(serverId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('servers');
      },
      onError: (error) => {
        console.error('关闭服务器失败:', error);
        alert('关闭服务器失败，请重试');
      },
    }
  );

  // 重启服务器
  const rebootMutation = useMutation(
    (serverId: number) => ApiService.rebootServer(serverId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('servers');
      },
      onError: (error) => {
        console.error('重启服务器失败:', error);
        alert('重启服务器失败，请重试');
      },
    }
  );

  const handleDeleteServer = (serverId: number, serverLabel: string) => {
    if (window.confirm(`确定要删除服务器 "${serverLabel}" 吗？此操作不可撤销。`)) {
      deleteMutation.mutate(serverId);
    }
  };

  const handleBootServer = (serverId: number, serverLabel: string) => {
    if (window.confirm(`确定要启动服务器 "${serverLabel}" 吗？`)) {
      bootMutation.mutate(serverId);
    }
  };

  const handleShutdownServer = (serverId: number, serverLabel: string) => {
    if (window.confirm(`确定要关闭服务器 "${serverLabel}" 吗？`)) {
      shutdownMutation.mutate(serverId);
    }
  };

  const handleRebootServer = (serverId: number, serverLabel: string) => {
    if (window.confirm(`确定要重启服务器 "${serverLabel}" 吗？`)) {
      rebootMutation.mutate(serverId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      case 'booting':
      case 'rebooting':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
        <p className="text-gray-500 mb-4">无法加载服务器数据</p>
        <button
          onClick={() => refetch()}
          className="btn btn-primary"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">服务器列表</h1>
          <p className="mt-1 text-sm text-gray-500">
            管理您的所有Linode服务器实例
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

      {/* 服务器列表 */}
      {servers && servers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servers.map((server) => (
            <div key={server.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    <Link
                      to={`/servers/${server.id}`}
                      className="hover:text-primary-600"
                    >
                      {server.label}
                    </Link>
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Server className="w-4 h-4 mr-2" />
                      <span>ID: {server.id}</span>
                    </div>
                    
                    <div>
                      <span className="font-medium">状态: </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(server.status)}`}>
                        {server.status}
                      </span>
                    </div>
                    
                    <div>
                      <span className="font-medium">区域: </span>
                      <span>{server.region}</span>
                    </div>
                    
                    <div>
                      <span className="font-medium">类型: </span>
                      <span>{server.type}</span>
                    </div>
                    
                    {server.ipv4.length > 0 && (
                      <div>
                        <span className="font-medium">IP: </span>
                        <span className="font-mono">{server.ipv4[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* 操作按钮 */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  {server.status === 'offline' && (
                    <button
                      onClick={() => handleBootServer(server.id, server.label)}
                      disabled={bootMutation.isLoading}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                      title="启动服务器"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  
                  {server.status === 'running' && (
                    <button
                      onClick={() => handleShutdownServer(server.id, server.label)}
                      disabled={shutdownMutation.isLoading}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-50"
                      title="关闭服务器"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleRebootServer(server.id, server.label)}
                    disabled={rebootMutation.isLoading}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                    title="重启服务器"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteServer(server.id, server.label)}
                    disabled={deleteMutation.isLoading}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto disabled:opacity-50"
                    title="删除服务器"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
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
  );
};

export default ServerList; 