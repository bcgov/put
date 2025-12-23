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

> **Note**: The deployment has been refactored into separate template files for better modularity and easier updates.

N8N deployment uses OpenShift templates with environment-specific parameter files. This allows you to deploy the same templates to different environments (dev/test/prod) with different configurations.

### Quick Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md) and [QUICK-START.md](QUICK-START.md).

**Quick deploy to production:**
```bash
cd containers/workflow/openshift
export ENV_FILE="values-prod.env"

# Create secrets first (passwords auto-generated)
oc process -f templates/secrets.yaml --param-file=${ENV_FILE} | oc create -f -

# Deploy remaining components
for template in services routes postgresql-statefulset redis-statefulset n8n-deployment n8n-worker-deployment n8n-webhook-deployment hpa pdb networkpolicy; do 
  oc process -f templates/${template}.yaml --param-file=${ENV_FILE} | oc apply -f -
done

# Save generated passwords for future reference
echo "N8N Password: $(oc get secret n8n -o jsonpath='{.data.password}' | base64 -d)"
echo "Encryption Key: $(oc get secret n8n -o jsonpath='{.data.encryption-key}' | base64 -d)"
```

**Quick deploy to development (new installation):**
```bash
cd containers/workflow/openshift
export ENV_FILE="values-dev.env"

# Create secrets first (passwords auto-generated)
oc process -f templates/secrets.yaml --param-file=${ENV_FILE} | oc create -f -

# Deploy remaining components
for template in services routes postgresql-statefulset redis-statefulset n8n-deployment n8n-worker-deployment n8n-webhook-deployment hpa pdb networkpolicy; do 
  oc process -f templates/${template}.yaml --param-file=${ENV_FILE} | oc apply -f -
done

# Save generated passwords for future reference
echo "N8N Password: $(oc get secret n8n -o jsonpath='{.data.password}' | base64 -d)"
echo "Encryption Key: $(oc get secret n8n -o jsonpath='{.data.encryption-key}' | base64 -d)"
```

### Architecture

This deployment creates the following:

|    Application    |       Object        | Description                                                                                                        | Template File                   |
| :---------------: | :-----------------: | ------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
|  **N8N (Main)**   |       Secret        | Main Secret for N8N                                                                                                | `secrets.yaml`                  |
|                   |     Deployment      | Deploys the Main Application                                                                                       | `n8n-deployment.yaml`           |
|                   |       Service       | The service is responsible for making the pod available for the router                                             | `services.yaml`                 |
|                   |        Route        | Exposes an external URL for connecting to the UI                                                                   | `routes.yaml`                   |
|                   | PodDisruptionBudget | Makes sure we have at least one pod running                                                                        | `pdb.yaml`                      |
|                   |         PVC         | Persistent Storage for N8N                                                                                         | `pvcs.yaml`                     |
| **N8N (Worker)**  |     Deployment      | Deploys N8N worker Pods, they use the same storage, database and configuration as the main N8N pod                 | `n8n-worker-deployment.yaml`    |
|                   |       Service       | The service is responsible for enabling access to a **set** of worker pods                                         | `services.yaml`                 |
|                   |  HorizontalScaler   | Scales up the number of pods depending on load, this allows for automatic scalability                              | `hpa.yaml`                      |
|                   | PodDisruptionBudget | Makes sure we have at least one pod running                                                                        | `pdb.yaml`                      |
| **N8N (Webhook)** |     Deployment      | Deploys N8N webhook Pods, they use the same storage, database and configuration as the main N8N pod                | `n8n-webhook-deployment.yaml`   |
|                   |       Service       | The service is responsible for enabling access to a **set** of webhook pods and making it available for the router | `services.yaml`                 |
|                   |  HorizontalScaler   | Scales up the number of pods depending on load, this allows for automatic scalability                              | `hpa.yaml`                      |
|                   | PodDisruptionBudget | Makes sure we have at least one pod running                                                                        | `pdb.yaml`                      |
|                   |        Route        | Exposes an external URL for connecting to the webhooks                                                             | `routes.yaml`                   |
|  **PostgreSQL**   |       Secret        | Main Secret for PostgreSQL                                                                                         | `secrets.yaml`                  |
|                   |    StatefulSet      | The database that is used by N8N as the repository for all workflows, credentials and execution data               | `postgresql-statefulset.yaml`   |
|                   |       Service       | The service is responsible for making the database available for the application                                   | `services.yaml`                 |
|                   |         PVC         | Persistent Storage for PostgreSQL database server                                                                  | `pvcs.yaml`                     |
|     **Redis**     |       Secret        | Main Secret for Redis (The open source, in-memory data store)                                                      | `secrets.yaml`                  |
|                   |    StatefulSet      | The data store that is used by N8N to manage queuing of workflow runs                                              | `redis-statefulset.yaml`        |
|                   |       Service       | The service is responsible for making the data store available for the application                                 | `services.yaml`                 |
|                   |         PVC         | Persistent Storage for Redis data store                                                                            | `pvcs.yaml`                     |
|      **ALL**      |    NetworkPolicy    | To make sure that all pods can talk to each other                                                                  | `networkpolicy.yaml`            |

