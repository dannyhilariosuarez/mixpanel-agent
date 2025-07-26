import mixpanel from 'mixpanel';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Analytics Agent - Post & Upload Event Tracking
 * 
 * Tracks only two types of user actions:
 * 1. Post events (user creates content)
 * 2. Upload events (user uploads files)
 */

class ProductAnalyticsAgent {
  constructor() {
    this.mixpanel = mixpanel.init(process.env.MIXPANEL_PROJECT_TOKEN, {
      secret: process.env.MIXPANEL_API_SECRET
    });
    
    // In-memory event store (use Redis/Database in production)
    this.events = [];
    this.users = new Map(); // userId -> user profile
    
    this.trackEvent('analytics_agent_initialized', {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      tracking_events: ['post', 'upload']
    });
    
    console.log('🎯 Analytics Agent initialized - Tracking: POST & UPLOAD events');
  }

  // === CORE EVENT TRACKING ===

  /**
   * Track any event
   */
  track(eventName, properties = {}, userId = null) {
    const event = {
      event: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        session_id: this.getSessionId(userId),
        user_id: userId
      },
      user_id: userId,
      timestamp: Date.now()
    };

    // Store event locally
    this.events.push(event);

    // Send to Mixpanel
    this.sendToMixpanel(event);

    // Update user profile
    if (userId) {
      this.updateUserProfile(userId, event);
    }

