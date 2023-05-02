// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

function loginToArtifactory(username, password) {

    cy.visit(Cypress.env('base_url'))
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="password"]').type(password);
    cy.get('input[type="checkbox"]').click({ force: true });
    cy.get('button[type="submit"]').click();

}

Cypress.Commands.add('loginToArtifactory', (username, password) => {
    const log = Cypress.log({
        displayName: 'Logint to Artifactory',
        message: [`🔐 Authenticating | ${username}`],
        autoEnd: false,
    })
    log.snapshot('before')

    loginToArtifactory(username, password)

    log.snapshot('after')
    log.end()
})