#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env

# Check required environment variables
if [ -z "$DEPLOY_HOST" ] || [ -z "$DEPLOY_USER" ] || [ -z "$DEPLOY_PATH" ]; then
  echo "Error: Missing required environment variables"
  exit 1
fi

# Build application
echo "Building application..."
npm run build

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Create deployment archive
echo "Creating deployment archive..."
tar -czf deploy.tar.gz \
  dist/ \
  node_modules/ \
  package*.json \
  prisma/ \
  .env \
  docker-compose.yml \
  Dockerfile

# Copy files to server
echo "Copying files to server..."
scp deploy.tar.gz $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH

# Execute remote deployment
echo "Executing remote deployment..."
ssh $DEPLOY_USER@$DEPLOY_HOST << EOF
  cd $DEPLOY_PATH
  tar -xzf deploy.tar.gz
  docker-compose down
  docker-compose up -d
  rm deploy.tar.gz
EOF

# Cleanup local archive
rm deploy.tar.gz

echo "Deployment completed successfully!" 