    console.log(`📊 Tracked: ${eventName}`, properties);
    return event;
  }

  /**
   * Track post creation events
   */
  trackPost(userId, postType = 'text', additionalProps = {}) {
    return this.track('post_created', {
      post_type: postType,
      content_category: additionalProps.category || 'general',
      ...additionalProps
    }, userId);
  }

  /**
   * Track file upload events
   */
  trackUpload(userId, fileType = 'unknown', additionalProps = {}) {
    return this.track('file_uploaded', {
      file_type: fileType,
      file_size: additionalProps.size || 0,
      upload_method: additionalProps.method || 'direct',
      ...additionalProps
    }, userId);
  }

  // === ANALYTICS ===

  /**
   * Analyze post and upload behavior
   */
  async analyzeUserBehavior(userId = null) {
    console.log('🔍 Analyzing post & upload behavior...');
    
    const userEvents = userId ? 
      this.events.filter(e => e.user_id === userId) : 
      this.events;

    if (userEvents.length === 0) {
      return {
        insights: [],
        summary: { message: 'No post or upload events tracked yet' },
        metrics: { totalEvents: 0, uniqueUsers: 0, posts: 0, uploads: 0 }
      };
    }

    const posts = userEvents.filter(e => e.event === 'post_created');
    const uploads = userEvents.filter(e => e.event === 'file_uploaded');

    const analysis = {
      totalEvents: userEvents.length,
      uniqueUsers: new Set(userEvents.map(e => e.user_id)).size,
      posts: {
        total: posts.length,
        types: this.getPostTypeAnalysis(posts),
        categories: this.getPostCategoryAnalysis(posts)
      },
      uploads: {
        total: uploads.length,
        fileTypes: this.getFileTypeAnalysis(uploads),
        averageSize: this.getAverageFileSize(uploads)
      },
      userActivity: this.getUserActivityAnalysis(userEvents),
      timePatterns: this.getTimePatterns(userEvents)
    };

    const insights = this.generateInsights(analysis);

    return {
      insights,
      summary: this.generateSummary(analysis),
      metrics: {
        totalEvents: analysis.totalEvents,
        uniqueUsers: analysis.uniqueUsers,
        posts: analysis.posts.total,
        uploads: analysis.uploads.total,
        postToUploadRatio: analysis.uploads.total > 0 ? 
          (analysis.posts.total / analysis.uploads.total).toFixed(2) : 'N/A'
      },
      rawAnalysis: analysis
    };
  }

  getPostTypeAnalysis(posts) {
    const types = {};
    posts.forEach(post => {
      const type = post.properties.post_type;
      types[type] = (types[type] || 0) + 1;
    });
    return Object.entries(types)
      .map(([type, count]) => ({ type, count, percentage: ((count / posts.length) * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count);
  }

  getPostCategoryAnalysis(posts) {
    const categories = {};
    posts.forEach(post => {
      const category = post.properties.content_category;
      categories[category] = (categories[category] || 0) + 1;
    });
    return Object.entries(categories)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  getFileTypeAnalysis(uploads) {
    const types = {};
    uploads.forEach(upload => {
      const type = upload.properties.file_type;
      types[type] = (types[type] || 0) + 1;
    });
    return Object.entries(types)
      .map(([type, count]) => ({ type, count, percentage: ((count / uploads.length) * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count);
  }

  getAverageFileSize(uploads) {
    if (uploads.length === 0) return 0;
    const totalSize = uploads.reduce((sum, upload) => sum + (upload.properties.file_size || 0), 0);
    return Math.round(totalSize / uploads.length);
  }

  getUserActivityAnalysis(events) {
    const userActivity = {};
    events.forEach(event => {
      if (!event.user_id) return;
      if (!userActivity[event.user_id]) {
        userActivity[event.user_id] = { posts: 0, uploads: 0, total: 0 };
      }
      if (event.event === 'post_created') userActivity[event.user_id].posts++;
      if (event.event === 'file_uploaded') userActivity[event.user_id].uploads++;
      userActivity[event.user_id].total++;
    });

    const activities = Object.values(userActivity);
    return {
      averagePostsPerUser: activities.length > 0 ? 
        (activities.reduce((sum, a) => sum + a.posts, 0) / activities.length).toFixed(1) : 0,
      averageUploadsPerUser: activities.length > 0 ? 
        (activities.reduce((sum, a) => sum + a.uploads, 0) / activities.length).toFixed(1) : 0,
      mostActiveUsers: Object.entries(userActivity)
        .sort(([,a], [,b]) => b.total - a.total)
        .slice(0, 5)
        .map(([userId, activity]) => ({ userId, ...activity }))
    };
  }

  getTimePatterns(events) {
    const hourlyActivity = new Array(24).fill(0);
    events.forEach(event => {
      const hour = new Date(event.properties.timestamp).getHours();
      hourlyActivity[hour]++;
    });
    const peakHour = hourlyActivity.indexOf(Math.max(...hourlyActivity));
    
    return {
      peakHour,
      hourlyDistribution: hourlyActivity
    };
  }

  generateInsights(analysis) {
    const insights = [];

    // Post vs Upload ratio insight
    if (analysis.posts.total > 0 && analysis.uploads.total > 0) {
      const ratio = analysis.posts.total / analysis.uploads.total;
      if (ratio > 3) {
        insights.push({
          type: 'content_balance',
          discovery: `Users create ${ratio.toFixed(1)}x more posts than uploads`,
          recommendation: 'Consider promoting file upload features to increase engagement',
          confidence: 0.85
        });
      } else if (ratio < 0.5) {
        insights.push({
          type: 'content_balance',
          discovery: `Users upload ${(1/ratio).toFixed(1)}x more files than creating posts`,
          recommendation: 'Encourage more post creation to balance content types',
          confidence: 0.85
        });
      }
    }

    // Popular content types
    if (analysis.posts.types.length > 0) {
      const topPostType = analysis.posts.types[0];
      insights.push({
        type: 'content_preference',
        discovery: `${topPostType.type} posts are most popular (${topPostType.percentage}%)`,
        recommendation: `Optimize ${topPostType.type} post creation experience`,
        confidence: 0.90
      });
    }

    // File type patterns
    if (analysis.uploads.fileTypes.length > 0) {
      const topFileType = analysis.uploads.fileTypes[0];
      insights.push({
        type: 'upload_preference',
        discovery: `${topFileType.type} files are most commonly uploaded (${topFileType.percentage}%)`,
        recommendation: `Optimize ${topFileType.type} upload experience and storage`,
        confidence: 0.88
      });
    }

    // Activity timing
    if (analysis.timePatterns.peakHour !== -1) {
      insights.push({
        type: 'timing',
        discovery: `Peak activity occurs at ${analysis.timePatterns.peakHour}:00`,
        recommendation: `Schedule maintenance outside peak hours, optimize performance at ${analysis.timePatterns.peakHour}:00`,
        confidence: 0.75
      });
    }

    return insights;
  }

  generateSummary(analysis) {
    return {
      totalActivity: `${analysis.totalEvents} total events from ${analysis.uniqueUsers} users`,
      contentBreakdown: `${analysis.posts.total} posts, ${analysis.uploads.total} uploads`,
      topPostType: analysis.posts.types[0]?.type || 'N/A',
      topFileType: analysis.uploads.fileTypes[0]?.type || 'N/A',
      averageFileSize: `${Math.round(analysis.uploads.averageSize / 1024)}KB` || '0KB'
    };
  }

  // === HELPER METHODS ===

  sendToMixpanel(event) {
    try {
      if (this.mixpanel && process.env.MIXPANEL_PROJECT_TOKEN && 
          process.env.MIXPANEL_PROJECT_TOKEN !== 'your_mixpanel_project_token_here') {
        this.mixpanel.track(event.event, event.properties);
      }
    } catch (error) {
      console.log(`⚠️ Mixpanel tracking error: ${error.message}`);
    }
  }

  trackEvent(eventName, properties = {}) {
    this.track(eventName, properties);
  }

  updateUserProfile(userId, event) {
    if (!this.users.has(userId)) {
      this.users.set(userId, {
        firstSeen: Date.now(),
        events: [],
        posts: 0,
        uploads: 0
      });
    }
    
    const user = this.users.get(userId);
    user.events.push(event);
    user.lastSeen = Date.now();
    
    if (event.event === 'post_created') user.posts++;
    if (event.event === 'file_uploaded') user.uploads++;
  }

  getSessionId(userId) {
    if (userId && this.users.has(userId)) {
      return `session_${userId}_${Date.now()}`;
    }
    return `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getMetrics() {
    const posts = this.events.filter(e => e.event === 'post_created');
    const uploads = this.events.filter(e => e.event === 'file_uploaded');
    
    return {
      totalEvents: this.events.length,
      posts: posts.length,
      uploads: uploads.length,
      uniqueUsers: new Set(this.events.map(e => e.user_id).filter(Boolean)).size,
      lastActivity: this.events.length > 0 ? 
        new Date(this.events[this.events.length - 1].properties.timestamp).toISOString() : null
    };
  }
}

export default ProductAnalyticsAgent; 