# Stage 1: Install dependencies
FROM node:23.11.0-alpine3.21 AS deps

WORKDIR /app
# Install system dependencies for compatibility
RUN apk add --no-cache libc6-compat

# Copy package files and TypeScript config
COPY package*.json ./
COPY tsconfig.json ./

# Install npm dependencies
RUN npm install

# Stage 2: Build the application
FROM node:23.11.0-alpine3.21 AS builder
WORKDIR /app/

# Copy installed node_modules and tsconfig from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/tsconfig.json ./tsconfig.json

# Copy the rest of the application source code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 3: Prepare the production image
FROM node:23.11.0-alpine3.21 AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Create system group and user for running the app securely
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets from builder stage
COPY --from=builder /app/public ./public

# Prepare .next directory and set permissions
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy Next.js standalone and static files with correct ownership
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Use the non-root user to run the app
USER nextjs

# Expose the application port
EXPOSE 3000

# Set environment variables for Next.js
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Start the Next.js server
CMD ["node", "server.js"]
