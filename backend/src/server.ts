import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import serversRouter from './routes/servers';
import authRouter from './routes/auth';
import { authenticateToken } from './routes/auth';

// 加载环境变量 - 指定 .env 文件路径
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// 中间件
app.use(helmet({
  contentSecurityPolicy: false, // 在开发环境中禁用CSP
})); // 安全头
app.use(cors()); // CORS支持
app.use(morgan('combined')); // 日志
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true }));

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 认证路由（不需要保护）
app.use('/api/auth', authRouter);

// API路由（需要认证）
app.use('/api/servers', authenticateToken, serversRouter);

// 生产环境：提供前端静态文件
if (isProduction) {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  
  // 提供静态文件
  app.use(express.static(frontendPath));
  
  // 所有非API请求都返回前端应用
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  // 开发环境：404处理
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: '接口不存在'
    });
  });
}

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/health`);
  console.log(`🔧 API文档: http://localhost:${PORT}/api/servers`);
  if (isProduction) {
    console.log(`🌐 前端应用: http://localhost:${PORT}`);
  }
});

export default app; 