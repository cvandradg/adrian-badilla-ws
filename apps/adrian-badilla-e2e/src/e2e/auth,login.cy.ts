describe('Auth - Login', () => {
  const sel = {
    email: '[data-cy="login-email"]',
    pass: '[data-cy="login-password"]',
    submit: '[data-cy="login-submit"]',
    goRegister: '[data-cy="go-register"]',
  } as const;

  function creds(kind: 'verified' | 'unverified') {
    const email = Cypress.env(
      kind === 'verified' ? 'E2E_VERIFIED_EMAIL' : 'E2E_UNVERIFIED_EMAIL'
    );
    const password = Cypress.env(
      kind === 'verified' ? 'E2E_VERIFIED_PASSWORD' : 'E2E_UNVERIFIED_PASSWORD'
    );

    expect(email, `${kind} email`).to.not.equal(undefined);
    expect(password, `${kind} password`).to.not.equal(undefined);

    return { email: String(email), password: String(password) };
  }

  beforeEach(() => {
    cy.visit('/auth/login');
  });

  it('usuario verificado: entra a dashboard', () => {
    const { email, password } = creds('verified');

    cy.get(sel.email).clear();
    cy.get(sel.email).type(email);
    cy.get(sel.email).blur();

    cy.get(sel.pass).clear();
    cy.get(sel.pass).type(password, { log: false });
    cy.get(sel.pass).type('{enter}');

    cy.url({ timeout: 20000 }).should('include', '/dashboard');
  });

  it('usuario NO verificado: no entra y muestra warning', () => {
    const { email, password } = creds('unverified');

    cy.get(sel.email).clear();
    cy.get(sel.email).type(email);
    cy.get(sel.email).blur();

    cy.get(sel.pass).clear();
    cy.get(sel.pass).type(password, { log: false });
    cy.get(sel.pass).type('{enter}');

    cy.url({ timeout: 15000 }).should('not.include', '/dashboard');
    cy.contains('Verifica tu cuenta', { timeout: 15000 }).should('exist');
  });

  it('credenciales inválidas: muestra error', () => {
    cy.get(sel.email).clear();
    cy.get(sel.email).type('invalid@example.com');
    cy.get(sel.email).blur();

    cy.get(sel.pass).clear();
    cy.get(sel.pass).type('wrong-pass', { log: false });
    cy.get(sel.pass).type('{enter}');

    cy.contains(/error|invalid|incorrect|contraseña|correo/i, {
      timeout: 15000,
    }).should('exist');
  });

  it('desde login navega a register', () => {
    cy.get(sel.goRegister).click();
    cy.url().should('include', '/auth/register');
  });
});
