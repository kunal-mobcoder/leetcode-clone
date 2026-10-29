# ---------------------------------------------------------------------------
# Stage 1 — deps
# Install production dependencies only (no devDeps, no build step since
# we run TypeScript directly with tsx in production for simplicity).
# ---------------------------------------------------------------------------
FROM node:22-alpine AS deps

WORKDIR /app

# Copy manifests first so Docker can cache the layer
COPY package.json package-lock.json ./

RUN npm ci --omit=dev --ignore-scripts


# ---------------------------------------------------------------------------
# Stage 2 — runtime image
# ---------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Install tsx globally so we can run TypeScript files directly
# (avoids a build step; acceptable for a Node.js side-project)
RUN npm install --ignore-scripts tsx && chown -R appuser:appgroup /app

USER appuser

ENV NODE_ENV=production

EXPOSE 3000

# The start:server script runs the API; the worker is a separate service
CMD ["node", "--import", "tsx/esm", "index.ts"]
