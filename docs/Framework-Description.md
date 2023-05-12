# Framework Description

## Architecture and design principles

## Core components and modules

## Supported use cases and scenarios

## Installation Instructions

N8N can be run locally by just using the [DockerFile](https://github.com/bcgov/put/blob/main/containers/workflow/Dockerfile). This will install all the dependencies and run the application on port 5678. But please not that the application will not be able to connect to a database. To connect to the database, you need to pass the environment variables to the docker container. But N8N with an ephermeral setup will give you a good idea of how the application works.

## OpenShift Deployment
Openshift Deployment is more involved and requires a few more steps. The following steps will help you deploy N8N on OpenShift.
You'll find the [README][DockerFile](https://github.com/bcgov/put/blob/main/containers/workflow/README.md) in the same folder as the DockerFile. This will give you a good idea of how to deploy N8N on OpenShift.

N8N on OpenShift will be set up as an enterprise-ready install, meaning that it is ready for production use. Because of this type of install, the requirements for resources are higher than the ephemeral install. 

The following are the requirements for the OpenShift install:
![N8N Recommend Resources](../../media/n8n-resources.png)
