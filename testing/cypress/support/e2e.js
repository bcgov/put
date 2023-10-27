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

    cy.visit('/');
    // if username field is not found in 15 seconds, visit the page again (additional layer of wait and a retry through the revisit)
    if ($body.find('input[name="username"]', { timeout: 15_000 }).length < 0) {
        cy.visit('/');
       }
    // if username field is found, type in the username (maximum wait 15 seconds)
    cy.get('input[name="username"]', { timeout: 15_000 }).should('be.visible').type(username);
    cy.get('input[name="password"]').type(password);
    cy.get('input[type="checkbox"]').click({ force: true });
    cy.get('button[type="submit"]').click();

}

Cypress.Commands.add('loginToArtifactory', (username, password) => {
    const log = Cypress.log({
        displayName: 'Login to Artifactory',
        message: [`🔐 Authenticating | ${username}`],
        autoEnd: false,
    })
    log.snapshot('before')

    loginToArtifactory(username, password)

    log.snapshot('after')
    log.end()
})
