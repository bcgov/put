# N8N Deployment Guide

This guide explains how to deploy n8n using the separated template files.

## Directory Structure

```
containers/workflow/openshift/
├── templates/
│   ├── secrets.yaml                    # Secrets for n8n, PostgreSQL, and Redis
│   ├── services.yaml                   # Services for all components
│   ├── routes.yaml                     # Routes for n8n and webhook
│   ├── pvcs.yaml                       # PersistentVolumeClaims
│   ├── redis-statefulset.yaml         # Redis StatefulSet
│   ├── postgresql-statefulset.yaml    # PostgreSQL StatefulSet
│   ├── n8n-deployment.yaml            # N8N main deployment
│   ├── n8n-worker-deployment.yaml     # N8N worker deployment
│   ├── n8n-webhook-deployment.yaml    # N8N webhook deployment
│   ├── hpa.yaml                        # HorizontalPodAutoscalers
│   ├── pdb.yaml                        # PodDisruptionBudgets
│   └── networkpolicy.yaml              # NetworkPolicy
├── values-prod.env                     # Production parameters
├── values-dev.env                      # Development parameters
├── n8n.bc.yaml                         # BuildConfig (unchanged)
└── n8n.dc.yaml                         # Original (legacy - can be removed)
```

## Prerequisites

Before deploying, ensure you have:

1. **Existing PVCs**: The templates expect existing PVCs. If they don't exist, create them using `pvcs.yaml`
2. **Secrets with correct values**: Update the password values in your environment file
3. **Built n8n image**: Ensure the n8n image is built and available in the tools namespace

## Deployment Order

### Initial Deployment (All Components)

When deploying from scratch, follow this order:

```bash
# Set your target environment
ENV_FILE="values-prod.env"  # or values-dev.env

# 1. Create secrets (NOTE!!!!passwords will be auto-generated on first deployment, if it is not first deployment, DON"T run this!!!!)
oc process -f templates/secrets.yaml --param-file=${ENV_FILE} | oc create -f -

oc get secret n8n -o jsonpath='{.data.password}' | base64 -d > /tmp/n8n-password.txt
oc get secret n8n -o jsonpath='{.data.encryption-key}' | base64 -d > /tmp/n8n-encryption-key.txt
echo "Saved generated credentials to /tmp/"

# 2. Create PVCs (if they don't exist) - ONLY if starting fresh
# NOTE: If PVCs already exist with data, skip this step!
oc process -f templates/pvcs.yaml --param-file=${ENV_FILE} | oc apply -f -

# 3. Create services
oc process -f templates/services.yaml --param-file=${ENV_FILE} | oc apply -f -

# 4. Create routes
oc process -f templates/routes.yaml --param-file=${ENV_FILE} | oc apply -f -

# 5. Deploy PostgreSQL
oc process -f templates/postgresql-statefulset.yaml --param-file=${ENV_FILE} | oc apply -f -

# 6. Deploy Redis
oc process -f templates/redis-statefulset.yaml --param-file=${ENV_FILE} | oc apply -f -



# 7. Deploy n8n main application
oc process -f templates/n8n-deployment.yaml --param-file=${ENV_FILE} | oc apply -f -

# 8. Deploy n8n worker
oc process -f templates/n8n-worker-deployment.yaml --param-file=${ENV_FILE} | oc apply -f -

# 9. Deploy n8n webhook
oc process -f templates/n8n-webhook-deployment.yaml --param-file=${ENV_FILE} | oc apply -f -

# 10. Create HorizontalPodAutoscalers
oc process -f templates/hpa.yaml --param-file=${ENV_FILE} | oc apply -f -

# 11. Create PodDisruptionBudgets
oc process -f templates/pdb.yaml --param-file=${ENV_FILE} | oc apply -f -

# 12. Create NetworkPolicy
oc process -f templates/networkpolicy.yaml --param-file=${ENV_FILE} | oc apply -f -
```

### Update Existing Deployment

To update only specific components:

```bash
ENV_FILE="values-prod.env"

# Update only n8n deployments (after new image build)
oc process -f templates/n8n-deployment.yaml --param-file=${ENV_FILE} | oc apply -f -
oc process -f templates/n8n-worker-deployment.yaml --param-file=${ENV_FILE} | oc apply -f -
oc process -f templates/n8n-webhook-deployment.yaml --param-file=${ENV_FILE} | oc apply -f -

# Update only configuration (secrets) - ONLY if you have provided password values in env file
# WARNING: Do not update secrets unless necessary - will regenerate passwords if not provided!
oc process -f templates/secrets.yaml --param-file=${ENV_FILE} | oc apply -f -

# Update only database deployments
oc process -f templates/postgresql-statefulset.yaml --param-file=${ENV_FILE} | oc apply -f -
oc process -f templates/redis-statefulset.yaml --param-file=${ENV_FILE} | oc apply -f -
```

