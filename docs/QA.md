# Quality assurance

## Build and domain tests

The Vite production build succeeds. Six Node tests cover:

- Revenue and both expense categories, including negative net return.
- Exclusion of pending quotations from public prices.
- Replacement of the public quotation after approval without duplicate market entries.
- Market ranking by net return rather than headline price.
- Exclusion of archived crops and markets from current comparisons.
- Finite percentage movement when the prior price is zero.

## Responsive checks

A temporary browser inspection harness loaded the real React routes in independently sized viewports. It was excluded from the delivered application. The requested widths were 320, 360, 390, 430, 768, 1024, 1366 and 1920 CSS pixels. The desktop browser's scrollbar occupies up to 15 pixels inside those widths, which also exercises slightly narrower content space.

32 distinct pages were measured at all eight widths, totaling 256 initial checks:

- 14 public/farmer/authentication pages.
- 8 MAO pages.
- 10 Admin pages.

Public and Admin pages had no document-level horizontal overflow. The initial 320 px MAO checks exposed a 10 px header overflow; the compact management header was corrected and inspected again. No broken images were found in the measured routes.

Visual screenshot review included the Farmer dashboard at all eight widths, small-phone forms and records, crop cards, the management drawer and edit modal at 320 px, the Admin dashboard at desktop width, and account/access/monitoring screens at mobile width. Screens were inspected in the browser rather than inferred from Tailwind classes.

## Interaction checks

- Farmer price search narrowed the displayed crop cards correctly.
- MAO crop creation and editing worked, with local persistence and search.
- A pending Tomato quotation was approved. The Farmer price screen then displayed ₱65.00/kg rather than ₱62.00/kg.
- Management drawer opened and closed at 320 px; the crop form fit the viewport.
- Calculator result for 100 kg × ₱49, less ₱120 transport and ₱80 other expenses, displayed ₱4,700.00.
- Zero quantity replaced the calculation with a useful validation message.
- Demo role navigation opened the distinct MAO and Admin workspaces.

## Defects resolved

- Corrected an initial JSX compilation error.
- Corrected the 320 px management header overflow.
- Replaced unconditional crypto.randomUUID use with a local-HTTP-compatible prototype ID helper.
- Adjusted compact metadata sizes and made the mobile dashboard expose a crop quotation immediately.
- Added a visible marker for single-month forecast charts.
- Updated demo email login to select the matching account rather than the first role account.

- Admin account editing changed a sample account to Suspended. Direct Admin-to-MAO navigation returned to login.
- Removed an overbroad Recharts width rule; confirmed the single-point desktop chart and six-month mobile chart render visibly, then rechecked chart overflow at all eight widths.

## Limits

Browser width checks are not physical Android/iOS device certification. No real backend, password recovery, API health service, forecast algorithm, security enforcement or production backup was tested because none is connected. The full manual test matrix for every field permutation, long localized text, screen-reader behavior, physical keyboard overlays and real device safe areas should continue during development. Browser-extension metadata errors were separate from the application. A transient development hot-refresh context error was resolved by reloading after source formatting.
