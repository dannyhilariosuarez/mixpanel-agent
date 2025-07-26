#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import ProductAnalyticsAgent from './productAnalyticsAgent.js';

/**
 * COO Analytics Agent HTTP API Server
 * 
 * Provides REST endpoints for other agents to consume ProductAnalyticsAgent functionality
 * 
 * Endpoints:
 * - POST /api/analyze-behavior - Run full user behavior analysis
 * - POST /api/query - Ask natural language questions
 * - POST /api/track-outcome - Track implementation outcomes  
 * - GET /api/insights - Get stored insights
 * - GET /api/metrics/:category? - Get business metrics
 * - GET /api/health - Health check
 */

class COOAnalyticsAPI {
  constructor(port = 3000) {
    this.app = express();
    this.port = port;
    this.agent = new ProductAnalyticsAgent();
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Enable CORS for all origins (configure as needed)
    this.app.use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Agent-ID']
    }));

    // Parse JSON bodies
    this.app.use(express.json({ limit: '10mb' }));
    
    // Add request logging
    this.app.use((req, res, next) => {
      const agentId = req.headers['x-agent-id'] || 'unknown';
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Agent: ${agentId}`);
      
      // Track API usage
      this.agent.mixpanel.trackEvent('api_request', {
        method: req.method,
        path: req.path,
        agent_id: agentId,
        user_agent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      });
      
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'coo-analytics-agent',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Full behavior analysis
    this.app.post('/api/analyze-behavior', async (req, res) => {
      try {
        const { include_tracking = true } = req.body;
        const agentId = req.headers['x-agent-id'] || 'unknown';

        // Track API analysis request
        if (include_tracking) {
          this.agent.mixpanel.trackEvent('api_behavior_analysis_requested', {
            agent_id: agentId,
            timestamp: new Date().toISOString()
          });
        }

        const analysis = await this.agent.analyzeUserBehavior();

        if (include_tracking) {
          this.agent.mixpanel.trackEvent('api_behavior_analysis_completed', {
            agent_id: agentId,
            insights_count: analysis.insights.length,
            average_confidence: parseFloat(analysis.summary.averageConfidence.replace('%', '')),
            timestamp: new Date().toISOString()
          });
        }

        res.json({
          success: true,
          data: analysis,
          metadata: {
            insights_count: analysis.insights.length,
            average_confidence: analysis.summary.averageConfidence,
            timestamp: new Date().toISOString()
          }
        });

      } catch (error) {
        this.handleError(res, error, 'analyze-behavior');
      }
    });

    // Natural language query
    this.app.post('/api/query', async (req, res) => {
      try {
        const { question, generate_insights = true } = req.body;
        const agentId = req.headers['x-agent-id'] || 'unknown';

        if (!question) {
          return res.status(400).json({
            success: false,
            error: 'Question is required',
            example: 'How many users do we have?'
          });
        }

        // Track API query
        this.agent.mixpanel.trackEvent('api_query_requested', {
          question: question,
          agent_id: agentId,
          timestamp: new Date().toISOString()
        });

        const result = await this.agent.mixpanel.query({
          natural_language: question
        });

        let insights = [];
        if (generate_insights) {
          insights = this.generateInsightsFromResult(result, question);
        }

        this.agent.mixpanel.trackEvent('api_query_completed', {
          question: question,
          result_type: result.type,
          insights_generated: insights.length,
          agent_id: agentId,
          timestamp: new Date().toISOString()
        });

        res.json({
          success: true,
          question: question,
          data: result,
          insights: insights,
          metadata: {
            result_type: result.type,
            insights_count: insights.length,
            timestamp: new Date().toISOString()
          }
        });

      } catch (error) {
        this.handleError(res, error, 'query');
      }
    });

    // Track implementation outcome
    this.app.post('/api/track-outcome', async (req, res) => {
      try {
        const { insight_id, implemented, improved, actual_impact = 'not_specified' } = req.body;
        const agentId = req.headers['x-agent-id'] || 'unknown';

        if (!insight_id || typeof implemented !== 'boolean' || typeof improved !== 'boolean') {
          return res.status(400).json({
            success: false,
            error: 'insight_id, implemented (boolean), and improved (boolean) are required'
          });
        }

        const confidence = await this.agent.trackOutcome(insight_id, implemented, {
          improved,
          actualImpact: actual_impact
        });

        this.agent.mixpanel.trackEvent('api_outcome_tracked', {
          insight_id,
          implemented,
          improved,
          new_confidence: confidence,
          agent_id: agentId,
          timestamp: new Date().toISOString()
        });

        res.json({
          success: true,
          insight_id,
          new_confidence: confidence,
          message: `Outcome tracked. New confidence: ${(confidence * 100).toFixed(1)}%`,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        this.handleError(res, error, 'track-outcome');
      }
    });

    // Get insights
    this.app.get('/api/insights', async (req, res) => {
      try {
        const { min_confidence = 0.0, insight_type = null } = req.query;
        const agentId = req.headers['x-agent-id'] || 'unknown';
        
        let insights = this.agent.insights;
        
        // Filter by confidence
        if (min_confidence > 0) {
          insights = insights.filter(insight => insight.confidence >= parseFloat(min_confidence));
        }
        
        // Filter by type
        if (insight_type) {
          insights = insights.filter(insight => insight.type === insight_type);
        }

        this.agent.mixpanel.trackEvent('api_insights_retrieved', {
          total_insights: insights.length,
          min_confidence: parseFloat(min_confidence),
          insight_type,
          agent_id: agentId,
          timestamp: new Date().toISOString()
        });

        res.json({
          success: true,
          insights,
          metadata: {
            total_count: insights.length,
            filters: { min_confidence: parseFloat(min_confidence), insight_type },
            timestamp: new Date().toISOString()
          }
        });

      } catch (error) {
        this.handleError(res, error, 'insights');
      }
    });

    // Get metrics by category
    this.app.get('/api/metrics/:category?', async (req, res) => {
      try {
        const { category = 'all' } = req.params;
        const agentId = req.headers['x-agent-id'] || 'unknown';
        
        let data;
        if (category === 'all') {
          // Get multiple key metrics
          const [userMetrics, revenueMetrics, engagementMetrics] = await Promise.all([
            this.agent.mixpanel.query({ natural_language: "How many users do we have?" }),
            this.agent.mixpanel.query({ natural_language: "What is our monthly revenue?" }),
            this.agent.mixpanel.query({ natural_language: "How is user engagement?" })
          ]);
          
          data = {
            user_metrics: userMetrics,
            revenue_metrics: revenueMetrics,
            engagement_metrics: engagementMetrics
          };
        } else {
          // Get specific category
          data = await this.agent.mixpanel.query({ 
            natural_language: `Tell me about ${category.replace('_', ' ')}` 
          });
        }

        this.agent.mixpanel.trackEvent('api_metrics_retrieved', {
          category,
          agent_id: agentId,
          timestamp: new Date().toISOString()
        });

        res.json({
          success: true,
          category,
          data,
          metadata: {
            timestamp: new Date().toISOString()
          }
        });

      } catch (error) {
        this.handleError(res, error, 'metrics');
      }
    });

    // List available data categories
    this.app.get('/api/categories', (req, res) => {
      res.json({
        success: true,
        categories: [
          'user_metrics',
          'revenue_metrics', 
          'engagement_metrics',
          'growth_metrics',
          'feature_adoption',
          'retention_metrics',
          'onboarding_metrics',
          'support_metrics',
          'conversion_metrics',
          'performance_metrics',
          'competitive_metrics',
          'product_health'
        ],
        description: 'Available data categories for /api/metrics/:category endpoint'
      });
    });

    // Example queries
    this.app.get('/api/examples', (req, res) => {
      res.json({
        success: true,
        examples: {
          natural_language_queries: [
            "How many users do we have?",
            "What is our monthly revenue?",
            "Which features are most popular?",
            "What drives user retention?",
            "Where do users drop off?",
            "How is our growth trending?",
            "What is our NPS score?",
            "How do we compare to competitors?"
          ],
          api_usage: {
            "POST /api/query": {
              body: { question: "How many users do we have?", generate_insights: true },
              headers: { "X-Agent-ID": "my-agent-name" }
            },
            "POST /api/analyze-behavior": {
              body: { include_tracking: true }
            },
            "GET /api/metrics/user_metrics": {},
            "POST /api/track-outcome": {
              body: { insight_id: "insight_1", implemented: true, improved: true, actual_impact: "+20% retention" }
            }
          }
        }
      });
    });
  }

  generateInsightsFromResult(result, question) {
    const insights = [];

    switch (result.type) {
      case 'user_metrics':
        if (result.growth_rate > 0.1) {
          insights.push({
            id: `insight_${Date.now()}_growth`,
            discovery: `Strong user growth at ${(result.growth_rate * 100).toFixed(1)}% indicates healthy market demand`,
            confidence: 0.87,
            recommendation: 'Invest in user acquisition channels that are working',
            expectedImpact: '+25% user growth acceleration',
            type: 'growth',
            generated_from: question,
            timestamp: new Date().toISOString()
          });
        }
        break;

      case 'revenue_metrics':
        if (result.revenue_growth > 0.1) {
          insights.push({
            id: `insight_${Date.now()}_revenue`,
            discovery: `Revenue growing at ${(result.revenue_growth * 100).toFixed(1)}% shows strong product-market fit`,
            confidence: 0.91,
            recommendation: 'Focus on upselling existing customers to premium tiers',
            expectedImpact: '+20% revenue growth',
            type: 'revenue',
            generated_from: question,
            timestamp: new Date().toISOString()
          });
        }
        break;

      case 'retention_metrics':
        if (result.topAction) {
          insights.push({
            id: `insight_${Date.now()}_retention`,
            discovery: `Users who ${result.topAction} retain ${result.retentionLift}x better`,
            confidence: 0.89,
            recommendation: `Prompt all users to ${result.topAction} in first session`,
            expectedImpact: '+15% 30-day retention',
            type: 'retention',
            generated_from: question,
            timestamp: new Date().toISOString()
          });
        }
        break;
    }

    return insights;
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        available_endpoints: [
          'GET /api/health',
          'POST /api/analyze-behavior', 
          'POST /api/query',
          'POST /api/track-outcome',
          'GET /api/insights',
          'GET /api/metrics/:category?',
          'GET /api/categories',
          'GET /api/examples'
        ]
      });
    });

    // Global error handler
    this.app.use((error, req, res, next) => {
      this.handleError(res, error, req.path);
    });
  }

  handleError(res, error, operation) {
    console.error(`Error in ${operation}:`, error);
    
    // Track errors
    this.agent.mixpanel.trackEvent('api_error', {
      operation,
      error_message: error.message,
      timestamp: new Date().toISOString()
    });

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Internal server error',
      operation,
      timestamp: new Date().toISOString()
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 COO Analytics API Server running on port ${this.port}`);
      console.log(`📚 API Documentation: http://localhost:${this.port}/api/examples`);
      console.log(`❤️  Health Check: http://localhost:${this.port}/api/health`);
      
      // Track server startup
      this.agent.mixpanel.trackEvent('api_server_started', {
        port: this.port,
        timestamp: new Date().toISOString()
      });
    });
  }
}

// Run the server if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.env.PORT || 3000;
  const api = new COOAnalyticsAPI(port);
  api.start();
}

export default COOAnalyticsAPI; 