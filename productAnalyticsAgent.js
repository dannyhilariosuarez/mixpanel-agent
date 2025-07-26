import mixpanel from 'mixpanel';
import dotenv from 'dotenv';
import { mockBusinessData, getDataByCategory, searchData, generateDataInsights } from './mockData.js';

dotenv.config();

// MixpanelMCP - Natural language query interface with real analytics tracking
class MixpanelMCP {
  constructor() {
    this.mixpanel = mixpanel.init(process.env.MIXPANEL_PROJECT_TOKEN, {
      secret: process.env.MIXPANEL_API_SECRET
    });
    
    // Track initialization
    this.trackEvent('coo_analytics_initialized', {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  }

  // Helper method for safe tracking
  trackEvent(eventName, properties = {}) {
    try {
      if (this.mixpanel && process.env.MIXPANEL_PROJECT_TOKEN && process.env.MIXPANEL_PROJECT_TOKEN !== 'your_mixpanel_project_token_here') {
        this.mixpanel.track(eventName, {
          ...properties,
          session_id: this.getSessionId(),
          user_agent: 'COO-Analytics-Agent',
          platform: 'nodejs'
        });
        console.log(`📊 Tracked: ${eventName}`);
      } else {
        console.log(`📊 Mock Track: ${eventName} (no credentials)`);
      }
    } catch (error) {
      console.log(`⚠️  Tracking error: ${error.message}`);
    }
  }

  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return this.sessionId;
  }

  async query(options) {
    const { natural_language } = options;
    console.log(`🧠 Natural Language Query: "${natural_language}"`);
    
    // Track the query
    this.trackEvent('coo_query_asked', {
      question: natural_language,
      question_length: natural_language.length,
      timestamp: new Date().toISOString()
    });
    
    // Process natural language and return insights
    const result = await this.processNaturalLanguageQuery(natural_language);
    
    // Track the response
    this.trackEvent('coo_query_answered', {
      question: natural_language,
      response_type: result.type,
      data_category: result.type,
      has_insights: result.search_matched ? true : false,
      timestamp: new Date().toISOString()
    });
    
    return result;
  }

  async processNaturalLanguageQuery(query) {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const lowerQuery = query.toLowerCase();
    
    // User count questions
    if (lowerQuery.includes('how many users') || lowerQuery.includes('user count') || lowerQuery.includes('total users')) {
      const data = getDataByCategory('user_metrics');
      this.trackEvent('coo_data_accessed', {
        category: 'user_metrics',
        metric_type: 'user_count',
        total_users: data.total_users,
        growth_rate: data.growth_rate
      });
      return {
        type: 'user_metrics',
        ...data
      };
    }
    
    // Revenue questions
    if (lowerQuery.includes('revenue') || lowerQuery.includes('mrr') || lowerQuery.includes('money') || lowerQuery.includes('income')) {
      const data = getDataByCategory('revenue_metrics');
      this.trackEvent('coo_data_accessed', {
        category: 'revenue_metrics',
        metric_type: 'revenue',
        mrr: data.mrr,
        arr: data.arr,
        growth_rate: data.revenue_growth
      });
      return {
        type: 'revenue_metrics',
        ...data
      };
    }
    
    // Engagement questions
    if (lowerQuery.includes('engagement') || lowerQuery.includes('active') || lowerQuery.includes('usage')) {
      const data = getDataByCategory('engagement_metrics');
      this.trackEvent('coo_data_accessed', {
        category: 'engagement_metrics',
        metric_type: 'engagement',
        dau: data.daily_active_users,
        engagement_score: data.engagement_score
      });
      return {
        type: 'engagement_metrics',
        ...data
      };
    }
    
    // Growth questions
    if (lowerQuery.includes('growth') || lowerQuery.includes('growing') || lowerQuery.includes('trend')) {
      const data = getDataByCategory('growth_metrics');
      this.trackEvent('coo_data_accessed', {
        category: 'growth_metrics',
        metric_type: 'growth',
        user_growth_rate: data.user_growth_rate,
        revenue_growth_rate: data.revenue_growth_rate
      });
      return {
        type: 'growth_metrics',
        ...data
      };
    }
    
    // Feature adoption questions
    if (lowerQuery.includes('features') && lowerQuery.includes('adoption')) {
      const data = getDataByCategory('feature_adoption');
      this.trackEvent('coo_data_accessed', {
        category: 'feature_adoption',
        metric_type: 'features',
        top_feature: data.topFeatures[0].name,
        underused_feature: data.underused
      });
      return {
        type: 'feature_adoption',
        ...data
      };
    }
    
    // Retention questions
    if (lowerQuery.includes('retention') || lowerQuery.includes('stay') || lowerQuery.includes('return')) {
      const data = getDataByCategory('retention_metrics');
      this.trackEvent('coo_data_accessed', {
        category: 'retention_metrics',
        metric_type: 'retention',
        day30_retention: data.day30_retention,
        top_action: data.topAction
      });
      return {
        type: 'retention_metrics',
        ...data
      };
    }
    
    // Onboarding/Drop-off questions
    if (lowerQuery.includes('drop') || lowerQuery.includes('abandon') || lowerQuery.includes('onboarding') || lowerQuery.includes('leave')) {
      const data = getDataByCategory('onboarding_metrics');
      this.trackEvent('coo_data_accessed', {
        category: 'onboarding_metrics',
        metric_type: 'onboarding',
        drop_off_rate: data.dropOffRate,
        biggest_dropoff: data.biggest
      });
      return {
        type: 'onboarding_metrics',
        ...data
      };
    }
    
    // Support questions
    if (lowerQuery.includes('support') || lowerQuery.includes('help') || lowerQuery.includes('tickets') || lowerQuery.includes('issues')) {
      const data = getDataByCategory('support_metrics');
      this.trackEvent('coo_data_accessed', {
        category: 'support_metrics',
        metric_type: 'support',
        open_tickets: data.open_tickets,
        satisfaction: data.satisfaction_score
      });
      return {
        type: 'support_metrics',
        ...data
      };
    }
    
    // Conversion questions
    if (lowerQuery.includes('convert') || lowerQuery.includes('upgrade') || lowerQuery.includes('paid') || lowerQuery.includes('trial')) {
      const data = getDataByCategory('conversion_metrics');
      this.trackEvent('coo_data_accessed', {
        category: 'conversion_metrics',
        metric_type: 'conversion',
        trial_to_paid: data.trial_to_paid,
        signup_to_activation: data.signup_to_activation
      });
      return {
        type: 'conversion_metrics',
        ...data
      };
    }
    
    // Performance questions
    if (lowerQuery.includes('performance') || lowerQuery.includes('speed') || lowerQuery.includes('slow') || lowerQuery.includes('load')) {
      const data = getDataByCategory('performance_metrics');
      this.trackEvent('coo_data_accessed', {
        category: 'performance_metrics',
        metric_type: 'performance',
        avg_page_load: data.avg_page_load,
        performance_score: data.performance_score
      });
      return {
        type: 'performance_metrics',
        ...data
      };
    }

    // Competitive questions
    if (lowerQuery.includes('competitor') || lowerQuery.includes('market') || lowerQuery.includes('competitive')) {
      const data = getDataByCategory('competitive_metrics');
      this.trackEvent('coo_data_accessed', {
        category: 'competitive_metrics',
        metric_type: 'competitive',
        market_share: data.market_share,
        win_rate: data.win_loss_analysis.win_rate
      });
      return {
        type: 'competitive_metrics',
        ...data
      };
    }

    // Product health questions
    if (lowerQuery.includes('health') || lowerQuery.includes('nps') || lowerQuery.includes('satisfaction')) {
      const data = getDataByCategory('product_health');
      this.trackEvent('coo_data_accessed', {
        category: 'product_health',
        metric_type: 'health',
        nps_score: data.nps_score,
        overall_score: data.overall_score,
        product_market_fit: data.product_market_fit
      });
      return {
        type: 'product_health',
        ...data
      };
    }

    // Smart search for complex queries
    const searchResults = searchData(query);
    if (Object.keys(searchResults).length > 0) {
      const firstCategory = Object.keys(searchResults)[0];
      const data = searchResults[firstCategory];
      
      this.trackEvent('coo_smart_search_used', {
        query: query,
        matched_category: firstCategory,
        total_matches: Object.keys(searchResults).length
      });
      
      return {
        type: firstCategory,
        ...data,
        search_matched: true
      };
    }
    
    // Track unknown queries for improvement
    this.trackEvent('coo_query_unmatched', {
      question: query,
      timestamp: new Date().toISOString()
    });
    
    // Generic/fallback response
    return { 
      type: 'general_response',
      message: 'I can help you analyze user behavior, revenue, engagement, growth, features, retention, onboarding, support, conversions, performance, and competitive metrics. Try asking more specific questions!',
      suggestions: [
        'How many users do we have?',
        'What is our monthly revenue?',
        'Which features are most popular?',
        'What drives user retention?',
        'Where do users drop off?',
        'How is our growth trending?',
        'What is our NPS score?',
        'How do we compare to competitors?'
      ]
    };
  }
}

class ProductAnalyticsAgent {
  constructor() {
    this.mixpanel = new MixpanelMCP();
    this.insights = [];
    this.patterns = new Map();
    
    // Track agent initialization
    this.mixpanel.trackEvent('product_analytics_agent_created', {
      timestamp: new Date().toISOString(),
      agent_version: '1.0.0'
    });
  }
  
