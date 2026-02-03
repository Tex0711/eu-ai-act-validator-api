# -----------------------------------------------------------------------------
# EU AI Act Validator API – multi-stage build (Node/Astro + Rust engine)
# Enterprise & On-Premise: lightweight, production-ready image
# -----------------------------------------------------------------------------

# ---- Stage 1: Build Astro/TypeScript API ----
FROM node:20-slim AS builder-node

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY astro.config.mjs tailwind.config.mjs tsconfig.json ./
COPY src ./src
COPY supabase ./supabase

RUN npm run build

# ---- Stage 2: Build Rust compliance engine (optional batch/CLI) ----
FROM rust:1-slim-bookworm AS builder-rust

WORKDIR /engine

COPY engine-rust/Cargo.toml engine-rust/Cargo.lock ./
COPY engine-rust/src ./src
COPY engine-rust/data ./data
COPY engine-rust/benches ./benches

RUN cargo build --release

# ---- Stage 3: Runtime image ----
FROM node:20-slim AS runtime

WORKDIR /app

# Production deps only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Built API & frontend
COPY --from=builder-node /app/dist ./dist

# Rust engine binary + data (for on-prem batch/benchmark)
COPY --from=builder-rust /engine/target/release/compliance-engine /app/engine-rust/compliance-engine
COPY --from=builder-rust /engine/data /app/engine-rust/data

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

CMD ["node", "./dist/server/entry.mjs"]
