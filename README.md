# Leads CRM UI

Frontend for the Leads CRM, built on the patterns of `builder-crm-ui` rather than a new
architecture. Three modules: **Leads**, **Projects**, **Channel Partners**.

React 19, Vite 7, TypeScript, TanStack Router + Query + Table, Zustand, Tailwind v4, shadcn/Radix,
react-hook-form + Zod, AWS Amplify.

## Running it

```bash
npm install
```

```bash
cp .env.example .env && npm run dev
```

The backend must be running at `VITE_SERVER_URL` (default `http://localhost:8090`).

Without Cognito configured the app still runs and shows the sign-in screen with an explanatory
banner; sign-in itself will not work until a pool exists. See the backend README for
`scripts/provision-cognito.sh`.

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

**Lists.** One `DataTable` over a TanStack Table instance in fully manual mode — paging, sorting
and filtering all happen on the server, so letting the table sort its one loaded page would
disagree with the next one. Each module has a Zustand store built by `createListFilterStore`, which
resets to page one on any filter change but not on a column-visibility toggle.

**The filter drawer is generated.** `GET /leads/filter-fields` publishes each field's group, value
type, allowed operators and options source; `AdvancedFilterDrawer` renders controls from that, and
each dropdown's options are fetched only when it opens. Adding a filterable field on the server
adds a control here with no frontend change.

## Deviations from `builder-crm-ui`

### 1. One service, not a gateway of many

The reference client takes a microservice namespace (`api.getService("pre-sales", "leads")`). This
backend is a single service, so the namespace collapses to its context path. The resource-scoped
shape callers use is unchanged.

### 2. Sign-in only

Ported: the sign-in route and form, the new-password challenge, the Amplify provider, the auth
provider and the protected-route guard. Dropped: sign-up, forgot password, email verification,
subscription checks, reCAPTCHA, and the platform-user builder-selection screen — none are needed
for these three modules.

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
panel, the info panel, permissions/RBAC route guards, the craft.js page builder, three.js, TipTap,
Google Maps address entry, the multi-step lead wizard (a single dialog replaces it), bulk upload
and export dialogs.

### 6. Smaller things

- No `routeTree.gen.ts` in git; the Vite plugin regenerates it (it is gitignored, as in the
  reference).
- `Loader`'s branded wordmark variant is replaced by a plain page loader — that one was branding
  rather than a pattern.
- Missing Cognito variables are fatal only in a production build. In development they warn, so the
  app renders the sign-in screen that explains the problem instead of a blank page.
- Delete confirmations use `window.confirm` rather than the reference's alert dialog.

## Verified

- `npm run build` — clean.
- `tsc -b --force` — no type errors under `strict`, `noUnusedLocals`, `noUnusedParameters`.
- Dev server renders: `/` redirects to `/leads`, the guard redirects to `/signin`, and the sign-in
  screen renders with the design system intact.

The authenticated shell — the three list screens, their tables and forms — has not been exercised
against live data, because both the route guard and the API require a real Cognito token.
