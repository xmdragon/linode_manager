import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, Play, Square, RotateCcw, Trash2, Copy } from 'lucide-react';
import { ApiService } from '../services/api';
import { LinodeInstance } from '../types/linode';
import MetricsTab from '../components/MetricsTab';
import NetworkTab from '../components/NetworkTab';
import { useState } from 'react';

const ServerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const serverId = parseInt(id!);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'network'>('overview');

  const { data: server, isLoading, error } = useQuery<LinodeInstance>(
    ['server', serverId],
    () => ApiService.getServer(serverId),
    {
      enabled: !!serverId,
    }
  );

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

  if (error || !server) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
        <p className="text-gray-500 mb-4">无法加载服务器详情</p>
        <button
          onClick={() => navigate('/servers')}
          className="btn btn-primary"
        >
          返回列表
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{server.label}</h1>
            <p className="text-sm text-gray-500">服务器详情</p>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex space-x-2">
          {server.status === 'offline' && (
            <button className="btn btn-primary inline-flex items-center">
              <Play className="w-4 h-4 mr-2" />
              启动
            </button>
          )}
          
          {server.status === 'running' && (
            <button className="btn btn-secondary inline-flex items-center">
              <Square className="w-4 h-4 mr-2" />
              关闭
            </button>
          )}
          
          <button className="btn btn-secondary inline-flex items-center">
            <RotateCcw className="w-4 h-4 mr-2" />
            重启
          </button>
          
          <button className="btn btn-danger inline-flex items-center">
            <Trash2 className="w-4 h-4 mr-2" />
            删除
          </button>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            概览
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'metrics'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            性能指标
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'network'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            网络
          </button>
        </nav>
      </div>

      {/* 标签页内容 */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 基本信息 */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">基本信息</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">服务器ID</span>
              <span className="text-sm text-gray-900">{server.id}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">状态</span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(server.status)}`}>
                {server.status}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">区域</span>
              <span className="text-sm text-gray-900">{server.region}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">类型</span>
              <span className="text-sm text-gray-900">{server.type}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">创建时间</span>
              <span className="text-sm text-gray-900">
                {new Date(server.created).toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">更新时间</span>
              <span className="text-sm text-gray-900">
                {new Date(server.updated).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 网络信息 */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">网络信息</h2>
          <div className="space-y-4">
            {server.ipv4.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-500 block mb-2">IPv4 地址</span>
                <div className="space-y-2">
                  {server.ipv4.map((ip, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="font-mono text-sm">{ip}</span>
                      <button
                        onClick={() => copyToClipboard(ip)}
                        className="text-gray-400 hover:text-gray-600"
                        title="复制IP地址"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {server.ipv6 && (
              <div>
                <span className="text-sm font-medium text-gray-500 block mb-2">IPv6 地址</span>
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="font-mono text-sm">{server.ipv6}</span>
                  <button
                    onClick={() => copyToClipboard(server.ipv6!)}
                    className="text-gray-400 hover:text-gray-600"
                    title="复制IP地址"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 规格信息 */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">规格信息</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">CPU 核心</span>
              <span className="text-sm text-gray-900">{server.specs.vcpus}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">内存</span>
              <span className="text-sm text-gray-900">{server.specs.memory} MB</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">存储</span>
              <span className="text-sm text-gray-900">{server.specs.disk} GB</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">带宽</span>
              <span className="text-sm text-gray-900">{server.specs.transfer} GB</span>
            </div>
          </div>
        </div>

        {/* 标签信息 */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">标签</h2>
          {server.tags && server.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {server.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">暂无标签</p>
          )}
        </div>
      </div>
      )}

      {activeTab === 'metrics' && (
        <MetricsTab serverId={serverId} />
      )}

      {activeTab === 'network' && (
        <NetworkTab serverId={serverId} />
      )}
    </div>
  );
};

export default ServerDetail; 