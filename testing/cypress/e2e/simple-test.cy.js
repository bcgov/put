

describe('Artifactory Login', () => {
    beforeEach(() => {
        // log into Artifactory using custom command
        cy.loginToArtifactory(Cypress.env('username'), Cypress.env('password'))
    });

    it('Verifies that we are logged in', () => {

        cy.get(".username-text", { timeout: 33_000 }).should("have.text", " admin");
    });

});
