import mixpanel from 'mixpanel';
import dotenv from 'dotenv';
import { mockBusinessData, getDataByCategory, searchData, generateDataInsights } from './mockData.js';

dotenv.config();

// MixpanelMCP - Natural language query interface
class MixpanelMCP {
  constructor() {
    this.mixpanel = mixpanel.init(process.env.MIXPANEL_PROJECT_TOKEN, {
      secret: process.env.MIXPANEL_API_SECRET
    });
  }

  async query(options) {
    const { natural_language } = options;
    console.log(`🧠 Natural Language Query: "${natural_language}"`);
    
    // Process natural language and return insights
    return this.processNaturalLanguageQuery(natural_language);
  }

  async processNaturalLanguageQuery(query) {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const lowerQuery = query.toLowerCase();
    
    // User count questions
    if (lowerQuery.includes('how many users') || lowerQuery.includes('user count') || lowerQuery.includes('total users')) {
      const data = getDataByCategory('user_metrics');
      return {
        type: 'user_metrics',
        ...data
      };
    }
    
    // Revenue questions
    if (lowerQuery.includes('revenue') || lowerQuery.includes('mrr') || lowerQuery.includes('money') || lowerQuery.includes('income')) {
      const data = getDataByCategory('revenue_metrics');
      return {
        type: 'revenue_metrics',
        ...data
      };
    }
    
    // Engagement questions
    if (lowerQuery.includes('engagement') || lowerQuery.includes('active') || lowerQuery.includes('usage')) {
      const data = getDataByCategory('engagement_metrics');
      return {
        type: 'engagement_metrics',
        ...data
      };
    }
    
    // Growth questions
    if (lowerQuery.includes('growth') || lowerQuery.includes('growing') || lowerQuery.includes('trend')) {
      const data = getDataByCategory('growth_metrics');
      return {
        type: 'growth_metrics',
        ...data
      };
    }
    
    // Feature adoption questions
    if (lowerQuery.includes('features') && lowerQuery.includes('adoption')) {
      const data = getDataByCategory('feature_adoption');
      return {
        type: 'feature_adoption',
        ...data
      };
    }
    
    // Retention questions
    if (lowerQuery.includes('retention') || lowerQuery.includes('stay') || lowerQuery.includes('return')) {
      const data = getDataByCategory('retention_metrics');
      return {
        type: 'retention_metrics',
        ...data
      };
    }
    
    // Onboarding/Drop-off questions
    if (lowerQuery.includes('drop') || lowerQuery.includes('abandon') || lowerQuery.includes('onboarding') || lowerQuery.includes('leave')) {
      const data = getDataByCategory('onboarding_metrics');
      return {
        type: 'onboarding_metrics',
        ...data
      };
    }
    
    // Support questions
    if (lowerQuery.includes('support') || lowerQuery.includes('help') || lowerQuery.includes('tickets') || lowerQuery.includes('issues')) {
      const data = getDataByCategory('support_metrics');
      return {
        type: 'support_metrics',
        ...data
      };
    }
    
    // Conversion questions
    if (lowerQuery.includes('convert') || lowerQuery.includes('upgrade') || lowerQuery.includes('paid') || lowerQuery.includes('trial')) {
      const data = getDataByCategory('conversion_metrics');
      return {
        type: 'conversion_metrics',
        ...data
      };
    }
    
    // Performance questions
    if (lowerQuery.includes('performance') || lowerQuery.includes('speed') || lowerQuery.includes('slow') || lowerQuery.includes('load')) {
      const data = getDataByCategory('performance_metrics');
      return {
        type: 'performance_metrics',
        ...data
      };
    }

    // Competitive questions
    if (lowerQuery.includes('competitor') || lowerQuery.includes('market') || lowerQuery.includes('competitive')) {
      const data = getDataByCategory('competitive_metrics');
      return {
        type: 'competitive_metrics',
        ...data
      };
    }

    // Product health questions
    if (lowerQuery.includes('health') || lowerQuery.includes('nps') || lowerQuery.includes('satisfaction')) {
      const data = getDataByCategory('product_health');
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
      return {
        type: firstCategory,
        ...data,
        search_matched: true
      };
    }
    
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
  }
  
  async analyzeUserBehavior() {
    console.log('Analyzing product usage patterns...');
    
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
    
    return this.synthesizeInsights({
      featureAdoption,
      retentionDrivers,
      dropOffPoints
    });
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
  
  // Track improvement over time
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