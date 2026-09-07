# Backend integration guide

## Current data boundary

`AppProvider` loads from `mockRepository` and exposes `data`, `save`, `commit`, session actions, and feedback. Page components consume that API. The only source of initial sample records is `data/mock/seed.js`.

The Axios instance in `services/api.js` uses `VITE_API_BASE_URL`, credentials, and a 15-second timeout. Its sample bootstrap and update methods are an adapter skeleton, not live endpoints. Replace the provider's repository calls with asynchronous operations matching the actual Express API. Add pending/error states around mutations before connecting network writes.

Do not send the whole mock dataset to production. Replace collection-level saves with explicit resource methods, server validation, and server-generated audit records.

## DTO concepts

| Resource         | Fields                                                                  |
| ---------------- | ----------------------------------------------------------------------- |
| Crop             | id, name, category, unit, image, status                                 |
| Market           | id, name, location, transport, status                                   |
| Price            | id, cropId, marketId, price, previous, date, status, source, reviewNote |
| Historical price | id, cropId, marketId, date, price, status                               |
| Forecast         | id, cropId, date, price, status                                         |
| Account          | id, name, email, role, municipality, status, lastLogin                  |
| Audit event      | id, date, actor, action, type, status                                   |

Prices are Philippine pesos per kilogram. Dates are date-only ISO strings. Production monetary calculations should use a defined decimal/centavo strategy rather than unqualified JavaScript floating-point values.

## Integration sequence

1. Finalize FARMER, MAO, and ADMIN server roles and the approved municipality scope.
2. Connect actual authentication and sessions. Remove demo entry buttons and constant demo-password handling. Never trust client route guards or browser storage for permissions.
3. Implement read-only crops, markets, latest verified prices and historical endpoints.
4. Connect MAO resource mutations and explicit approval/rejection endpoints. Enforce record versioning and audit trails server-side.
5. Replace sample forecasts with evaluated model outputs and provenance/uncertainty metadata.
6. Connect cost data, reports and account preferences as approved.
7. Connect Admin account, security, monitoring and backup operations. Remove prototype-only local snapshot and draft configuration flows.
8. Add network loading/error/retry states, concurrency handling, pagination, automated integration tests and server-side authorization tests.

## Financial logic

- Revenue = quantity × selling price.
- Net return = revenue − transport − other expenses.
- Sample transport = rounded base cost × (0.65 + 0.35 × quantity / 100), with zero transport at zero quantity.
- Rank markets descending by net return. No distance penalty or hidden score.
- Only active crops/markets and latest verified prices participate.
- Calculator transport is editable. Selecting a crop/market or changing quantity refreshes its sample transport estimate. Other expenses remain explicit.

## Persistence and security

Mock data uses `agriprice.mock.v1` in localStorage. Demo sessions use `agriprice.session` in sessionStorage. Snapshots use `agriprice.backup.v1`. These are disposable, browser-local fixtures. No passwords are persisted. Real security requires secure server sessions, hashing, authorization, rate limits and appropriate audit storage. Deployment-level private access and application-level authentication are separate concerns.
