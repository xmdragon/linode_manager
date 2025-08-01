import { Router, Request, Response } from 'express';
import { LinodeApiService } from '../services/linodeApi';
import { CreateLinodeRequest } from '../types/linode';

const router = Router();

// 获取Linode API服务实例
const getLinodeService = (req: Request): LinodeApiService => {
  const apiToken = process.env.LINODE_API_TOKEN;
  if (!apiToken) {
    throw new Error('LINODE_API_TOKEN 未配置');
  }
  return new LinodeApiService(apiToken);
};

// 获取所有服务器列表
router.get('/', async (req: Request, res: Response) => {
  try {
    const linodeService = getLinodeService(req);
    const instances = await linodeService.getInstances();
    
    res.json({
      success: true,
      data: instances,
      message: '获取服务器列表成功'
    });
  } catch (error: any) {
    console.error('获取服务器列表失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取服务器列表失败',
      message: '服务器内部错误'
    });
  }
});

// 获取所有可用区域
router.get('/regions', async (req: Request, res: Response) => {
  try {
    const linodeService = getLinodeService(req);
    const regions = await linodeService.getRegions();
    
    res.json({
      success: true,
      data: regions,
      message: '获取区域列表成功'
    });
  } catch (error: any) {
    console.error('获取区域列表失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取区域列表失败',
      message: '服务器内部错误'
    });
  }
});

// 获取所有可用实例类型
router.get('/types', async (req: Request, res: Response) => {
  try {
    const linodeService = getLinodeService(req);
    const types = await linodeService.getTypes();
    
    res.json({
      success: true,
      data: types,
      message: '获取实例类型列表成功'
    });
  } catch (error: any) {
    console.error('获取实例类型列表失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取实例类型列表失败',
      message: '服务器内部错误'
    });
  }
});

// 获取所有可用镜像
router.get('/images', async (req: Request, res: Response) => {
  try {
    const linodeService = getLinodeService(req);
    const images = await linodeService.getImages();
    
    res.json({
      success: true,
      data: images,
      message: '获取镜像列表成功'
    });
  } catch (error: any) {
    console.error('获取镜像列表失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取镜像列表失败',
      message: '服务器内部错误'
    });
  }
});

// 获取所有SSH密钥
router.get('/sshkeys', async (req: Request, res: Response) => {
  try {
    const linodeService = getLinodeService(req);
    const sshKeys = await linodeService.getSshKeys();
    
    res.json({
      success: true,
      data: sshKeys,
      message: '获取SSH密钥列表成功'
    });
  } catch (error: any) {
    console.error('获取SSH密钥列表失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取SSH密钥列表失败',
      message: '服务器内部错误'
    });
  }
});

// 获取所有StackScripts
router.get('/stackscripts', async (req: Request, res: Response) => {
  try {
    const linodeService = getLinodeService(req);
    const stackScripts = await linodeService.getStackScripts();
    
    res.json({
      success: true,
      data: stackScripts,
      message: '获取StackScripts列表成功'
    });
  } catch (error: any) {
    console.error('获取StackScripts列表失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取StackScripts列表失败',
      message: '服务器内部错误'
    });
  }
});

// 获取备份列表
router.get('/backups', async (req: Request, res: Response) => {
  try {
    const linodeService = getLinodeService(req);
    const backups = await linodeService.getBackups();
    res.json({ success: true, data: backups, message: '获取备份列表成功' });
  } catch (error: any) {
    console.error('获取备份列表失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '获取备份列表失败',
      message: '服务器内部错误'
    });
  }
});

// 获取防火墙列表
router.get('/firewalls', async (req: Request, res: Response) => {
  try {
    const linodeService = getLinodeService(req);
    const firewalls = await linodeService.getFirewalls();
    res.json({ success: true, data: firewalls, message: '获取防火墙列表成功' });
  } catch (error: any) {
    console.error('获取防火墙列表失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '获取防火墙列表失败',
      message: '服务器内部错误'
    });
  }
});

// 获取用户列表
router.get('/users', async (req: Request, res: Response) => {
  try {
    const linodeService = getLinodeService(req);
    const users = await linodeService.getUsers();
    res.json({ success: true, data: users, message: '获取用户列表成功' });
  } catch (error: any) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '获取用户列表失败',
      message: '服务器内部错误'
    });
  }
});

// 获取单个服务器详情
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const linodeService = getLinodeService(req);
    const instance = await linodeService.getInstance(parseInt(id));
    
    res.json({
      success: true,
      data: instance,
      message: '获取服务器详情成功'
    });
  } catch (error: any) {
    console.error('获取服务器详情失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取服务器详情失败',
      message: '服务器内部错误'
    });
  }
});

// 创建新服务器
router.post('/', async (req: Request, res: Response) => {
  try {
    const createData: CreateLinodeRequest = req.body;
    const linodeService = getLinodeService(req);
    const instance = await linodeService.createInstance(createData);
    
    res.status(201).json({
      success: true,
      data: instance,
      message: '创建服务器成功'
    });
  } catch (error: any) {
    console.error('创建服务器失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '创建服务器失败',
      message: '服务器内部错误'
    });
  }
});

// 删除服务器
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const linodeService = getLinodeService(req);
    await linodeService.deleteInstance(parseInt(id));
    
    res.json({
      success: true,
      message: '删除服务器成功'
    });
  } catch (error: any) {
    console.error('删除服务器失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '删除服务器失败',
      message: '服务器内部错误'
    });
  }
});

// 重启服务器
router.post('/:id/reboot', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const linodeService = getLinodeService(req);
    await linodeService.rebootInstance(parseInt(id));
    
    res.json({
      success: true,
      message: '重启服务器成功'
    });
  } catch (error: any) {
    console.error('重启服务器失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '重启服务器失败',
      message: '服务器内部错误'
    });
  }
});

// 启动服务器
router.post('/:id/boot', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const linodeService = getLinodeService(req);
    await linodeService.bootInstance(parseInt(id));
    
    res.json({
      success: true,
      message: '启动服务器成功'
    });
  } catch (error: any) {
    console.error('启动服务器失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '启动服务器失败',
      message: '服务器内部错误'
    });
  }
});

// 关闭服务器
router.post('/:id/shutdown', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const linodeService = getLinodeService(req);
    await linodeService.shutdownInstance(parseInt(id));
    
    res.json({
      success: true,
      message: '关闭服务器成功'
    });
  } catch (error: any) {
    console.error('关闭服务器失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '关闭服务器失败',
      message: '服务器内部错误'
    });
  }
});

// 获取服务器性能指标
router.get('/:id/metrics', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const linodeService = getLinodeService(req);
    const metrics = await linodeService.getLinodeMetrics(parseInt(id));
    
    res.json({
      success: true,
      data: metrics,
      message: '获取性能指标成功'
    });
  } catch (error: any) {
    console.error('获取性能指标失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取性能指标失败',
      message: '服务器内部错误'
    });
  }
});

// 获取服务器网络信息
router.get('/:id/network', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const linodeService = getLinodeService(req);
    const networkData = await linodeService.getLinodeNetwork(parseInt(id));
    
    res.json({
      success: true,
      data: networkData,
      message: '获取网络信息成功'
    });
  } catch (error: any) {
    console.error('获取网络信息失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取网络信息失败',
      message: '服务器内部错误'
    });
  }
});

export default router; 