## Configuration

### Environment Files

The `values-prod.env` and `values-dev.env` files contain deployment parameters.

**For NEW installations:**
- Passwords and encryption keys will be **auto-generated** by OpenShift when you first deploy
- No need to set password values in the env files
- After deployment, retrieve generated values from secrets if needed

**For EXISTING installations (migration/update):**
- You MUST provide existing password values to avoid breaking your installation
- Get existing values from your current secrets:
```bash
# View existing n8n secret
oc get secret n8n -o yaml

# View PostgreSQL secret
oc get secret postgresql-n8n -o yaml

# View Redis secret
oc get secret redis-n8n -o yaml
```

- Uncomment and set the password values in your env file:
```bash
N8N_PASSWORD=<your-existing-password>
N8N_ENCRYPTION_KEY=<your-existing-key>  # CRITICAL - Do not change for existing data!
DATABASE_PASSWORD=<postgresql-password>
REDIS_DATABASE_PASSWORD=<redis-password>
```

**Important Notes:**

- **New installations**: Leave password fields commented out - they will auto-generate
- **Existing installations**: MUST provide all passwords to maintain data access
- **Production encryption key**: NEVER change for existing installations - will break all encrypted data
- Keep env files secure and never commit actual passwords to git

## Using Existing PVCs

The templates are configured to use existing PVCs with specific names:

- `n8n-data` - Main n8n data
- `n8n-backup` - Backup data
- `redis-n8n-0` - Redis data (StatefulSet PVC)
- `postgresql-n8n-0` - PostgreSQL data (StatefulSet PVC)

If your existing PVCs have different names, you have two options:

1. **Rename PVCs** (not recommended with existing data)
2. **Modify the template files** to match your PVC names



## Cleanup

To remove all n8n components (careful - this will not delete PVCs):

```bash
ENV_FILE="values-prod.env"

oc process -f templates/networkpolicy.yaml --param-file=${ENV_FILE} | oc delete -f -
oc process -f templates/pdb.yaml --param-file=${ENV_FILE} | oc delete -f -
oc process -f templates/hpa.yaml --param-file=${ENV_FILE} | oc delete -f -
oc process -f templates/n8n-webhook-deployment.yaml --param-file=${ENV_FILE} | oc delete -f -
oc process -f templates/n8n-worker-deployment.yaml --param-file=${ENV_FILE} | oc delete -f -
oc process -f templates/n8n-deployment.yaml --param-file=${ENV_FILE} | oc delete -f -
oc process -f templates/redis-statefulset.yaml --param-file=${ENV_FILE} | oc delete -f -
oc process -f templates/postgresql-statefulset.yaml --param-file=${ENV_FILE} | oc delete -f -
oc process -f templates/routes.yaml --param-file=${ENV_FILE} | oc delete -f -
oc process -f templates/services.yaml --param-file=${ENV_FILE} | oc delete -f -

# Optional: Delete secrets (be careful!)
# oc process -f templates/secrets.yaml --param-file=${ENV_FILE} | oc delete -f -

# Optional: Delete PVCs (DESTRUCTIVE - will lose all data!)
# oc process -f templates/pvcs.yaml --param-file=${ENV_FILE} | oc delete -f -
```

Some quick commands:

## Quick Deploy to Production (New Installation)

```bash
cd /Users/billyli/github/put/containers/workflow/openshift
export ENV_FILE="values-prod.env"

# Create secrets first (auto-generates passwords)
oc process -f templates/secrets.yaml --param-file=${ENV_FILE} | oc create -f -

# Deploy remaining components
oc process -f templates/services.yaml --param-file=${ENV_FILE} | oc apply -f -
oc process -f templates/routes.yaml --param-file=${ENV_FILE} | oc apply -f -
oc process -f templates/postgresql-statefulset.yaml --param-file=${ENV_FILE} | oc apply -f -
oc process -f templates/redis-statefulset.yaml --param-file=${ENV_FILE} | oc apply -f -
oc process -f templates/n8n-deployment.yaml --param-file=${ENV_FILE} | oc apply -f -
oc process -f templates/n8n-worker-deployment.yaml --param-file=${ENV_FILE} | oc apply -f -
oc process -f templates/n8n-webhook-deployment.yaml --param-file=${ENV_FILE} | oc apply -f -
oc process -f templates/hpa.yaml --param-file=${ENV_FILE} | oc apply -f -
oc process -f templates/pdb.yaml --param-file=${ENV_FILE} | oc apply -f -
oc process -f templates/networkpolicy.yaml --param-file=${ENV_FILE} | oc apply -f -

# Save generated credentials
echo "=== Generated Credentials ==="
echo "N8N Password: $(oc get secret n8n -o jsonpath='{.data.password}' | base64 -d)"
echo "Encryption Key: $(oc get secret n8n -o jsonpath='{.data.encryption-key}' | base64 -d)"
```

