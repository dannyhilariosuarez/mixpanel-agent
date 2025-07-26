# 🎯 Event Tracking API

> **HTTP API for tracking POST & UPLOAD events from external applications**

Simple API to track when users create posts and upload files. Analyze content creation patterns and get behavioral insights.

## ✨ Core Features

✅ **HTTP API for Event Tracking** - Track posts and uploads from any application  
✅ **Post Event Tracking** - Track content creation (text, image, video posts)  
✅ **Upload Event Tracking** - Track file uploads (images, documents, videos)  
✅ **Content Analytics** - Analyze post/upload patterns and user behavior  
✅ **User Activity Analysis** - Track individual and aggregate content creation  
✅ **Mixpanel Integration** - All events automatically sent to Mixpanel  

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the API server
npm start
# Server runs on http://localhost:3000
```

## 📡 API Endpoints

### **Track Events:**

```bash
# Track post creation
curl -X POST http://localhost:3000/track/post \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "postType": "text", "properties": {"category": "blog", "title": "My First Post"}}'

# Track file uploads
curl -X POST http://localhost:3000/track/upload \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "fileType": "image", "properties": {"size": 1024000, "method": "drag_drop"}}'
```

### **Get Analytics:**

```bash
# Get content creation analysis for all users
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{}'

# Get analysis for specific user
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123"}'

# Get current metrics
curl http://localhost:3000/metrics

# Health check
curl http://localhost:3000/health

# API documentation
curl http://localhost:3000/docs
```

## 🎯 Integration Examples

### **JavaScript/TypeScript:**

```javascript
const API_BASE = 'http://localhost:3000';

class ContentTracker {
  async trackPost(userId, postType = 'text', properties = {}) {
    const response = await fetch(`${API_BASE}/track/post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, postType, properties })
    });
    return response.json();
  }

  async trackUpload(userId, fileType = 'unknown', properties = {}) {
    const response = await fetch(`${API_BASE}/track/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, fileType, properties })
    });
    return response.json();
  }

  async getAnalytics(userId = null) {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return response.json();
  }
}

// Usage
const tracker = new ContentTracker();
await tracker.trackPost('user123', 'text', { category: 'blog', title: 'Hello World' });
await tracker.trackUpload('user123', 'image', { size: 2048000, format: 'jpg' });
const analytics = await tracker.getAnalytics();
```

### **Python:**

```python
import requests

class ContentTracker:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
    
    def track_post(self, user_id, post_type="text", properties={}):
        response = requests.post(f"{self.base_url}/track/post", json={
            "userId": user_id,
            "postType": post_type,
            "properties": properties
        })
        return response.json()
    
    def track_upload(self, user_id, file_type="unknown", properties={}):
        response = requests.post(f"{self.base_url}/track/upload", json={
            "userId": user_id,
            "fileType": file_type,
            "properties": properties
        })
        return response.json()
    
    def get_analytics(self, user_id=None):
        response = requests.post(f"{self.base_url}/analyze", json={
            "userId": user_id
        })
        return response.json()

# Usage
tracker = ContentTracker()
tracker.track_post("user123", "text", {"category": "blog", "title": "Hello World"})
tracker.track_upload("user123", "image", {"size": 2048000, "format": "jpg"})
analytics = tracker.get_analytics()
```

### **React/Frontend:**

```jsx
import { useCallback } from 'react';

const useContentTracker = () => {
  const trackPost = useCallback(async (postType, properties = {}) => {
    const userId = getCurrentUserId(); // Your user ID logic
    await fetch('http://localhost:3000/track/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, postType, properties })
    });
  }, []);

  const trackUpload = useCallback(async (fileType, properties = {}) => {
    const userId = getCurrentUserId();
    await fetch('http://localhost:3000/track/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, fileType, properties })
    });
  }, []);

  return { trackPost, trackUpload };
};

// Component usage
const PostEditor = () => {
  const { trackPost } = useContentTracker();

  const handlePostSubmit = (postData) => {
    trackPost('text', { 
      category: postData.category, 
      title: postData.title,
      wordCount: postData.content.split(' ').length
    });
    // Your post submission logic
  };

  return <PostForm onSubmit={handlePostSubmit} />;
};

const FileUploader = () => {
  const { trackUpload } = useContentTracker();

  const handleFileUpload = (file) => {
    trackUpload(file.type.split('/')[0], {
      size: file.size,
      format: file.type.split('/')[1],
      method: 'drop_zone'
    });
    // Your upload logic
  };

  return <DropZone onDrop={handleFileUpload} />;
};
```

## 📊 Response Format

All endpoints return JSON responses:

```json
{
  "success": true,
  "event": {
    "event": "post_created",
    "properties": {
      "post_type": "text",
      "content_category": "blog",
      "title": "My First Post",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "session_id": "session_user123_1704110400000",
      "user_id": "user123"
    },
    "user_id": "user123",
    "timestamp": 1704110400000
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "message": "Post event tracked successfully"
}
```

### **Analytics Response:**

```json
{
  "success": true,
  "analysis": {
    "insights": [
      {
        "type": "content_balance",
        "discovery": "Users create 3.2x more posts than uploads",
        "recommendation": "Consider promoting file upload features to increase engagement",
        "confidence": 0.85
      },
      {
        "type": "content_preference", 
        "discovery": "text posts are most popular (78.3%)",
        "recommendation": "Optimize text post creation experience",
        "confidence": 0.90
      }
    ],
    "summary": {
      "totalActivity": "145 total events from 32 users",
      "contentBreakdown": "112 posts, 33 uploads",
      "topPostType": "text",
      "topFileType": "image"
    },
    "metrics": {
      "totalEvents": 145,
      "uniqueUsers": 32,
      "posts": 112,
      "uploads": 33,
      "postToUploadRatio": "3.39"
    }
  }
}
```

## 📈 What Gets Tracked & Analyzed

### **Events Tracked:**
- `post_created` - User created a post (text, image, video, etc.)
- `file_uploaded` - User uploaded a file (image, document, video, etc.)

### **Post Properties:**
- `post_type`: text, image, video, link, poll
- `content_category`: blog, news, personal, business
- `title`, `wordCount`, `hasMedia`

### **Upload Properties:**
- `file_type`: image, document, video, audio
- `file_size`: bytes
- `upload_method`: drag_drop, browse, paste, api

### **Analytics Generated:**
- **Content Balance** - Post vs upload ratios
- **Popular Content Types** - Most common post and file types
- **User Activity Patterns** - Posts and uploads per user
- **Time-based Analysis** - Peak content creation hours
- **Content Preferences** - Category and format preferences

## 📊 Mixpanel Integration

Set up your Mixpanel credentials:

```bash
cp env.example .env
# Edit .env with your MIXPANEL_PROJECT_TOKEN and MIXPANEL_API_SECRET
```

All tracked events are automatically sent to Mixpanel with rich context.

## 🚀 Deployment

```bash
# Start API server
npm start

# Production deployment
PORT=3000 npm start

# Docker
docker build -t content-tracking-api .
docker run -p 3000:3000 content-tracking-api
```

## 📁 Project Structure

- **`api-server.js`** - HTTP API server for external consumption
- **`agent.js`** - Core event tracking and analysis engine
- **`env.example`** - Mixpanel configuration template

---

**Simple content tracking API ready for external consumption!** 🚀

**Track posts & uploads → Analyze content patterns → Optimize content strategy** 🎯 