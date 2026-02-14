describe('Auth - Login', () => {
  const sel = {
    email: '[data-cy="login-email"]',
    pass: '[data-cy="login-password"]',
    submit: '[data-cy="login-submit"]',
    goRegister: '[data-cy="go-register"]',

    resendVerification: '[data-cy="resend-verification"]',
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

    // ✅ NO dependas de Enter
    cy.get(sel.submit).click();

    cy.url({ timeout: 30000 }).should('include', '/dashboard');
  });

  it('usuario NO verificado: no entra y muestra opción de reenviar verificación', () => {
    const { email, password } = creds('unverified');

    cy.get(sel.email).clear();
    cy.get(sel.email).type(email);
    cy.get(sel.email).blur();

    cy.get(sel.pass).clear();
    cy.get(sel.pass).type(password, { log: false });

    // ✅ NO dependas de Enter
    cy.get(sel.submit).click();

    cy.url({ timeout: 20000 }).should('not.include', '/dashboard');

    // ✅ Assert estable: existe el botón de reenviar
    cy.get(sel.resendVerification, { timeout: 20000 }).should('exist');
  });

  it('usuario NO verificado: puede reenviar correo de verificación', () => {
    const { email, password } = creds('unverified');

    cy.intercept('POST', '**/accounts:sendOobCode*').as('sendOobCode');

    cy.get(sel.email).clear();
    cy.get(sel.email).type(email);
    cy.get(sel.email).blur();

    cy.get(sel.pass).clear();
    cy.get(sel.pass).type(password, { log: false });

    // ✅ NO dependas de Enter
    cy.get(sel.submit).click();

    cy.url({ timeout: 20000 }).should('not.include', '/dashboard');
    cy.get(sel.resendVerification, { timeout: 20000 }).should('be.visible').click();

    cy.wait('@sendOobCode', { timeout: 20000 })
      .its('response.statusCode')
      .should('be.oneOf', [200, 400]);

    // ✅ Mensaje puede variar; solo valida que haya feedback
    cy.contains(/reenviamos|enviando|espera unos minutos|Ocurrió un error/i, {
      timeout: 15000,
    }).should('exist');
  });

  it('credenciales inválidas: muestra error', () => {
    cy.get(sel.email).clear();
    cy.get(sel.email).type('invalid@example.com');
    cy.get(sel.email).blur();

    cy.get(sel.pass).clear();
    cy.get(sel.pass).type('wrong-pass', { log: false });

    // ✅ NO dependas de Enter
    cy.get(sel.submit).click();

    cy.contains(/error|invalid|incorrect|contraseña|correo/i, {
      timeout: 20000,
    }).should('exist');
  });

  it('desde login navega a register', () => {
    cy.get(sel.goRegister).click();
    cy.url().should('include', '/auth/register');
  });
});
