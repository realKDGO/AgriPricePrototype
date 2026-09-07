# AgriPrice React frontend

A fresh frontend foundation for crop price information and decision support in Jala-Jala, Rizal. Built with React, Vite, React Router, Tailwind CSS, Axios, Recharts, and Lucide React. JavaScript and npm are used throughout.

## Run locally

Requires Node.js 20.19+ or a supported newer LTS release.

```bash
npm ci
npm run dev
```

Open the URL printed by Vite. The development server uses port 4173.

```bash
npm run build
npm run preview
npm test
```

## Explore the roles

The app opens at `/farmer`, accessible without a login. Open `/login` and choose Farmer, MAO, or Admin under **Frontend prototype**. These buttons create browser-local demo sessions.

Optional login-form demonstration:

| Role   | Email                 | Demo password  |
| ------ | --------------------- | -------------- |
| Farmer | farmer@agriprice.demo | AgriPriceDemo! |
| MAO    | mao@agriprice.demo    | AgriPriceDemo! |
| Admin  | admin@agriprice.demo  | AgriPriceDemo! |

Do not enter real credentials. Registration creates a local sample profile without storing a password. Password recovery displays a simulation result and sends no email. Route guards demonstrate UI boundaries only. They are not a security mechanism.

## Implemented workflows

- Public/farmer dashboard, current and historical prices, crop detail tabs, 1–6 month illustrative forecasts, market comparisons, profit estimator, CSV reports, profile, settings, help, and mobile More menu.
- MAO crop and market create/edit/archive, price create/edit, validation approval/rejection with notes, historical record create/edit, forecasts, reports, and decision-support tools.
- Admin user/MAO account creation and editing, role assignment and suspension, responsibility matrix, audit search/export, connection status, security overview, local snapshot download/restore, draft configuration, and technical reports.
- Browser-local changes persist across reloads. Price submissions do not enter public views until verified. Editing a verified price creates a pending replacement and retains the original until approval.
- Responsive mobile record cards, safe-area-aware farmer bottom navigation, native modal dialogs with keyboard focus containment, and management drawers.

## Architecture

```text
src/
  components/common/   Shared cards, forms, tables/cards, dialogs, charts
  components/farmer/   Crop card
  layouts/             Public, Farmer, MAO, Admin and shared shell
  pages/public/        Authentication demonstrations
  pages/farmer/        Information and decision support
  pages/mao/           Agricultural management
  pages/admin/         Technical administration
  data/mock/           Central seed records
  services/            Browser-local repository and Axios client
  hooks/               App data/session provider
  routes/              Route tree, guards and navigation configuration
  utils/               Formatting, exports and financial calculations
```

Shared agricultural tools are reused between MAO and Farmer. Admin does not inherit agricultural management. Route-level lazy loading separates secondary pages. Styling uses Tailwind utilities with centralized CSS tokens and reusable semantic component classes. No legacy CSS, HTML pages, or JavaScript logic was copied. Supplied crop photos and favicon were reused.

## Replace mock data with the backend

See `docs/BACKEND-INTEGRATION.md`. Components consume the app context and domain DTOs rather than import seed data directly. The current mock repository persists one local dataset. `services/api.js` provides a configured Axios client and illustrative remote adapter methods. The backend contract is proposed, not an assertion about existing Express endpoints.

## Data and scope

All prices are samples, dated September 5, 2026. The local collection and trading points are fictional comparison locations within Jala-Jala, not verified market listings. Forecasts are fixed illustrative records, not outputs of an implemented forecasting model. The final forecasting method remains a project decision.

Net return = quantity × selling price − transportation − other expenses. It is profit only if all costs are included. Transport estimates use a documented sample load formula and can be replaced in the calculator.

The app is frontend-only. No production API, database, authentication, email delivery, security enforcement, monitoring, or database backups are implemented.

## Deployment

`npm run build` outputs `dist/`, suitable for static hosting with SPA fallback to `index.html`. No Next.js, server framework, or backend is required. A Sites manifest is included for the private preview. For another host, deploy `dist/` and configure rewrites for deep links.

## Project notes

- `docs/SCOPE-REVIEW.md`: source review and decisions.
- `docs/BACKEND-INTEGRATION.md`: data contracts and next integration steps.
- `docs/QA.md`: checks performed and limitations.
- Keep your existing repository's backend, database, and docs folders. Integrate this project under the frontend directory through the frontend integration branch; do not replace the entire repository.
