# Source review

Read the supplied `AgriPrice_Master_Document_Updated_v2.1.md` in full. Its internal heading says Version 2.0, although the filename is v2.1. The supplied file's content was used as the primary source for this recreation, as explicitly requested.

Inspected the reference ZIP structure, the shared agricultural dataset, farmer dashboard, management navigation, and authentication/management patterns. This was not an analysis or modification of the live GitHub repository.

## Retained ideas

- Green identity, crop photography, crop price cards and peso formatting.
- Current/historical price views, forecast horizon, market comparison, cost calculator, reporting, account pages.
- Distinct farmer, MAO and system-administration responsibilities.

## Corrections

- Replaced province-wide sample markets with a Jala-Jala-focused dataset. Two comparison points are explicitly fictional, avoiding claims of verified local listings.
- Replaced legacy `admin-crops`, `admin-markets`, `admin-prices`, and similar names with `/mao/*` routes.
- Admin receives technical/account functions, not crop or market management.
- Public information is accessible without signing in.
- Removed unsubstantiated explanatory claims about weather, supply conditions and regional demand from sample insights.
- Market ranking follows estimated net return. There is no unexplained score or distance penalty.
- All financial tools use consistent verified data and expense calculations.
- Static multi-page navigation, old responsive styles, and custom DOM-select scripts were discarded.

## Responsive design

Farmer pages use cards and bottom navigation below 1024 px. Management layouts switch from desktop sidebar to a modal navigation drawer. Management tables become structured cards below 1024 px. Grids and content widths adapt continuously; no device names or device-specific checks are used. The public desktop workspace has a restrained green welcome panel, neutral crop cards, and a focused trend/decision-support section. All pages share spacing, color and component conventions.

## Unresolved production decisions

Forecast algorithm and validation, data acquisition procedure, actual monitored market list, backend route contracts, JWT/session strategy, and production role enforcement must be agreed and connected later. This recreation does not make those decisions on behalf of the team.
