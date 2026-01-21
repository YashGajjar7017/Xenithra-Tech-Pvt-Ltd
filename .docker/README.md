# Docker Setup for Human Error Application

This directory contains Docker configuration files to containerize the Human Error Node.js application.

## Files

- `Dockerfile` - Multi-stage build configuration for the Node.js application
- `docker-compose.yml` - Orchestration file with app and MongoDB services
- `.dockerignore` - Files to exclude from Docker build context
- `init-mongo.js` - MongoDB initialization script
- `README.md` - This documentation

## Prerequisites

- Docker installed on your system
- Docker Compose installed

## Quick Start

1. **Navigate to the docker directory:**

   ```bash
   cd .docker
   ```

2. **Build and start the services:**

   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Application: http://localhost:8000
   - Health check: http://localhost:8000/health

## Environment Variables

Update the environment variables in `docker-compose.yml` before running in production:

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `EMAIL_USER` - Gmail address for email notifications
- `EMAIL_PASS` - Gmail app password

## Services

### App Service

- **Port:** 8000
- **Health Check:** `/health` endpoint
- **Dependencies:** MongoDB service

### MongoDB Service

- **Port:** 27017
- **Database:** human-error
- **Data Persistence:** mongodb_data volume

## Development

For development with hot reloading, mount your source code:

```yaml
volumes:
  - ../Backend:/app
  - ../Frontend:/app/Frontend
```

## Production Deployment

1. Update all environment variables with production values
2. Use a reverse proxy (nginx) for SSL termination
3. Configure proper logging and monitoring
4. Set up database backups
5. Use Docker secrets for sensitive data

## Troubleshooting

- **Port conflicts:** Change ports in docker-compose.yml
- **Build issues:** Clear Docker cache with `docker system prune`
- **Database connection:** Check MongoDB logs with `docker-compose logs mongodb`
- **App logs:** Check app logs with `docker-compose logs app`

## Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up --build --force-recreate

# Clean up
docker-compose down -v
docker system prune -a
```
