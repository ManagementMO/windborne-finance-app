# WindBorne Vendor Dashboard - Docker Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Docker 24.0+
- Docker Compose 2.0+
- 4GB+ RAM available for containers

### 1. Clone and Setup
```bash
git clone <your-repo>
cd windborne
cp .env.example .env
# Edit .env with your Alpha Vantage API key
```

### 2. Deploy

#### Production Deployment
```bash
./deploy.sh --prod
```

#### Development Deployment
```bash
./deploy.sh --dev
```

#### Production with Monitoring
```bash
./deploy.sh --prod --monitoring
```

## 📋 Available Services

### Production Mode
- **Frontend**: http://localhost (Nginx + React)
- **API**: http://localhost:8000 (FastAPI + Python)
- **API Docs**: http://localhost:8000/docs
- **Redis**: Internal caching

### Development Mode
- **Frontend**: http://localhost:5173 (Vite dev server with HMR)
- **API**: http://localhost:8000 (FastAPI with auto-reload)
- **Redis**: http://localhost:6379

### Monitoring Stack (Optional)
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)
- **Traefik Dashboard**: http://localhost:8080

## 🛠 Manual Docker Commands

### Build and Run Production
```bash
docker-compose up --build -d
```

### Build and Run Development
```bash
docker-compose -f docker-compose.dev.yml up --build -d
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f frontend
```

### Stop Services
```bash
docker-compose down
```

### Rebuild Single Service
```bash
# Rebuild API
docker-compose up --build -d api

# Rebuild Frontend
docker-compose up --build -d frontend
```

## 🏗 Architecture

### Multi-Stage Frontend Build
1. **Builder Stage**: Node.js 20 Alpine builds the React app
2. **Production Stage**: Nginx serves static files with optimized config

### Optimized Backend
- Python 3.13 slim base image
- Non-root user for security
- Health checks for container orchestration
- Optimized pip and Python settings

### Security Features
- Non-root users in all containers
- Read-only mounted volumes where appropriate
- Security headers in Nginx
- Resource limits and health checks

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# Required
ALPHA_VANTAGE_API_KEY=your_api_key_here

# Optional
NODE_ENV=production
VITE_API_URL=http://localhost:8000
```

### Custom Nginx Configuration
The frontend Dockerfile includes optimized Nginx config with:
- Gzip compression
- Security headers
- Static asset caching
- SPA routing support
- API proxy configuration

## 📊 Monitoring Setup

### Prometheus Metrics
Create `monitoring/prometheus.yml`:
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'windborne-api'
    static_configs:
      - targets: ['api:8000']
```

### Grafana Dashboards
- Access: http://localhost:3000
- Login: admin/admin
- Import dashboard ID: 1860 (Node Exporter Full)

## 🐛 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs <service-name>

# Check container status
docker-compose ps

# Rebuild with no cache
docker-compose build --no-cache
```

### API Connection Issues
```bash
# Check API health
curl http://localhost:8000/

# Check if API is accessible from frontend container
docker-compose exec frontend curl http://api:8000/
```

### Frontend Build Issues
```bash
# Check build logs
docker-compose logs frontend

# Rebuild frontend only
docker-compose up --build -d frontend
```

### Development Hot Reload Not Working
- Ensure volumes are properly mounted
- Check if ports are available
- Restart development containers:
```bash
docker-compose -f docker-compose.dev.yml restart
```

## 🚀 Production Deployment

### Using Traefik (Recommended)
```bash
docker-compose --profile production up -d
```

### Manual Nginx Proxy
```nginx
upstream windborne_api {
    server localhost:8000;
}

upstream windborne_frontend {
    server localhost:80;
}

server {
    listen 80;
    server_name yourdomain.com;

    location /api/ {
        proxy_pass http://windborne_api/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://windborne_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### SSL/HTTPS Setup
Use Let's Encrypt with Traefik (included in monitoring profile) or configure manually:

```bash
# Generate SSL certificate
certbot --nginx -d yourdomain.com

# Update docker-compose.yml ports
ports:
  - "443:443"
  - "80:80"
```

## 💾 Data Persistence

### Volumes
- `redis_data`: Redis cache persistence
- `prometheus_data`: Metrics storage
- `grafana_data`: Dashboard configurations
- `traefik_letsencrypt`: SSL certificates

### Backup Strategy
```bash
# Backup volumes
docker run --rm -v windborne_redis_data:/data -v $(pwd):/backup alpine tar czf /backup/redis_backup.tar.gz /data

# Restore volumes
docker run --rm -v windborne_redis_data:/data -v $(pwd):/backup alpine tar xzf /backup/redis_backup.tar.gz -C /
```

## 🔄 Updates and Maintenance

### Update Application
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up --build -d

# Clean up old images
docker image prune
```

### Update Base Images
```bash
# Pull latest base images
docker-compose pull

# Rebuild with new base images
docker-compose build --pull --no-cache
docker-compose up -d
```

## 📈 Performance Optimization

### Resource Limits
Add to `docker-compose.yml`:
```yaml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

### Scaling
```bash
# Scale API instances
docker-compose up -d --scale api=3

# Use load balancer (nginx/traefik) for distribution
```