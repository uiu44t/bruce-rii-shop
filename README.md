# UBUZIMA HMS — Rwanda National Healthcare Management System

## What this repository contains
This repository evolves the existing React/Vite/Express hospital management app toward **UBUZIMA HMS**, a professional Rwanda-ready healthcare platform.

- **Current runtime (working now):** `server.ts` (Express + Vite middleware), React 19 frontend, in-memory/demo adapters for NIDA/RSSB/payment flows.
- **UBUZIMA foundation (added):** Prisma PostgreSQL schema, Docker/dev infra, environment template, and Phase 1 backend scaffold for incremental migration to persistent, secure services.

> **Important:** National/government/payment integrations (NIDA, RSSB/RAMA/CBHI, DHIS2, eLMIS, civil registration, FHIR, MTN MoMo, Airtel Money) must be configured and authorized before live use. Demo/simulated modes are clearly labeled and must never be presented as verified national/real-time data.

## Current quick start (existing app)
```bash
npm install
cp .env.example .env   # fill only values you are authorized to use
npm run dev
# http://localhost:3000
```

## UBUZIMA Phase 1 foundation (PostgreSQL + Prisma)
Requires Docker/Compose or an authorized local PostgreSQL instance.

```bash
# 1) Install Phase 1 backend dependencies (planned; see docs/PHASE1.md)
npm install @prisma/client prisma jsonwebtoken bcryptjs zod helmet cors express-rate-limit
npm install -D @types/jsonwebtoken @types/bcryptjs

# 2) Start local infrastructure
docker compose up -d postgres redis

# 3) Prisma
npx prisma generate --schema=database/prisma/schema.prisma
npx prisma migrate dev --name init --schema=database/prisma/schema.prisma
npx tsx database/prisma/seed.ts
```

## Architecture (target)
- **Frontend:** React 19 + TypeScript + Tailwind, responsive, role-based UI, Kinyarwanda/English/French ready.
- **Backend:** Node.js + Express + TypeScript, modular routes/controllers/services/middleware/validators.
- **Data:** PostgreSQL primary store, Prisma ORM/migrations, Redis cache/queues (optional in early phases).
- **Security:** JWT access/refresh, RBAC, audit logging, MFA-ready, input validation, helmet/rate limiting, least privilege.
- **Integrations:** adapter pattern with simulated fallback; real APIs only when configured/authorized.
- **Deployment:** Docker, CI/CD-ready structure, cloud/on-prem compatible.

## Phase 1 modules prioritized
1. Auth/RBAC/facility/user foundation
2. National-ready patient registry (MRN + hashed/masked identifiers, consent)
3. EMR core (encounters, consultations, diagnoses, allergies, vitals)
4. Appointments/admissions/billing scaffolding
5. Audit logging and integration adapters

## Roles (RBAC)
Super Admin, MOH Admin, Hospital Admin, Hospital Director, Doctor, Nurse, Pharmacist, Lab Technician, Radiologist, Blood Bank Officer, Receptionist, Accountant, Insurance Officer, Ambulance Operator, Community Health Worker, Patient.

## Compliance notes (Rwanda context)
- Collect/process health data only for legitimate care/operations with consent where applicable.
- Follow Rwanda data protection/privacy requirements and facility authorization policies during deployment.
- Keep audit trails for sensitive access and data changes.
- Never expose secrets, API keys, or credentials in frontend code.
- AI features (future phases) must be clinical decision support only: explainable, clinician-approved, audit logged.

## Repository layout
- `src/` — React frontend
- `server.ts` — current Express/Vite server (legacy runtime during migration)
- `server/identity/` — current demo identity/payment adapters
- `database/prisma/schema.prisma` — UBUZIMA PostgreSQL schema
- `database/prisma/seed.ts` — development demo seed
- `backend/src/` — Phase 1 modular backend scaffold
- `infrastructure/docker/` — Docker build files
- `docs/` — architecture and phase plans
