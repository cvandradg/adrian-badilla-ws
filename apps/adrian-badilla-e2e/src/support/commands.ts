/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      login(email: string, password: string): void;

      authEmuReset(): Chainable<void>;
      authEmuCreateUser(opts: {
        email: string;
        password: string;
        emailVerified?: boolean;
      }): Chainable<void>;
    }
  }
}

// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
  console.log('Custom command example: Login', email, password);
});
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
const AUTH_EMU = 'http://localhost:9099';
const KEY = 'fake';

Cypress.Commands.add('authEmuReset', () => {
  const projectId = Cypress.env('FIREBASE_PROJECT_ID');

  expect(projectId, 'FIREBASE_PROJECT_ID')
    .to.be.a('string')
    .and.not.be.empty;

  cy.request('DELETE', `${AUTH_EMU}/emulator/v1/projects/${projectId}/accounts`)
    .its('status')
    .should('eq', 200);
});

Cypress.Commands.add(
  'authEmuCreateUser',
  ({ email, password, emailVerified }) => {
    cy.request({
      method: 'POST',
      url: `${AUTH_EMU}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${KEY}`,
      body: { email, password, returnSecureToken: true },
      failOnStatusCode: true,
    }).then((res) => {
      expect(res.status).to.eq(200);

      if (!emailVerified) return;

      const idToken = res.body?.idToken;

      cy.request({
        method: 'POST',
        url: `${AUTH_EMU}/identitytoolkit.googleapis.com/v1/accounts:update?key=${KEY}`,
        body: { idToken, emailVerified: true },
        failOnStatusCode: true,
      }).its('status').should('eq', 200);
    });
  }
);

export {};
