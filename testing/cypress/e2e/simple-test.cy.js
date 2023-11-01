

describe('Artifactory Login', () => {
    // Uncomment before each if decided to make a more complex test
    // beforeEach(() => {
    //     // log into Artifactory using custom command
    //     cy.loginToArtifactory(Cypress.env('username'), Cypress.env('password'));
    // });

    // login as a non-existing user, (call to backend and user database is made), verifying the error message shown
    it('Verifies that error message after auth call to backend and user db is shown after login attempt', () => {
        cy.loginToArtifactory(Cypress.env('username') + 'blah', Cypress.env('password'));
        cy.get('div[role="alert"]').should('be.visible');
    }
    )

    // Modify the below test when decide to make a more complex test with login
    // it('Verifies that we are logged in', () => {
    //     cy.get(".username-text", { timeout: 33_000 }).should("have.text", " admin");
    // })
})
          