## Quick Deploy to Development (New Installation)

```bash
cd /Users/billyli/github/put/containers/workflow/openshift
export ENV_FILE="values-dev.env"

# Create secrets first (auto-generates passwords)
oc process -f templates/secrets.yaml --param-file=${ENV_FILE} | oc create -f -

# Deploy remaining components
oc process -f templates/services.yaml --param-file=${ENV_FILE} | oc apply -f -
oc process -f templates/routes.yaml --param-file=${ENV_FILE} | oc apply -f -
oc process -f templates/postgresql-statefulset.yaml --param-file=${ENV_FILE} | oc apply -f -
oc process -f templates/redis-statefulset.yaml --param-file=${ENV_FILE} | oc apply -f -
oc process -f templates/n8n-deployment.yaml --param-file=${ENV_FILE} | oc apply -f -
oc process -f templates/n8n-worker-deployment.yaml --param-file=${ENV_FILE} | oc apply -f -
oc process -f templates/n8n-webhook-deployment.yaml --param-file=${ENV_FILE} | oc apply -f -
oc process -f templates/hpa.yaml --param-file=${ENV_FILE} | oc apply -f -
oc process -f templates/pdb.yaml --param-file=${ENV_FILE} | oc apply -f -
oc process -f templates/networkpolicy.yaml --param-file=${ENV_FILE} | oc apply -f -

# Save generated credentials
echo "=== Generated Credentials ==="
echo "N8N Password: $(oc get secret n8n -o jsonpath='{.data.password}' | base64 -d)"
echo "Encryption Key: $(oc get secret n8n -o jsonpath='{.data.encryption-key}' | base64 -d)"
```

## Update Only n8n Application (After Image Build)

```bash
# Production
export ENV_FILE="values-prod.env"
oc process -f templates/n8n-deployment.yaml --param-file=${ENV_FILE} | oc apply -f -
oc process -f templates/n8n-worker-deployment.yaml --param-file=${ENV_FILE} | oc apply -f -
oc process -f templates/n8n-webhook-deployment.yaml --param-file=${ENV_FILE} | oc apply -f -

# Force new rollout to pull latest image
oc rollout restart deployment/n8n
oc rollout restart deployment/n8n-worker
oc rollout restart deployment/n8n-webhook
```

## Update Only Databases

```bash
export ENV_FILE="values-prod.env"
oc process -f templates/postgresql-statefulset.yaml --param-file=${ENV_FILE} | oc apply -f -
oc process -f templates/redis-statefulset.yaml --param-file=${ENV_FILE} | oc apply -f -
```
## One-Line Deployments

### Full Deployment (New Installation)
```bash
# Production
oc process -f templates/secrets.yaml --param-file=values-prod.env | oc create -f - && for template in services routes postgresql-statefulset redis-statefulset n8n-deployment n8n-worker-deployment n8n-webhook-deployment hpa pdb networkpolicy; do oc process -f templates/${template}.yaml --param-file=values-prod.env | oc apply -f -; done

# Development
oc process -f templates/secrets.yaml --param-file=values-dev.env | oc create -f - && for template in services routes postgresql-statefulset redis-statefulset n8n-deployment n8n-worker-deployment n8n-webhook-deployment hpa pdb networkpolicy; do oc process -f templates/${template}.yaml --param-file=values-dev.env | oc apply -f -; done
```

**Note:** Use `oc create` for secrets on first deployment to auto-generate passwords. Use `oc apply` for updates (but ensure you have password values set in env file).

### Update Only Application Deployments
```bash
# Production
for template in n8n-deployment n8n-worker-deployment n8n-webhook-deployment; do oc process -f templates/${template}.yaml --param-file=values-prod.env | oc apply -f -; done

# Development
for template in n8n-deployment n8n-worker-deployment n8n-webhook-deployment; do oc process -f templates/${template}.yaml --param-file=values-dev.env | oc apply -f -; done
```

