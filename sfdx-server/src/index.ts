import express from 'express';
import dotenv from 'dotenv';
import { validateApiKey } from './middleware/auth.js';
import { extractProjectContext } from './middleware/projectContext.js';
import metadataRoutes from './routes/metadata.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const API_KEY = process.env.API_KEY || 'dev-api-key';

// Middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Key validation
app.use(validateApiKey);

// Project context extraction
app.use(extractProjectContext);

// Routes
app.use('/metadata', metadataRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: false,
    error: 'Not Found',
    createdItems: []
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response) => {
  console.error('Server error:', err);
  res.status(500).json({
    status: false,
    error: 'Internal Server Error',
    createdItems: []
  });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`SFDX Server running on http://0.0.0.0:${PORT}`);
  console.log(`API Key: ${API_KEY.substring(0, 4)}...${API_KEY.slice(-4)}`);
});
