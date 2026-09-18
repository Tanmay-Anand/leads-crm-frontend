# Leads CRM UI

Frontend for the Leads CRM, built on the patterns of `builder-crm-ui` rather than a new
architecture. Modules: **Leads**, **Meetings**, **Projects**, and **User Management** (Users plus
a Roles & Permissions matrix editor). **Channel Partners** still exists as a route and API, but is
unreachable from the nav or by URL - this tenant is itself the broker/channel-partner, so tracking
external partner brokers referring leads to a developer doesn't apply; see
`routes/_protected/channel-partners`'s own class doc.

React 19, Vite 7, TypeScript, TanStack Router + Query + Table, Zustand, Tailwind v4, shadcn/Radix,
react-hook-form + Zod, AWS Amplify.

## Running it

```bash
npm install
```

```bash
cp .env.example .env && npm run dev
```

Fill in the two Cognito values and nothing else. The backend is reached at a **relative** path
(`/leads-crm/...`), which the Vite dev server proxies to `http://localhost:8090` — so start the
backend and it just works. `VITE_SERVER_URL` is an override for pointing at a backend elsewhere,
and is normally left unset.

Without Cognito configured the app still runs and shows the sign-in screen with an explanatory
banner; sign-in itself will not work until a pool exists. See the backend README for
`scripts/provision-cognito.sh`.

## Deployment

**Currently hosted on Vercel**, not Amplify - `vercel.json` proxies `/leads-crm/*` straight to the
backend host's IP and rewrites everything else to `/` for the SPA router. An `amplify.yml` also
still exists in this repo from an earlier hosting setup; it is not what serves the live app and has
not been kept up to date. If you're setting up hosting from scratch, follow Vercel's own GitHub
import flow (connect the repo, framework preset "Vite", build command `npm run build`, output
`dist`) and set the environment variables below on the Vercel project - do not follow the Amplify
instructions this section used to have.

**Environment variables to set on the hosting platform** (never in the repo - `env.ts` throws at
module load if a required one is missing, so a misconfigured deploy fails the build with the
variable named rather than shipping a bundle that breaks at runtime):

| Variable | Value |
| --- | --- |
| `VITE_AWS_COGNITO_USER_POOL_ID` | from the backend's Cognito provisioning |
| `VITE_AWS_COGNITO_USER_POOL_CLIENT_ID` | from the backend's Cognito provisioning |
| `VITE_AWS_REGION` | `ap-south-1` |
| `VITE_SERVER_URL` | leave unset - `vercel.json`'s rewrite makes the API same-origin, same as the Vite dev proxy does locally |
| `VITE_ENGAGETO_API_KEY` | the WhatsApp chat integration's key - see `.env.example` for why it's a real credential despite being a `VITE_*` var |

**Allow the origin on the API.** Set `APP_CORS_ORIGINS` in the backend host's `/opt/leads-crm/.env`
to whatever origin actually serves the frontend and restart the stack. Until then the site loads
and every request is blocked by CORS - it fails only in the browser, so `curl` against the API
will look perfectly healthy.

## Structure

The reference's layering, kept as-is:

```
src/
  app/providers/        auth, query, router, theme
  domains/<module>/
    domain/             types, Zod schemas — no React
    application/store/  Zustand filter state
    infrastructure/api/ the service that talks to the backend
    presentation/       hooks, components, pages
  infrastructure/       env, http client, session, Amplify config
  routes/               TanStack file-based routes
  shared/               ui primitives, data-table, layout, lib, types
```

`domain` holds what the module *is*, `infrastructure` how it reaches the outside, `application`
what state it keeps, `presentation` what the user sees. Dependencies point inwards.

## How the pieces fit

**Auth.** `amplify-auth.provider` is the only file that imports Amplify; everything above it deals
in domain types. `AuthProvider` owns the session and publishes the tenant that the API client sends
as `x-tenant-id`. The `_protected` route guard resolves the auth state with `fetchQuery` before
anything renders, sharing the cache entry the provider already populated, and redirects to
`/signin` with the intended destination in the URL.

**API client.** Fetch-based, with a module-scoped token cache, a shared in-flight refresh so six
concurrent requests make one Amplify round-trip, a single retry on 401 for the expiry race, and
uniform error handling. `api.getService("leads")` returns a client with that resource prefixed.

Its base URL is **relative**. The dev server proxies `/leads-crm` to the local backend and the
hosting platform rewrites it to the deployed one, so requests are same-origin in both — which
means no CORS anywhere, and no deployment URL compiled into the bundle that could be wrong. An
absolute `VITE_SERVER_URL` remains available as an override.

**Lists.** One `DataTable` over a TanStack Table instance in fully manual mode — paging, sorting
and filtering all happen on the server, so letting the table sort its one loaded page would
disagree with the next one. Each module has a Zustand store built by `createListFilterStore`, which
resets to page one on any filter change but not on a column-visibility toggle.

**The filter drawer is generated.** `GET /leads/filter-fields` publishes each field's group, value
type, allowed operators and options source; `AdvancedFilterDrawer` renders controls from that, and
each dropdown's options are fetched only when it opens. Adding a filterable field on the server
adds a control here with no frontend change.

## Authorization (RBAC)

Mirrors the backend's two-layer model (see the backend README) rather than the reference's. The
core fix relative to `builder-crm-ui`: it uses `permissions === null` to mean "unrestricted", and
`getPermissionsFromCache()` returns `null` for *both* "unrestricted" and "not loaded yet" - so a
restricted user can see the whole UI for a frame on a hard reload, and (a second, separate bug) its
route guard does `permissions.some(async p => ...)`, where an async callback always returns a
truthy Promise, so the guard never actually denies anything.

