# Introduction

The Post Upgrade Testing Solution is based on [N8N](https://n8n.io/).

N8N (pronounced "n-eight-n" or "node-based") is an open-source, self-hosted workflow automation tool that helps to automate tasks between various applications and services. It was created by Jan Oberhauser in 2019, and it has gained popularity in the developer community for its flexibility and extensibility.

n8n allows you to create custom workflows using a visual, node-based interface. Each node represents a different application or service, and you can connect them to create complex automation processes. The platform provides a wide range of built-in nodes for handling data manipulation, conditional logic, and other operations.

It forms the basis for our test framework as it allows us to create custom complex workflows and integration with our platform and other services.

The key features of n8n include:

* **Open source**: n8n is released under the Apache 2.0 License, which means that it is freely available for anyone to use, modify, and distribute.
* **Self-hosted**: You can run n8n on your own server, ensuring that your data remains private and secure.
* **Extensibility**: n8n can be easily extended by adding new nodes to support additional applications and services.
* **Visual interface**: n8n's node-based interface makes it easy to create and manage complex workflows without the need for extensive programming knowledge.
* **Cross-platform**: n8n can be run on various operating systems, including Windows, macOS, and Linux.

To get started with n8n, you can either install it on your own server or use one of the available cloud-hosted solutions. There is also an [active community around n8n](https://community.n8n.io/) that can provide support, share workflows, and help with troubleshooting.

For installation on OpenShift refer to https://github.com/bcgov/put/tree/main/containers/workflow/openshift.

## Workflow components and their functionalities

* Nodes: integrations and operations.
* Connections: node connectors.
* Sticky notes: document your workflows.

### [Nodes](https://docs.n8n.io/workflows/components/nodes/)
Nodes are the key building blocks of a workflow. They perform a range of actions, including:

* Starting the workflow.
* Fetching and sending data.
* Processing and manipulating data.

n8n provides a collection of built-in nodes, as well as the ability to create your own nodes. You can also install additional nodes from the n8n community.

### [Connections](https://docs.n8n.io/workflows/components/connections/)
Connections are used to connect nodes together. They represent the flow of data between nodes, and they can be used to create complex workflows.

### [Sticky notes](https://docs.n8n.io/workflows/components/sticky-notes/)
Sticky notes are used to document your workflows. They can be used to add comments, instructions, or other information about the workflow.

## PUT (Post Upgrade Testing)
We implemented a modular, extensible automation test framework for the Platform Services team that will includes test cases for:
* Patroni database clusters
* Vault Secret Management platform
* Artifactory Trusted Repository service

These test cases will be executed after each upgrade of the platform to ensure that the platform is functioning as expected.
The different applications are deployed in our CLAB environment and upgardes to the platform will first be inmplemeneted there. This give the team the opportunity to evaluate the upgrade and test the functionality of the platform before it is deployed to the production environment.

