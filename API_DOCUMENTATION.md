# API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.devbattle.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "rating": 1200,
      "rank": "Beginner"
    },
    "token": "jwt_token_here"
  }
}
```

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User
**GET** `/auth/me`

**Headers:** Authorization required

---

## Problems Endpoints

### List Problems
**GET** `/problems`

**Query Parameters:**
- `difficulty` - Easy, Medium, Hard
- `tags` - Comma-separated tags
- `search` - Search query
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "problem_id",
      "title": "Two Sum",
      "slug": "two-sum",
      "difficulty": "Easy",
      "tags": ["array", "hash-table"],
      "stats": {
        "totalSubmissions": 1000,
        "acceptedSubmissions": 450
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

### Get Problem Details
**GET** `/problems/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "problem_id",
    "title": "Two Sum",
    "description": "Given an array...",
    "difficulty": "Easy",
    "examples": [
      {
        "input": "[2,7,11,15], target = 9",
        "output": "[0,1]",
        "explanation": "nums[0] + nums[1] = 9"
      }
    ],
    "constraints": ["2 <= nums.length <= 10^4"],
    "timeLimit": 2000,
    "memoryLimit": 256,
    "starterCode": {
      "python": "def two_sum(nums, target):\n    pass"
    },
    "sampleTestCases": [
      {
        "input": "[2,7,11,15]\n9",
        "expectedOutput": "[0,1]"
      }
    ]
  }
}
```

---

## Submission Endpoints

### Submit Code
**POST** `/submissions`

**Headers:** Authorization required

**Request Body:**
```json
{
  "problemId": "problem_id",
  "language": "python",
  "code": "def solution():\n    return []",
  "battleId": "battle_id",  // optional
  "contestId": "contest_id"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "submission_id",
    "status": "accepted",
    "runtime": 45,
    "memory": 12.5,
    "testCasesPassed": 10,
    "totalTestCases": 10,
    "testResults": [
      {
        "passed": true,
        "runtime": 5,
        "memory": 2.1
      }
    ]
  }
}
```

**Possible Status Values:**
- `accepted`
- `wrong_answer`
- `time_limit_exceeded`
- `memory_limit_exceeded`
- `runtime_error`
- `compilation_error`

### Get User Submissions
**GET** `/submissions/my-submissions`

**Headers:** Authorization required

**Query Parameters:**
- `problemId` - Filter by problem
- `status` - Filter by status
- `page` - Page number
- `limit` - Items per page

---

## Battle Endpoints

### Create Battle Challenge
**POST** `/battles/challenge`

**Headers:** Authorization required

**Request Body:**
```json
{
  "opponentId": "user_id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "battle_id",
    "challenger": "user_id_1",
    "opponent": "user_id_2",
    "status": "pending",
    "roomId": "unique_room_id"
  }
}
```

### Accept Battle
**PUT** `/battles/:id/accept`

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "battle_id",
    "status": "in_progress",
    "problem": {
      "id": "problem_id",
      "title": "Problem Title"
    },
    "startTime": "2024-01-01T00:00:00Z",
    "duration": 1800000
  }
}
```

### Decline Battle
**PUT** `/battles/:id/decline`

**Headers:** Authorization required

### Get User Battles
**GET** `/battles/my-battles`

**Headers:** Authorization required

---

## Contest Endpoints

### List Contests
**GET** `/contests`

**Query Parameters:**
- `status` - upcoming, live, completed

### Create Contest
**POST** `/contests`

**Headers:** Authorization required (Admin only)

**Request Body:**
```json
{
  "title": "Weekly Contest #1",
  "description": "Contest description",
  "groupId": "group_id",
  "problems": [
    {
      "problemId": "problem_id_1",
      "points": 100
    }
  ],
  "startTime": "2024-01-01T00:00:00Z",
  "duration": 7200000
}
```

### Register for Contest
**POST** `/contests/:id/register`

**Headers:** Authorization required

---

## Leaderboard Endpoints

### Global Leaderboard
**GET** `/leaderboard/global`

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "user": {
        "id": "user_id",
        "username": "johndoe",
        "rating": 2450,
        "rank": "Grandmaster"
      },
      "stats": {
        "wins": 150,
        "losses": 50,
        "problemsSolved": 300
      }
    }
  ]
}
```

### Contest Leaderboard
**GET** `/leaderboard/contest/:id`

**Headers:** Authorization required

---

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'jwt_token' }
});
```

### Messaging Events

#### Send Message
```javascript
socket.emit('message:send', {
  conversationId: 'conv_id',
  recipientId: 'user_id',
  content: 'Hello!',
  messageType: 'text'
});
```

#### Receive Message
```javascript
socket.on('message:receive', (message) => {
  console.log(message);
});
```

#### Typing Indicator
```javascript
// Start typing
socket.emit('typing:start', {
  conversationId: 'conv_id',
  recipientId: 'user_id'
});

// Stop typing
socket.emit('typing:stop', {
  conversationId: 'conv_id',
  recipientId: 'user_id'
});

// Listen for typing
socket.on('typing:indicator', (data) => {
  console.log(`${data.username} is typing...`);
});
```

### Battle Events

#### Join Battle Room
```javascript
socket.emit('battle:join', { battleId: 'battle_id' });
```

#### Battle Started
```javascript
socket.on('battle:started', (battle) => {
  console.log('Battle started!', battle);
});
```

#### Battle Completed
```javascript
socket.on('battle:completed', (result) => {
  console.log('Battle completed!', result);
});
```

### Contest Events

#### Join Contest Room
```javascript
socket.emit('contest:join', { contestId: 'contest_id' });
```

#### Leaderboard Update
```javascript
socket.on('contest:leaderboard-update', (data) => {
  console.log('Leaderboard updated', data);
});
```

### Presence Events

#### User Online
```javascript
socket.on('user:online', (data) => {
  console.log(`${data.username} is online`);
});
```

#### User Offline
```javascript
socket.on('user:offline', (data) => {
  console.log(`User offline at ${data.lastSeen}`);
});
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

API endpoints are rate-limited:
- **Window**: 15 minutes
- **Max Requests**: 100 per IP

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640000000
```
