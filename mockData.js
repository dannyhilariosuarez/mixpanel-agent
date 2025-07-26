// Mock Business Data for COO Analytics Agent
// This file contains realistic mock data for various business metrics

export const mockBusinessData = {
  // User Metrics
  user_metrics: {
    total_users: 45230,
    active_users_30d: 18650,
    new_users_30d: 2340,
    churned_users_30d: 890,
    growth_rate: 0.15,
    avg_session_duration: 8.5, // minutes
    user_segments: {
      freemium: 32450,
      premium: 8920,
      enterprise: 3860
    },
    geographic_distribution: {
      'North America': 18500,
      'Europe': 12300,
      'Asia Pacific': 8900,
      'Other': 5530
    },
    acquisition_channels: {
      organic_search: 0.35,
      paid_ads: 0.25,
      referrals: 0.20,
      social_media: 0.12,
      direct: 0.08
    }
  },

  // Revenue Metrics
  revenue_metrics: {
    mrr: 285000, // Monthly Recurring Revenue
    arr: 3420000, // Annual Recurring Revenue
    revenue_30d: 310000,
    revenue_growth: 0.15,
    avg_revenue_per_user: 16.60,
    ltv: 332.00, // Customer Lifetime Value
    revenue_by_segment: {
      freemium: 0, // Free users
      premium: 178000,
      enterprise: 132000
    },
    revenue_trends: {
      jan: 245000,
      feb: 258000,
      mar: 271000,
      apr: 285000
    },
    churn_rate: 0.05,
    expansion_revenue: 45000 // Upsells/upgrades
  },

  // Engagement Metrics
  engagement_metrics: {
    daily_active_users: 12450,
    weekly_active_users: 18650,
    monthly_active_users: 35200,
    avg_session_duration: 8.5, // minutes
    bounce_rate: 0.32,
    pages_per_session: 5.4,
    sessions_per_user: 12.3,
    top_engaged_features: ['dashboard', 'reports', 'analytics'],
    engagement_score: 7.8, // out of 10
    stickiness: 0.35, // DAU/MAU ratio
    power_users: 4200 // highly engaged users
  },

  // Growth Metrics
  growth_metrics: {
    user_growth_rate: 0.15,
    revenue_growth_rate: 0.18,
    month_over_month: 0.12,
    quarter_over_quarter: 0.35,
    signup_trend: 'increasing',
    churn_trend: 'stable',
    net_growth: 0.10, // growth minus churn
    growth_drivers: ['organic_search', 'referrals', 'product_hunt'],
    growth_bottlenecks: ['onboarding_friction', 'pricing_sensitivity'],
    viral_coefficient: 0.3,
    payback_period: 8.2 // months
  },

  // Feature Adoption
  feature_adoption: {
    topFeatures: [
      { name: 'dashboard', adoption_rate: 0.89, time_to_adopt: 1.2, satisfaction: 4.6 },
      { name: 'reports', adoption_rate: 0.67, time_to_adopt: 3.4, satisfaction: 4.2 },
      { name: 'integrations', adoption_rate: 0.45, time_to_adopt: 7.1, satisfaction: 4.4 },
      { name: 'api', adoption_rate: 0.23, time_to_adopt: 12.5, satisfaction: 4.8 },
      { name: 'mobile_app', adoption_rate: 0.34, time_to_adopt: 5.2, satisfaction: 3.9 }
    ],
    underused: 'integrations',
    fastest_growing: 'dashboard',
    most_valuable: 'api', // highest correlation with retention
    feature_requests: [
      { feature: 'advanced_filters', votes: 234 },
      { feature: 'team_collaboration', votes: 189 },
      { feature: 'custom_dashboards', votes: 156 }
    ]
  },

  // Retention Metrics
  retention_metrics: {
    topAction: 'complete_profile',
    correlationStrength: 0.78,
    retentionLift: 3.2,
    day1_retention: 0.78,
    day7_retention: 0.52,
    day30_retention: 0.28,
    day90_retention: 0.18,
    cohort_retention: {
      '2024-01': { month_1: 0.85, month_3: 0.65, month_6: 0.45 },
      '2024-02': { month_1: 0.82, month_3: 0.68, month_6: 0.48 },
      '2024-03': { month_1: 0.88, month_3: 0.71, month_6: null },
      '2024-04': { month_1: 0.84, month_3: null, month_6: null }
    },
    retention_drivers: [
      { action: 'complete_profile', impact: 3.2 },
      { action: 'connect_integration', impact: 2.8 },
      { action: 'create_first_report', impact: 2.1 },
      { action: 'invite_team_member', impact: 1.9 }
    ]
  },

  // Onboarding Metrics
  onboarding_metrics: {
    biggest: 'email_verification',
    dropOffRate: 0.42,
    completion_rate: 0.73,
    avg_time_to_complete: 8.5, // minutes
    success_factors: ['clear_instructions', 'quick_verification', 'immediate_value'],
    onboarding_steps: [
      { step: 'signup', completion: 1.0, avg_time: 2.1 },
      { step: 'email_verification', completion: 0.58, avg_time: 15.2 },
      { step: 'profile_setup', completion: 0.48, avg_time: 4.3 },
      { step: 'first_action', completion: 0.41, avg_time: 6.8 },
      { step: 'tutorial_completion', completion: 0.35, avg_time: 8.9 }
    ],
    drop_off_reasons: [
      { reason: 'email_verification_delay', percentage: 0.35 },
      { reason: 'complex_setup', percentage: 0.28 },
      { reason: 'unclear_value_prop', percentage: 0.22 },
      { reason: 'technical_issues', percentage: 0.15 }
    ]
  },

  // Support Metrics
  support_metrics: {
    open_tickets: 245,
    avg_resolution_time: 4.2, // hours
    satisfaction_score: 4.3, // out of 5
    response_time: 0.8, // hours for first response
    escalation_rate: 0.12,
    top_issues: ['billing', 'technical', 'onboarding'],
    ticket_categories: {
      billing: 89,
      technical: 156,
      feature_request: 34,
      bug_report: 67,
      onboarding: 45
    },
    support_channels: {
      email: 0.45,
      chat: 0.35,
      phone: 0.15,
      self_service: 0.05
    },
    resolution_by_tier: {
      tier1: 0.70, // resolved at first contact
      tier2: 0.25, // escalated once
      tier3: 0.05  // escalated multiple times
    }
  },

  // Conversion Metrics
  conversion_metrics: {
    trial_to_paid: 0.28,
    signup_to_activation: 0.72,
    freemium_to_premium: 0.15,
    visitor_to_signup: 0.019,
    conversion_funnel: {
      visitors: 125000,
      signups: 2340,
      activated: 1685,
      trial: 890,
      paid: 249
    },
    conversion_by_source: {
      organic_search: 0.31,
      paid_ads: 0.18,
      referrals: 0.42,
      social_media: 0.08
    },
    time_to_convert: {
      trial_to_paid: 12.5, // days
      freemium_to_premium: 45.2 // days
    }
  },

  // Performance Metrics
  performance_metrics: {
    avg_page_load: 2.3, // seconds
    api_response_time: 145, // milliseconds
    uptime: 0.999,
    error_rate: 0.002,
    performance_score: 92, // out of 100
    core_web_vitals: {
      lcp: 1.8, // Largest Contentful Paint
      fid: 65, // First Input Delay (ms)
      cls: 0.08 // Cumulative Layout Shift
    },
    mobile_performance: 85,
    desktop_performance: 96,
    geographic_performance: {
      'North America': 1.9,
      'Europe': 2.1,
      'Asia Pacific': 2.8,
      'Other': 3.2
    }
  },

  // Competitive Analysis
  competitive_metrics: {
    market_share: 0.08,
    competitor_comparison: {
      feature_parity: 0.85,
      pricing_competitiveness: 0.72,
      user_satisfaction: 0.91
    },
    win_loss_analysis: {
      win_rate: 0.34,
      top_win_reasons: ['better_ux', 'pricing', 'customer_support'],
      top_loss_reasons: ['missing_features', 'integration_limitations', 'enterprise_requirements']
    }
  },

  // Product Health
  product_health: {
    overall_score: 78, // out of 100
    user_satisfaction: 4.3, // out of 5
    nps_score: 42, // Net Promoter Score
    product_market_fit: 0.75,
    technical_debt_score: 0.25, // lower is better
    innovation_index: 0.68,
    time_to_value: 3.2 // days for new users to see value
  }
};