`domains/authorization/domain/permission.types.ts` replaces the sentinel with an explicit
discriminated union (`loading` / `unauthenticated` / `unrestricted` / `restricted`), and
`application/route-guards.ts`'s `requireRoutePermission` is a synchronous rewrite. `GET /users/me`
populates the cache once, in `_protected`'s `beforeLoad`, before anything renders - a failure there
(expired token, a backend blip) falls back to `/signin` rather than crashing into the generic error
boundary, which is what happens if that fetch is left to throw uncaught into a route guard.

- **`RequirePermission`/`usePermission`** (`shared/ui/common/require-permission.tsx`) - reactive,
  built on `useQuery`, unlike the reference's bare cache read. Convention: `RequirePermission` to
  hide a create affordance, `hasPermission()` to *disable* (not hide) a row action, since hiding
  row actions makes menus jump between rows.
- **The permission matrix** (`domains/role-management`) renders from `GET /permissions/catalog`,
  never from a hardcoded list, and fixes two reference bugs: a parent checkbox's `checked` state
  derives from its own permission plus its children's, but the reference's toggle only ever flips
  the parent's *own* action - so an indeterminate parent can never be cleared by clicking it. And a
  child's label there comes from `key.split("/")[1]`, the wrong segment past one level of nesting.
- **Users tab** (`domains/user-management`) - a Sheet-hosted create/edit form with no password
  field on edit at all (a separately gated "Reset password" row action instead), and `/users` and
  `/roles` as two real routes under `/user-management`, not `?tab=` state, so each tab can carry
  its own guard and search schema.
- An eslint `no-restricted-imports` rule keeps the non-reactive permission-cache read
  (`application/permission-cache.ts`, for `beforeLoad` only) out of `presentation/` and `ui/` code.

## Deviations from `builder-crm-ui`

### 1. One service, not a gateway of many

The reference client takes a microservice namespace (`api.getService("pre-sales", "leads")`). This
backend is a single service, so the namespace collapses to its context path. The resource-scoped
shape callers use is unchanged.

### 2. Sign-in only

Ported: the sign-in route and form, the new-password challenge, the Amplify provider, the auth
provider and the protected-route guard. Dropped: sign-up, forgot password, email verification,
subscription checks, reCAPTCHA, and the platform-user builder-selection screen — none are needed
here.

The tenant comes from the signed-in user's `custom:tenantId` claim rather than from a builder
picker. `tenantSession` keeps the setter, so a platform user could be pointed at a tenant without
the API client changing.

### 3. A trimmed DataTable

The reference's is ~1,500 lines with saved filters, column pinning and resizing, row selection,
bulk actions, export and a date-range picker. This one keeps the parts these screens use —
toolbar with scoped search, filter drawer, column visibility, pagination, loading skeletons — at
about a third the size, with the same prop shape.

### 4. One store factory instead of three stores

The reference hand-writes a filter store per domain. With three near-identical modules that is
three copies of one reducer, so `createListFilterStore` builds them and the behaviour worth keeping
lives in one place.

### 5. Dropped wholesale

Datadog RUM, Mixpanel, Storybook, Playwright, the guided tour, saved filters, the audit-trail
panel, the info panel, the craft.js page builder, three.js, TipTap, Google Maps address entry, the
multi-step lead wizard (a single dialog replaces it), bulk upload and export dialogs.

Permissions/RBAC route guards were dropped **at first**, then ported back in - see
[Authorization](#authorization-rbac) below. They are not the reference's implementation; they fix
two bugs it has.

### 6. Smaller things

- Currently hosted on Vercel - see [Deployment](#deployment). This flipped at least once already
  (an earlier pass moved it *to* Amplify, away from `builder-crm-ui`'s own Vercel setup); check
  which config file actually matches the live URL before trusting either `vercel.json` or
  `amplify.yml` at face value.
- `src/routeTree.gen.ts` is committed, as it is in the reference. It is generated code, so the
  instinct is to ignore it — but `npm run build` runs `tsc -b` before `vite build`, and the
  plugin that generates it only runs during the Vite step. On a fresh clone the typecheck fails
  before anything can generate it, which is exactly how the first Vercel deploy broke.
- `Loader`'s branded wordmark variant is replaced by a plain page loader — that one was branding
  rather than a pattern.
- Missing Cognito variables are fatal only in a production build. In development they warn, so the
  app renders the sign-in screen that explains the problem instead of a blank page.
- Delete confirmations use `window.confirm` rather than the reference's alert dialog.

## Verified

- `npm run build`, `npm run typecheck`, `npm run lint` — all clean.
- `npm run test` (Vitest, scoped to pure logic - `grants()`/`checkPermission()`'s truth table,
  where every reference RBAC bug lives) — passing.
- Dev server renders: `/` redirects to the first route the signed-in user actually has `view`
  access to (not a hard-coded `/leads`), the guard redirects to `/signin`, and the sign-in screen
  renders with the design system intact.
- Against the provisioned pool, a deliberately wrong password returns *"Incorrect email or
  password"* — Cognito reachability, SRP, and the error mapping in `auth-errors.ts` all work.
- Signed in as an existing `TENANT_ADMIN`: every screen (Leads, Meetings, Projects, User
  Management) renders against live data; a restricted role sees only the nav entries it has `view`
  access to, and a hard reload of a restricted screen shows no flash of ungated UI.

**Known gap:** creating a user, resetting a password, or toggling one active/inactive all end in a
real Cognito Admin API call on the backend, which needs AWS credentials scoped to the pool in the
backend's `.env` - see that repo's README. This frontend's own validation, role/custom-role
pickers, and permission gating are all exercised and correct; only that one backend-side write
path is currently blocked pending those credentials.
