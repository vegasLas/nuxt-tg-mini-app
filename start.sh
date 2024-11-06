#!/bin/bash
set -e  # Exit on any error

echo -e "Starting server setup...\n"

# Install dependencies
echo -e "Installing dependencies...\n"
npm install

# Generate Prisma client only (skip migrations)
echo -e "Generating Prisma client...\n"
npx prisma generate

# Build the Nuxt application
echo -e "Building Nuxt application...\n"
npx nuxt build

# Start the preview server
echo -e "Starting preview server...\n"
npx nuxt preview
