# ICPS Enterprise — Cypress E2E Test Suite

End-to-end test suite covering the complete RBAC authentication and authorization flow for the 5-role Insurance Claim Processing System.

## Test Coverage

| Category | Tests | Description |
|----------|-------|-------------|
| Login Page | 3 | Page render, demo buttons, auto-fill |
| Role Auth (×5) | 15 | Login, session restore, welcome messages |
| Error Handling | 2 | Invalid credentials, stay-on-page |
| Logout Flow | 1 | Dashboard access after login |
| Navigation Guards | 2 | Unauthenticated redirect, unknown route |
| Dashboard | 7 | Metrics, claims table, navigation, error state |
| **Total** | **30** | |

## Screenshots

| Screenshot | Description |
|------------|-------------|
| `01-login-page.png` | Login page with ICPS Enterprise branding |
| `02-demo-buttons.png` | 5 demo account buttons for RBAC roles |
| `03-admin-dashboard.png` | Admin dashboard with metric cards and charts |
| `04-error-toast.png` | Invalid credentials error via sonner toast |
| `05-error-state.png` | Dashboard error state on API failure |
| `06-role-guard-redirect.png` | Unauthenticated user redirected to login |
| `07-metric-cards.png` | Analytics metric cards display |

## Running Tests

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Start the client dev server (API mocking used for tests)
cd client && npm run dev

# In another terminal, run Cypress
npx cypress run --headless --browser chrome

# Or open interactive mode
npx cypress open
```

All API calls are mocked via `cy.intercept()` — no backend or database required.

## Test Approach

- **Authentication flow**: Validates JWT-based login/logout with HttpOnly cookies
- **5-role RBAC**: Tests each role independently (Admin, Manager, Policyholder, Surveyor, Provider)
- **Session persistence**: Verifies cookie-based session survives page reload
- **Error resilience**: Toast notifications for auth failures; retry state for API failures
- **Navigation guards**: Protected routes redirect unauthenticated users to login
