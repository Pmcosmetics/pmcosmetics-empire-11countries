# PM Cosmetics Hub - Security Guidelines

## 🔐 Security First Approach

This document outlines security best practices for the PM Cosmetics Hub project.

---

## 📋 Secret Management

### ✅ DO
- ✅ Store all secrets in environment variables
- ✅ Use `.env.local` for development
- ✅ Rotate API keys regularly
- ✅ Use `.env.example` as template
- ✅ Keep secrets secure and encrypted

### ❌ DON'T
- ❌ Never commit `.env` file to Git
- ❌ Don't share API keys in messages
- ❌ Don't hardcode secrets in code
- ❌ Don't push `.env` to public repositories
- ❌ Don't log sensitive information

---

## 🔑 API Key Management

### Shopify
- Store in: `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_ACCESS_TOKEN`
- Rotate: Every 90 days
- Scope: Read/Write for products, orders

### Instagram
- Store in: `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_BUSINESS_ACCOUNT_ID`
- Rotate: Every 60 days
- Type: Use long-lived tokens

### Etsy
- Store in: `ETSY_API_KEY`, `ETSY_API_SECRET`
- Rotate: Every 90 days
- Scope: Products, inventory, orders

### WhatsApp Business
- Store in: `WHATSAPP_BUSINESS_ACCESS_TOKEN`, `WHATSAPP_BUSINESS_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_VERIFY_TOKEN`, `WHATSAPP_WEBHOOK_SECRET`
- Rotate: Every 30 days
- Security: Enable webhook verification and validate `X-Hub-Signature-256` before processing POST deliveries
- Do not persist inbound webhook bodies unless a separate approved data-retention policy exists

### Database
- Store in: `DATABASE_URL`, `MONGODB_URI`
- Use: Strong passwords (min 32 characters)
- Enable: SSL/TLS encryption
- Rotate: Every 180 days

---

## 🛡️ Authentication & Authorization

### JWT Tokens
```javascript
// Use strong JWT_SECRET
JWT_SECRET=your_random_64_character_string_here

// Token expiry: 24 hours for access, 7 days for refresh
ACCESS_TOKEN_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=7d
```

### Session Management
- Use secure session cookies
- Enable HttpOnly flag
- Set Secure flag (HTTPS only)
- Use SameSite=Strict

### Role-Based Access Control (RBAC)
- Admin: Full system access
- Manager: Operational access
- Seller: Product & order management
- Customer: Personal data access

---

## 🔒 Data Encryption

### In Transit
- ✅ Use HTTPS/TLS 1.3
- ✅ Enable certificate pinning
- ✅ Use secure headers

### At Rest
```bash
# Enable database encryption
DATABASE_ENCRYPTION=true
ENCRYPTION_KEY=your_32_byte_hex_string
```

### Sensitive Fields
- Customer passwords (bcrypt)
- Payment information (encrypted)
- API keys (encrypted)
- PII data (encrypted)

---

## 🚨 Input Validation & Sanitization

### Catalog Data
```json
{
  "sku": "PM-ABC123",
  "name": "Product Name",
  "price": 99.99
}
```

### Validation Rules
- Whitelist allowed characters
- Validate data types
- Check length constraints
- Sanitize HTML/JS

### SQL Injection Prevention
- Use parameterized queries
- Validate all inputs
- Use ORMs (Sequelize, Prisma)

---

## 🔑 CORS & API Security

### Allowed Origins
```javascript
CORS_ORIGINS=https://pmcosmetics.hub,https://admin.pmcosmetics.hub
```

### Rate Limiting
```javascript
// Limit: 100 requests per 15 minutes per IP
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100
```

### API Key Validation
- Validate all API requests
- Check rate limits
- Monitor suspicious activity

---

## 📱 Password Security

### Requirements
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- No common patterns
- Unique per account

### Storage
```javascript
// Use bcrypt with salt rounds 12
bcrypt.hash(password, 12)
```