All deployments have liveliness and readiness checks built in, and handle image updates via RollingUpdate strategy. Databases use StatefulSets for stable network identities and persistent storage.

## Initial Setup

Once N8N is up and functional (this will take between 3 to 5 minutes), you will have to do initial setup manually. We suggest you populate the email account and password as whatever the `n8n-secret` secret contains in the `owner-user` and `owner-password` fields respectively.

## Notes

In general, N8N should generally take up very little CPU (<0.01 cores) and float between 700 to 800mb of memory usage during operation. The template has some reasonable requests and limits set for both CPU and Memory, but you may change it should your needs be different. For inspecting the official N8N documentation [here](https://docs.n8n.io/).

## File Structure

```
containers/workflow/openshift/
├── templates/                          # All template files
│   ├── secrets.yaml                    # Secrets for n8n, PostgreSQL, Redis
│   ├── services.yaml                   # Services for all components
│   ├── routes.yaml                     # Routes for n8n and webhook
│   ├── pvcs.yaml                       # PersistentVolumeClaims
│   ├── redis-statefulset.yaml         # Redis StatefulSet
│   ├── postgresql-statefulset.yaml    # PostgreSQL StatefulSet
│   ├── n8n-deployment.yaml            # N8N main Deployment
│   ├── n8n-worker-deployment.yaml     # N8N worker Deployment
│   ├── n8n-webhook-deployment.yaml    # N8N webhook Deployment
│   ├── hpa.yaml                        # HorizontalPodAutoscalers
│   ├── pdb.yaml                        # PodDisruptionBudgets
│   └── networkpolicy.yaml              # NetworkPolicy
├── values-prod.env                     # Production environment parameters
├── values-dev.env                      # Development environment parameters
├── n8n.bc.yaml                         # BuildConfig for n8n image
├── DEPLOYMENT.md                       # Detailed deployment guide
├── QUICK-START.md                      # Quick start commands
└── README.md                           # This file
```

## Overall Resource Requirements

N8N requires:
- 1 Main Pod (always on)
- 1-3 Worker Pods (auto-scales based on load)
- 1-3 Webhook Pods (auto-scales based on load)
- 1 PostgreSQL Pod (StatefulSet)
- 1 Redis Pod (StatefulSet)

Default resource requests/limits per n8n pod:
- CPU Request: 100m, Limit: 1 core
- Memory Request: 256Mi, Limit: 4Gi

## Migration from DeploymentConfig

If you're migrating from the old `n8n.dc.yaml` (DeploymentConfig), note the following changes:

1. **DeploymentConfig → Deployment**: Main n8n components now use Deployment instead of DeploymentConfig
2. **DeploymentConfig → StatefulSet**: PostgreSQL and Redis now use StatefulSet for better persistence
3. **Separate Templates**: Each component type is now in its own template file for easier management
4. **Parameter Files**: Use `values-prod.env` and `values-dev.env` for environment-specific configuration
5. **PVC Names**: StatefulSet PVCs are named with `-0` suffix (e.g., `redis-n8n-0`, `postgresql-n8n-0`)

## Additional Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Comprehensive deployment guide with troubleshooting
- **[QUICK-START.md](QUICK-START.md)** - Quick command reference for common operations