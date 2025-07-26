#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import ProductAnalyticsAgent from './productAnalyticsAgent.js';

/**
 * COO Analytics Agent MCP Server
 * 
 * Exposes ProductAnalyticsAgent functionality to other AI agents via MCP protocol
 * 
 * Available tools:
 * - coo_analyze_behavior: Run full user behavior analysis
 * - coo_query_data: Ask natural language questions about business metrics
 * - coo_track_outcome: Track implementation outcomes for pattern learning
 * - coo_get_insights: Get current insights with confidence scores
 */

class COOAnalyticsMCPServer {
  constructor() {
    this.agent = new ProductAnalyticsAgent();
    this.server = new Server(
      {
        name: 'coo-analytics-agent',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'coo_analyze_behavior',
            description: 'Run comprehensive user behavior analysis with AI insights',
            inputSchema: {
              type: 'object',
              properties: {
                include_tracking: {
                  type: 'boolean',
                  description: 'Whether to track this analysis to Mixpanel',
                  default: true
                }
              }
            },
          },
          {
            name: 'coo_query_data',
            description: 'Ask natural language questions about business metrics and get instant data',
            inputSchema: {
              type: 'object',
              properties: {
                question: {
                  type: 'string',
                  description: 'Natural language question about business metrics (e.g., "How many users do we have?", "What is our revenue growth?")',
                },
                generate_insights: {
                  type: 'boolean',
                  description: 'Whether to generate AI insights from the query result',
                  default: true
                }
              },
              required: ['question'],
            },
          },
          {
            name: 'coo_track_outcome',
            description: 'Track implementation outcome for pattern learning and confidence updates',
            inputSchema: {
              type: 'object',
              properties: {
                insight_id: {
                  type: 'string',
                  description: 'ID of the insight to track outcome for',
                },
                implemented: {
                  type: 'boolean',
                  description: 'Whether the recommendation was implemented',
                },
                improved: {
                  type: 'boolean',
                  description: 'Whether the implementation improved the metric',
                },
                actual_impact: {
                  type: 'string',
                  description: 'Description of actual impact observed',
                  default: 'not_specified'
                }
              },
              required: ['insight_id', 'implemented', 'improved'],
            },
          },
          {
            name: 'coo_get_insights',
            description: 'Get all stored insights with current confidence scores',
            inputSchema: {
              type: 'object',
              properties: {
                min_confidence: {
                  type: 'number',
                  description: 'Minimum confidence threshold (0-1)',
                  default: 0.0
                },
                insight_type: {
                  type: 'string',
                  description: 'Filter by insight type (retention, adoption, onboarding, etc.)',
                  default: null
                }
              }
            },
          },
          {
            name: 'coo_get_metrics',
            description: 'Get current product health metrics and KPIs',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  description: 'Specific metric category (user_metrics, revenue_metrics, engagement_metrics, etc.)',
                  default: 'all'
                }
              }
            },
          }
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'coo_analyze_behavior':
            return await this.handleAnalyzeBehavior(args);
          
          case 'coo_query_data':
            return await this.handleQueryData(args);
          
          case 'coo_track_outcome':
            return await this.handleTrackOutcome(args);
          
          case 'coo_get_insights':
            return await this.handleGetInsights(args);
            
          case 'coo_get_metrics':
            return await this.handleGetMetrics(args);

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${name}: ${error.message}`
        );
      }
    });
  }

  async handleAnalyzeBehavior(args) {
    const { include_tracking = true } = args;
    
    // Track MCP usage
    if (include_tracking) {
      this.agent.mixpanel.trackEvent('mcp_behavior_analysis_requested', {
        client: 'external_agent',
        timestamp: new Date().toISOString()
      });
    }

    const analysis = await this.agent.analyzeUserBehavior();
    
    if (include_tracking) {
      this.agent.mixpanel.trackEvent('mcp_behavior_analysis_completed', {
        insights_count: analysis.insights.length,
        average_confidence: parseFloat(analysis.summary.averageConfidence.replace('%', '')),
        client: 'external_agent',
        timestamp: new Date().toISOString()
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: analysis,
            summary: `Generated ${analysis.insights.length} insights with ${analysis.summary.averageConfidence} average confidence`,
            timestamp: new Date().toISOString()
          }, null, 2),
        },
      ],
    };
  }

  async handleQueryData(args) {
    const { question, generate_insights = true } = args;
    
    // Track MCP query
    this.agent.mixpanel.trackEvent('mcp_query_requested', {
      question: question,
      client: 'external_agent',
      timestamp: new Date().toISOString()
    });

    const result = await this.agent.mixpanel.query({
      natural_language: question
    });

    let insights = [];
    if (generate_insights) {
      insights = this.generateInsightsFromResult(result, question);
    }

    this.agent.mixpanel.trackEvent('mcp_query_completed', {
      question: question,
      result_type: result.type,
      insights_generated: insights.length,
      client: 'external_agent',
      timestamp: new Date().toISOString()
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            question: question,
            data: result,
            insights: insights,
            timestamp: new Date().toISOString()
          }, null, 2),
        },
      ],
    };
  }

  async handleTrackOutcome(args) {
    const { insight_id, implemented, improved, actual_impact = 'not_specified' } = args;
    
    const confidence = await this.agent.trackOutcome(insight_id, implemented, {
      improved,
      actualImpact: actual_impact
    });

    this.agent.mixpanel.trackEvent('mcp_outcome_tracked', {
      insight_id,
      implemented,
      improved,
      new_confidence: confidence,
      client: 'external_agent',
      timestamp: new Date().toISOString()
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            insight_id,
            new_confidence: confidence,
            message: `Outcome tracked. New confidence: ${(confidence * 100).toFixed(1)}%`,
            timestamp: new Date().toISOString()
          }, null, 2),
        },
      ],
    };
  }

  async handleGetInsights(args) {
    const { min_confidence = 0.0, insight_type = null } = args;
    
    let insights = this.agent.insights;
    
    // Filter by confidence
    if (min_confidence > 0) {
      insights = insights.filter(insight => insight.confidence >= min_confidence);
    }
    
    // Filter by type
    if (insight_type) {
      insights = insights.filter(insight => insight.type === insight_type);
    }

    this.agent.mixpanel.trackEvent('mcp_insights_retrieved', {
      total_insights: insights.length,
      min_confidence,
      insight_type,
      client: 'external_agent',
      timestamp: new Date().toISOString()
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            insights,
            total_count: insights.length,
            filters: { min_confidence, insight_type },
            timestamp: new Date().toISOString()
          }, null, 2),
        },
      ],
    };
  }

  async handleGetMetrics(args) {
    const { category = 'all' } = args;
    
    let data;
    if (category === 'all') {
      // Get multiple key metrics
      const userMetrics = await this.agent.mixpanel.query({ natural_language: "How many users do we have?" });
      const revenueMetrics = await this.agent.mixpanel.query({ natural_language: "What is our monthly revenue?" });
      const engagementMetrics = await this.agent.mixpanel.query({ natural_language: "How is user engagement?" });
      
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

    this.agent.mixpanel.trackEvent('mcp_metrics_retrieved', {
      category,
      client: 'external_agent',
      timestamp: new Date().toISOString()
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            category,
            data,
            timestamp: new Date().toISOString()
          }, null, 2),
        },
      ],
    };
  }

  generateInsightsFromResult(result, question) {
    const insights = [];

    switch (result.type) {
      case 'user_metrics':
        if (result.growth_rate > 0.1) {
          insights.push({
            discovery: `Strong user growth at ${(result.growth_rate * 100).toFixed(1)}% indicates healthy market demand`,
            confidence: 0.87,
            recommendation: 'Invest in user acquisition channels that are working',
            expectedImpact: '+25% user growth acceleration',
            type: 'growth'
          });
        }
        break;

      case 'revenue_metrics':
        if (result.revenue_growth > 0.1) {
          insights.push({
            discovery: `Revenue growing at ${(result.revenue_growth * 100).toFixed(1)}% shows strong product-market fit`,
            confidence: 0.91,
            recommendation: 'Focus on upselling existing customers to premium tiers',
            expectedImpact: '+20% revenue growth',
            type: 'revenue'
          });
        }
        break;

      case 'retention_metrics':
        if (result.topAction) {
          insights.push({
            discovery: `Users who ${result.topAction} retain ${result.retentionLift}x better`,
            confidence: 0.89,
            recommendation: `Prompt all users to ${result.topAction} in first session`,
            expectedImpact: '+15% 30-day retention',
            type: 'retention'
          });
        }
        break;
    }

    return insights;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('COO Analytics Agent MCP Server running on stdio');
  }
}

// Run the server
const server = new COOAnalyticsMCPServer();
server.run().catch(console.error); 