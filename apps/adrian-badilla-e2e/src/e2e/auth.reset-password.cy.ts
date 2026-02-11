describe('Auth - Verify Email + Reset Password (YOPmail) + Login', () => {
  const sel = {
    // register
    registerEmail: '[data-cy="register-email"]',
    registerPass: '[data-cy="register-password"]',
    registerSubmit: '[data-cy="register-submit"]',

    // login
    loginEmail: '[data-cy="login-email"]',
    loginPass: '[data-cy="login-password"]',
    loginSubmit: '[data-cy="login-submit"]',

    // pass reset button (lo agregas)
    goPassReset: '[data-cy="go-passreset"]',

    // reset password screen (los agregas)
    resetPassInput: '[data-cy="resetpass-password"]',
    resetPassSubmit: '[data-cy="resetpass-submit"]',
  } as const;

  function uniqueInbox() {
    return `e2e_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }

  function openYopmailAndCaptureLocalhostUrl(inbox: string, wantedMode: 'verifyEmail' | 'resetPassword') {
    cy.origin('https://yopmail.com', { args: { inbox, wantedMode } }, ({ inbox, wantedMode }) => {
      cy.visit(`https://yopmail.com/?${inbox}`);

      const started = Date.now();

      const reloadOrRefresh = () => {
        cy.get('body').then(($body) => {
          if ($body.find('#refresh').length) cy.get('#refresh').click({ force: true });
          else cy.reload();
        });
      };

      const openFirstMailOrRetry = (): Cypress.Chainable<void> => {
        return cy
          .get('iframe#ifinbox', { timeout: 30000 })
          .its('0.contentDocument.body')
          .then((body) => {
            if (!body || !body.innerText || !body.innerText.trim()) {
              if (Date.now() - started > 90000) throw new Error('YOPmail ifinbox no cargó (90s).');
              reloadOrRefresh();
              return openFirstMailOrRetry();
            }

            const $body = Cypress.$(body);
            const clickable = $body.find('a, div, span, tr, td').filter(':visible').first();

            if (!clickable.length) {
              if (Date.now() - started > 90000) throw new Error('Inbox vacío en YOPmail (90s).');
              reloadOrRefresh();
              return openFirstMailOrRetry();
            }

            cy.wrap(clickable).click({ force: true });
            return;
          });
      };

      const extractUrlOrRetry = (): Cypress.Chainable<void> => {
        return cy
          .get('iframe#ifmail', { timeout: 30000 })
          .its('0.contentDocument.body')
          .then((body) => {
            if (!body || !body.innerText || !body.innerText.trim()) {
              if (Date.now() - started > 90000) throw new Error('YOPmail ifmail no cargó (90s).');
              reloadOrRefresh();
              return openFirstMailOrRetry().then(() => extractUrlOrRetry());
            }

            const text = body.innerText;
            const re = new RegExp(`http:\\/\\/localhost:4200\\/[^\\s]+mode=${wantedMode}[^\\s]+`, 'i');
            const match = text.match(re);

            if (!match?.[0]) {
              if (Date.now() - started > 90000) {
                throw new Error(`No encontré link localhost con mode=${wantedMode} en el correo (90s).`);
              }
              reloadOrRefresh();
              return openFirstMailOrRetry().then(() => extractUrlOrRetry());
            }

            Cypress.env(wantedMode === 'verifyEmail' ? 'VERIFY_URL' : 'RESET_URL', match[0]);
            return;
          });
      };

      openFirstMailOrRetry().then(() => extractUrlOrRetry());
    });
  }

  it('register -> verify email -> go login -> request reset -> reset -> login with new password', () => {
    const inbox = uniqueInbox();
    const email = `${inbox}@yopmail.com`;
    const initialPassword = `StrongPass_${Date.now()}!`;
    const newPassword = `NewStrongPass_${Date.now()}!`;

    // 1) Register
    cy.visit('/auth/register');

    cy.get(sel.registerEmail).clear();
    cy.get(sel.registerEmail).type(email);
    cy.get(sel.registerEmail).blur();

    cy.get(sel.registerPass).clear();
    cy.get(sel.registerPass).type(initialPassword, { log: false });

    cy.get(sel.registerSubmit).click({ force: true });

    cy.contains('Cuenta creada. Te enviamos un correo para verificar tu cuenta.', { timeout: 20000 })
      .should('exist');

    // 2) Verify email via YOPmail
    openYopmailAndCaptureLocalhostUrl(inbox, 'verifyEmail');

    cy.then(() => {
      const verifyUrl = Cypress.env('VERIFY_URL') as string | undefined;
      expect(verifyUrl, 'VERIFY_URL').to.be.a('string');
      cy.visit(String(verifyUrl), { timeout: 30000 });
    });

    cy.contains('Verificar ahora', { timeout: 30000 }).click();
    cy.contains('Cuenta verificada correctamente.', { timeout: 30000 }).should('exist');

    // 3) Ir a login (directo, como pediste)
    cy.visit('/auth/login');

    // 4) Desde login, pedir reset (tu UI actual: botón usa user)
    // Para que funcione, el login tiene que tener el email en un input que el componente use como "user".
    cy.get(sel.loginEmail).clear();
    cy.get(sel.loginEmail).type(email);
    cy.get(sel.loginEmail).blur();

    cy.get(sel.goPassReset).click({ force: true });

    cy.contains('Si el correo es válido te llegará un link para cambiar tu contraseña.', { timeout: 20000 })
      .should('exist');

    // 5) Abrir correo resetPassword
    openYopmailAndCaptureLocalhostUrl(inbox, 'resetPassword');

    cy.then(() => {
      const resetUrl = Cypress.env('RESET_URL') as string | undefined;
      expect(resetUrl, 'RESET_URL').to.be.a('string');
      cy.visit(String(resetUrl), { timeout: 30000 });
    });

    // 6) Cambiar contraseña
    cy.get(sel.resetPassInput).clear();
    cy.get(sel.resetPassInput).type(newPassword, { log: false });

    cy.get(sel.resetPassSubmit).click({ force: true });

    cy.contains('Creaste una nueva contraseña.', { timeout: 30000 }).should('exist');

    // 7) Volver a login (tu status message tiene routerLink="/")
    cy.contains(/click acá/i, { timeout: 30000 }).click({ force: true });

    // 8) Login con nueva contraseña
    cy.visit('/auth/login');

    cy.get(sel.loginEmail).clear();
    cy.get(sel.loginEmail).type(email);
    cy.get(sel.loginEmail).blur();

    cy.get(sel.loginPass).clear();
    cy.get(sel.loginPass).type(newPassword, { log: false });

    cy.get(sel.loginSubmit).click({ force: true });

    cy.url({ timeout: 30000 }).should('include', '/dashboard');
  });
});
