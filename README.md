# DevBattle

DevBattle is a full-stack coding battle platform with:

- Next.js frontend
- Node.js + Express backend
- Python Flask judge service
- MongoDB and Redis

## Monorepo Structure

- frontend: Next.js app
- backend: API, auth, chat, battles, contests
- judge-service: code execution and evaluation service

## Requirements

- Node.js 18+
- npm
- Python 3.11+
- pip
- Docker and Docker Compose (optional, recommended)

## Quick Start (Docker)

From repository root:

```bash
npm run docker:build
npm run docker:up
```

Services:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Judge service: http://localhost:8000

Stop:

```bash
npm run docker:down
```

## Quick Start (Local Development)

1. Install dependencies:

```bash
npm run install:all
```

2. Start MongoDB and Redis (Docker is easiest):

```bash
docker-compose up -d mongodb redis
```

3. Start all services:

```bash
npm run dev
```

## Environment Variables

No example env files are included. Add your own env files as needed.

Backend (required):

- PORT (default: 5000)
- NODE_ENV
- MONGODB_URI
- JWT_SECRET
- JWT_EXPIRE (default: 7d)
- REDIS_HOST (default: localhost)
- REDIS_PORT (default: 6379)
- REDIS_PASSWORD
- CORS_ORIGIN
- JUDGE_SERVICE_URL

Frontend:

- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_SOCKET_URL
- NEXT_PUBLIC_JUDGE_URL

Judge service:

- PORT (default: 8000)
- FLASK_ENV
- MONGODB_URI

## Seed Sample Problems

From backend folder:

```bash
cd backend
npm run dev
node seed.js
```

## Useful Scripts

Root:

- npm run dev
- npm run build
- npm run docker:build
- npm run docker:up
- npm run docker:down

Backend:

- npm run dev
- npm run test

Frontend:

- npm run dev
- npm run build
