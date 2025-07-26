# 🔗 Integration Guide: How Other Agents Can Consume COO Analytics

Your **ProductAnalyticsAgent** is now available in **4 different ways** for consumption by other AI agents, MCP servers, and applications.

## 🚀 Integration Methods

### 1. 📡 **MCP Server** (Recommended for AI Agents)

**Perfect for:** Claude, GPT, and other AI agents that support MCP protocol

#### **Start MCP Server:**
```bash
npm run mcp-server
# or directly
node mcp-server.js
```

#### **Available MCP Tools:**
- `coo_analyze_behavior` - Full behavior analysis with AI insights
- `coo_query_data` - Natural language business queries  
- `coo_track_outcome` - Track implementation outcomes
- `coo_get_insights` - Retrieve stored insights
- `coo_get_metrics` - Get business metrics by category

#### **Example MCP Usage:**
```json
{
  "method": "tools/call",
  "params": {
    "name": "coo_query_data",
    "arguments": {
      "question": "How many users do we have?",
      "generate_insights": true
    }
  }
}
```

#### **Connect to MCP Server:**
```bash
# Add to your MCP client configuration
{
  "mcpServers": {
    "coo-analytics": {
      "command": "node",
      "args": ["/path/to/coo-analytics-agent/mcp-server.js"]
    }
  }
}
```

---

### 2. 🌐 **HTTP API** (Universal Access)

**Perfect for:** Any agent, web service, or application with HTTP support

#### **Start API Server:**
```bash
npm run api-server
# Server runs on http://localhost:3000
```

#### **Available Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze-behavior` | Run full behavior analysis |
| `POST` | `/api/query` | Natural language queries |
| `POST` | `/api/track-outcome` | Track implementation outcomes |
| `GET` | `/api/insights` | Get stored insights |
| `GET` | `/api/metrics/:category?` | Get business metrics |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/examples` | API documentation |

#### **Example HTTP Requests:**

**Natural Language Query:**
```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -H "X-Agent-ID: my-agent-name" \
  -d '{
    "question": "What is our monthly revenue?",
    "generate_insights": true
  }'
```

**Full Behavior Analysis:**
```bash
curl -X POST http://localhost:3000/api/analyze-behavior \
  -H "Content-Type: application/json" \
  -H "X-Agent-ID: my-agent-name" \
  -d '{"include_tracking": true}'
```

**Get User Metrics:**
```bash
curl http://localhost:3000/api/metrics/user_metrics \
  -H "X-Agent-ID: my-agent-name"
