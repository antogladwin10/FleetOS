# FleetOS Deployment Guide

This guide covers deployment procedures for Docker, Kubernetes, Linux VMs, or Cloud PaaS (Render / Railway / AWS ECS).

---

## 1. Environment Variables Configuration

### Backend (`backend/.env`)
```bash
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://username:password@mongo-host:27017/fleetos?authSource=admin
JWT_ACCESS_SECRET=your_super_secret_jwt_access_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key_min_32_chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=https://fleetos.yourcompany.com
COOKIE_SECRET=your_secure_cookie_signing_secret
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=1000
```

### Frontend (`frontend/.env`)
```bash
VITE_API_URL=https://api.fleetos.yourcompany.com/api/v1
VITE_SOCKET_URL=https://api.fleetos.yourcompany.com
```

---

## 2. Docker & Containerization

### Backend Dockerfile
```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "src/server.js"]
```

### Frontend Dockerfile (Nginx Reverse Proxy)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 3. Production Health Checks & Monitoring
- **Backend Health**: `GET /health` -> Returns `{"status":"ok","timestamp":"..."}`
- **Database Connection**: MongoDB auto-reconnect with pool size 10.
- **WebSocket Protocol**: WSS upgrades supported through Nginx using `proxy_set_header Upgrade $http_upgrade;`.
