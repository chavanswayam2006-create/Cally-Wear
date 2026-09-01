# Cally Wear — Enterprise API Security & Authorization Inventory

**Document Version:** 1.0.0 (Post-Hardening Baseline)  
**Last Updated:** 02 Sep 2026  
**Audience:** Security Engineering, Backend Engineers, QA, Compliance

---

## 1. Authentication & Session Model Overview

- **Architecture:** Cookie-based session management with Backend-for-Frontend (BFF) pattern.
- **Session Tokens:** High-entropy random identifiers (`csess_...`), stored server-side.
- **Cookie Security Attributes:** `Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800`.
- **Session ID Rotation:** Enforced on login, privilege escalation, and credential updates.
- **Multi-Device Revocation:** Immediate invalidation of all active user sessions upon password reset or account recovery.
- **CSRF Protection:** State-changing methods (`POST`, `PUT`, `DELETE`, `PATCH`) enforce Origin & Referer matching via edge middleware.

---

## 2. API Endpoint Matrix

| Method | Endpoint | Auth Level | Required Permission | Rate Limit Baseline | Description & Controls |
|---|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public | None | 5 req / 15 min / IP | Registers account with unique salted password hash. Sends verification token. Generic uniform output. |
| `POST` | `/api/auth/login` | Public | None | 5 req / 15 min / IP+Account (Exp Backoff) | Constant-time password verify, session rotation, generic error messaging, HttpOnly cookie generation. |
| `POST` | `/api/auth/logout` | Authenticated | None | None | Server-side session revocation and deletion cookie response (`Max-Age=0`). |
| `GET` | `/api/auth/me` | Authenticated | None | 60 req / min | Returns minimized current user profile. |
| `POST` | `/api/auth/verify-email` | Public | None | 10 req / 15 min / IP | Single-use email confirmation token handler. |
| `POST` | `/api/auth/forgot-password` | Public | None | 3 req / 15 min / IP | Uniform generic response; issues 15-min single-use reset token. |
| `POST` | `/api/auth/reset-password` | Public | None | 5 req / 15 min / IP | Verifies token, rehashes password, revokes all other active sessions globally. |
| `POST` | `/api/auth/step-up` | Authenticated | None | 5 req / 15 min / User | Verifies password for step-up challenge before high-risk mutations (valid 10 mins). |
| `POST` | `/api/track-order` | Public (Verified) | None | 6 req / 10 min / IP+Order (Exp Backoff) | High-risk flow: Requires Order# + Contact verifier. Timing padded, data minimization (no address/prices). |
| `POST` | `/api/checkout/create-order` | Public / Customer | `orders:create:self` (if auth) | 15 req / 10 min / IP | Server-calculated pricing, atomic inventory decrement lock, idempotency key check, COD limits. |
| `POST` | `/api/webhooks/payment` | Service (HMAC) | None (Provider Signature) | 100 req / min | HMAC-SHA256 signature verification, 5-min timestamp replay tolerance, event ID idempotency check. |
| `GET` | `/api/user/orders` | Customer | `orders:read:self` | 30 req / min / User | Object-level auth: returns only authenticated user's own orders. |
| `GET` | `/api/user/orders/[orderId]` | Customer / Admin | `orders:read:self` or `orders:read:all` | 30 req / min / User | Object-level auth: blocks horizontal IDOR access across accounts. |
| `PUT` | `/api/user/profile` | Customer | `profile:update:self` | 15 req / min / User | Property-level auth: whitelisted fields only (`name`, `phone`, `addresses`). Blocks role/flags mass-assignment. |
| `GET` | `/api/user/privacy` | Customer | None | 5 req / hour / User | DPDP Act 2023 / GDPR data portability export. |
| `DELETE` | `/api/user/privacy` | Customer | None | 1 req / day / User | DPDP Right to be Forgotten: anonymizes profile and revokes all active sessions. |
| `GET` | `/api/admin/orders` | Admin / Ops | `orders:read:all` | 60 req / min / Admin | Function-level RBAC check: list all platform orders. |
| `POST` | `/api/admin/orders/[orderId]/status` | Admin / Ops | `orders:status:update` | 30 req / min / Admin | Enforces order state machine (`pending -> paid -> in_transit -> delivered`). Requires step-up for `refunded`. |
| `GET` | `/api/admin/audit-logs` | Super Admin | `audit:read` | 30 req / min / Admin | Returns immutable structured audit log trail with redacted PII and actor hashes. |
| `POST` | `/api/contact` | Public | None | 5 req / 15 min / IP | Rate limit, 50KB payload cap, honeypot bot trap, header injection and XSS defense. |
| `POST` | `/api/newsletter/subscribe` | Public | None | 5 req / 15 min / IP | Double opt-in token, consent timestamp & IP logging, HMAC signed unsubscribe token. |
| `POST` | `/api/newsletter/unsubscribe` | Public (Signed Token) | None | 10 req / 15 min / IP | Validates HMAC signed unsubscribe token before unflagging. |

---

## 3. Role-Based Access Control (RBAC) Matrix

| Permission Key | Customer | Support Rep | Order Manager | Catalog Manager | Super Admin |
|---|:---:|:---:|:---:|:---:|:---:|
| `orders:read:self` | Yes | Yes | Yes | Yes | Yes |
| `orders:create:self` | Yes | Yes | Yes | Yes | Yes |
| `profile:update:self` | Yes | Yes | Yes | Yes | Yes |
| `orders:read:all` | No | Yes | Yes | No | Yes |
| `orders:status:update` | No | Yes | Yes | No | Yes |
| `orders:refund` (Step-Up) | No | No | Yes | No | Yes |
| `inventory:edit` | No | No | Yes | Yes | Yes |
| `catalog:edit` | No | No | No | Yes | Yes |
| `discounts:manage` | No | No | No | Yes | Yes |
| `audit:read` | No | No | No | No | Yes |
| `users:manage_roles` (Step-Up) | No | No | No | No | Yes |
| `system:settings` (Step-Up) | No | No | No | No | Yes |
