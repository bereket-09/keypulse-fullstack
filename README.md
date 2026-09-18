# ⚡ KeyPulse — Developer API Key & Usage Analytics Gateway

**KeyPulse** is an enterprise-grade developer platform built with **Spring Boot 3 (Java 17)** and **Next.js (React 19 / App Router, TypeScript, Tailwind CSS)**. It demonstrates secure API key provisioning, SHA-256 key hashing, rate limiting, an interactive Gateway Sandbox, and real-time usage analytics.

---

## 🌟 Key Highlights & Engineering Features

### 🛡️ Backend Architecture (Spring Boot 3 + Java 17)
* **Zero-Knowledge Key Storage**: API keys follow modern standards (`kp_live_...` and `kp_test_...`). The raw secret is generated securely via `SecureRandom` and returned **only once** upon creation. In the database, only the **SHA-256 hash** and display prefix are stored.
* **Spring Security 6 & Dual-Layer Authentication**:
  * **JWT Stateless Authentication**: Protects dashboard APIs (`/api/v1/keys/**`, `/api/v1/analytics/**`).
  * **API Key Gateway Filter**: Custom `ApiKeyAuthenticationFilter` protects gateway endpoints (`/api/v1/gateway/**`) using the `x-api-key` header.
* **Sliding Window Rate Limiter**: Thread-safe in-memory rate limiting per API key (e.g. 60 req/min) returning `429 Too Many Requests` and standard `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `Retry-After` headers.
* **Automatic Usage Audit Logging**: Every gateway request automatically records HTTP method, status code, latency (ms), client IP, and user-agent into `ApiUsageLog`.
* **Database & Seed Data**: Compatible with **PostgreSQL** and **H2 In-Memory** database. Out of the box, `DataInitializer` pre-populates a demo developer account with 14 days of realistic usage metrics.
* **Interactive OpenAPI / Swagger**: Complete interactive documentation available at `http://localhost:8080/swagger-ui.html`.

### 💻 Frontend Architecture (Next.js App Router + TypeScript + Tailwind CSS)
* **Modern Developer UI**: Clean, high-density dashboard inspired by modern developer platforms like Stripe, Resend, and Vercel.
* **One-Time Secret Reveal**: Secret modal with one-click copy, confirmation feedback, and security warnings.
* **Interactive Gateway Sandbox**: Built-in API tester that allows developers to test their generated API keys live against the Spring Boot gateway endpoints with visual status badges, latency timers, and JSON payload inspection.
* **Analytics & Visualizations**: Interactive KPI cards (Total Requests, Success Rate %, Rate Limits, Avg Latency) and time-series request charts.
* **Searchable Audit Logs**: Filterable request logs with status color-coding (2xx green, 4xx yellow, 5xx red) and latency meters.

---

## 🚀 Quick Start

### Option A: Run with Docker Compose (Recommended)
You can spin up PostgreSQL, the Spring Boot backend, and the Next.js frontend with a single command:

```bash
docker compose up --build
```
Once started:
* **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
* **Backend API**: [http://localhost:8080](http://localhost:8080)
* **Swagger Documentation**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

### Option B: Local Development (Zero-Config / No Postgres Needed)

#### 1. Start Backend (Runs with H2 In-Memory Database):
```bash
cd backend
./mvnw spring-boot:run
```
*The backend starts at `http://localhost:8080` and automatically populates demo data.*

#### 2. Start Frontend:
```bash
cd frontend
npm install
npm run dev
```
*The frontend starts at `http://localhost:3000`.*

---

## 🔑 Pre-Configured Demo Credentials

The backend automatically seeds a ready-to-test developer account upon first startup:

* **Email**: `demo@keypulse.dev`
* **Password**: `password123`

### Pre-Generated API Keys for Testing:
| Name | Environment | Rate Limit | Raw Secret Key (Ready to Test) |
|---|---|---|---|
| **Production Mobile App** | `PRODUCTION` | 120 req/min | `kp_live_9a7b8c6d4e2f109837a4b5c6d7e8f9a0` |
| **Staging Web Gateway** | `STAGING` | 60 req/min | `kp_test_3f2e1d0c9b8a7f6e5d4c3b2a10987654` |
| **Deprecated Integration** | `DEVELOPMENT` | 30 req/min | *(Revoked - Returns 403)* |

---

## 📡 API Endpoint Overview

### 🔐 Auth (`/api/v1/auth`)
* `POST /register` — Register a new developer account.
* `POST /login` — Login and receive JWT token.
* `GET /me` — Get current user profile.

### 🔑 API Keys (`/api/v1/keys`)
* `POST /` — Generate a new API key (returns raw key once).
* `GET /` — List user's API keys (masked with `...`).
* `GET /{id}` — Get single key details.
* `PATCH /{id}/revoke` — Instantly revoke an API key.
* `DELETE /{id}` — Permanently delete an API key.

### 📊 Analytics & Logs (`/api/v1/analytics`)
* `GET /overview` — High-level KPI metrics & aggregated performance.
* `GET /time-series?days=14` — Historical daily request volume.
* `GET /logs?page=0&size=20` — Paginated request audit trail.

### 🌐 Gateway Sandbox (`/api/v1/gateway`)
*Header required: `x-api-key: <key>`*
* `GET /mock-data` — Protected gateway query endpoint.
* `POST /echo` — Protected payload echo endpoint.

---

## 📁 Repository Structure

```text
├── backend/
│   ├── src/main/java/dev/keypulse/backend/
│   │   ├── config/          # Security, OpenAPI, and Demo Data Seeder
│   │   ├── controller/      # REST API Controllers (Auth, Keys, Analytics, Gateway)
│   │   ├── dto/             # Request & Response DTOs
│   │   ├── exception/       # Global Exception Handler & Custom Exceptions
│   │   ├── model/           # JPA Entities (User, ApiKey, ApiUsageLog, Enums)
│   │   ├── repository/      # Spring Data JPA Repositories
│   │   ├── security/        # JWT Provider, Filters, UserDetails
│   │   ├── service/         # Business Logic (Auth, Keys, Analytics, RateLimiter)
│   │   └── util/            # Key Generation & SHA-256 Hashing Utilities
│   ├── src/main/resources/  # application.yml, application-dev.yml, application-postgres.yml
│   ├── pom.xml              # Maven dependencies
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages (login, register, dashboard, keys, sandbox, logs)
│   │   ├── components/      # Reusable UI components, Modals, Navbar, Charts
│   │   ├── context/         # AuthContext & Session management
│   │   └── lib/             # API client and formatting utilities
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```
