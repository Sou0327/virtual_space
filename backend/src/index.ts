import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import os from 'os';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import spaceRoutes from './routes/spaces';
import aiRoutes from './routes/ai';

// Import database initialization
import { initializeDatabase } from './utils/database';

// Load environment variables
dotenv.config();

console.log('🔧 Environment Configuration:', {
  NODE_ENV: process.env.NODE_ENV || 'not-set',
  PORT: process.env.PORT || 'using-default-3001',
  isDevelopment: process.env.NODE_ENV === 'development',
  corsMode: process.env.NODE_ENV === 'development' ? 'permissive' : 'restricted'
});

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(limiter);
app.use(cors({
  origin: (origin, callback) => {
    console.log('🌐 CORS Request from origin:', origin || 'no-origin');
    
    // 開発環境または特定のローカルポートを許可
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174', 
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:3000'
    ];
    
    // オリジンが無い場合（Postmanなど）またはローカル開発の場合は許可
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      console.log('✅ CORS: Allowed');
      return callback(null, true);
    }
    
    // その他のローカルホストパターンもチェック
    const localhostPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
    if (localhostPattern.test(origin)) {
      console.log('✅ CORS: Allowed (localhost pattern)');
      return callback(null, true);
    }
    
    console.log('❌ CORS: Blocked');
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // AI画像データ用に容量増加
app.use(express.urlencoded({ extended: true }));

// プリフライトリクエストの処理
app.options('*', (req, res) => {
  console.log('🚀 Preflight request received:', req.method, req.url, 'from:', req.headers.origin);
  res.sendStatus(200);
});

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url} from ${req.headers.origin || 'no-origin'} at ${new Date().toISOString()}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  // 明示的にCORSヘッダーを設定
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'no-origin',
    method: req.method,
    services: {
      database: 'connected',
      ai_integration: 'available'
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Get local IP address function
function getLocalIPAddress(): string {
  const interfaces = os.networkInterfaces();
  
  for (const interfaceName in interfaces) {
    const networkInterface = interfaces[interfaceName];
    if (networkInterface) {
      for (const alias of networkInterface) {
        if (alias.family === 'IPv4' && !alias.internal && alias.address !== '127.0.0.1') {
          return alias.address;
        }
      }
    }
  }
  
  return 'localhost';
}

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    const port = Number(PORT);
    const localIP = getLocalIPAddress();
    
    app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 FanVerse API server is running on port ${port}`);
      console.log(`🌐 Server accessible at:`);
      console.log(`   Local:   http://localhost:${port}`);
      console.log(`   Network: http://${localIP}:${port}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🤖 AI Services: DALL-E 3, Stability AI, Meshy AI, Kaedim3D`);
      console.log(`🔧 For mobile testing: http://${localIP}:${port}/api/health`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

startServer(); 