### Reset Flow
- Send secure reset link
- Token expires in 1 hour
- One-time use only
- Verify email ownership

---

## 🔍 Logging & Monitoring

### What to Log
- ✅ API requests (not sensitive data)
- ✅ Authentication events
- ✅ Error messages
- ✅ Configuration changes
- ✅ Database queries

### What NOT to Log
- ❌ Passwords
- ❌ API keys
- ❌ Credit card numbers
- ❌ Personal identification
- ❌ Full error stack traces

### Log Storage
```javascript
LOG_LEVEL=info
SENTRY_DSN=your_sentry_dsn
```

---

## 🚀 Deployment Security

### Environment Setup
```bash
# Production only
NODE_ENV=production
DEBUG=false
HTTPS_ONLY=true
```

### SSL/TLS
- Use certificates from trusted CAs
- Enable HSTS headers
- Renew before expiration
- Use TLS 1.3+

### Firewall Rules
- Restrict database access
- Whitelist API consumers
- Enable WAF (Web Application Firewall)
- Block suspicious IPs

---

## 🔄 Backup & Recovery

### Database Backups
- Daily automated backups
- Store in encrypted storage
- Test restore procedures
- Keep 30-day retention

### Disaster Recovery
- Document recovery procedures
- Test recovery plans quarterly
- Maintain backup redundancy
- Document RTO/RPO targets

---

## 📋 Compliance

### GDPR
- ✅ User consent for data collection
- ✅ Right to access data
- ✅ Right to deletion
- ✅ Data portability

### PCI DSS (Payment Card Industry)
- ✅ Never store full card numbers
- ✅ Use tokenized payments
- ✅ Encrypt payment data
- ✅ Regular security audits

### Local Regulations
- Comply with country-specific laws
- Respect privacy requirements
- Follow data residency rules

---

## 🔐 Security Headers