// Helper function to get data by category
export function getDataByCategory(category) {
  return mockBusinessData[category] || null;
}

// Helper function to search data by keywords
export function searchData(keywords) {
  const results = {};
  const searchTerms = keywords.toLowerCase().split(' ');
  
  for (const [category, data] of Object.entries(mockBusinessData)) {
    if (searchTerms.some(term => category.includes(term) || JSON.stringify(data).toLowerCase().includes(term))) {
      results[category] = data;
    }
  }
  
  return results;
}

// Helper function to get insights based on data patterns
export function generateDataInsights(category, data) {
  const insights = [];
  
  switch (category) {
    case 'user_metrics':
      if (data.growth_rate > 0.10) {
        insights.push({
          type: 'positive',
          message: `Strong user growth at ${(data.growth_rate * 100).toFixed(1)}%`,
          recommendation: 'Scale successful acquisition channels'
        });
      }
      break;
      
    case 'retention_metrics':
      if (data.day30_retention < 0.30) {
        insights.push({
          type: 'warning',
          message: `30-day retention at ${(data.day30_retention * 100).toFixed(1)}% is below industry average`,
          recommendation: `Focus on improving ${data.topAction} completion`
        });
      }
      break;
      
    case 'onboarding_metrics':
      if (data.dropOffRate > 0.35) {
        insights.push({
          type: 'critical',
          message: `High drop-off at ${data.biggest} (${(data.dropOffRate * 100).toFixed(1)}%)`,
          recommendation: `Simplify ${data.biggest} process`
        });
      }
      break;
  }
  
  return insights;
}

export default mockBusinessData; 