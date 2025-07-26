import readline from 'readline';
import ProductAnalyticsAgent from './productAnalyticsAgent.js';

class InteractiveAnalytics {
  constructor() {
    this.agent = new ProductAnalyticsAgent();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.sessionStartTime = new Date();
    this.queryCount = 0;
  }

  async start() {
    console.log('🧠 === INTERACTIVE PRODUCT ANALYTICS ===');
    console.log('========================================\n');
    console.log('Ask me anything about your product analytics!');
    console.log('Examples:');
    console.log('  • "How many users do we have?"');
    console.log('  • "What is our monthly revenue?"');
    console.log('  • "Which features are most popular?"');
    console.log('  • "What drives user retention?"');
    console.log('  • "Where do users drop off?"');
    console.log('  • "How is our growth trending?"');
    console.log('  • "What is our NPS score?"');
    console.log('  • "How do we compare to competitors?"');
    console.log('\nType "analyze" to run full behavior analysis');
    console.log('Type "help" to see commands');
    console.log('Type "exit" to quit\n');

    // Track interactive session start
    this.agent.mixpanel.trackEvent('interactive_session_started', {
      start_time: this.sessionStartTime.toISOString(),
      user_interface: 'cli',
      session_type: 'interactive'
    });

    this.promptUser();
  }

  promptUser() {
    this.rl.question('🔍 Your question: ', async (input) => {
      const query = input.trim();
      
      if (query.toLowerCase() === 'exit') {
        await this.handleExit();
        return;
      }
      
      if (query.toLowerCase() === 'help') {
        this.trackCommand('help');
        this.showHelp();
        this.promptUser();
        return;
      }

      if (query.toLowerCase() === 'analyze') {
        this.trackCommand('analyze');
        await this.runFullAnalysis();
        this.promptUser();
        return;
      }

      if (query === '') {
        console.log('💡 Please enter a question or command.\n');
        this.promptUser();
        return;
      }

      await this.processQuery(query);
      this.promptUser();
    });
  }

  async handleExit() {
    const sessionDuration = Date.now() - this.sessionStartTime.getTime();
    
    // Track session end
    this.agent.mixpanel.trackEvent('interactive_session_ended', {
      session_duration_ms: sessionDuration,
      session_duration_minutes: Math.round(sessionDuration / 60000),
      total_queries: this.queryCount,
      queries_per_minute: this.queryCount / (sessionDuration / 60000),
      end_time: new Date().toISOString()
    });

    console.log('\n👋 Thanks for using Interactive Analytics!');
    this.rl.close();
    process.exit(0);
  }

  trackCommand(command) {
    this.agent.mixpanel.trackEvent('interactive_command_used', {
      command: command,
      query_number: this.queryCount + 1,
      session_time_elapsed: Date.now() - this.sessionStartTime.getTime(),
      timestamp: new Date().toISOString()
    });
  }

