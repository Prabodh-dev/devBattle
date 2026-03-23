# DevBattle

A production-ready, full-stack developer communication and coding competition platform that combines real-time messaging (inspired by WhatsApp) with competitive coding challenges (inspired by LeetCode).

## Features

### Core Features

- **Real-Time Messaging System**
  - Private one-on-one chat
  - Group messaging
  - Code snippet sharing with syntax highlighting
  - File sharing
  - Message reactions
  - Read receipts
  - Typing indicators
  - Online/offline status

- **1v1 Coding Battles**
  - Challenge friends to coding battles
  - Random problem selection
  - Real-time battle status
  - Automated code evaluation
  - ELO-based rating system
  - Battle history and statistics

- **Group Coding Contests**
  - Host group contests with multiple problems
  - Real-time leaderboard
  - Contest timer and submission window
  - Automated judging and scoring
  - Contest rankings

- **Coding Problem System**
  - Comprehensive problem repository
  - Multiple difficulty levels (Easy, Medium, Hard)
  - Problem tags and categorization
  - Sample and hidden test cases
  - Multiple language support

- **Code Execution & Judge System**
  - Secure sandboxed code execution using Docker
  - Support for Python, JavaScript, Java, C++, C
  - Automated test case evaluation
  - Performance metrics (runtime, memory)
  - Multiple verdict types (Accepted, Wrong Answer, TLE, Runtime Error, etc.)

- **Code Playground**
  - Monaco editor integration
  - Syntax highlighting
  - Run code without submission
  - Shareable code snippets

- **User System**
  - User profiles with stats
  - Rating and ranking system
  - Friend system
  - Activity feed
  - Achievement tracking

- **Leaderboards**
  - Global leaderboard
  - Contest-specific leaderboards
  - Battle rankings

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (React)
- **Styling**: TailwindCSS
- **Code Editor**: Monaco Editor
- **Real-time**: Socket.io Client
- **State Management**: Zustand
- **HTTP Client**: Axios
- **TypeScript**: Full type safety

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time**: Socket.io
- **Authentication**: JWT
- **Validation**: Express Validator
- **Security**: Helmet, bcryptjs

### Database
- **Primary Database**: MongoDB (via Mongoose)
- **Caching & Pub/Sub**: Redis (via ioredis)

### Judge Service
- **Language**: Python 3.11
- **Framework**: Flask
- **Container Runtime**: Docker (for sandboxed execution)
- **Database Client**: PyMongo

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **File Storage**: AWS S3 (configurable)
- **Logging**: Winston

## Project Structure

```
DevBattle/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── pages/           # Next.js pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities (API, Socket)
│   │   ├── store/           # Zustand state management
│   │   └── styles/          # Global styles
│   ├── public/              # Static assets
│   ├── Dockerfile
│   └── package.json
│
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── models/          # Mongoose models
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, validation, etc.
│   │   ├── socket/          # Socket.io handlers
│   │   ├── config/          # Configuration (Redis, etc.)
│   │   └── utils/           # Utilities
│   ├── Dockerfile
│   └── package.json
│
├── judge-service/           # Python code evaluation service
│   ├── app.py              # Flask application
│   ├── evaluator.py        # Code execution engine
│   ├── database.py         # MongoDB connection
│   ├── Dockerfile
│   └── requirements.txt
│
├── docker-compose.yml       # Docker orchestration
└── package.json            # Root package.json

```

## Database Schema

### Collections

1. **Users** - User accounts and profiles
2. **Messages** - Chat messages (private & group)
3. **Groups** - Group chat information
4. **Problems** - Coding problems
5. **TestCases** - Problem test cases
6. **Battles** - 1v1 coding battles
7. **Contests** - Group coding contests
8. **Submissions** - Code submissions
9. **FriendRequests** - Friend requests
10. **Notifications** - User notifications
11. **Activities** - User activity feed

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile` - Update profile

### Problems
- `GET /api/problems` - List problems
- `GET /api/problems/:id` - Get problem details

### Battles
- `POST /api/battles/challenge` - Create battle challenge
- `PUT /api/battles/:id/accept` - Accept challenge
- `PUT /api/battles/:id/decline` - Decline challenge
- `GET /api/battles/my-battles` - Get user battles

### Submissions
- `POST /api/submissions` - Submit code
- `GET /api/submissions/my-submissions` - Get submissions
- `GET /api/submissions/:id` - Get submission details

### Contests
- `GET /api/contests` - List contests
- `POST /api/contests` - Create contest
- `POST /api/contests/:id/register` - Register for contest

### Leaderboard
- `GET /api/leaderboard/global` - Global leaderboard
- `GET /api/leaderboard/contest/:id` - Contest leaderboard

## WebSocket Events

### Messaging
- `message:send` - Send message
- `message:receive` - Receive message
- `typing:start` - User starts typing
- `typing:stop` - User stops typing
- `message:read` - Mark message as read

### Presence
- `user:online` - User comes online
- `user:offline` - User goes offline

### Battles
- `battle:challenge` - Battle challenge received
- `battle:started` - Battle started
- `battle:submission` - Opponent submitted
- `battle:completed` - Battle completed

### Contests
- `contest:leaderboard-update` - Leaderboard updated

## Installation & Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- MongoDB (or use Docker)
- Redis (or use Docker)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DevBattle
   ```

