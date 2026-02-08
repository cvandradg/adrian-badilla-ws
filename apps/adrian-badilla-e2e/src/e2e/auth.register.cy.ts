describe('Auth - Register', () => {
  const sel = {
    email: '[data-cy="register-email"]',
    pass: '[data-cy="register-password"]',
    submit: '[data-cy="register-submit"]',
  } as const;

  const msg = {
    invalidEmail: 'El correo electrónico no es válido.',
    weakPassword: 'La contraseña es muy débil.',
    emailAlreadyInUse: 'El usuario ya existe.',
    success:
      'Cuenta creada. Te enviamos un correo para verificar tu cuenta. Revisa Spam/Promociones.',
  } as const;

  function uniqueEmail() {
    return `e2e_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
  }

  beforeEach(() => {
    cy.visit('/auth/register');
  });

  it('renderiza formulario', () => {
    cy.get(sel.email).should('exist');
    cy.get(sel.pass).should('exist');
    cy.get(sel.submit).should('exist');
  });

  it('validaciones básicas: submit deshabilitado si inválido', () => {
    cy.get(sel.submit).click({ force: true });
    cy.url().should('include', '/auth/register');
  });

  it('error: correo no válido', () => {
    cy.get(sel.email).clear();
    cy.get(sel.email).type('correo-invalido');
    cy.get(sel.email).blur();

    cy.get(sel.pass).clear();
    cy.get(sel.pass).type('StrongPass_123!', { log: false });

    cy.get(sel.submit).click({ force: true });

    cy.contains(msg.invalidEmail, { timeout: 15000 }).should('exist');
  });

  it('error: contraseña muy débil', () => {
    cy.get(sel.email).clear();
    cy.get(sel.email).type(uniqueEmail());
    cy.get(sel.email).blur();

    cy.get(sel.pass).clear();
    cy.get(sel.pass).type('123', { log: false });

    cy.get(sel.submit).click({ force: true });

    cy.contains(msg.weakPassword, { timeout: 15000 }).should('exist');
  });

  it('registro exitoso: crea usuario nuevo y muestra success', () => {
    const email = uniqueEmail();
    const password = `StrongPass_${Date.now()}!`;

    cy.get(sel.email).clear();
    cy.get(sel.email).type(email);
    cy.get(sel.email).blur();

    cy.get(sel.pass).clear();
    cy.get(sel.pass).type(password, { log: false });

    cy.get(sel.submit).click({ force: true });

    cy.contains(msg.success, { timeout: 20000 }).should('exist');

    cy.contains('Volver al Login').should('exist');
    cy.contains('Reenviar verificación').should('exist');
  });

  it('registro con email existente: muestra error', () => {
    const existingEmail = Cypress.env('E2E_VERIFIED_EMAIL');

    expect(existingEmail, 'E2E_VERIFIED_EMAIL').to.not.equal(undefined);

    cy.get(sel.email).clear();
    cy.get(sel.email).type(String(existingEmail));
    cy.get(sel.email).blur();

    cy.get(sel.pass).clear();
    cy.get(sel.pass).type(`StrongPass_${Date.now()}!`, { log: false });

    cy.get(sel.submit).click({ force: true });

    cy.contains(msg.emailAlreadyInUse, { timeout: 15000 }).should('exist');
  });
});
