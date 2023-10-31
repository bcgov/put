

describe('Artifactory Login', () => {
    beforeEach(() => {
        // log into Artifactory using custom command
        cy.loginToArtifactory(Cypress.env('username'), Cypress.env('password'))
    });

    it('Verifies that we are logged in', () => {
        cy.wait(5_000);
        cy.get('body', { timeout: 33_000 }).then((body) => {
            if (body
            .find('span:contains("some text")').length > 0) {
                cy.log('Found an error message "This request is blocked due to recurrent login failures"');
            }
            else {
                cy.log("I'm in else condition and looking for the welcome message for admin")
                cy.get(".username-text").should("have.text", " admin");
            }
        })
        
    });

});
