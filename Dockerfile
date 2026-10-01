# Image for the email worker (worker/index.ts). The Next.js app is deployed separately.
FROM node:22-slim

ENV NODE_ENV=production
WORKDIR /app

RUN corepack enable

# Production dependencies only; tsx runs the TypeScript worker directly.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

# The worker only needs the sender, the queue definition and itself.
COPY lib/email.ts lib/queue.ts ./lib/
COPY worker ./worker

USER node

# Run tsx directly (not via pnpm) so SIGTERM reaches the worker's graceful shutdown.
CMD ["node_modules/.bin/tsx", "worker/index.ts"]
