# Security Specification — Lexical Decision Psychology Lab

## 1. Data Invariants
1. Every document in `/trial_responses/{responseId}` represents an immutable single-trial lexical decision submitted by a participant.
2. Document IDs (`responseId`) and `sessionId` values must match `^[a-zA-Z0-9_\-]+$` and be at most 128 characters long.
3. All required fields (`id`, `sessionId`, `participantCode`, `word`, `category`, `answer`, `timestamp`, `createdAt`) must be present, with no unknown shadow fields (`hasOnly`).
4. `category` must strictly belong to `["Real English Words", "Harry Potter Coined Words", "Plausible Nonwords"]` and `answer` must strictly belong to `["Yes", "No"]`.
5. `createdAt` must equal `request.time` (server timestamp) so clients cannot forge creation order.
6. Responses are append-only (`update` is universally denied).
7. Reading (`get`, `list`) and deleting (`delete`) participant data are strictly restricted to the verified researcher (`request.auth != null && request.auth.token.email_verified == true && request.auth.token.email == 'wyammhmd1@gmail.com'`).

## 2. The "Dirty Dozen" Adversarial Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated List Read**: Unauthenticated client requests `list /trial_responses` -> DENIED.
2. **Non-Researcher Authenticated Read**: Signed-in user with different email requests `get /trial_responses/{id}` or `list /trial_responses` -> DENIED.
3. **Unverified Email Admin Spoof**: Token with `email: 'wyammhmd1@gmail.com'` and `email_verified: false` requests `list /trial_responses` -> DENIED.
4. **Shadow Field Injection**: Create payload includes `isAdmin: true` or `extraField: "hack"` -> DENIED (`hasOnly`).
5. **Missing Required Field**: Create payload omits `category` or `createdAt` -> DENIED (`hasAll`).
6. **Spoofed Server Timestamp**: Create payload sets `createdAt` to a client string or past timestamp instead of `request.time` -> DENIED.
7. **Invalid Answer Enum**: Create payload sets `answer: "Maybe"` -> DENIED.
8. **Invalid Category Enum**: Create payload sets `category: "Custom"` -> DENIED.
9. **Oversized String / Resource Poisoning**: `participantCode` > 64 chars or `word` > 64 chars -> DENIED.
10. **ID Poisoning**: Document path `responseId` contains invalid characters or exceeds 128 chars -> DENIED (`isValidId`).
11. **Tampering / Update Attempt**: Any user (even admin) attempts `update /trial_responses/{id}` -> DENIED (`allow update: if false`).
12. **Unauthorized Delete**: Unauthenticated or non-admin user attempts `delete /trial_responses/{id}` -> DENIED.