  async processQuery(question) {
    this.queryCount++;
    
    try {
      console.log(`\n🧠 Processing: "${question}"\n`);
      
      // Track query start
      this.agent.mixpanel.trackEvent('interactive_query_started', {
        question: question,
        query_number: this.queryCount,
        question_length: question.length,
        question_type: this.categorizeQuestion(question),
        timestamp: new Date().toISOString()
      });
      
      const startTime = Date.now();
      
      // Use the ProductAnalyticsAgent's mixpanel interface for natural language queries
      const result = await this.agent.mixpanel.query({
        natural_language: question
      });

      const processingTime = Date.now() - startTime;

      // Display results based on type
      this.displayQueryResult(result);

      // Check if this generates insights
      const insights = this.generateInsightsFromResult(result, question);
      
      // Track query completion
      this.agent.mixpanel.trackEvent('interactive_query_completed', {
        question: question,
        query_number: this.queryCount,
        response_type: result.type,
        processing_time_ms: processingTime,
        insights_generated: insights.length,
        had_data: result.type !== 'general_response',
        timestamp: new Date().toISOString()
      });

      if (insights.length > 0) {
        console.log('\n💡 GENERATED INSIGHTS:');
        insights.forEach((insight, i) => {
          console.log(`\n${i + 1}. ${insight.discovery}`);
          console.log(`   Confidence: ${(insight.confidence * 100).toFixed(1)}%`);
          console.log(`   Recommendation: ${insight.recommendation}`);
          console.log(`   Expected Impact: ${insight.expectedImpact}`);
        });

        // Track insights shown to user
        this.agent.mixpanel.trackEvent('interactive_insights_displayed', {
          question: question,
          insights_count: insights.length,
          average_confidence: insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length,
          insight_types: insights.map(i => i.type || 'unknown'),
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.log(`❌ Error processing query: ${error.message}`);
      
      // Track errors
      this.agent.mixpanel.trackEvent('interactive_query_error', {
        question: question,
        error_message: error.message,
        query_number: this.queryCount,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('\n' + '─'.repeat(50) + '\n');
  }

  categorizeQuestion(question) {
    const lowerQ = question.toLowerCase();
    if (lowerQ.includes('user') || lowerQ.includes('how many')) return 'user_metrics';
    if (lowerQ.includes('revenue') || lowerQ.includes('money') || lowerQ.includes('mrr')) return 'revenue';
    if (lowerQ.includes('feature') || lowerQ.includes('adoption')) return 'features';
    if (lowerQ.includes('retention') || lowerQ.includes('stay')) return 'retention';
    if (lowerQ.includes('growth') || lowerQ.includes('trend')) return 'growth';
    if (lowerQ.includes('nps') || lowerQ.includes('satisfaction') || lowerQ.includes('health')) return 'health';
    if (lowerQ.includes('competitor') || lowerQ.includes('market')) return 'competitive';
    if (lowerQ.includes('performance') || lowerQ.includes('speed')) return 'performance';
    if (lowerQ.includes('support') || lowerQ.includes('ticket')) return 'support';
    if (lowerQ.includes('conversion') || lowerQ.includes('trial') || lowerQ.includes('paid')) return 'conversion';
    return 'general';
  }

  displayQueryResult(result) {
    if (!result.type) {
      console.log('📝 Response:', JSON.stringify(result, null, 2));
      return;
    }

    console.log('📊 QUERY RESULTS:\n');

    switch (result.type) {
      case 'user_metrics':
        console.log('👥 USER METRICS:');
        console.log(`   Total Users: ${result.total_users.toLocaleString()}`);
        console.log(`   Active Users (30d): ${result.active_users_30d.toLocaleString()}`);
        console.log(`   New Users (30d): ${result.new_users_30d.toLocaleString()}`);
        console.log(`   Growth Rate: ${(result.growth_rate * 100).toFixed(1)}%`);
        console.log('\n   📊 User Segments:');
        console.log(`     Freemium: ${result.user_segments.freemium.toLocaleString()}`);
        console.log(`     Premium: ${result.user_segments.premium.toLocaleString()}`);
        console.log(`     Enterprise: ${result.user_segments.enterprise.toLocaleString()}`);
        if (result.geographic_distribution) {
          console.log('\n   🌍 Geographic Distribution:');
          Object.entries(result.geographic_distribution).forEach(([region, count]) => {
            console.log(`     ${region}: ${count.toLocaleString()}`);
          });
        }
        break;

      case 'revenue_metrics':
        console.log('💰 REVENUE METRICS:');
        console.log(`   MRR: $${result.mrr.toLocaleString()}`);
        console.log(`   ARR: $${result.arr.toLocaleString()}`);
        console.log(`   Revenue Growth: ${(result.revenue_growth * 100).toFixed(1)}%`);
        console.log(`   ARPU: $${result.avg_revenue_per_user}`);
        console.log(`   LTV: $${result.ltv}`);
        console.log(`   Churn Rate: ${(result.churn_rate * 100).toFixed(1)}%`);
        console.log('\n   💵 Revenue by Segment:');
        console.log(`     Premium: $${result.revenue_by_segment.premium.toLocaleString()}`);
        console.log(`     Enterprise: $${result.revenue_by_segment.enterprise.toLocaleString()}`);
        if (result.expansion_revenue) {
          console.log(`   📈 Expansion Revenue: $${result.expansion_revenue.toLocaleString()}`);
        }
        break;

      case 'engagement_metrics':
        console.log('📈 ENGAGEMENT METRICS:');
        console.log(`   Daily Active Users: ${result.daily_active_users.toLocaleString()}`);
        console.log(`   Weekly Active Users: ${result.weekly_active_users.toLocaleString()}`);
        console.log(`   Monthly Active Users: ${result.monthly_active_users.toLocaleString()}`);
        console.log(`   Avg Session Duration: ${result.avg_session_duration} minutes`);
        console.log(`   Bounce Rate: ${(result.bounce_rate * 100).toFixed(1)}%`);
        console.log(`   Pages per Session: ${result.pages_per_session}`);
        console.log(`   Engagement Score: ${result.engagement_score}/10`);
        console.log(`   Power Users: ${result.power_users.toLocaleString()}`);
        console.log(`   Top Engaged Features: ${result.top_engaged_features.join(', ')}`);
        break;

      case 'growth_metrics':
        console.log('🚀 GROWTH METRICS:');
        console.log(`   User Growth Rate: ${(result.user_growth_rate * 100).toFixed(1)}%`);
        console.log(`   Revenue Growth Rate: ${(result.revenue_growth_rate * 100).toFixed(1)}%`);
        console.log(`   Month-over-Month: ${(result.month_over_month * 100).toFixed(1)}%`);
        console.log(`   Quarter-over-Quarter: ${(result.quarter_over_quarter * 100).toFixed(1)}%`);
        console.log(`   Signup Trend: ${result.signup_trend}`);
        console.log(`   Churn Trend: ${result.churn_trend}`);
        console.log(`   Viral Coefficient: ${result.viral_coefficient}`);
        console.log(`   Growth Drivers: ${result.growth_drivers.join(', ')}`);
        break;

      case 'feature_adoption':
        console.log('🎯 FEATURE ADOPTION:');
        result.topFeatures.forEach((feature, i) => {
          console.log(`   ${i + 1}. ${feature.name}: ${(feature.adoption_rate * 100).toFixed(1)}% (${feature.satisfaction}/5 ⭐)`);
        });
        if (result.underused) {
          console.log(`\n⚠️  Underutilized: ${result.underused} feature needs attention`);
        }
        if (result.fastest_growing) {
          console.log(`🚀 Fastest Growing: ${result.fastest_growing}`);
        }
        if (result.most_valuable) {
          console.log(`💎 Most Valuable: ${result.most_valuable}`);
        }
        break;

      case 'retention_metrics':
        console.log('🔄 RETENTION METRICS:');
        console.log(`   Key Driver: ${result.topAction}`);
        console.log(`   Correlation Strength: ${(result.correlationStrength * 100).toFixed(1)}%`);
        console.log(`   Retention Lift: ${result.retentionLift}x improvement`);
        console.log(`   Day 1 Retention: ${(result.day1_retention * 100).toFixed(1)}%`);
        console.log(`   Day 7 Retention: ${(result.day7_retention * 100).toFixed(1)}%`);
        console.log(`   Day 30 Retention: ${(result.day30_retention * 100).toFixed(1)}%`);
        if (result.retention_drivers) {
          console.log('\n   🎯 Top Retention Drivers:');
          result.retention_drivers.slice(0, 3).forEach((driver, i) => {
            console.log(`     ${i + 1}. ${driver.action}: ${driver.impact}x impact`);
          });
        }
        break;

      case 'onboarding_metrics':
        console.log('🎯 ONBOARDING METRICS:');
        console.log(`   Biggest Drop-off: ${result.biggest}`);
        console.log(`   Drop-off Rate: ${(result.dropOffRate * 100).toFixed(1)}%`);
        console.log(`   Completion Rate: ${(result.completion_rate * 100).toFixed(1)}%`);
        console.log(`   Avg Time to Complete: ${result.avg_time_to_complete} minutes`);
        console.log(`   Success Factors: ${result.success_factors.join(', ')}`);
        if (result.onboarding_steps) {
          console.log('\n   📊 Step-by-Step Completion:');
          result.onboarding_steps.forEach(step => {
            console.log(`     ${step.step}: ${(step.completion * 100).toFixed(1)}% (${step.avg_time} min)`);
          });
        }
        break;

      case 'support_metrics':
        console.log('🎧 SUPPORT METRICS:');
        console.log(`   Open Tickets: ${result.open_tickets}`);
        console.log(`   Avg Resolution Time: ${result.avg_resolution_time} hours`);
        console.log(`   Satisfaction Score: ${result.satisfaction_score}/5`);
        console.log(`   Response Time: ${result.response_time} hours`);
        console.log(`   Escalation Rate: ${(result.escalation_rate * 100).toFixed(1)}%`);
        console.log(`   Top Issues: ${result.top_issues.join(', ')}`);
        if (result.ticket_categories) {
          console.log('\n   📋 Ticket Categories:');
          Object.entries(result.ticket_categories).forEach(([category, count]) => {
            console.log(`     ${category}: ${count}`);
          });
        }
        break;

      case 'conversion_metrics':
        console.log('🎯 CONVERSION METRICS:');
        console.log(`   Trial to Paid: ${(result.trial_to_paid * 100).toFixed(1)}%`);
        console.log(`   Signup to Activation: ${(result.signup_to_activation * 100).toFixed(1)}%`);
        console.log(`   Freemium to Premium: ${(result.freemium_to_premium * 100).toFixed(1)}%`);
        console.log(`   Visitor to Signup: ${(result.visitor_to_signup * 100).toFixed(2)}%`);
        console.log('\n   📊 Conversion Funnel:');
        console.log(`     Visitors: ${result.conversion_funnel.visitors.toLocaleString()}`);
        console.log(`     Signups: ${result.conversion_funnel.signups.toLocaleString()}`);
        console.log(`     Activated: ${result.conversion_funnel.activated.toLocaleString()}`);
        console.log(`     Trial: ${result.conversion_funnel.trial.toLocaleString()}`);
        console.log(`     Paid: ${result.conversion_funnel.paid.toLocaleString()}`);
        break;

      case 'performance_metrics':
        console.log('⚡ PERFORMANCE METRICS:');
        console.log(`   Avg Page Load: ${result.avg_page_load}s`);
        console.log(`   API Response Time: ${result.api_response_time}ms`);
        console.log(`   Uptime: ${(result.uptime * 100).toFixed(2)}%`);
        console.log(`   Error Rate: ${(result.error_rate * 100).toFixed(3)}%`);
        console.log(`   Performance Score: ${result.performance_score}/100`);
        if (result.core_web_vitals) {
          console.log('\n   🌐 Core Web Vitals:');
          console.log(`     LCP: ${result.core_web_vitals.lcp}s`);
          console.log(`     FID: ${result.core_web_vitals.fid}ms`);
          console.log(`     CLS: ${result.core_web_vitals.cls}`);
        }
        break;

      case 'competitive_metrics':
        console.log('🥊 COMPETITIVE METRICS:');
        console.log(`   Market Share: ${(result.market_share * 100).toFixed(1)}%`);
        console.log(`   Win Rate: ${(result.win_loss_analysis.win_rate * 100).toFixed(1)}%`);
        console.log('\n   📊 Competitor Comparison:');
        console.log(`     Feature Parity: ${(result.competitor_comparison.feature_parity * 100).toFixed(1)}%`);
        console.log(`     Pricing Competitiveness: ${(result.competitor_comparison.pricing_competitiveness * 100).toFixed(1)}%`);
        console.log(`     User Satisfaction: ${(result.competitor_comparison.user_satisfaction * 100).toFixed(1)}%`);
        console.log('\n   🏆 Top Win Reasons:');
        result.win_loss_analysis.top_win_reasons.forEach((reason, i) => {
          console.log(`     ${i + 1}. ${reason}`);
        });
        break;

      case 'product_health':
        console.log('🏥 PRODUCT HEALTH:');
        console.log(`   Overall Score: ${result.overall_score}/100`);
        console.log(`   User Satisfaction: ${result.user_satisfaction}/5`);
        console.log(`   NPS Score: ${result.nps_score}`);
        console.log(`   Product-Market Fit: ${(result.product_market_fit * 100).toFixed(1)}%`);
        console.log(`   Technical Debt: ${(result.technical_debt_score * 100).toFixed(1)}%`);
        console.log(`   Innovation Index: ${(result.innovation_index * 100).toFixed(1)}%`);
        console.log(`   Time to Value: ${result.time_to_value} days`);
        break;

      case 'general_response':
        console.log(`📝 ${result.message}`);
        if (result.suggestions) {
          console.log('\n💡 Try asking:');
          result.suggestions.forEach(suggestion => {
            console.log(`   • "${suggestion}"`);
          });
        }
        break;

      default:
        console.log('Raw data:', JSON.stringify(result, null, 2));
    }
  }

  generateInsightsFromResult(result, question) {
    const insights = [];

    // Generate insights based on the result type
    switch (result.type) {
      case 'user_metrics':
        if (result.growth_rate > 0.1) {
          insights.push({
            discovery: `Strong user growth at ${(result.growth_rate * 100).toFixed(1)}% indicates healthy market demand`,
            confidence: 0.87,
            recommendation: 'Invest in user acquisition channels that are working',
            expectedImpact: '+25% user growth acceleration'
          });
        }
        break;

      case 'revenue_metrics':
        if (result.revenue_growth > 0.1) {
          insights.push({
            discovery: `Revenue growing at ${(result.revenue_growth * 100).toFixed(1)}% shows strong product-market fit`,
            confidence: 0.91,
            recommendation: 'Focus on upselling existing customers to premium tiers',
            expectedImpact: '+20% revenue growth'
          });
        }
        break;

      case 'retention_metrics':
        if (result.topAction) {
          insights.push({
            discovery: `Users who ${result.topAction} retain ${result.retentionLift}x better`,
            confidence: 0.89,
            recommendation: `Prompt all users to ${result.topAction} in first session`,
            expectedImpact: '+15% 30-day retention'
          });
        }
        break;

      case 'onboarding_metrics':
        if (result.dropOffRate > 0.3) {
          insights.push({
            discovery: `${(result.dropOffRate * 100).toFixed(0)}% drop-off at ${result.biggest} is limiting activation`,
            confidence: 0.92,
            recommendation: `Simplify ${result.biggest} to reduce friction`,
            expectedImpact: '+38% activation rate'
          });
        }
        break;

      case 'feature_adoption':
        if (result.underused) {
          insights.push({
            discovery: `${result.underused} feature is underutilized but drives engagement`,
            confidence: 0.85,
            recommendation: `Add tutorial for ${result.underused} in onboarding`,
            expectedImpact: '+23% daily active users'
          });
        }
        break;

      case 'product_health':
        if (result.nps_score < 50) {
          insights.push({
            discovery: `NPS score of ${result.nps_score} indicates room for improvement in user satisfaction`,
            confidence: 0.88,
            recommendation: 'Focus on addressing top user pain points and feature requests',
            expectedImpact: '+15 point NPS improvement'
          });
        }
        break;

      case 'competitive_metrics':
        if (result.win_loss_analysis.win_rate < 0.4) {
          insights.push({
            discovery: `Win rate of ${(result.win_loss_analysis.win_rate * 100).toFixed(1)}% suggests competitive disadvantages`,
            confidence: 0.86,
            recommendation: 'Address top loss reasons and strengthen win factors',
            expectedImpact: '+10% win rate improvement'
          });
        }
        break;
    }

    return insights;
  }

  async runFullAnalysis() {
    console.log('\n🎯 Running full behavior analysis...\n');
    
    // Track full analysis start
    this.agent.mixpanel.trackEvent('interactive_full_analysis_started', {
      query_number: this.queryCount,
      timestamp: new Date().toISOString()
    });
    
    const startTime = Date.now();
    const analysis = await this.agent.analyzeUserBehavior();
    const analysisTime = Date.now() - startTime;
    
    console.log('📊 === FULL ANALYSIS RESULTS ===\n');
    
    console.log('💡 INSIGHTS DISCOVERED:');
    analysis.insights.forEach((insight, i) => {
      console.log(`\n${i + 1}. ${insight.discovery}`);
      console.log(`   Confidence: ${(insight.confidence * 100).toFixed(1)}%`);
      console.log(`   Recommendation: ${insight.recommendation}`);
      console.log(`   Expected Impact: ${insight.expectedImpact}`);
    });

    console.log('\n📋 EXECUTIVE SUMMARY:');
    console.log(`   Total Insights: ${analysis.summary.totalInsights}`);
    console.log(`   Average Confidence: ${analysis.summary.averageConfidence}`);
    console.log(`   Top Recommendation: ${analysis.summary.topRecommendation}`);

    console.log('\n📊 METRICS:');
    console.log(`   Adoption Health: ${analysis.metrics.adoptionHealth}`);
    console.log(`   Retention Strength: ${(analysis.metrics.retentionStrength * 100).toFixed(1)}%`);
    console.log(`   Onboarding Efficiency: ${(analysis.metrics.onboardingEfficiency * 100).toFixed(1)}%`);
    
    // Track full analysis completion
    this.agent.mixpanel.trackEvent('interactive_full_analysis_completed', {
      analysis_time_ms: analysisTime,
      insights_generated: analysis.insights.length,
      average_confidence: parseFloat(analysis.summary.averageConfidence.replace('%', '')),
      timestamp: new Date().toISOString()
    });
    
    console.log('\n' + '═'.repeat(50) + '\n');
  }

  showHelp() {
    console.log('\n💡 AVAILABLE COMMANDS:');
    console.log('   analyze    - Run full ProductAnalyticsAgent.analyzeUserBehavior()');
    console.log('   help       - Show this help message');
    console.log('   exit       - Quit the interactive session');
    console.log('\n🧠 EXAMPLE QUESTIONS:');
    console.log('   "How many users do we have?"');
    console.log('   "What is our monthly revenue?"');
    console.log('   "Which features are most popular?"');
    console.log('   "What drives user retention?"');
    console.log('   "Where do users drop off in onboarding?"');
    console.log('   "How is our growth trending?"');
    console.log('   "What are our conversion rates?"');
    console.log('   "How is our app performance?"');
    console.log('   "What support issues are we seeing?"');
    console.log('   "What is our NPS score?"');
    console.log('   "How do we compare to competitors?"');
    console.log('   "What is our product health score?"');
    console.log('');
  }
}

// Start the interactive session
const interactive = new InteractiveAnalytics();
interactive.start(); 