# AI Agent API Documentation

## Overview

This document describes the REST API endpoints for the AI Agent system. The API provides access to prompts, tools, and evaluation functionalities.

## Base URL

```
https://api.aiagent.com/v1
```

## Authentication

All API requests require authentication using a JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## Endpoints

### Prompts

#### GET /prompts

Retrieve available prompts.

Query Parameters:
- `category` (optional): Filter prompts by category
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page

Response:
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "category": "string",
      "template": "string",
      "variables": [
        {
          "name": "string",
          "type": "string",
          "required": boolean,
          "description": "string"
        }
      ],
      "version": "string",
      "updatedAt": "string"
    }
  ],
  "metadata": {
    "page": number,
    "limit": number,
    "total": number
  }
}
```

### Tools

#### POST /tools/execute

Execute a tool with parameters.

Request Body:
```json
{
  "toolId": "string",
  "params": {
    "key": "value"
  }
}
```

Response:
```json
{
  "result": "string",
  "metadata": {
    "duration": number,
    "status": "string"
  }
}
```

### Evaluations

#### POST /evaluations

Create a new evaluation.

Request Body:
```json
{
  "promptId": "string",
  "response": "string"
}
```

Response:
```json
{
  "id": "string",
  "scores": {
    "accuracy": {
      "score": number,
      "feedback": "string"
    },
    "clarity": {
      "score": number,
      "feedback": "string"
    }
  },
  "suggestions": ["string"],
  "metadata": {
    "modelUsed": "string",
    "confidence": number,
    "evaluationTime": number
  }
}
```

## Error Handling

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "message": "string",
  "code": "string",
  "details": {
    "key": "value"
  }
}
```

Common error codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Rate Limiting

API requests are limited to:
- 100 requests per minute per IP
- 1000 requests per hour per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
``` 