  async analyzeUserBehavior() {
    console.log('Analyzing product usage patterns...');
    
    // Track analysis start
    this.mixpanel.trackEvent('behavior_analysis_started', {
      timestamp: new Date().toISOString()
    });
    
    // Query 1: Feature adoption
    const featureAdoption = await this.mixpanel.query({
      natural_language: "Which features have the highest adoption in first week?"
    });
    
    // Query 2: Retention drivers
    const retentionDrivers = await this.mixpanel.query({
      natural_language: "What actions correlate with 30-day retention?"
    });
    
    // Query 3: Drop-off points
    const dropOffPoints = await this.mixpanel.query({
      natural_language: "Where do users drop off in the onboarding flow?"
    });
    
    const analysis = this.synthesizeInsights({
      featureAdoption,
      retentionDrivers,
      dropOffPoints
    });
    
    // Track analysis completion with results
    this.mixpanel.trackEvent('behavior_analysis_completed', {
      insights_generated: analysis.insights.length,
      average_confidence: parseFloat(analysis.summary.averageConfidence.replace('%', '')),
      total_insights: analysis.summary.totalInsights,
      top_recommendation: analysis.summary.topRecommendation,
      timestamp: new Date().toISOString()
    });
    
    // Track individual insights
    analysis.insights.forEach((insight, index) => {
      this.mixpanel.trackEvent('insight_generated', {
        insight_id: `insight_${index + 1}`,
        type: insight.type,
        discovery: insight.discovery,
        confidence: insight.confidence,
        recommendation: insight.recommendation,
        expected_impact: insight.expectedImpact,
        timestamp: new Date().toISOString()
      });
    });
    
    return analysis;
  }
  
