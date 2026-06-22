# N8N Kustomize Deployment

This folder provides a Kustomize deployment path for the existing n8n OpenShift objects.

It keeps the same object names, selectors, labels, secret references, routes, services, and deployment names used by the existing OpenShift deployment. Applying an overlay updates the existing objects instead of creating a second n8n stack.

Secrets are intentionally not generated here. Keep using the existing `n8n`, `postgresql-n8n`, and `redis-n8n` Secrets that were created by the OpenShift Template deployment. This avoids accidentally rotating the n8n encryption key or database passwords.

PersistentVolumeClaims are intentionally not managed here. Existing PVCs are reused through the deployment volume references, but the PVC objects themselves are left untouched to avoid immutable storage-class changes during migration.

## Apply

Render and inspect production:

```bash
kustomize build containers/workflow/kustomize/overlays/prod
```

Apply production:

```bash
oc apply -k containers/workflow/kustomize/overlays/prod
```

Apply development:

```bash
oc apply -k containers/workflow/kustomize/overlays/dev
```

## Notes

- Production namespace: `bf5ef6-prod`
- Development namespace: `bf5ef6-dev`
- n8n image namespace: `bf5ef6-tools`
- Cluster route host: `apps.gold.devops.gov.bc.ca`
- Worker concurrency: `n8n worker --concurrency=5`
- Main n8n runs `replicas: 2` with PDB `maxUnavailable: 1`
- Webhook runs with HPA `minReplicas: 2` and PDB `maxUnavailable: 1`
- Worker runs with HPA `minReplicas: 3` and PDB `maxUnavailable: 2`
- Main, webhook, and worker pods use topology spread constraints across `kubernetes.io/hostname`