2. **Configure environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   cp frontend/.env.local.example frontend/.env.local
   
   # Judge Service
   cp judge-service/.env.example judge-service/.env
   ```

3. **Start all services with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Judge Service: http://localhost:8000

### Manual Setup (Development)

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your configuration
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Update .env.local with your configuration
npm run dev
```

#### Judge Service Setup
```bash
cd judge-service
pip install -r requirements.txt
cp .env.example .env
# Update .env with your configuration
python app.py
```

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://admin:admin123@localhost:27017/devbattle?authSource=admin
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JUDGE_SERVICE_URL=http://localhost:8000
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=devbattle-uploads
AWS_REGION=us-east-1
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

### Judge Service (.env)
```env
FLASK_ENV=development
PORT=8000
MONGODB_URI=mongodb://admin:admin123@localhost:27017/devbattle?authSource=admin
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123
```

## System Architecture

```
┌─────────────┐
│   Client    │
│  (Next.js)  │
└──────┬──────┘
       │
       ├─── HTTP ───────────┐
       │                    │
       └─── WebSocket ──┐   │
                        │   │
                   ┌────▼───▼────┐
                   │   Backend   │
                   │  (Express)  │
                   └────┬────┬───┘
                        │    │
         ┌──────────────┘    └────────┐
         │                            │
    ┌────▼────┐                  ┌────▼─────┐
    │ MongoDB │                  │  Redis   │
    └─────────┘                  └──────────┘
         │
         │
    ┌────▼─────────┐
    │Judge Service │
    │   (Python)   │
    └────┬─────────┘
         │
    ┌────▼────┐
    │ Docker  │
    │Sandbox  │
    └─────────┘
```

## Security Features

- **Authentication**: JWT-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Rate Limiting**: Express rate limiter
- **CORS**: Configured CORS policy
- **Helmet**: Security headers
- **Code Execution**: Sandboxed Docker containers
- **Input Validation**: Express validator
- **Network Isolation**: Docker containers run with disabled networking

## Rating System

DevBattle uses an ELO-based rating system for battles:
- Win against higher-rated opponent: +more points
- Win against lower-rated opponent: +fewer points
- Loss against higher-rated opponent: -fewer points
- Loss against lower-rated opponent: -more points

**Rank Tiers**:
- Beginner: < 1200
- Coder: 1200 - 1599
- Expert: 1600 - 1999
- Master: 2000 - 2399
- Grandmaster: 2400+

## Code Execution Limits

- **Time Limit**: 2000ms (configurable per problem)
- **Memory Limit**: 256MB (configurable per problem)
- **Maximum Execution Time**: 5s (hard limit)

## Supported Languages

- Python 3.11
- JavaScript (Node.js 18)
- Java 17
- C++ (GCC 12)
- C (GCC 12)

## Development

### Adding New Problems

Problems can be added directly to MongoDB with the following structure:

```javascript
{
  title: "Two Sum",
  slug: "two-sum",
  description: "Problem description...",
  difficulty: "Easy",
  tags: ["array", "hash-table"],
  examples: [...],
  constraints: [...],
  timeLimit: 2000,
  memoryLimit: 256,
  starterCode: {
    python: "def solution():\n    pass",
    // other languages...
  }
}
```

### Adding Test Cases

```javascript
{
  problem: ObjectId("problem_id"),
  input: "1 2 3\n4 5 6",
  expectedOutput: "7 9 11",
  isHidden: false,
  isSample: true
}
```

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Production Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment Variables for Production

Update the following in your production environment:
- Change `JWT_SECRET` to a strong random key
- Update MongoDB and Redis credentials
- Configure AWS S3 credentials
- Set `NODE_ENV=production`
- Update CORS origins

## Monitoring & Logging

- **Backend**: Winston logger with file transports
- **Judge Service**: Python logging to stdout
- **Docker**: Container logs via docker-compose

## Performance Optimization

- Redis caching for frequently accessed data
- MongoDB indexes on commonly queried fields
- Connection pooling for database connections
- Code execution result caching
- Real-time event debouncing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

For issues and questions:
- Create an issue on GitHub
- Contact: support@devbattle.com

## Roadmap

- [ ] Video/Voice chat integration
- [ ] Code review system
- [ ] AI-powered hints
- [ ] Mobile applications
- [ ] Advanced analytics dashboard
- [ ] Team battles
- [ ] Tournament system
- [ ] Code plagiarism detection

---

Built with ❤️ for developers, by developers.
