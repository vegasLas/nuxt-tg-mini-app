#!/bin/bash
echo 'Running server'
npx prisma generate && npx nuxt build && npx nuxt preview
