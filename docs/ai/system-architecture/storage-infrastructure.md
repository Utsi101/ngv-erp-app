# Storage Infrastructure & Document Vault

**Spoke Category:** System & Architecture
**Purpose:** Defines the strict architectural patterns for managing sensitive leather export documents using Amazon S3 and CloudFront with RSA-signed access.
**CRITICAL SYNC RULE:** Changes to `CLOUDFRONT_KEY_PAIR_ID` or `private_key.pem` require immediate synchronization across all environments and an update to this registry.

---

## 1. Core Philosophy: The Zero-Trust Vault

This ERP handles legally binding international trade documents. Data integrity and access control are non-negotiable.

- **Rule 1: Strict Decoupling.** The Postgres database NEVER stores files. It only stores the `s3Key`.
- **Rule 2: Locked S3 (OAC).** The S3 bucket `ngv-export-vault` has **Block All Public Access** enabled. Access is granted ONLY to the CloudFront Service Principal via **Origin Access Control (OAC)**.
- **Rule 3: RSA-Signed Retrieval.** Files are never served via public URLs. Next.js generates an RSA-signed CloudFront URL with a **15-minute TTL**.
- **Rule 4: Validated POST Uploads.** We use **Presigned POST** (not PUT) to enforce file size and MIME type restrictions at the AWS hardware firewall level before the file even reaches storage.

---

## 2. Technical Stack & Environment

### 2.1 NPM Specification (AWS SDK v3)

- `@aws-sdk/client-s3`: Base storage operations.
- `@aws-sdk/s3-presigned-post`: Secure, firewall-validated uploads.
- `@aws-sdk/cloudfront-signer`: RSA-SHA1 signing for edge delivery.

### 2.2 Environment Configuration

```env
# AWS Core
AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET_NAME="some-vault"

# CloudFront Delivery
NEXT_PUBLIC_CLOUDFRONT_DOMAIN="https://d123...cloudfront.net"
CLOUDFRONT_KEY_PAIR_ID="K2J..."
# NOTE: Private key must be stored with \n for line breaks in .env
CLOUDFRONT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

---

## 3. Data Flow Architectures

### 3.1 The "Secure View" Flow (Verified)

1.  **Client:** Requests a document (e.g., `ORD-001_PI.pdf`).
2.  **Server Action (`getViewUrl`):** \* Checks user session.
    - Reads `CLOUDFRONT_PRIVATE_KEY` and converts `\n` to actual line breaks.
    - Uses `@aws-sdk/cloudfront-signer` to create a signed URL.
3.  **Edge:** CloudFront verifies the RSA signature using the Public Key stored in AWS.
4.  **Origin:** CloudFront fetches the object from S3 using its OAC permissions.

### 3.2 The "Secure Upload" Flow (Presigned POST)

1.  **Server Action:** Generates a POST policy specifying:
    - `bucket`, `key`, `Content-Type`.
    - `content-length-range`: [1, 10485760] (Strict 10MB limit).
2.  **Client:** POSTs `FormData` directly to S3.
3.  **AWS:** Rejects the upload automatically if it is >10MB or the wrong file type.

---

## 4. Directory Taxonomy (The Vault Map)

All S3 keys MUST follow this human-readable, auditable structure:

| Entity                               | S3 Path Pattern                                                       |
| :----------------------------------- | :-------------------------------------------------------------------- |
| **Order Docs**                       | `orders/[orderId]/phase_[N]/[docTag]_[timestamp]_[sanitizedFileName]` |
| **Buyer KYC**                        | `buyers/[buyerId]/kyc/[docType]_[timestamp]_[filename]`               |
| **CRM & Business Profile Documents** | `company/[companyId]/[documentType]_[timestamp]_[sanitizedFileName]`  |

---

## 5. Security Validation Boundaries

### 5.1 MIME Type Restrictions

- **Allowed:** `application/pdf`, `image/jpeg`, `image/png`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (Excel).
- **Action:** Block all others (e.g., `.exe`, `.zip`, `.html`) to prevent XSS and malware.

### 5.2 Encryption at Rest

- All objects in `ngv-export-vault` use **SSE-S3** (AES-256) encryption by default.

---

## 6. Resilience & Cleanup

### 6.1 Orphan Management

- **The "Pending" Tag:** Files are uploaded with an S3 object tag `Status=Pending`.
- **The Commit:** After the Prisma DB record is successfully saved, a Server Action removes the tag.
- **The Reaper:** An S3 Lifecycle Rule is configured to permanently delete any object with `Status=Pending` that is older than 24 hours (cleanup for failed/interrupted uploads).

### 6.2 Versioning Rule

- **Key Immutability:** Never overwrite. If a document is revised, append a new Unix timestamp to the filename. The DB record is updated to point to the new key; the old key remains in S3 for compliance auditing.

---

## 7. Troubleshooting Registry

- `ERR_OSSL_UNSUPPORTED`: Usually indicates the Private Key in `.env` is missing proper `\n` line breaks or the header/footer is incorrect.
- `AccessDenied (403)` on Signed URL: Verify S3 Bucket Policy allows `s3:GetObject` for the CloudFront OAC.
- `MissingKey`: Ensure the `CLOUDFRONT_KEY_PAIR_ID` matches the Public Key ID in the AWS Console.

---