```javascript
// Add to all responses
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## 🧪 Security Testing

### OWASP Top 10
- SQL Injection
- Broken Authentication
- Sensitive Data Exposure
- XML External Entities
- Access Control Issues
- Security Misconfiguration
- XSS (Cross-Site Scripting)
- Insecure Deserialization
- Components with Known Vulnerabilities
- Insufficient Logging

### Testing Tools
- OWASP ZAP
- Burp Suite
- SonarQube
- npm audit
- Snyk

---

## 🚨 Incident Response

### If Credentials Are Exposed
1. Immediately rotate compromised keys
2. Review access logs
3. Revoke affected tokens
4. Notify affected users
5. Document incident

### Report Security Issues
- 📧 Email: security@pmcosmetics.hub
- 🔐 Use PGP encryption
- Responsible disclosure (90 days)

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Security is everyone's responsibility. Always prioritize security!** 🔐


---

# 🔎 2026-10-05 Production Security Audit Addendum

## Current deployment evidence

- Canonical GitHub repository: `Pmcosmetics/pmcosmetics-empire-11countries`
- Railway production service: `pmcosmetics-empire-11countries`
- Railway deployment state at audit time: **ONLINE / SUCCESS**
- Railway public domain: `pmcosmetics-empire-11countries-production.up.railway.app`
- Railway runtime region observed: **SFO**
- Supabase project: `rhozehqlpnmzmknlpmvf`
- Supabase database region observed: **eu-west-1**
- Configured markets: **11** (Egypt, Saudi Arabia, UAE, Kuwait, Qatar, Bahrain, Oman, Jordan, Palestine, Lebanon, Iran)

## Control results

| Control | Status | Evidence / action |
|---|---|---|
| No secrets in Git | **PASS WITH LIMITATION** | Repository review found no real credential values; common token-pattern searches found no live-token pattern. A synthetic `shpat_xxxxx` documentation placeholder was removed on the security branch. GitHub code search is not a formal secret-scanning certificate. |
| Credentials in environment variables | **PASS** | `.env`/production secrets are excluded from Git. `.env.example` contains blank non-secret templates. Production credentials are defined as environment-variable names in the Railway service configuration. |
| HTTPS only | **PASS** | Railway public networking requires TLS and redirects plaintext HTTP at the edge. The app now also enforces HTTPS when `HTTPS_ONLY=true` and rate-limits `/api/auth`. |
| Encryption in transit | **PASS** | Production app uses HTTPS; Supabase API access uses HTTPS. Railway manages TLS certificates for its public domain. |
| Encryption at rest | **PLATFORM-MANAGED / VERIFY CONTRACTUALLY** | The connected tools do not expose an independent cryptographic-at-rest attestation for this deployment. Verify current provider security/compliance terms and contract/DPA before legal sign-off. |
| Authentication | **IMPLEMENTED** | Server verifies Supabase access tokens against `/auth/v1/user` and enforces the exact PM allowlist. |
| RLS for core commerce tables | **VERIFIED** | Products, inventory, orders, order_items, customer_profiles, product_prices and commerce_channels have RLS enabled with authenticated/admin policies. |
| Customer/reporting views | **RESTRICTED TO AUTHENTICATED** | `customer_analytics`, `commercial_dashboard`, and `reporting_dashboard` are granted to the `authenticated` role, not `anon`. One allowlisted admin/staff account is currently mapped in `admin_users`. Continue RBAC review before adding operators. |
| PCI DSS | **NOT SIGNED OFF** | Current commerce schema contains no PAN/card-number field. Final PCI scope still depends on the actual payment flow, processor, checkout architecture, contracts and applicable SAQ/ROC. |
| GDPR | **CONDITIONAL / NOT SIGNED OFF** | Current market configuration has no EU market, but GDPR can still apply when Article 3 conditions are met. Privacy, legal basis, rights handling, retention, records of processing and international transfer safeguards remain to be validated. |
| Egypt PDPL | **CONDITIONAL / ACTION REQUIRED** | Egypt's PDPL No. 151/2020 and Executive Regulations No. 816/2025 are the current framework. DPO/governance, notices/consent, retention and cross-border controls must be mapped to the live data flows. |
| Saudi PDPL | **CONDITIONAL / TRANSFER REVIEW REQUIRED** | Saudi rules apply to processing of Saudi residents' data and regulate transfers outside the Kingdom. The current Supabase EU and Railway SFO deployment therefore requires a documented transfer assessment/safeguards before Saudi personal-data processing is treated as compliant. |
| UAE PDPL | **CONDITIONAL / TRANSFER REVIEW REQUIRED** | UAE Federal Decree-Law No. 45 of 2021 includes cross-border transfer requirements. The current non-UAE hosting regions require a documented transfer/privacy assessment before UAE personal-data processing is treated as compliant. |

## Compliance gate

The project **must not be described as “GDPR compliant”, “PCI compliant”, “Egypt PDPL compliant”, “Saudi PDPL compliant”, or “UAE PDPL compliant”** until the remaining legal, contractual and operational checks are completed.

Required evidence for final sign-off:
1. Data inventory and data-flow map by market and provider.
2. Processor/subprocessor list and current DPAs.
3. Privacy notice, consent/legal-basis matrix, retention schedule and deletion/DSAR workflow.
4. International-transfer assessment and safeguards for applicable jurisdictions.
5. Payment-flow diagram proving whether the PM application touches cardholder data.
6. Appropriate PCI DSS v4.x validation path (SAQ/ROC and service-provider responsibility matrix).
7. Incident/breach response contacts and tested recovery procedure.


## Supabase Advisor snapshot — 2026-10-05

Current security advisor findings:
- **1 actionable warning:** leaked password protection is disabled in Supabase Auth. This is an external project-auth setting and has not been changed through the connected toolset.
- **3 anonymous-access heuristic warnings:** the listed policies are explicitly scoped to the `authenticated` role when inspected in `pg_policies` for `currencies`, `customer_profiles`, and `product_prices`. Treat these as advisor heuristics, not evidence that `anon` currently has access. Re-check after any policy migration.

Advisor remediation link for the password-protection control: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
