import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, Server } from 'lucide-react';
import { ApiService } from '../services/api';
import { CreateLinodeRequest, LinodeRegion, LinodeType, LinodeImage, LinodeSshKey, LinodeStackScript, LinodeBackup, LinodeFirewall, LinodeUser } from '../types/linode';

const CreateServer = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateLinodeRequest>({
    label: '',
    region: '',
    type: '',
    image: ''
  });

  // 获取区域列表
  const { data: regions, isLoading: regionsLoading, error: regionsError } = useQuery<LinodeRegion[]>(
    'regions',
    ApiService.getRegions,
    {
      staleTime: 5 * 60 * 1000, // 5分钟缓存
      retry: 3,
      retryDelay: 1000,
    }
  );

  // 获取实例类型列表
  const { data: types, isLoading: typesLoading, error: typesError } = useQuery<LinodeType[]>(
    'types',
    ApiService.getTypes,
    {
      staleTime: 5 * 60 * 1000, // 5分钟缓存
      retry: 3,
      retryDelay: 1000,
    }
  );

  // 获取镜像列表
  const { data: images, isLoading: imagesLoading, error: imagesError } = useQuery<LinodeImage[]>(
    'images',
    ApiService.getImages,
    {
      staleTime: 5 * 60 * 1000, // 5分钟缓存
      retry: 3,
      retryDelay: 1000,
    }
  );

  // 获取SSH密钥列表
  const { data: sshKeys, isLoading: sshKeysLoading } = useQuery<LinodeSshKey[]>(
    'sshkeys',
    ApiService.getSshKeys,
    {
      staleTime: 5 * 60 * 1000, // 5分钟缓存
    }
  );

  // 获取StackScripts列表
  const { data: stackScripts, isLoading: stackScriptsLoading } = useQuery<LinodeStackScript[]>(
    'stackscripts',
    ApiService.getStackScripts,
    { staleTime: 5 * 60 * 1000 }
  );

  // 获取备份列表
  const { data: backups, isLoading: backupsLoading } = useQuery<LinodeBackup[]>(
    'backups',
    ApiService.getBackups,
    { staleTime: 5 * 60 * 1000 }
  );

  // 获取防火墙列表
  const { data: firewalls, isLoading: firewallsLoading } = useQuery<LinodeFirewall[]>(
    'firewalls',
    ApiService.getFirewalls,
    { staleTime: 5 * 60 * 1000 }
  );

  // 获取用户列表
  const { data: users, isLoading: usersLoading } = useQuery<LinodeUser[]>(
    'users',
    ApiService.getUsers,
    { staleTime: 5 * 60 * 1000 }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await ApiService.createServer(formData);
      navigate('/servers');
    } catch (error) {
      console.error('创建服务器失败:', error);
      alert('创建服务器失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateLinodeRequest, value: string | string[] | number | boolean | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回
        </button>
        <h1 className="text-2xl font-bold text-gray-900">创建新服务器</h1>
        <p className="mt-1 text-sm text-gray-500">
          配置并创建您的Linode服务器实例
        </p>
      </div>

      {/* 创建表单 */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 服务器名称 */}
          <div>
            <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-2">
              服务器名称 *
            </label>
            <input
              type="text"
              id="label"
              value={formData.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
              className="input"
              placeholder="my-server"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              为您的服务器选择一个描述性名称
            </p>
          </div>

          {/* 区域选择 */}
          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
              数据中心区域 *
            </label>
            <select
              id="region"
              value={formData.region}
              onChange={(e) => handleInputChange('region', e.target.value)}
              className="input"
              required
              disabled={regionsLoading}
            >
              <option value="">{regionsLoading ? '加载中...' : '请选择区域'}</option>
              {regions?.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.label} ({region.id})
                </option>
              ))}
            </select>
            {regionsError && (
              <p className="mt-1 text-sm text-red-500">
                加载区域列表失败: {regionsError.message}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              选择离您最近的数据中心以获得最佳性能
            </p>
          </div>

          {/* 实例类型 */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              实例类型 *
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="input"
              required
              disabled={typesLoading}
            >
              <option value="">{typesLoading ? '加载中...' : '请选择实例类型'}</option>
              {types?.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label} - {type.vcpus} CPU, {type.memory}MB RAM, ${type.price.monthly}/月
                </option>
              ))}
            </select>
            {typesError && (
              <p className="mt-1 text-sm text-red-500">
                加载实例类型列表失败: {typesError.message}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              选择适合您需求的实例配置
            </p>
          </div>

          {/* 镜像选择 */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              操作系统镜像
            </label>
            <select
              id="image"
              value={formData.image || ''}
              onChange={(e) => handleInputChange('image', e.target.value)}
              className="input"
              disabled={imagesLoading}
            >
              <option value="">{imagesLoading ? '加载中...' : '使用默认镜像'}</option>
              {images?.map((image) => (
                <option key={image.id} value={image.id}>
                  {image.label}
                </option>
              ))}
            </select>
            {imagesError && (
              <p className="mt-1 text-sm text-red-500">
                加载镜像列表失败: {imagesError.message}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              选择要安装的操作系统，包含 Ubuntu、Debian、CentOS、Rocky Linux、AlmaLinux、Alpine、Fedora、Arch Linux、Gentoo、openSUSE、Void Linux、FreeBSD、NetBSD、OpenBSD 等
            </p>
          </div>

          {/* SSH密钥选择 */}
          <div>
            <label htmlFor="authorized_keys" className="block text-sm font-medium text-gray-700 mb-2">
              SSH密钥
            </label>
            <select
              id="authorized_keys"
              value={formData.authorized_keys?.[0] || ''}
              onChange={(e) => handleInputChange('authorized_keys', e.target.value ? [e.target.value] : [])}
              className="input"
              disabled={sshKeysLoading}
            >
              <option value="">{sshKeysLoading ? '加载中...' : '不添加SSH密钥'}</option>
              {sshKeys?.map((key) => (
                <option key={key.id} value={key.ssh_key}>
                  {key.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              选择要添加到服务器的SSH密钥，用于安全登录
            </p>
          </div>

          {/* StackScript选择 */}
          <div>
            <label htmlFor="stackscript_id" className="block text-sm font-medium text-gray-700 mb-2">
              StackScript
            </label>
            <select
              id="stackscript_id"
              value={formData.stackscript_id?.toString() || ''}
              onChange={(e) => handleInputChange('stackscript_id', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input"
              disabled={stackScriptsLoading}
            >
              <option value="">{stackScriptsLoading ? '加载中...' : '不使用StackScript'}</option>
              {stackScripts?.map((script) => (
                <option key={script.id} value={script.id}>
                  {script.label} - {script.description}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              选择自动化配置脚本，如LAMP、LEMP、WordPress等
            </p>
          </div>

          {/* 备份选择 */}
          <div>
            <label htmlFor="backup_id" className="block text-sm font-medium text-gray-700 mb-2">
              备份
            </label>
            <select
              id="backup_id"
              value={formData.backup_id?.toString() || ''}
              onChange={(e) => handleInputChange('backup_id', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input"
              disabled={backupsLoading}
            >
              <option value="">{backupsLoading ? '加载中...' : '不使用备份'}</option>
              {backups?.map((backup) => (
                <option key={backup.id} value={backup.id}>
                  {backup.label} - {backup.description}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              选择要恢复的备份，用于快速部署
            </p>
          </div>

                      {/* 防火墙选择 */}
            <div>
              <label htmlFor="firewall_id" className="block text-sm font-medium text-gray-700 mb-2">
                防火墙
              </label>
              <select
                id="firewall_id"
                value={formData.firewall_id?.toString() || ''}
                onChange={(e) => handleInputChange('firewall_id', e.target.value ? parseInt(e.target.value) : undefined)}
                className="input"
                disabled={firewallsLoading}
              >
                <option value="">{firewallsLoading ? '加载中...' : '不使用防火墙'}</option>
                {firewalls?.map((firewall) => (
                  <option key={firewall.id} value={firewall.id}>
                    {firewall.label} ({firewall.rules.inbound.length} 入站规则, {firewall.rules.outbound.length} 出站规则)
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                选择要应用的防火墙规则，用于控制入站和出站流量
              </p>
            </div>

            {/* 授权用户选择 */}
            <div>
              <label htmlFor="authorized_users" className="block text-sm font-medium text-gray-700 mb-2">
                授权用户
              </label>
              <select
                id="authorized_users"
                multiple
                value={formData.authorized_users || []}
                onChange={(e) => {
                  const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                  handleInputChange('authorized_users', selectedOptions);
                }}
                className="input"
                disabled={usersLoading}
              >
                {usersLoading ? (
                  <option>加载中...</option>
                ) : (
                  users?.map((user) => (
                    <option key={user.id} value={user.username}>
                      {user.username} ({user.email}) {user.restricted ? '[受限]' : ''}
                    </option>
                  ))
                )}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                选择可以访问此服务器的用户（按住 Ctrl 键可多选）
              </p>
            </div>

          {/* 私有IP选项 */}
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">私有IP</span>
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={formData.private_ip === true}
                onChange={(e) => handleInputChange('private_ip', e.target.checked)}
              />
            </label>
            <label className="label">
              <span className="label-text-alt">为服务器分配私有IP地址</span>
            </label>
          </div>

          {/* 根密码设置 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">根密码</span>
            </label>
            <input
              type="password"
              placeholder="设置根用户密码"
              className="input input-bordered"
              value={formData.root_pass || ''}
              onChange={(e) => handleInputChange('root_pass', e.target.value)}
            />
            <label className="label">
              <span className="label-text-alt">留空将自动生成密码</span>
            </label>
          </div>

          {/* 确认密码 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">确认密码</span>
            </label>
            <input
              type="password"
              placeholder="再次输入密码"
              className="input input-bordered"
              value={formData.confirmPassword || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            />
            {formData.root_pass && formData.confirmPassword && formData.root_pass !== formData.confirmPassword && (
              <label className="label">
                <span className="label-text-alt text-error">密码不匹配</span>
              </label>
            )}
          </div>



          {/* 提交按钮 */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              取消
            </button>
            <button
              type="submit"
              className="btn btn-primary inline-flex items-center"
              disabled={Boolean(isLoading || regionsLoading || typesLoading || imagesLoading || sshKeysLoading || stackScriptsLoading || backupsLoading || firewallsLoading || usersLoading || 
                       (formData.root_pass && formData.confirmPassword && formData.root_pass !== formData.confirmPassword))}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  创建中...
                </>
              ) : (
                <>
                  <Server className="w-4 h-4 mr-2" />
                  创建服务器
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateServer; 