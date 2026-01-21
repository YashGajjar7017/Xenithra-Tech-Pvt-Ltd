# Dev Container Setup

This dev container provides a complete development environment for the Node.js Compiler project.

## What's Included

- Node.js 18
- MongoDB database
- Conda environment with Python and ML libraries
- SBT and Scala for advanced features
- Docker support
- GitHub CLI

## Getting Started

1. Open the project in VS Code
2. When prompted, click "Reopen in Container" or use Command Palette: "Dev Containers: Reopen in Container"
3. Wait for the post-create setup to complete
4. Start the services: `.devcontainer/start-services.sh`

## Services

- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **MongoDB**: localhost:27017
- **Health Check**: http://localhost:8000/health

## Development

- Backend code is in `./Backend`
- Frontend code is in `./Frontend`
- Database initialization script: `./.docker/init-mongo.js`
- Environment configuration: `./environment.yml`

## Troubleshooting

If services don't start properly:

1. Check if ports 8000, 3000, 27017 are available
2. Ensure MongoDB container is running: `docker ps`
3. Check logs: `docker logs mongodb-dev`

## Manual Setup (if dev container fails)

```bash
# Install dependencies
cd Backend && npm install
cd ../Frontend && npm install

# Start MongoDB
docker run -d --name mongodb-dev -p 27017:27017 mongo:6.0

# Start services
cd Backend && npm start &
cd ../Frontend && npm start &
```
