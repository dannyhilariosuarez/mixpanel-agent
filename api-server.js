#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import ProductAnalyticsAgent from './agent.js';

/**
 * Event Tracking API Server
 * 
 * Simple HTTP API for tracking:
 * - Post events (user creates content)
 * - Upload events (user uploads files)
 */

const app = express();
const agent = new ProductAnalyticsAgent();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// === HEALTH & DOCS ===

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'event-tracking-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    tracking: ['post', 'upload']
  });
});

app.get('/docs', (req, res) => {
  res.json({
    name: 'Event Tracking API',
    version: '1.0.0',
    description: 'Track post and upload events',
    endpoints: {
      track: {
        post: {
          method: 'POST',
          path: '/track/post',
          body: {
            userId: 'string (required)',
            postType: 'string (optional, default: "text")',
            properties: 'object (optional) - category, title, etc.'
          },
          example: {
            userId: 'user123',
            postType: 'text',
            properties: { category: 'blog', title: 'My Post' }
          }
        },
        upload: {
          method: 'POST', 
          path: '/track/upload',
          body: {
            userId: 'string (required)',
            fileType: 'string (optional, default: "unknown")',
            properties: 'object (optional) - size, method, etc.'
          },
          example: {
            userId: 'user123',
            fileType: 'image',
            properties: { size: 1024000, method: 'drag_drop' }
          }
        }
      },
      analytics: {
        analyze: {
          method: 'POST',
          path: '/analyze',
          body: { userId: 'string (optional)' },
          description: 'Get behavioral analysis for all users or specific user'
        },
        metrics: {
          method: 'GET',
          path: '/metrics',
          description: 'Get current system metrics'
        }
      }
    },
    examples: {
      curl: {
        track_post: 'curl -X POST http://localhost:3000/track/post -H "Content-Type: application/json" -d \'{"userId":"user123","postType":"text","properties":{"category":"blog"}}\'',
        track_upload: 'curl -X POST http://localhost:3000/track/upload -H "Content-Type: application/json" -d \'{"userId":"user123","fileType":"image","properties":{"size":1024000}}\''
      }
    }
  });
});

// === EVENT TRACKING ENDPOINTS ===

app.post('/track/post', async (req, res) => {
  try {
    const { userId, postType = 'text', properties = {} } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const event = agent.trackPost(userId, postType, properties);
    
    res.json({
      success: true,
      event,
      timestamp: new Date().toISOString(),
      message: 'Post event tracked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/track/upload', async (req, res) => {
  try {
    const { userId, fileType = 'unknown', properties = {} } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const event = agent.trackUpload(userId, fileType, properties);
    
    res.json({
      success: true,
      event,
      timestamp: new Date().toISOString(),
      message: 'Upload event tracked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// === ANALYTICS ENDPOINTS ===

app.post('/analyze', async (req, res) => {
  try {
    const { userId } = req.body;
    const analysis = await agent.analyzeUserBehavior(userId);
    
    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/metrics', (req, res) => {
  try {
    const metrics = agent.getMetrics();
    res.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// === ERROR HANDLING ===

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /docs', 
      'POST /track/post',
      'POST /track/upload',
      'POST /analyze',
      'GET /metrics'
    ]
  });
});

app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// === START SERVER ===

app.listen(PORT, () => {
  console.log(`🚀 Event Tracking API Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log(`📊 Metrics: http://localhost:${PORT}/metrics`);
  console.log(`\n🎯 Ready to track POST & UPLOAD events!`);
});

export default app; 