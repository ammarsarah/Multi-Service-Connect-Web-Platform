# Deployment Guide — Multi-Service Connect

This guide covers everything required to deploy the Multi-Service Connect platform to a production environment.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Environment Variables](#2-environment-variables)
3. [Docker Deployment (Recommended)](#3-docker-deployment-recommended)
4. [Manual Deployment (VPS)](#4-manual-deployment-vps)
5. [Database Migrations](#5-database-migrations)
6. [SSL/HTTPS with Let's Encrypt](#6-sslhttps-with-lets-encrypt)
7. [Environment-Specific Configs](#7-environment-specific-configs)
8. [Monitoring & Logging](#8-monitoring--logging)
9. [Backup Strategy](#9-backup-strategy)

---

## 1. Prerequisites

### Server Requirements

| Resource | Minimum    | Recommended |
|----------|------------|-------------|
| OS       | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| CPU      | 2 vCPU     | 4 vCPU      |
| RAM      | 2 GB       | 4 GB        |
| Disk     | 20 GB SSD  | 50 GB SSD   |
| Network  | 1 Gbps     | 1 Gbps      |

### Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Verify Docker installation
docker --version          # Docker 24.x+
docker compose version    # Docker Compose v2.x+

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### Required Accounts & Services

- **Stripe** — Production API keys (Dashboard → API Keys)
- **OpenAI** — API key with GPT-4 access
- **SMTP** — Email service (Gmail, Mailgun, SendGrid, etc.)
- **Domain Name** — Pointed to your server's IP (A record)

---

## 2. Environment Variables

### Production `.env` Configuration

Create `/opt/multiservice/.env` on your server:

```env
# ── Application ────────────────────────────────────────────
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com

# ── Database ───────────────────────────────────────────────
POSTGRES_DB=multiservice_db
POSTGRES_USER=msc_user
POSTGRES_PASSWORD=CHANGE_THIS_STRONG_PASSWORD_32CHARS
POSTGRES_PORT=5432

# ── JWT ────────────────────────────────────────────────────
# Generate with: openssl rand -hex 64
JWT_SECRET=CHANGE_THIS_64_CHAR_RANDOM_HEX_SECRET
JWT_REFRESH_SECRET=CHANGE_THIS_OTHER_64_CHAR_RANDOM_HEX_SECRET
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── Stripe ─────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# ── OpenAI ─────────────────────────────────────────────────
OPENAI_API_KEY=sk-...

# ── Email ──────────────────────────────────────────────────
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.YOUR_SENDGRID_API_KEY
EMAIL_FROM=noreply@yourdomain.com

# ── Frontend build ─────────────────────────────────────────
VITE_API_URL=https://yourdomain.com/api

# ── Platform ───────────────────────────────────────────────
PLATFORM_COMMISSION_RATE=0.10
```

**Security Best Practices:**
```bash
# Restrict file permissions
chmod 600 /opt/multiservice/.env
chown root:root /opt/multiservice/.env
```

---

## 3. Docker Deployment (Recommended)

### Initial Deployment

```bash
# Clone the repository
git clone https://github.com/your-org/Multi-Service-Connect-Web-Platform.git /opt/multiservice
cd /opt/multiservice

# Copy and configure environment variables
cp .env.example .env
nano .env   # Edit with production values

# Build and start all services
docker compose up -d --build

# Verify all containers are running
docker compose ps

# Check logs
docker compose logs -f
```

### Expected Container Status

```
NAME            IMAGE                STATUS          PORTS
msc_postgres    postgres:15-alpine   Up (healthy)    5432/tcp
msc_backend     msc_backend          Up (healthy)    5000/tcp
msc_frontend    msc_frontend         Up (healthy)    80/tcp
msc_nginx       nginx:alpine         Up (healthy)    0.0.0.0:80->80/tcp
```

### Zero-Downtime Updates

```bash
cd /opt/multiservice

# Pull latest code
git pull origin main

# Rebuild and restart (Docker handles rolling update)
docker compose up -d --build --no-deps backend frontend

# Verify update
docker compose logs backend --tail=50
```

### Rollback

```bash
# Roll back to a specific git tag
git checkout v1.2.3
docker compose up -d --build
```

---

## 4. Manual Deployment (VPS)

Use this approach if you cannot use Docker.

### 4.1 Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version    # v20.x.x
```

### 4.2 Install PostgreSQL 15

```bash
sudo apt install -y postgresql-15 postgresql-client-15

# Start and enable service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql <<EOF
CREATE USER msc_user WITH ENCRYPTED PASSWORD 'your_strong_password';
CREATE DATABASE multiservice_db OWNER msc_user;
GRANT ALL PRIVILEGES ON DATABASE multiservice_db TO msc_user;
EOF

# Apply schema
psql -h localhost -U msc_user -d multiservice_db -f /opt/multiservice/database/schema.sql
```

### 4.3 Install and Configure Nginx

```bash
sudo apt install -y nginx

# Copy configuration
sudo cp /opt/multiservice/nginx/nginx.conf /etc/nginx/nginx.conf

# Update upstream to use localhost
sudo nano /etc/nginx/nginx.conf
# Change: server backend:5000;   →   server 127.0.0.1:5000;
# Change: server frontend:80;    →   serve static files directly (see below)

# Test configuration
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

### 4.4 Deploy Backend

```bash
cd /opt/multiservice/backend

# Install production dependencies
npm ci --omit=dev

# Set environment variables
cp /opt/multiservice/.env .env

# Install PM2 process manager
sudo npm install -g pm2

# Start backend
pm2 start server.js --name msc-backend --env production

# Save PM2 configuration
pm2 save

# Auto-start on server reboot
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

### 4.5 Deploy Frontend

```bash
cd /opt/multiservice/frontend

# Install dependencies
npm ci

# Build production assets
VITE_API_URL=https://yourdomain.com/api npm run build

# Copy dist to nginx html directory
sudo cp -r dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html/
```

### 4.6 Configure Nginx for Static Frontend

Edit `/etc/nginx/nginx.conf` — replace the frontend proxy block with:

```nginx
location / {
    root /var/www/html;
    index index.html;
    try_files $uri $uri/ /index.html;  # SPA fallback
}
```

---

## 5. Database Migrations

The project uses raw SQL migration files. All migrations are in `database/`.

### Applying the Initial Schema

```bash
# Docker
docker compose exec postgres psql -U msc_user -d multiservice_db -f /docker-entrypoint-initdb.d/01_schema.sql

# Manual
psql -h localhost -U msc_user -d multiservice_db -f database/schema.sql
```

### Applying Seed Data (Development/Staging Only)

```bash
# Docker
docker compose exec postgres psql -U msc_user -d multiservice_db -f /docker-entrypoint-initdb.d/02_seed.sql

# Manual
psql -h localhost -U msc_user -d multiservice_db -f database/seed.sql
```

### Future Migrations Workflow

Create new migration files named `database/migrations/YYYYMMDD_description.sql`:

```bash
# Example: Add column to services
cat database/migrations/20240615_add_service_image.sql
```

```sql
-- Migration: 20240615_add_service_image
ALTER TABLE services ADD COLUMN image_url VARCHAR(500);
```

Apply:
```bash
psql -h localhost -U msc_user -d multiservice_db -f database/migrations/20240615_add_service_image.sql
```

---

## 6. SSL/HTTPS with Let's Encrypt

### 6.1 Obtain SSL Certificate

```bash
# Replace yourdomain.com with your actual domain
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Certificates are stored at:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### 6.2 Configure Nginx for SSL

Edit `/opt/multiservice/nginx/nginx.conf` — uncomment the HTTPS server block:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate     /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling        on;
    ssl_stapling_verify on;

    # Same API proxy and frontend location blocks...
}

# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}
```

### 6.3 Mount Certificates in Docker

```bash
# Create ssl directory
mkdir -p /opt/multiservice/nginx/ssl

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/multiservice/nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem   /opt/multiservice/nginx/ssl/
sudo chmod 644 /opt/multiservice/nginx/ssl/*.pem

# Restart nginx container
docker compose restart nginx
```

### 6.4 Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Add cron job for automatic renewal (every 60 days)
sudo crontab -e
```

Add the following line:
```cron
0 3 1 */2 * certbot renew --quiet && cp /etc/letsencrypt/live/yourdomain.com/*.pem /opt/multiservice/nginx/ssl/ && docker compose -f /opt/multiservice/docker-compose.yml restart nginx
```

---

## 7. Environment-Specific Configs

### Development

```bash
# Use docker-compose.override.yml for dev overrides
cat docker-compose.override.yml
```

```yaml
# docker-compose.override.yml (not committed to git)
services:
  backend:
    environment:
      NODE_ENV: development
    volumes:
      - ./backend:/app
      - /app/node_modules
  postgres:
    ports:
      - "5432:5432"   # expose DB locally for development tools
```

### Staging

- Use `NODE_ENV=staging`
- Use Stripe test keys (`sk_test_...`, `pk_test_...`)
- Use a separate database (`multiservice_staging`)
- Mirror production configuration as closely as possible

### Production

- `NODE_ENV=production`
- Stripe live keys
- SSL enforced
- Strict rate limiting
- Log shipping enabled

---

## 8. Monitoring & Logging

### Container Health

```bash
# Check all container status
docker compose ps

# View real-time stats
docker stats

# Check individual health
docker inspect msc_backend | jq '.[0].State.Health'
```

### Application Logs

```bash
# All services (follow)
docker compose logs -f

# Backend only
docker compose logs -f backend --tail=100

# Nginx access/error logs
docker compose exec nginx tail -f /var/log/nginx/access.log
docker compose exec nginx tail -f /var/log/nginx/error.log
```

### Recommended Monitoring Stack

**Uptime Monitoring:**
- [UptimeRobot](https://uptimerobot.com) (free) — monitor `https://yourdomain.com/health`

**Application Performance:**
```bash
# Install Prometheus + Grafana (optional)
docker compose -f docker-compose.monitoring.yml up -d
```

**Error Tracking:**
- Add [Sentry](https://sentry.io) to backend:
  ```bash
  cd backend && npm install @sentry/node
  ```

**Log Aggregation:**
- Configure Docker logging driver to ship to a service like Datadog or Papertrail:
  ```yaml
  # In docker-compose.yml under each service:
  logging:
    driver: "json-file"
    options:
      max-size: "10m"
      max-file: "5"
  ```

### PostgreSQL Monitoring

```bash
# Check active connections
docker compose exec postgres psql -U msc_user -d multiservice_db \
  -c "SELECT count(*) FROM pg_stat_activity;"

# Slow query log
docker compose exec postgres psql -U msc_user -d multiservice_db \
  -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

---

## 9. Backup Strategy

### Automated Database Backup

Create `/opt/multiservice/scripts/backup.sh`:

```bash
#!/bin/bash

set -euo pipefail

BACKUP_DIR="/opt/backups/multiservice"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"
RETENTION_DAYS=30

# Load environment
source /opt/multiservice/.env

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Dump database
docker compose -f /opt/multiservice/docker-compose.yml exec -T postgres \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$BACKUP_FILE"

echo "[$(date)] Backup created: $BACKUP_FILE ($(du -sh $BACKUP_FILE | cut -f1))"

# Remove backups older than RETENTION_DAYS
find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "[$(date)] Old backups cleaned (>$RETENTION_DAYS days)"
```

```bash
chmod +x /opt/multiservice/scripts/backup.sh

# Schedule daily backups at 02:00
crontab -e
```

Add:
```cron
0 2 * * * /opt/multiservice/scripts/backup.sh >> /var/log/msc_backup.log 2>&1
```

### Restore from Backup

```bash
# List available backups
ls -lh /opt/backups/multiservice/

# Restore a specific backup
gunzip -c /opt/backups/multiservice/db_backup_20240601_020000.sql.gz | \
  docker compose -f /opt/multiservice/docker-compose.yml exec -T postgres \
  psql -U msc_user -d multiservice_db
```

### File Uploads Backup

```bash
# Backup uploaded files (profile photos, etc.)
tar -czf /opt/backups/uploads_$(date +%Y%m%d).tar.gz \
  $(docker volume inspect msc_backend_uploads --format '{{ .Mountpoint }}')
```

### Offsite Backup (Recommended)

```bash
# Sync backups to S3 or compatible storage
aws s3 sync /opt/backups/multiservice/ s3://your-bucket/multiservice-backups/ \
  --storage-class STANDARD_IA \
  --delete

# Add to cron after daily backup:
# 30 2 * * * aws s3 sync /opt/backups/multiservice/ s3://your-bucket/multiservice-backups/ --storage-class STANDARD_IA
```

---

## Quick Reference

| Task                        | Command |
|-----------------------------|---------|
| Start all services          | `docker compose up -d` |
| Stop all services           | `docker compose down` |
| View logs                   | `docker compose logs -f` |
| Rebuild & restart backend   | `docker compose up -d --build backend` |
| Database shell              | `docker compose exec postgres psql -U msc_user -d multiservice_db` |
| Backend shell               | `docker compose exec backend sh` |
| Run backup manually         | `/opt/multiservice/scripts/backup.sh` |
| Apply new migration         | `docker compose exec postgres psql -U msc_user -d multiservice_db -f /path/migration.sql` |
| Renew SSL certificate       | `sudo certbot renew` |
