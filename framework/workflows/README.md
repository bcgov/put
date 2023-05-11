## Workflows

All our current production workflows. You'll find a mode detailed usage descriptions in the Wiki.

| Workflow Name                             | Test | Common Component | Example | Utility | Scheduled | Webhook | Description                                                                                       |
| :---------------------------------------- | :--: | :--------------: | :-----: | :-----: | :-------: | :-----: | :------------------------------------------------------------------------------------------------ |
| Artifactory Basic Health Check CLAB       |  X   |                  |         |         |           |         | Artifactory Test in CLAB                                                                          |
| Artifactory Basic Health Check Prod       |  X   |                  |         |         |           |         | Artifactory Test in PROD                                                                          |
| Artifactory UI CLAB                       |  X   |                  |         |         |           |         | Artifactory UI Test in CLAB with Cypress running on GHA                                           |
| Backup All                                |      |                  |         |    X    |     Y     |         | Backup of all workflows and credentials on backup PVC                                             |
| Backup workflows to GitHub                |      |                  |         |    X    |           |         | Store all workflows in the [PUT repo](https://github.com/bcgov/put/tree/main/framework/workflows) |
| Clean Up GOLD                             |      |                  |         |    X    |     Y     |         | Remove all stopped and errrored out pods from the N8N namespace                                   |
| Common OC Login                           |      |                  |    X    |         |           |         | Example for using the OC Login Common Component                                                   |
| Duplicate github issue                    |      |                  |         |    X    |           |    Y    | Utility webhook for quickly copying an issue in zenhub                                            |
| Error Handler                             |      |        X         |         |         |           |         | Common Component that deals with Workflow execution errors and reports them                       |
| Force Activate webhooks (Automatic)       |      |                  |         |    X    |           |         | Utility workflow to make sure our scheduled and webhook workflows get properly started            |
| Main                                      |  X   |                  |         |         |     Y     |         | Main test framework, contains all the tests we run (every hour)                                   |
| OC Login Common Component                 |      |        X         |         |         |           |         | This workflow is called when you want to build an oc login command                                |
| Patroni CLAB (Crunchy)                    |  X   |                  |         |         |           |         | Crunchy Test In CLAB                                                                              |
| Patroni CLAB (HELM)                       |  X   |                  |         |         |           |         | Patroni Test instantiated from the NR Helm Chart                                                  |
| Patroni CLAB (Reference) - Switch Leader  |  X   |                  |         |         |           |         | Patroni Test where we switch leader pods                                                          |
| Patroni CLAB (Reference)                  |  X   |                  |         |         |           |         | Patroni Test                                                                                      |
| Patroni CLAB Main                         |  X   |                  |         |         |           |         | Organizing workflow that calls our our patroni and crunchy tests                                  |
| Remotely Trigger Workflows                |      |                  |         |    X    |           |    Y    | An exposed webhook that allows users to start a workflow with a simple webhook url                |
| Report Error Calling Stub                 |      |                  |    X    |         |           |         | Example on how to call our Report Error Common component                                          |
| Report Error                              |      |        X         |         |         |           |         | Common component that will report an error by email and RocketChat                                |
| Run N8N Audit                             |      |                  |         |    X    |           |         | Utility that runs the N8N audit command reporting on orhaned credentials and such.                |
| Run Test in GHA                           |      |        X         |         |         |           |         | A common component that runs a Cypress test in GHA.                                               |
| Start Cypress Test                        |      |                  |    X    |         |           |         | A example that shows how to invoke invoke the 'Run Test in GHA"                                   |
| Trigger N8N image build on Version Change |      |                  |         |    X    |     Y     |         | Automatic version check and N8N rebuild when a newer eleigble version is detected                 |
| Vault Check                               |  X   |                  |         |         |           |         | Vault Test in CLAB                                                                                |
