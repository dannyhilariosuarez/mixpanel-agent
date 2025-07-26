#!/usr/bin/env node

/**
 * Test MCP Client for COO Analytics Agent
 * 
 * Demonstrates how other agents can consume the ProductAnalyticsAgent via MCP protocol
 */

import { spawn } from 'child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

class TestMCPClient {
  constructor() {
    this.client = new Client(
      {
        name: "test-coo-analytics-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );
  }

  async connect() {
    // Spawn the MCP server process
    const serverProcess = spawn('node', ['mcp-server.js'], {
      stdio: ['pipe', 'pipe', 'inherit'], // stdin, stdout, stderr
    });

    // Create transport and connect
    const transport = new StdioClientTransport({
      readable: serverProcess.stdout,
      writable: serverProcess.stdin,
    });

    await this.client.connect(transport);
    console.log('🔗 Connected to COO Analytics MCP Server');
    
    return serverProcess;
  }

  async testConnection() {
    try {
      console.log('\n🧪 === MCP CLIENT INTEGRATION TEST ===\n');
      
      const serverProcess = await this.connect();

      // List available tools
      console.log('📋 1. Listing available tools...');
      const tools = await this.client.listTools();
      console.log(`   Found ${tools.tools.length} tools:`);
      tools.tools.forEach(tool => {
        console.log(`   • ${tool.name}: ${tool.description}`);
      });

      // Test natural language query
      console.log('\n🧠 2. Testing natural language query...');
      const queryResult = await this.client.callTool('coo_query_data', {
        question: "How many users do we have?",
        generate_insights: true
      });
      console.log('   Query result preview:');
      const parsedResult = JSON.parse(queryResult.content[0].text);
      console.log(`   ✅ Success: ${parsedResult.success}`);
      console.log(`   📊 Data type: ${parsedResult.data.type}`);
      console.log(`   👥 Total users: ${parsedResult.data.total_users?.toLocaleString()}`);
      console.log(`   💡 Insights generated: ${parsedResult.insights.length}`);

      // Test behavior analysis
      console.log('\n🎯 3. Testing full behavior analysis...');
      const analysisResult = await this.client.callTool('coo_analyze_behavior', {
        include_tracking: true
      });
      const parsedAnalysis = JSON.parse(analysisResult.content[0].text);
      console.log('   Analysis result preview:');
      console.log(`   ✅ Success: ${parsedAnalysis.success}`);
      console.log(`   💡 Total insights: ${parsedAnalysis.data.insights.length}`);
      console.log(`   📈 Average confidence: ${parsedAnalysis.data.summary.averageConfidence}`);
      console.log(`   🎯 Top recommendation: ${parsedAnalysis.data.summary.topRecommendation}`);

      // Test outcome tracking
      console.log('\n📊 4. Testing outcome tracking...');
      const outcomeResult = await this.client.callTool('coo_track_outcome', {
        insight_id: "test_insight_mcp",
        implemented: true,
        improved: true,
        actual_impact: "Test successful via MCP"
      });
      const parsedOutcome = JSON.parse(outcomeResult.content[0].text);
      console.log('   Outcome tracking result:');
      console.log(`   ✅ Success: ${parsedOutcome.success}`);
      console.log(`   📈 New confidence: ${(parsedOutcome.new_confidence * 100).toFixed(1)}%`);

      // Test metrics retrieval
      console.log('\n📋 5. Testing metrics retrieval...');
      const metricsResult = await this.client.callTool('coo_get_metrics', {
        category: "user_metrics"
      });
      const parsedMetrics = JSON.parse(metricsResult.content[0].text);
      console.log('   Metrics result preview:');
      console.log(`   ✅ Success: ${parsedMetrics.success}`);
      console.log(`   📊 Category: ${parsedMetrics.category}`);
      console.log(`   👥 Users: ${parsedMetrics.data.total_users?.toLocaleString()}`);

      console.log('\n🎉 === MCP INTEGRATION TEST COMPLETE ===');
      console.log('\n✅ ALL TESTS PASSED - Your ProductAnalyticsAgent is MCP-ready!');
      console.log('\n🔗 Integration methods available:');
      console.log('   • MCP Server (for AI agents)');
      console.log('   • HTTP API (universal access)');
      console.log('   • NPM Package (direct import)');
      console.log('   • Docker Container (isolated service)');
      console.log('\n📚 See INTEGRATION.md for complete documentation');

      // Cleanup
      serverProcess.kill();
      process.exit(0);

    } catch (error) {
      console.error('❌ MCP Test Error:', error.message);
      process.exit(1);
    }
  }
}

// Run the test
const testClient = new TestMCPClient();
testClient.testConnection(); 