```

#### **Response Format:**
```json
{
  "success": true,
  "question": "How many users do we have?",
  "data": {
    "type": "user_metrics",
    "total_users": 45230,
    "growth_rate": 0.15,
    "...": "..."
  },
  "insights": [
    {
      "discovery": "Strong user growth at 15.0% indicates healthy market demand",
      "confidence": 0.87,
      "recommendation": "Invest in user acquisition channels that are working",
      "expectedImpact": "+25% user growth acceleration"
    }
  ],
  "metadata": {
    "result_type": "user_metrics",
    "insights_count": 1,
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### 3. 📦 **NPM Package Import** (Direct Integration)

**Perfect for:** Node.js applications that want direct code integration

#### **Install as Dependency:**
```bash
npm install /path/to/coo-analytics-agent
# or if published to npm:
# npm install coo-analytics-agent
```

#### **Import and Use:**
```javascript
import ProductAnalyticsAgent from 'coo-analytics-agent';

// Create agent instance
const agent = new ProductAnalyticsAgent();

// Run analysis
const analysis = await agent.analyzeUserBehavior();
console.log('Insights:', analysis.insights);

// Ask natural language questions
const result = await agent.mixpanel.query({
  natural_language: "How many users do we have?"
});
console.log('User data:', result);

// Track implementation outcomes
await agent.trackOutcome('insight_1', true, { improved: true });
```

#### **Available Exports:**
```javascript
// Main agent class
import ProductAnalyticsAgent from 'coo-analytics-agent';

// Specific imports
import ProductAnalyticsAgent from 'coo-analytics-agent/agent';
import MCPServer from 'coo-analytics-agent/mcp';
import APIServer from 'coo-analytics-agent/api';
```

---

### 4. 🐳 **Docker Container** (Isolated Service)

**Perfect for:** Microservices, cloud deployments, isolated environments

#### **Create Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 3000

# For API server
CMD ["npm", "run", "api-server"]

# Or for MCP server
# CMD ["npm", "run", "mcp-server"]
```

#### **Build and Run:**
```bash
# Build image
docker build -t coo-analytics-agent .

# Run API server
docker run -p 3000:3000 -e MIXPANEL_PROJECT_TOKEN=your_token coo-analytics-agent

# Run MCP server
docker run -it coo-analytics-agent npm run mcp-server
```

---

## 🎯 **Integration Examples**

### **Example 1: Claude Desktop MCP Integration**

Add to your Claude Desktop config:
```json
{
  "mcpServers": {
    "coo-analytics": {
      "command": "node",
      "args": ["/path/to/coo-analytics-agent/mcp-server.js"],
      "env": {
        "MIXPANEL_PROJECT_TOKEN": "your_token",
        "MIXPANEL_API_SECRET": "your_secret"
      }
    }
  }
}
```

Then in Claude:
- "Analyze our user behavior patterns"
- "What's our current revenue growth?"
- "Track the outcome of implementing insight_1"

### **Example 2: Python Agent HTTP Integration**

```python
import requests

class COOAnalyticsClient:
    def __init__(self, base_url="http://localhost:3000", agent_id="python-agent"):
        self.base_url = base_url
        self.headers = {"X-Agent-ID": agent_id}
    
    def query(self, question):
        response = requests.post(
            f"{self.base_url}/api/query",
            json={"question": question, "generate_insights": True},
            headers=self.headers
        )
        return response.json()
    
    def analyze_behavior(self):
        response = requests.post(
            f"{self.base_url}/api/analyze-behavior",
            json={"include_tracking": True},
            headers=self.headers
        )
        return response.json()

# Usage
client = COOAnalyticsClient()
result = client.query("How many users do we have?")
print(f"Users: {result['data']['total_users']}")
```

### **Example 3: TypeScript Agent Direct Import**

```typescript
import ProductAnalyticsAgent from 'coo-analytics-agent';

class MyBusinessAgent {
  private analyticsAgent: ProductAnalyticsAgent;
  
  constructor() {
    this.analyticsAgent = new ProductAnalyticsAgent();
  }
  
  async getDashboardData() {
    // Get comprehensive analysis
    const analysis = await this.analyticsAgent.analyzeUserBehavior();
    
    // Get specific metrics
    const userMetrics = await this.analyticsAgent.mixpanel.query({
      natural_language: "How many users do we have?"
    });
    
    return {
      insights: analysis.insights,
      userCount: userMetrics.total_users,
      confidence: analysis.summary.averageConfidence
    };
  }
}
```

## 📊 **Analytics Tracking**

All integration methods automatically track usage to your Mixpanel dashboard:

- **MCP calls** → `mcp_behavior_analysis_requested`, `mcp_query_completed`
- **API requests** → `api_request`, `api_query_completed`  
- **Direct imports** → Standard agent tracking events

## 🔒 **Authentication & Security**

### **API Keys (Optional):**
Add to your API server:
```javascript
// Simple API key authentication
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.COO_ANALYTICS_API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
});
```

### **Rate Limiting:**
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## 🎯 **Quick Start Templates**

### **MCP Client Template:**
```javascript
// For any MCP-compatible agent
const tools = await mcpClient.listTools();
const result = await mcpClient.callTool('coo_query_data', {
  question: "What drives user retention?"
});
```

### **HTTP Client Template:**
```javascript
// For any HTTP-capable agent
const response = await fetch('http://localhost:3000/api/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Agent-ID': 'my-agent' },
  body: JSON.stringify({ question: "What drives user retention?" })
});
```

### **Direct Import Template:**
```javascript
// For Node.js applications
import ProductAnalyticsAgent from 'coo-analytics-agent';
const agent = new ProductAnalyticsAgent();
const insights = await agent.analyzeUserBehavior();
```

---

**Your ProductAnalyticsAgent is now ready for consumption by any AI agent or service!** 🚀

Choose the integration method that best fits your architecture:
- **MCP** for AI agents
- **HTTP API** for universal access
- **NPM import** for direct integration
- **Docker** for isolated deployments 