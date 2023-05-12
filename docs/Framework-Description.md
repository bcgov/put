# Framework Description

## Architecture and design principles

We deploy the following tools and approaches:

- Conductor/Workflow engine: [N8N](https://n8n.io/)
- Command line tools for the platform like: oc, common range of Linux tools, bash etc.
- Web UI Testing tool: Cypress https://cypress.io/
- API Testing Tool: Cypress, Postman or N8N
- OpenShift API: Check status of objects running in OpenShift
- GitHub Actions for external checking
- Email Notification services
- Current reporting and monitoring tools (Uptime)
- Several pods in a dedicated Openshift name space (CLAB)
- User IDs with the appropriate access for the different purposes (dba access, admin access, user access etc.)
- Test installation of Patroni and/or other tools that cannot otherwise be tested (thinking about failover testing)

### Structure of every test workflow

Every Test has (in this order):

- Initialization: Setting of parameters, log in, prepare the test bed
- Execution of the test
- Evaluation of the result
- Error Reporting
- Closeout: Cleanup, logout, etc.

![Workflow Structure](https://github.com/bcgov/put/blob/main/media/workflow.png)

## Common components

We have created a set of common components for activities that get repeated.

| Workflow Name             | Test | Common Component | Example | Utility | Scheduled | Webhook | Description                                                                 |
| :------------------------ | :--: | :--------------: | :-----: | :-----: | :-------: | :-----: | :-------------------------------------------------------------------------- |
| Error Handler             |      |        X         |         |         |           |         | Common Component that deals with Workflow execution errors and reports them |
| OC Login Common Component |      |        X         |         |         |           |         | This workflow is called when you want to build an oc login command          |
| Report Error              |      |        X         |         |         |           |         | Common component that will report an error by email and RocketChat          |
| Run Test in GHA           |      |        X         |         |         |           |         | A common component that runs a Cypress test in GHA.                         |

### OC Login Common Component

This workflow gets called while providing the **tokenName** in the calling workflow.
The workflow will find the token from the credential and will build the `oc login` statement that you can use.

### Report Error

This component will be called whenever an error report needs to be emailed and send to RocketChat.
Key is using **Set** to set up the parameters and then call this workflow.

#### Incoming Parameters

- **rcChannel:** RC Channel
- **rcMessage:** RC Message
- **fromAddress:** Email From
- **toAddress:** Email To
- **textMessage:** Message Body Text
- **htmlMessage:** Message Body HTML, will supersede Text Message body
- **ccAddress:** Email cc
- **bccAddress:** email bcc
- **subJect:** Email Title

### Run Test in GHA

Running a Cypress test on GHA in your repo, requires you to set the following parameters:
**workFlow**: The workflow name you want to run
**repoOwner**: In our case this is "bcgov"
**repoName**: Your Repository Name
**errorString**: The string to detect an error with in your script

And then call this workflow.

## Supported use cases and scenarios

We support the following Scenarios:

- Connect to a database
- Run a SQL query
- Run a SQL script
- Run `oc` commands on any cluster/namespace (provided the credentials are available)
- Send emails/RocketChat messages
- Schedule Workflows
- Run workflows on demand
- Provide webhooks
- Run arbitrary code
- Run Cypress tests
- Run Linux commands and ony pod provided you have the correct credentials
- Integrate with over 200 applications/platforms
- Create layered structured workflows
- Common Components for Login, Reporting, Cypress Tests, etc.

## Installation Instructions

N8N can be run locally by just using the [DockerFile](https://github.com/bcgov/put/blob/main/containers/workflow/Dockerfile). This will install all the dependencies and run the application on port 5678. But please not that the application will not be able to connect to a database. To connect to the database, you need to pass the environment variables to the docker container. But N8N with an ephermeral setup will give you a good idea of how the application works.

## OpenShift Deployment

Openshift Deployment is more involved and requires a few more steps. The following steps will help you deploy N8N on OpenShift.
You'll find the [README](https://github.com/bcgov/put/blob/main/containers/workflow/openshift/README.md) in the same folder as the DockerFile. This will give you a good idea of how to deploy N8N on OpenShift.

N8N on OpenShift will be set up as an enterprise-ready install, meaning that it is ready for production use. Because of this type of install, the requirements for resources are higher than the ephemeral install.

The following are the requirements for the OpenShift install:
![N8N Recommend Resources](https://github.com/bcgov/put/blob/main/media/n8n-resources.png)

Once N8N is installed, you can access the application by using the route that is created. The route will be in the following format: `https://n8n-<namespace>-<project>.apps.<cluster>.devops.gov.bc.ca`.

## N8N Configuration

All the necessary configuration is built into the OpenShift DC.

## Adding Key Workflows and credentials

Several workflows are essential to the operation of the PUT. These workflows are stored [here](https://github.com/bcgov/put/blob/main/framework/workflows)

They are:

- Backup All : Backup of all workflows and credentials on backup PVC
- Backup workflows to GitHub: Store all workflows in the [PUT repo](https://github.com/bcgov/put/tree/main/framework/workflows)
- Trigger N8N image build on Version Change: Automatic version check and N8N rebuild when a newer eligble version is detected

You have to create the right credentials for the workflows to work.
