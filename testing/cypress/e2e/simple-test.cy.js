

describe('Artifactory Login', () => {
    beforeEach(() => {
        // log into Artifactory using custom command
        cy.loginToArtifactory(Cypress.env('username', { timeout: 33_000 }), Cypress.env('password'))
    });

    it('Verifies that we are logged in', () => {

        cy.get(".username-text").should("have.text", " admin");
    });

});
