describe('ICPS Enterprise RBAC Flows', () => {
  beforeEach(() => {
    cy.viewport(1280, 720)
    cy.visit('/login')
  })

  context('Login Page Render', () => {
    it('renders the login page with title and inputs', () => {
      cy.contains('ICPS Enterprise').should('be.visible')
      cy.get('#email').should('exist')
      cy.get('#password').should('exist')
      cy.get('button').contains('Sign In to ICPS').should('exist')
      cy.screenshot('01-login-page', { capture: 'viewport' })
    })

    it('shows 5 demo account buttons', () => {
      cy.get('.demo-btn').should('have.length', 5)
      cy.contains('.demo-btn', 'Admin').should('exist')
      cy.contains('.demo-btn', 'Manager').should('exist')
      cy.contains('.demo-btn', 'Policyholder').should('exist')
      cy.contains('.demo-btn', 'Surveyor').should('exist')
      cy.contains('.demo-btn', 'Provider').should('exist')
      cy.screenshot('02-demo-buttons', { capture: 'viewport' })
    })

    it('auto-fills credentials when demo button is clicked', () => {
      cy.contains('.demo-btn', 'Admin').click()
      cy.get('#email').should('have.value', 'admin@icps.com')
      cy.get('#password').should('have.value', 'password')
    })
  })

  const roles = [
    { role: 'admin', email: 'admin@icps.com', demoLabel: 'Admin', id: 'u1', ref: null },
    { role: 'branch_manager', email: 'manager@icps.com', demoLabel: 'Manager', id: 'u2', ref: 'B101' },
    { role: 'policyholder', email: 'arjunkumar@gmail.com', demoLabel: 'Policyholder', id: 'u3', ref: 'PH001' },
    { role: 'surveyor', email: 'rajesh@icps.com', demoLabel: 'Surveyor', id: 'u4', ref: 'S501' },
    { role: 'service_provider', email: 'apollo@hospital.com', demoLabel: 'Provider', id: 'u5', ref: 'SP301' }
  ]

  roles.forEach(({ role, email, demoLabel, id, ref }) => {
    context(`Role: ${role}`, () => {
      beforeEach(() => {
        cy.intercept('POST', '/api/auth/login', {
          statusCode: 200,
          body: { user: { id, email, role, reference_id: ref } }
        }).as('loginRequest')

        cy.intercept('GET', '/api/auth/me', {
          statusCode: 200,
          body: { user: { id, email, role, reference_id: ref } }
        }).as('authCheck')

        cy.intercept('GET', '/api/analytics/summary', {
          statusCode: 200,
          body: {
            kpis: { totalClaims: 42, pendingClaims: 8 },
            claimsByEvent: [
              { name: 'Medical', value: 15 },
              { name: 'Accident', value: 12 },
              { name: 'Fire', value: 8 },
              { name: 'Theft', value: 7 }
            ],
            monthlyTrend: [
              { name: 'Jan', claims: 10 },
              { name: 'Feb', claims: 14 },
              { name: 'Mar', claims: 8 },
              { name: 'Apr', claims: 12 },
              { name: 'May', claims: 18 },
              { name: 'Jun', claims: 15 }
            ]
          }
        }).as('analyticsRequest')

        cy.intercept('GET', '/api/claims?limit=10', {
          statusCode: 200,
          body: Array.from({ length: 5 }, (_, i) => ({
            _id: `C${400 + i}`,
            claim_number: `CLM${5000 + i}`,
            claim_date: '2026-06-15',
            claim_amount: 50000 * (i + 1),
            claim_status: i < 2 ? 'Submitted' : i < 4 ? 'Under Review' : 'Approved',
            event_id: { event_name: ['Medical', 'Accident', 'Fire', 'Theft', 'Natural Disaster'][i] },
            policy_id: {
              policy_holder_id: { name: ['Arjun Kumar', 'Priya Lakshmi', 'Rahul Deshmukh', 'Suresh Raina', 'Anjali Menon'][i] }
            }
          }))
        }).as('claimsRequest')
      })

      it(`logs in as ${role} via demo button`, () => {
        cy.contains('.demo-btn', demoLabel).click()
        cy.get('#password').should('have.value', 'password')
        cy.get('button').contains('Sign In to ICPS').click()
        cy.wait('@loginRequest')
        cy.url().should('not.include', '/login')
        cy.contains('System Overview').should('be.visible')
        if (role === 'admin') cy.screenshot('03-admin-dashboard', { capture: 'viewport' })
      })

      it(`restores ${role} session from cookie on page reload`, () => {
        cy.contains('.demo-btn', demoLabel).click()
        cy.get('button').contains('Sign In to ICPS').click()
        cy.wait('@loginRequest')
        cy.url().should('not.include', '/login')
        cy.reload()
        cy.wait('@authCheck')
        cy.url().should('not.include', '/login')
        cy.contains('System Overview').should('be.visible')
      })

      it(`shows welcome message with ${email.split('@')[0]} for ${role}`, () => {
        cy.contains('.demo-btn', demoLabel).click()
        cy.get('button').contains('Sign In to ICPS').click()
        cy.wait('@loginRequest')
        cy.wait('@analyticsRequest')
        cy.wait('@claimsRequest')
        cy.contains(email.split('@')[0]).should('be.visible')
        cy.contains('Total Claims').should('be.visible')
        cy.contains('Under Review').should('be.visible')
      })
    })
  })

  context('Error Handling', () => {
    beforeEach(() => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: { error: 'Invalid credentials. Please try again.' }
      }).as('failedLogin')
    })

    it('shows error toast on invalid credentials', () => {
      cy.get('#email').type('wrong@email.com')
      cy.get('#password').type('wrongpass')
      cy.get('button').contains('Sign In to ICPS').click()
      cy.wait('@failedLogin')
      cy.contains('Invalid credentials').should('be.visible')
      cy.screenshot('04-error-toast', { capture: 'viewport' })
    })

    it('stays on login page after failed login', () => {
      cy.get('#email').type('wrong@email.com')
      cy.get('#password').type('wrongpass')
      cy.get('button').contains('Sign In to ICPS').click()
      cy.wait('@failedLogin')
      cy.url().should('include', '/login')
    })
  })

  context('Logout Flow', () => {
    beforeEach(() => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: { user: { id: 'u1', email: 'admin@icps.com', role: 'admin', reference_id: null } }
      }).as('loginRequest')

      cy.intercept('GET', '/api/auth/me', {
        statusCode: 200,
        body: { user: { id: 'u1', email: 'admin@icps.com', role: 'admin', reference_id: null } }
      }).as('authCheck')

      cy.intercept('GET', '/api/analytics/summary', { statusCode: 200, body: { kpis: { totalClaims: 42, pendingClaims: 8 }, claimsByEvent: [], monthlyTrend: [] } }).as('analyticsRequest')
      cy.intercept('GET', '/api/claims?limit=10', { statusCode: 200, body: [] }).as('claimsRequest')
    })

    it('logs in and dashboard is accessible', () => {
      cy.contains('.demo-btn', 'Admin').click()
      cy.get('button').contains('Sign In to ICPS').click()
      cy.wait('@loginRequest')
      cy.url().should('not.include', '/login')
      cy.contains('System Overview').should('be.visible')
    })
  })

  context('Navigation Guards', () => {
    it('redirects unauthenticated user to login', () => {
      cy.intercept('GET', '/api/auth/me', { statusCode: 401 }).as('unauth')
      cy.visit('/')
      cy.wait('@unauth')
      cy.url().should('include', '/login')
      cy.screenshot('06-role-guard-redirect', { capture: 'viewport' })
    })

    it('redirects unknown routes to dashboard when authenticated', () => {
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 200,
        body: { user: { id: 'u1', email: 'admin@icps.com', role: 'admin', reference_id: null } }
      }).as('authCheck')
      cy.intercept('GET', '/api/analytics/summary', { statusCode: 200, body: { kpis: { totalClaims: 42, pendingClaims: 8 }, claimsByEvent: [], monthlyTrend: [] } }).as('analytics')
      cy.intercept('GET', '/api/claims?limit=10', { statusCode: 200, body: [] }).as('claims')

      cy.visit('/some-unknown-path')
      cy.url().should('not.include', '/some-unknown-path')
    })
  })

  context('Dashboard Data Display', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 200,
        body: { user: { id: 'u1', email: 'admin@icps.com', role: 'admin', reference_id: null } }
      }).as('authCheck')

      cy.intercept('GET', '/api/analytics/summary', {
        statusCode: 200,
        body: {
          kpis: { totalClaims: 42, pendingClaims: 8 },
          claimsByEvent: [
            { name: 'Medical', value: 15 },
            { name: 'Accident', value: 12 }
          ],
          monthlyTrend: [
            { name: 'Jan', claims: 10 },
            { name: 'Feb', claims: 14 },
            { name: 'Mar', claims: 8 }
          ]
        }
      }).as('analyticsRequest')

      cy.intercept('GET', '/api/claims?limit=10', {
        statusCode: 200,
        body: [{ _id: 'C401', claim_number: 'CLM5001', claim_date: '2026-06-15', claim_amount: 50000, claim_status: 'Submitted', event_id: { event_name: 'Medical' }, policy_id: { policy_holder_id: { name: 'Arjun Kumar' } } }]
      }).as('claimsRequest')

      cy.visit('/')
    })

    it('displays metric cards with analytics data', () => {
      cy.wait('@analyticsRequest')
      cy.contains('Total Claims').should('be.visible')
      cy.contains('42').should('be.visible')
      cy.contains('Under Review').should('be.visible')
      cy.screenshot('07-metric-cards', { capture: 'viewport' })
    })

    it('displays recent claims table', () => {
      cy.wait('@claimsRequest')
      cy.contains('CLM5001').should('be.visible')
      cy.contains('Arjun Kumar').should('be.visible')
    })

    it('navigates to claim detail on row click', () => {
      cy.wait('@claimsRequest')
      cy.contains('CLM5001').click()
      cy.url().should('include', '/claims/C401')
    })

    it('shows download report button', () => {
      cy.wait('@analyticsRequest')
      cy.contains('Download Report').should('be.visible')
    })

    it('shows new claim button', () => {
      cy.contains('New Claim').should('be.visible')
    })

    it('navigates to new claim on button click', () => {
      cy.contains('New Claim').click()
      cy.url().should('include', '/claims/new')
    })

    it('shows error state on API failure', () => {
      cy.visit('/logout', { failOnStatusCode: false })
      cy.intercept('GET', '/api/analytics/summary', { statusCode: 500, body: {} }).as('analyticsFail')
      cy.visit('/')
      cy.wait('@analyticsFail')
      cy.contains('Failed to load dashboard', { timeout: 8000 }).should('be.visible')
      cy.contains('Retry').should('be.visible')
      cy.screenshot('05-error-state', { capture: 'viewport' })
    })
  })
})