import ProductAnalyticsAgent from './productAnalyticsAgent.js';

// Initialize the Product Analytics Agent
const agent = new ProductAnalyticsAgent();

// Run the core analysis
console.log('🚀 COO Analytics Agent - AI Product Insights\n');

const analysis = await agent.analyzeUserBehavior();

// Display results
console.log('\n📊 === ANALYSIS RESULTS ===\n');

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

console.log('\n📊 PRODUCT HEALTH METRICS:');
console.log(`   Adoption Health: ${analysis.metrics.adoptionHealth}`);
console.log(`   Retention Strength: ${(analysis.metrics.retentionStrength * 100).toFixed(1)}%`);
console.log(`   Onboarding Efficiency: ${(analysis.metrics.onboardingEfficiency * 100).toFixed(1)}%`);

// Example: Track insight implementation
if (analysis.insights.length > 0) {
  const firstInsight = analysis.insights[0];
  console.log(`\n📈 Tracking implementation outcome...`);
  
  const confidence = await agent.trackOutcome('insight_1', true, { improved: true });
  console.log(`   Updated confidence: ${(confidence * 100).toFixed(1)}%`);
}

console.log('\n✅ Analysis complete');
