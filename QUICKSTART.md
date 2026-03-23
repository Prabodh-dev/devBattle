# Quick Start Guide

Get DevBattle up and running in 5 minutes!

## Prerequisites

- Docker and Docker Compose installed
- At least 4GB of available RAM
- Ports 3000, 5000, 8000, 27017, 6379 available

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd DevBattle
```

### 2. Start with Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# Check if services are running
docker-compose ps
```

That's it! The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Judge Service**: http://localhost:8000

### 3. Seed Sample Problems (Optional)

```bash
# Enter backend container
docker exec -it devbattle-backend sh

# Run seed script
node seed.js

# Exit
exit
```

## First Time Setup

### 1. Create an Account

1. Go to http://localhost:3000
2. Click "Sign Up"
3. Fill in your details
4. Login with your credentials

### 2. Try a Problem

1. Navigate to "Problems"
2. Select "Two Sum" (Easy)
3. Write your solution
4. Click "Submit"
5. View results

### 3. Challenge a Friend

1. Add a friend
2. Go to "Battles"
3. Click "New Battle"
4. Select opponent
5. Wait for acceptance
6. Start coding!

## Manual Installation (Development)

If you prefer to run services individually:

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB and Redis URLs
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with API URLs
npm run dev
```

### Judge Service

```bash
cd judge-service
pip install -r requirements.txt
cp .env.example .env
# Edit .env
python app.py
```

### MongoDB (using Docker)

```bash
docker run -d \
  --name devbattle-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:7.0
```

### Redis (using Docker)

```bash
docker run -d \
  --name devbattle-redis \
  -p 6379:6379 \
  redis:7-alpine redis-server --requirepass redis123
```

## Common Commands

### Docker Compose

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up -d --build

# Stop and remove everything
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f judge-service
```

### Check Service Health

```bash
# Backend health check
curl http://localhost:5000/health

# Judge service health check
curl http://localhost:8000/health

# Frontend (open in browser)
open http://localhost:3000
```

## Testing Features

### 1. Test Real-Time Messaging

1. Open two browser windows
2. Login with different accounts in each
3. Add each other as friends
4. Start a chat
5. See messages appear in real-time

### 2. Test Code Execution

1. Go to Problems
2. Select any problem
3. Write a simple solution:

**Python Example (Two Sum):**
```python
def two_sum(nums, target):
    for i in range(len(nums)):
        for j in range(i+1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
```

4. Click Submit
5. View execution results

### 3. Test Battle System

1. Create two accounts
2. Send battle challenge from Account A to Account B
3. Accept challenge from Account B
4. Both users receive the same problem
5. First to solve wins!

## Troubleshooting

### Services won't start

```bash
# Check if ports are in use
lsof -i :3000
lsof -i :5000
lsof -i :8000

# Kill processes if needed
kill -9 <PID>

# Restart Docker
docker-compose down
docker-compose up -d
```

### Cannot connect to MongoDB

```bash
# Check MongoDB is running
docker ps | grep mongo

# Check logs
docker logs devbattle-mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Frontend shows connection error

1. Check backend is running: `curl http://localhost:5000/health`
2. Check environment variables in `frontend/.env.local`
3. Restart frontend: `docker-compose restart frontend`

### Judge service errors

```bash
# Check Docker socket is accessible
docker ps

# Check judge service logs
docker logs devbattle-judge

# Restart judge service
docker-compose restart judge-service
```

## Default Credentials

After seeding, you can use these test accounts (if implemented):

- Username: `testuser1`
- Password: `password123`

Or create your own account via registration.

## Next Steps

- Read the full [README.md](README.md) for detailed features
- Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API details
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
- Explore the codebase and customize features

## Need Help?

- Create an issue on GitHub
- Check documentation files
- Review Docker logs
- Join our community (if available)

---

Happy coding! 🚀
