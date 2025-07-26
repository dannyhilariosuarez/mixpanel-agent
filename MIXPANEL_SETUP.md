# 📊 Mixpanel Analytics Setup Guide

## 🚀 Quick Setup

1. **Copy environment template:**
   ```bash
   cp env.example .env
   ```

2. **Get Mixpanel credentials:**
   - Go to [Mixpanel Project Settings](https://mixpanel.com/settings/project)
   - Copy your **Project Token** and **API Secret**

3. **Update `.env` file:**
   ```bash
   MIXPANEL_PROJECT_TOKEN=your_actual_project_token_here
   MIXPANEL_API_SECRET=your_actual_api_secret_here
   NODE_ENV=development
   ```

4. **Test the connection:**
   ```bash
   npm start
   ```

## 📈 What Gets Tracked

### 🧠 Query Analytics
- **Every user question** with natural language processing
- **Response types** and data categories accessed
- **Processing times** and success rates
- **Smart search usage** for complex queries

### 💡 Insight Generation
- **AI insights generated** with confidence scores
- **Recommendation effectiveness** tracking
- **Pattern learning** from implementation outcomes
- **Executive dashboard** metrics

### 🎯 Interactive Usage
- **Session analytics** (duration, query count, patterns)
- **Command usage** (help, analyze, specific queries)
- **User behavior** in CLI interface
- **Error tracking** for improvements

### 📊 Business Intelligence
- **Data access patterns** by category
- **Popular metrics** and trending questions
- **Feature adoption** analysis requests
- **Competitive analysis** queries

## 🔧 Events Tracked

| Event Name | Description | Key Properties |
|------------|-------------|----------------|
| `coo_analytics_initialized` | Agent startup | version, environment |
| `coo_query_asked` | User asks question | question, length, timestamp |
| `coo_query_answered` | Response provided | response_type, has_insights |
| `coo_data_accessed` | Data category queried | category, metric_type, values |
| `behavior_analysis_started` | Full analysis begins | timestamp |
| `behavior_analysis_completed` | Analysis finished | insights_count, confidence |
| `insight_generated` | AI insight created | type, confidence, recommendation |
| `insight_outcome_tracked` | Implementation result | success_rate, actual_impact |
| `interactive_session_started` | CLI session begins | interface_type |
| `interactive_session_ended` | CLI session ends | duration, query_count |
| `interactive_query_completed` | Interactive query done | processing_time, insights |

## 📋 Example Analytics Dashboard

With these events, you can create Mixpanel dashboards showing:

### 📊 Usage Analytics
- Daily/weekly active COO users
- Most popular business metrics queried
- Average session duration and query count
- Feature adoption analysis requests

### 🎯 AI Performance
- Insight generation success rates
- Confidence score distributions
- Recommendation implementation rates
- Pattern learning effectiveness

### 💼 Business Intelligence
- Which metrics are trending (users asking about growth vs revenue)
- Query complexity (simple vs advanced questions)
- Geographic usage patterns
- Time-based usage (business hours vs off-hours)

## 🔒 Privacy & Security

- **No sensitive business data** is sent to Mixpanel
- Only **metadata and usage patterns** are tracked
- **Questions are anonymized** for analytics
- **Mock data values** are included for analysis trends

## ⚡ Performance

- **Async tracking** - doesn't slow down queries
- **Error handling** - graceful fallback if Mixpanel unavailable
- **Batching** - efficient event delivery
- **Session management** - consistent user journey tracking

## 🛠️ Debugging

Check tracking status:
```bash
# Look for these console messages:
📊 Tracked: coo_query_asked          # Real tracking
📊 Mock Track: coo_query_asked        # No credentials
⚠️  Tracking error: [error message]   # Connection issue
```

## 🎯 Next Steps

1. Set up your Mixpanel account
2. Configure credentials in `.env`
3. Run interactive mode: `npm run interactive`
4. Ask questions and watch the analytics flow!
5. Build Mixpanel dashboards for COO insights

**Your ProductAnalyticsAgent is now a fully tracked, data-driven AI system!** 🏆 