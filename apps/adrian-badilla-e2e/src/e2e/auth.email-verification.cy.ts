describe('Auth - Register + Verify Email (YOPmail) + Dashboard', () => {
  const sel = {
    registerEmail: '[data-cy="register-email"]',
    registerPass: '[data-cy="register-password"]',
    registerSubmit: '[data-cy="register-submit"]',
  } as const;

  function uniqueInbox() {
    return `e2e_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }

  it('registra usuario, abre email en YOPmail, verifica y entra a dashboard', () => {
    const inbox = uniqueInbox();
    const email = `${inbox}@yopmail.com`;
    const password = `StrongPass_${Date.now()}!`;

    // 1) Register en tu app
    cy.visit('/auth/register');

    cy.get(sel.registerEmail).clear();
    cy.get(sel.registerEmail).type(email);
    cy.get(sel.registerEmail).blur();

    cy.get(sel.registerPass).clear();
    cy.get(sel.registerPass).type(password, { log: false });

    cy.get(sel.registerSubmit).click({ force: true });

    cy.contains('Cuenta creada. Te enviamos un correo para verificar tu cuenta.', {
      timeout: 20000,
    }).should('exist');

    // 2) YOPmail: abrir inbox, abrir correo, extraer link
    cy.origin('https://yopmail.com', { args: { inbox } }, ({ inbox }) => {
      cy.visit(`https://yopmail.com/?${inbox}`);

      const started = Date.now();

      const reloadOrRefresh = () => {
        cy.get('body').then(($body) => {
          if ($body.find('#refresh').length) {
            cy.get('#refresh').click({ force: true });
          } else {
            cy.reload();
          }
        });
      };

      const openFirstMailOrRetry = (): Cypress.Chainable<void> => {
        return cy
          .get('iframe#ifinbox', { timeout: 30000 })
          .its('0.contentDocument.body')
          .then((body) => {
            if (!body || !body.innerText || !body.innerText.trim()) {
              if (Date.now() - started > 90000) {
                throw new Error('YOPmail ifinbox no cargó (90s).');
              }
              reloadOrRefresh();
              return openFirstMailOrRetry();
            }

            const $body = Cypress.$(body);
            const clickable = $body
              .find('a, div, span, tr, td')
              .filter(':visible')
              .first();

            if (!clickable.length) {
              if (Date.now() - started > 90000) {
                throw new Error('Inbox vacío en YOPmail (90s).');
              }
              reloadOrRefresh();
              return openFirstMailOrRetry();
            }

            cy.wrap(clickable).click({ force: true });
            return;
          });
      };

      const extractVerifyUrlOrRetry = (): Cypress.Chainable<void> => {
        return cy
          .get('iframe#ifmail', { timeout: 30000 })
          .its('0.contentDocument.body')
          .then((body) => {
            if (!body || !body.innerText || !body.innerText.trim()) {
              if (Date.now() - started > 90000) {
                throw new Error('YOPmail ifmail no cargó (90s).');
              }
              // ✅ no cy.wait: reintento por condición (reload) en lugar de tiempo arbitrario
              reloadOrRefresh();
              return openFirstMailOrRetry().then(() => extractVerifyUrlOrRetry());
            }

            const text = body.innerText;
            const match = text.match(/http:\/\/localhost:4200\/[^\s]+/i);

            if (!match?.[0]) {
              if (Date.now() - started > 90000) {
                throw new Error('No encontré URL localhost:4200 en el correo (90s).');
              }
              reloadOrRefresh();
              return openFirstMailOrRetry().then(() => extractVerifyUrlOrRetry());
            }

            Cypress.env('VERIFY_URL', match[0]);
            return;
          });
      };

      // ✅ Encadenado correcto (sin void.then)
      openFirstMailOrRetry().then(() => extractVerifyUrlOrRetry());
    });

    // 3) Visitar el link capturado
    cy.then(() => {
      const verifyUrl = Cypress.env('VERIFY_URL') as string | undefined;
      expect(verifyUrl, 'VERIFY_URL desde YOPmail').to.be.a('string');
      cy.visit(String(verifyUrl), { timeout: 30000 });
    });

    // 4) Verificar y dashboard
    cy.contains('Verificar ahora', { timeout: 30000 }).click();
    cy.contains('Cuenta verificada correctamente.', { timeout: 30000 }).should('exist');

    cy.contains('Ir al dashboard', { timeout: 30000 }).click();
    cy.url({ timeout: 30000 }).should('include', '/dashboard');
  });
});
