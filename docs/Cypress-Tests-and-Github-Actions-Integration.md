# Cypress Tests and Github Actions (GHA) Integration

An exciting integration is the capability of N8N to dispatch workflows in your GitHub Repo. This capability allows you to run your Cypress tests, that have been deployed as GitHub Actions workflows, on your application and report the results back to you.

In theory, you can run any workflow in your repo, but we will focus on Cypress tests in this section.

## Configuring Cypress for end-to-end testing

Cypress is a popular end-to-end testing framework that is used to test web applications. It is a Node.js application that can be installed locally or run in a Docker container. It is also possible to run Cypress tests in a CI/CD pipeline, such as GitHub Actions.
A typical exampleof a test can be found here:

```javascript
describe("Artifactory Login", () => {
  beforeEach(() => {
    // log into Artifactory using custom command
    cy.loginToArtifactory(Cypress.env("username"), Cypress.env("password"));
  });

  it("Verifies that we are logged in", () => {
    cy.get(".username-text").should("have.text", " admin");
  });
});
```

## Integrating Cypress tests with Github Actions

A typical deployment would be that the test automation specialist builds a Cypress tests and creates a workflow in GHA that run the tests. Such a workflow is typically triggered by a push to the repo. The workflow runs the tests and reports the results back to the user.

Example of a workflow in this [repo](https://github.com/bcgov/put/blob/main/.github/workflows/cypress-simple-manual.yaml) that runs the above mentioned test:

```yaml
# Manual started workflow
# This is the simplest for of running the Cypress tests in Github actions
name: artifactory-smoke
on: [push, workflow_dispatch, repository_dispatch]
jobs:
  cypress-run:
    runs-on: ubuntu-latest
    env:
      CYPRESS_username: ${{ secrets.CYPRESS_USERNAME }}
      CYPRESS_password: ${{ secrets.CYPRESS_ARTIFACTORY_PW }}
      CYPRESS_BASE_URL: ${{ secrets.CYPRESS_BASEURL }}
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Artifactory (CLAB) Smoke test
        uses: cypress-io/github-action@v5
        id: smoke
        # Continue the build in case of an error, as we need to set the
        # commit status in the next step, both in case of success and failure
        continue-on-error: true
        with:
          # No recording of results in the cloud
          record: false
          # We need to force the install due to version checking
          install-command: npm ci
          working-directory: testing
```

The feature that makes this workflow run from N8N is the `repository_dispatch` trigger. This trigger allows you to run a workflow in your repo from an external source. In this case, the external source is N8N.

We built a common component that given a `repo owner`, `repo name`, `workflow name` and an `error detection string`, will run the workflow in the repo. The component is called `Run Test in GHA` and can be found in the `Common Components` section of the N8N editor.

Prequisites for running this component are:

- Your GitHub Credential has Access to the Repo
- You have set up a personal token for your GitHub user

## Analyzing test results and troubleshooting

If the workflow finds the error detection string in the log output of the test it will send an error message out by email and to RocketChat. This message will contain the link to the log output ([example(https://github.com/bcgov/put/actions/runs/4963098305)]) of the test.

The test workflow does not do any analysis, but it is a simple detection of a string in the log output. The test workflow can be extended to do more analysis and send out more detailed messages in the future if needed.
