# N8N

This folder contains the OpenShift templates required in order to build and deploy an instance of N8N onto OpenShift. These templates were designed with the assumption that you will be building and deploying the N8N application within the same project. We will be running with the assumption that this N8N instance will be co-located in the same project as the database it is expecting to poll from.

## Build N8N

You are supposed to build your n8n image in your <..>-tools namespace and then when you deploy you'll re-use that image.

While N8N does provide a Docker image [here](https://hub.docker.com/r/n8nio/n8n), it is not compatible with OpenShift due to the image assuming it has root privileges. Instead, we build a simple NodeJS image based off Redhat's /ubi8/nodejs-16 image where the N8N application can execute without needing privilege escalation. In order to build a N8N image in your project, process and create the build config template using the following command (replace anything in angle brackets with the correct value):

```sh
export NAMESPACE=<bf5ef6-tools>
export N8N_IMAGE_NAMESPACE=<bf5ef6-tools>

oc process -n $NAMESPACE -f n8n.bc.yaml -p N8N_IMAGE_NAMESPACE=$N8N_IMAGE_NAMESPACE -o yaml | oc apply -n $NAMESPACE -f -
```

This will create an ImageStream called `n8n`. This image is built on top of ubi8/nodejs-16, and will have N8N installed on it. We have also added a few extra libraries/tools to the image like jq, Python3, OC CLI and a graphics library. You can add your own tools to the install if needed.

In order for your other namespaces (dev,test,prod) to be able to pull this new image from your <..>-tools project, you have to create a role binding for each of those. See example below:

```yaml
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: "system:image-pullers"
  namespace: bf5ef6-tools
  annotations:
    openshift.io/description: >-
      Allows all pods in this namespace to pull images from this namespace.  It
      is auto-managed by a controller; remove subjects to disable.
subjects:
  - kind: Group
    apiGroup: rbac.authorization.k8s.io
    name: "system:serviceaccounts:bf5ef6-dev"
  - kind: Group
    apiGroup: rbac.authorization.k8s.io
    name: "system:serviceaccounts:bf5ef6-test"
  - kind: Group
    apiGroup: rbac.authorization.k8s.io
    name: "system:serviceaccounts:bf5ef6-prod"
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: "system:image-puller"
```

## Deploy N8N

Once your N8N image has been successfully built, you can then deploy it in your project by using the following command (replace anything in angle brackets with the correct value):

```sh
export NAMESPACE=<bf5ef6-dev>
export N8N_IMAGE_NAMESPACE=<bf5ef6-tools>
oc process -n $NAMESPACE -f n8n.dc.yaml NAMESPACE=$NAMESPACE -o yaml | oc apply -n $NAMESPACE -f -
```

This will create the following:

|    Application    |       Object        | Description                                                                                                        |
| :---------------: | :-----------------: | ------------------------------------------------------------------------------------------------------------------ |
|  **N8N (Main)**   |       Secret        | Main Secret for N8N                                                                                                |
|                   |  Deployment Config  | Deploys the Main Application                                                                                       |
|                   |       Service       | The service is responsible for making the pod available for the router                                             |
|                   |        Route        | Exposes an external URL for connecting to the UI                                                                   |
|                   | PodDisruptionBudget | Makes sure we have at least one pod running                                                                        |
|                   |         PVC         | Persistent Storage for N8N                                                                                         |
| **N8N (Worker)**  |  Deployment Config  | Deploys N8N worker Pods, they use the same storage, database and configuration as the main N8N pod                 |
|                   |       Service       | The service is responsible for enabling access to a **set** of worker pods                                         |
|                   |  HorizontalScaler   | Scales up the number of pods depending on load, this allows for automatic scalability                              |
|                   | PodDisruptionBudget | Makes sure we have at least one pod running                                                                        |
| **N8N (Webhook)** |  Deployment Config  | Deploys N8N webhook Pods, they use the same storage, database and configuration as the main N8N pod                |
|                   |       Service       | The service is responsible for enabling access to a **set** of webhook pods and making it available for the router |
|                   |  HorizontalScaler   | Scales up the number of pods depending on load, this allows for automatic scalability                              |
|                   | PodDisruptionBudget | Makes sure we have at least one pod running                                                                        |
|                   |        Route        | Exposes an external URL for connecting to the webhooks                                                             |
|  **PostgreSQL**   |       Secret        | Main Secret for PostgreSQL                                                                                         |
|                   |  Deployment Config  | The database that is used by N8N as the repository for all workflows, credentials and execution data               |
|                   |       Service       | The service is responsible for making the database available for the application                                   |
|                   |         PVC         | Persistent Storage for PostgreSQL database server                                                                  |
|     **Redis**     |       Secret        | Main Secret for Redis (The open source, in-memory data store)                                                      |
|                   |  Deployment Config  | The data store that is used by N8N to manage queuing of workflow runs                                              |
|                   |       Service       | The service is responsible for making the data store available for the application                                 |
|                   |         PVC         | Persistent Storage for Redis data store                                                                            |
|      **ALL**      |    NetworkPolicy    | To make sure that all pods can talk to each other                                                                  |

The Deployment Configs for N8N have liveliness and readiness checks built in, and handles image updates via Recreation strategy.

## Initial Setup

Once N8N is up and functional (this will take between 3 to 5 minutes), you will have to do initial setup manually. We suggest you populate the email account and password as whatever the `n8n-secret` secret contains in the `admin-user` and `admin-password` fields respectively.

## Notes

In general, N8N should generally take up very little CPU (<0.01 cores) and float between 700 to 800mb of memory usage during operation. The template has some reasonable requests and limits set for both CPU and Memory, but you may change it should your needs be different. For inspecting the official N8N documentation [here](https://docs.n8n.io/).