  synthesizeInsights(data) {
    const insights = [];
    
    // Insight 1: Key retention driver
    if (data.retentionDrivers?.topAction) {
      insights.push({
        type: 'retention',
        discovery: `Users who ${data.retentionDrivers.topAction} retain 3x better`,
        confidence: 0.89,
        recommendation: `Prompt all users to ${data.retentionDrivers.topAction} in first session`,
        expectedImpact: '+15% 30-day retention'
      });
    }
    
    // Insight 2: Feature adoption gap
    if (data.featureAdoption?.underused) {
      insights.push({
        type: 'adoption',
        discovery: `Only 12% use ${data.featureAdoption.underused} but it drives highest engagement`,
        confidence: 0.85,
        recommendation: `Add tutorial for ${data.featureAdoption.underused} in onboarding`,
        expectedImpact: '+23% daily active users'
      });
    }
    
    // Insight 3: Onboarding optimization
    if (data.dropOffPoints?.biggest) {
      insights.push({
        type: 'onboarding',
        discovery: `42% of users abandon at ${data.dropOffPoints.biggest}`,
        confidence: 0.92,
        recommendation: `Simplify ${data.dropOffPoints.biggest} to single tap`,
        expectedImpact: '+38% activation rate'
      });
    }
    
    return {
      insights,
      summary: this.generateExecutiveSummary(insights),
      metrics: this.calculateMetrics(data)
    };
  }
  
  generateExecutiveSummary(insights) {
    const avgConfidence = insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length;
    const topInsight = insights.sort((a, b) => b.confidence - a.confidence)[0];
    
    return {
      totalInsights: insights.length,
      averageConfidence: (avgConfidence * 100).toFixed(1) + '%',
      topRecommendation: topInsight?.recommendation,
      criticalAction: topInsight?.recommendation
    };
  }
  
  calculateMetrics(data) {
    return {
      adoptionHealth: data.featureAdoption?.topFeatures?.length || 0,
      retentionStrength: data.retentionDrivers?.correlationStrength || 0,
      onboardingEfficiency: 1 - (data.dropOffPoints?.dropOffRate || 0)
    };
  }
  
  // Track improvement over time with real analytics
  async trackOutcome(insightId, implemented, result) {
    const pattern = this.patterns.get(insightId) || { 
      suggested: 0, 
      implemented: 0, 
      successful: 0 
    };
    
    pattern.suggested++;
    if (implemented) {
      pattern.implemented++;
      if (result.improved) {
        pattern.successful++;
      }
    }
    
    this.patterns.set(insightId, pattern);
    
    // Track outcome to Mixpanel
    this.mixpanel.trackEvent('insight_outcome_tracked', {
      insight_id: insightId,
      was_implemented: implemented,
      was_successful: result.improved,
      actual_impact: result.actualImpact || 'not_specified',
      success_rate: pattern.implemented > 0 ? (pattern.successful / pattern.implemented) : 0,
      total_suggestions: pattern.suggested,
      total_implementations: pattern.implemented,
      timestamp: new Date().toISOString()
    });
    
    // Track pattern performance
    if (pattern.implemented >= 3) { // After 3+ implementations, track pattern performance
      this.mixpanel.trackEvent('insight_pattern_performance', {
        insight_id: insightId,
        success_rate: (pattern.successful / pattern.implemented),
        implementation_rate: (pattern.implemented / pattern.suggested),
        total_impact: pattern.successful,
        pattern_maturity: 'established',
        timestamp: new Date().toISOString()
      });
    }
    
    // Learn from outcomes
    return this.updateConfidence(insightId, result);
  }
  
  updateConfidence(insightId, result) {
    const pattern = this.patterns.get(insightId);
    if (!pattern || pattern.implemented === 0) return 0.5;
    
    const successRate = pattern.successful / pattern.implemented;
    return Math.min(0.95, Math.max(0.1, successRate));
  }
}

export default ProductAnalyticsAgent; 