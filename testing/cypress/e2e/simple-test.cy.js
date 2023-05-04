

describe('Artifactory Login', () => {
    beforeEach(() => {
        // log into Artifactory using custom command
        cy.loginToArtifactory(Cypress.env('username'), Cypress.env('password'))
    });

    const newUrl = Cypress.env('base_url') + '/ui/admin/onboarding-page';
    it('Verifies that we are logged in', () => {

        cy.get(".username-text").should("have.text", " admin");
    });

});