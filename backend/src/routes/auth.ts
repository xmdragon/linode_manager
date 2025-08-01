import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// 扩展 Request 类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const router = Router();

// 简单的用户数据（生产环境应该使用数据库）
let users = [
  {
    id: '1',
    username: 'admin',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin'
  }
];

// 登录接口
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }

    // 查找用户
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 生成 JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // 返回用户信息（不包含密码）
    const userResponse = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    res.json({
      success: true,
      message: '登录成功',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 验证 token 中间件
export const authenticateToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '访问令牌缺失'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: '访问令牌无效'
      });
    }

    req.user = user;
    next();
  });
};

// 获取当前用户信息
router.get('/me', authenticateToken, (req: Request, res: Response) => {
  res.json({
    success: true,
    user: req.user
  });
});

// 更新用户信息
router.put('/update-profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // 查找用户
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const user = users[userIndex];

    // 验证当前密码
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '当前密码错误'
      });
    }

    let needRelogin = false;
    let updatedUser = { ...user };

    // 更新用户名
    if (username && username !== user.username) {
      // 检查用户名是否已存在
      const existingUser = users.find(u => u.username === username && u.id !== userId);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '用户名已存在'
        });
      }
      updatedUser.username = username;
      needRelogin = true;
    }

    // 更新密码
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: '新密码至少需要6个字符'
        });
      }
      updatedUser.password = await bcrypt.hash(newPassword, 10);
    }

    // 更新用户数据
    users[userIndex] = updatedUser;

    // 返回更新后的用户信息（不包含密码）
    const userResponse = {
      id: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role
    };

    res.json({
      success: true,
      message: '用户信息更新成功',
      user: userResponse,
      needRelogin
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

export default router; 