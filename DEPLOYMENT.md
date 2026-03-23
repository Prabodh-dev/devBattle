# Deployment Guide

This guide provides instructions for deploying DevBattle to production.

## Prerequisites

- Linux server (Ubuntu 20.04+ recommended)
- Docker and Docker Compose installed
- Domain name configured
- SSL certificate (Let's Encrypt recommended)
- At least 4GB RAM
- 2 CPU cores minimum

## Production Deployment Steps

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### 2. Clone Repository

```bash
git clone <your-repo-url>
cd DevBattle
```

### 3. Configure Environment Variables

#### Backend (.env)
```bash
cd backend
cp .env.example .env
nano .env
```

Update with production values:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://admin:STRONG_PASSWORD@mongodb:27017/devbattle?authSource=admin
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=STRONG_REDIS_PASSWORD
JWT_SECRET=VERY_STRONG_RANDOM_SECRET_KEY_HERE
JWT_EXPIRE=7d
JUDGE_SERVICE_URL=http://judge-service:8000
CORS_ORIGIN=https://yourdomain.com
```

#### Frontend (.env.local)
```bash
cd frontend
cp .env.local.example .env.local
nano .env.local
```

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=https://api.yourdomain.com
NODE_ENV=production
```

#### Judge Service (.env)
```bash
cd judge-service
cp .env.example .env
nano .env
```

```env
FLASK_ENV=production
PORT=8000
MONGODB_URI=mongodb://admin:STRONG_PASSWORD@mongodb:27017/devbattle?authSource=admin
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=STRONG_REDIS_PASSWORD
```

### 4. Update Docker Compose for Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: devbattle-mongodb
    restart: always
    ports:
      - "127.0.0.1:27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: devbattle
    volumes:
      - mongodb_data:/data/db
    networks:
      - devbattle-network

  redis:
    image: redis:7-alpine
    container_name: devbattle-redis
    restart: always
    ports:
      - "127.0.0.1:6379:6379"
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - devbattle-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: devbattle-backend
    restart: always
    ports:
      - "127.0.0.1:5000:5000"
    env_file:
      - ./backend/.env
    depends_on:
      - mongodb
      - redis
      - judge-service
    networks:
      - devbattle-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  judge-service:
    build:
      context: ./judge-service
      dockerfile: Dockerfile
    container_name: devbattle-judge
    restart: always
    ports:
      - "127.0.0.1:8000:8000"
    env_file:
      - ./judge-service/.env
    depends_on:
      - redis
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    privileged: true
    networks:
      - devbattle-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: devbattle-frontend
    restart: always
    ports:
      - "127.0.0.1:3000:3000"
    env_file:
      - ./frontend/.env.local
    depends_on:
      - backend
    networks:
      - devbattle-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  devbattle-network:
    driver: bridge

volumes:
  mongodb_data:
  redis_data:
```

### 5. Nginx Configuration

Install Nginx:
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

Create Nginx configuration (`/etc/nginx/sites-available/devbattle`):

```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/devbattle /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL Certificate

```bash
# Get SSL certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 7. Build and Start Services

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 8. Seed Database

```bash
# Enter backend container
docker exec -it devbattle-backend sh

# Run seed script
node seed.js

# Exit container
exit
```

### 9. Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

## Monitoring

### Docker Health Checks

Check container health:
```bash
docker ps
docker stats
```

### Application Logs

```bash
# Backend logs
docker logs -f devbattle-backend

# Frontend logs
docker logs -f devbattle-frontend

# Judge service logs
docker logs -f devbattle-judge

# All logs
docker-compose -f docker-compose.prod.yml logs -f
```

### System Monitoring

Install monitoring tools:
```bash
# Htop for system monitoring
sudo apt install htop

# Monitoring
htop
```

## Backup Strategy

### Database Backup

Create backup script (`backup.sh`):
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"

mkdir -p $BACKUP_DIR

docker exec devbattle-mongodb mongodump \
  --username admin \
  --password YOUR_PASSWORD \
  --authenticationDatabase admin \
  --db devbattle \
  --out /tmp/backup

docker cp devbattle-mongodb:/tmp/backup $BACKUP_DIR/backup_$DATE

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

Make executable and add to crontab:
```bash
chmod +x backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /path/to/backup.sh
```

### Restore from Backup

```bash
docker cp /path/to/backup devbattle-mongodb:/tmp/restore

docker exec devbattle-mongodb mongorestore \
  --username admin \
  --password YOUR_PASSWORD \
  --authenticationDatabase admin \
  --db devbattle \
  /tmp/restore/devbattle
```

## Scaling

### Horizontal Scaling (Multiple Instances)

Use Docker Swarm or Kubernetes for horizontal scaling:

```bash
# Initialize Docker Swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.prod.yml devbattle

# Scale services
docker service scale devbattle_backend=3
docker service scale devbattle_frontend=2
```

### Vertical Scaling (More Resources)

Update `docker-compose.prod.yml` resource limits:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## Performance Optimization

### Enable Gzip Compression (Nginx)

Add to Nginx configuration:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript;
```

### Enable Caching

Add to Nginx:
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Security Checklist

- [ ] Strong passwords for MongoDB and Redis
- [ ] Random JWT secret
- [ ] SSL certificates installed
- [ ] Firewall configured
- [ ] Docker containers running as non-root users
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Regular security updates
- [ ] Backup strategy implemented

## Troubleshooting

### Container won't start
```bash
docker-compose -f docker-compose.prod.yml logs [service-name]
docker inspect [container-name]
```

### Database connection issues
```bash
# Test MongoDB connection
docker exec -it devbattle-mongodb mongo -u admin -p

# Test Redis connection
docker exec -it devbattle-redis redis-cli -a YOUR_PASSWORD ping
```

### High memory usage
```bash
# Check container stats
docker stats

# Restart service
docker-compose -f docker-compose.prod.yml restart [service-name]
```

## Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Remove old images
docker image prune -a
```

### Clean Up

```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Clean everything
docker system prune -a
```

## Support

For production issues:
1. Check application logs
2. Review system metrics
3. Contact support team
4. Create GitHub issue with logs

---

Last updated: 2024
