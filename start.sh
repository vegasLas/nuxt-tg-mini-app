#!/bin/bash
set -e  # Exit on any error

echo -e "\033[1mStarting server setup...\033[0m\n"

# Install dependencies
echo -e "\033[1mInstalling dependencies...\033[0m\n"
npm install

# Migrate the database
echo -e "\033[1mMigrating database...\033[0m\n"
npx prisma migrate deploy

# Generate Prisma client only (skip migrations)
echo -e "\033[1mGenerating Prisma client...\033[0m\n"
npx prisma generate

# Build the Nuxt application
echo -e "\033[1mBuilding Nuxt application...\033[0m\n"
npx nuxt build

# Start the preview server
echo -e "\033[1mStarting preview server...\033[0m\n"
npx nuxt preview
