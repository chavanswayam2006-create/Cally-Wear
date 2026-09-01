# Cally Wear — Data Privacy & DPDP Compliance Inventory

**Compliance Standard:** Digital Personal Data Protection (DPDP) Act 2023 & GDPR  
**Classification:** Internal Compliance Baseline  
**Review Status:** Flagged for Formal Legal / Compliance Counsel Review  
**Assigned Legal Reviewer:** *Pending Outside Legal Counsel Sign-off*

---

## 1. Data Field Inventory & Lawful Basis

| Category | Specific Data Fields | Primary Purpose | Lawful Basis (DPDP/GDPR) | Processor / Subprocessor | Retention Period | Deletion / Anonymization Path |
|---|---|---|---|---|---|---|
| **Identity** | Full Name, Email Address, Phone Number | Account creation, order dispatch notifications, identity verification | Consent / Contractual Necessity | Cloud Database (Vercel / MongoDB) | Active account life + statutory 7-year tax trail | `/api/user/privacy` (DELETE) / automated PII redaction |
| **Authentication** | Password (Salted Scrypt Hash), Session ID, Password Reset Tokens | Secure authentication, credential recovery | Security & Contractual Necessity | Server-side Memory & Auth Store | Sessions: 7 days. Reset tokens: 15 mins. | Revoked on logout/reset; scrubbed from active logs |
| **Fulfillment / Delivery** | Shipping Address (Street, City, State, PIN Code, Country) | Courier dispatch, delivery verification, doorstep size exchanges | Contractual Necessity | Logistics Partner (BlueDart / Delhivery) | Active fulfillment + 7-year statutory audit | Anonymized on account deletion; masked in guest tracking views |
| **Payment Data** | Payment Method, Provider Transaction Reference, Gateway Status | Payment processing, fraud prevention, refund disbursement | Contractual Necessity / Legal Obligation | Payment Gateway (Razorpay / Cashfree) | Gateway holds card tokens (PCI-DSS); Cally Wear stores only masked references | No raw card numbers or CVVs ever stored on Cally Wear servers |
| **Marketing Consent** | Email, Timestamp, IP Hash, Double Opt-In Status | VIP drop notifications, brand updates | Explicit Consent (Separate Checkbox) | Email Processor (Resend / AWS SES) | Until unsubscribe | Signed token link in emails or `/api/newsletter/unsubscribe` |
| **Security Audit Logs** | Actor User ID, Hashed IP, User-Agent, Event Type, Timestamp | Abuse prevention, security breach detection, forensic audit | Legitimate Interest / Security Mandate | Log Collector (Datadog / CloudWatch) | 90 days rolling | Automated log rotation (all passwords/secrets auto-redacted) |

---

## 2. Technical Privacy Guarantees

1. **Zero Raw Secrets in Logs:** The `lib/security/redactor.ts` engine automatically masks passwords, OTPs, session cookies, payment references, and full phone/emails before writing to disk or console.
2. **Guest Order Tracking Minimization:** The `/api/track-order` endpoint redacts full street addresses, customer billing totals, and payment details, exposing only carrier transit state and masked region (`Mumbai, Maharashtra (400***)`).
3. **Automated Right to be Forgotten:** Customers can invoke `DELETE /api/user/privacy` to immediately wipe PII, anonymize delivery histories, and revoke all active sessions across all devices.
4. **Isolated Marketing Consent:** Marketing consent is captured separately from transactional order placement, with immutable timestamp and hashed IP recording.

---

## 3. Mandatory Release Gate & Legal Review Sign-Off

> [!IMPORTANT]
> **Action Item for Legal & Compliance:**
> This technical data inventory must be reviewed and countersigned by qualified legal counsel prior to full public production rollout to confirm exact alignment between stated processors (Razorpay, Cashfree, BlueDart) and DPDP Grievance Officer disclosures.

- [ ] Technical implementation verified by Application Security Engineer (Completed)
- [ ] Automated regression suite verifies zero PII in logs (Completed)
- [ ] Legal Counsel DPDP Terms & Privacy Notice Confirmation (Scheduled with Legal)
