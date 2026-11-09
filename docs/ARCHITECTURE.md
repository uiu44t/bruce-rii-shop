# UBUZIMA HMS Architecture (Phase 1 Foundation)

## Goal
Deliver a **functional, secure, Rwanda-ready hospital platform** incrementally, preserving the currently working app while migrating core modules to PostgreSQL/Prisma and modular backend services.

## Target system design
```text
Frontend (React 19 + TS + Tailwind, RBAC UI, RW/EN/FR ready)
   -> API Gateway / Express modular backend
      -> Auth/RBAC (JWT access+refresh, MFA-ready)
      -> Domain services (patients, EMR, appointments, admissions, labs, billing...)
      -> Integration adapters (NIDA/RSSB/DHIS2/eLMIS/FHIR/MoMo/Airtel) [configurable]
      -> Audit/observability
   -> PostgreSQL (Prisma)
   -> Redis (cache/queues, optional)
   -> File/object storage (clinical documents/images metadata)
```

## Phase 1 implementation strategy
1. **Keep legacy runtime stable:** `server.ts` continues serving existing UI and demo endpoints.
2. **Add modular backend:** new code under `backend/src/` with config, middleware, routes, controllers, services, validators.
3. **Introduce persistence gradually:** Prisma models for facilities, users/roles/permissions, patients, identifiers, consents, EMR, encounters, appointments/admissions/billing/audit.
4. **Protect sensitive flows:** no secrets in frontend; hash/mask national identifiers; log sensitive access; enforce RBAC.
5. **Integration safety:** all national/payment integrations go through adapters; default to `simulated` unless authorized credentials/config exist.

## Core data domains (Prisma)
- Identity/access: `User`, `Role`, `Permission`, `RolePermission`, `Facility`, `Department`, `AuditLog`
- Patient/EMR: `Patient`, `PatientIdentifier`, `PatientConsent`, `MedicalRecord`, `Encounter`, `Consultation`, `Diagnosis`, `Allergy`, `VitalSign`
- Operations: `Appointment`, `Ward`, `Bed`, `Admission`, `Referral`
- Diagnostics: `LaboratoryOrder`, `LaboratoryResult`, `ImagingOrder`, `Blood*`
- Pharmacy/billing: `Prescription`, `PharmacyInventory`, `Invoice`, `Payment`, `Insurance*`
- Community/public health: `MaternalRecord`, `ChildHealthRecord`, `Vaccination`, `CommunityHealthVisit`
- Interop/notifications: `IntegrationLog`, `Notification`

## Security controls (minimum)
- JWT access tokens + refresh tokens; rotate/invalidate refresh tokens.
- Password hashing (`bcryptjs`/Argon2 in production choice), account status checks.
- RBAC permission checks per module/action.
- Request validation (Zod/Joi), helmet, CORS allowlist, rate limiting on auth.
- Audit logs for login, patient lookup, EMR access, consent, referrals, claims/payments.
- Do not store MoMo PINs or raw card secrets. Use provider tokenized references only.
- Treat NIN/insurance identifiers as sensitive: hash for uniqueness, mask for display/logs.

## Interoperability adapters
Adapters must expose a uniform interface and return provenance:
```ts
{ mode: 'simulated'|'configured'|'live', source: string, verified: boolean, data }
```
- `NIDA` patient identity verification (authorized only)
- `RSSB/RAMA/CBHI/MMI` eligibility/claims (authorized only)
- `DHIS2` aggregate reporting
- `eLMIS` supply chain
- Civil registration events
- `FHIR` resource exchange
- Mobile money status/callback verification (provider APIs only)

## Next phases
- **Phase 2:** Migrate legacy in-memory endpoints to Prisma services; appointments/admissions/EMR UI persistence.
- **Phase 3:** LIS/PACS metadata, pharmacy/inventory, billing/insurance workflows.
- **Phase 4:** Emergency/ambulance, maternal/child, CHW, notifications.
- **Phase 5:** Analytics dashboards, DHIS2/eLMIS/FHIR adapters (configured), AI decision support (assist only, audit logged).
- **Phase 6:** Hardening, performance, tests, deployment automation, operational runbooks.
