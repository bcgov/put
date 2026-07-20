# DevX webhook router test notes

Two active n8n workflows must not share the same webhook path pattern. Keep these
routers separate:

- `DevX Webhook Router.json`: `devx-router/:route`
- `Internal channel, artifcactory channel webhook.json`: `internal-router/:route`

## Route map

| Workflow | Route | Channel / target | Caller repo to update |
| --- | --- | --- | --- |
| `Internal channel, artifcactory channel webhook.json` | `internal-router/internal-platform-services` | `internal-platform-services` | Not in use currently |
| `Internal channel, artifcactory channel webhook.json` | `internal-router/artifactory-project-approvals` | `artifactory-project-approvals` | tenant-gitops-devops-artifactory` |
| `Internal channel, artifcactory channel webhook.json` | `internal-router/devops-vault` | `Internal-devops-vault` | platform-gitops-vault` |
| `DevX Webhook Router.json` | `devx-router/platform-monitoring-notifications` | `platform-monitoring-notifications` | platform-gitops-gen` |
| `DevX Webhook Router.json` | `devx-router/sysdig` | `platform-monitoring-notifications` | in sysdig notification setting |
| `DevX Webhook Router.json` | `devx-router/put` | `devops-post-update-testing` | put/framework/workflows/Report Error.json` |
| `DevX Webhook Router.json` | `devx-router/provisioner` | `internal-provisioner` | acs-automation`, tenant-gitops-eb6118` |

## Internal router

Base webhook ID: `7499cb76-ae1d-4f73-9d2f-d67afb9b0158`

### internal-platform-services

```bash
curl -i -X POST \
  "https://n8n.developer.gov.bc.ca/webhook/7499cb76-ae1d-4f73-9d2f-d67afb9b0158/internal-router/internal-platform-services" \
  -H "Content-Type: application/json" \
  -d '{"title":"Internal Platform Services Test","msg":"Smoke test for internal-platform-services route","severity":"info","source":"curl-test","url":"https://developer.gov.bc.ca","urlLabel":"Open Test"}'
```

### artifactory-project-approvals

```bash
curl -i -X POST \
  "https://n8n.developer.gov.bc.ca/webhook/7499cb76-ae1d-4f73-9d2f-d67afb9b0158/internal-router/artifactory-project-approvals" \
  -H "Content-Type: application/json" \
  -d '{"text":"Smoke test for Artifactory project approval request. Project: test-project, requester: billy.li@gov.bc.ca"}'
```

### devops-vault

```bash
curl -i -X POST \
  "https://n8n.developer.gov.bc.ca/webhook/7499cb76-ae1d-4f73-9d2f-d67afb9b0158/internal-router/devops-vault" \
  -H "Content-Type: application/json" \
  -d '{"title":"Vault Operation Test","msg":"Smoke test for devops-vault route","severity":"warning","source":"devops-vault","url":"https://vault.developer.gov.bc.ca","urlLabel":"Open Vault"}'
```

## DevX router

Base webhook ID: `67108286-493e-4d5c-8c5c-2450167b001f`

### platform-monitoring-notifications

```bash
curl -i -X POST \
  "https://n8n.developer.gov.bc.ca/webhook/67108286-493e-4d5c-8c5c-2450167b001f/devx-router/platform-monitoring-notifications" \
  -H "Content-Type: application/json" \
  -d '{"title":"Platform Monitoring Test","msg":"Smoke test for platform-monitoring-notifications route","severity":"info","source":"curl-test","url":"https://developer.gov.bc.ca","urlLabel":"Open Test"}'
```

### sysdig

```bash
curl -i -X POST \
  "https://n8n.developer.gov.bc.ca/webhook/67108286-493e-4d5c-8c5c-2450167b001f/devx-router/sysdig" \
  -H "Content-Type: application/json" \
  -d '{"state":"OPEN","condition":"cpu.used.percent > 90","alert":{"name":"Curl Smoke Test Sysdig Alert","severity":0,"severityLabel":"critical","scope":"namespace = test","editUrl":"https://app.sysdigcloud.com/#/alerts"}}'
```

### put

```bash
curl -i -X POST \
  "https://n8n.developer.gov.bc.ca/webhook/67108286-493e-4d5c-8c5c-2450167b001f/devx-router/put" \
  -H "Content-Type: application/json" \
  -d '{"subJect":"PUT Workflow Test","rcMessage":"Smoke test for PUT route","textMessage":"This is a test payload from curl","rcChannel":"test-channel","count":1,"severity":"warning","executionUrl":"https://n8n.developer.gov.bc.ca/workflow/test"}'
```

### provisioner

```bash
curl -i -X POST \
  "https://n8n.developer.gov.bc.ca/webhook/67108286-493e-4d5c-8c5c-2450167b001f/devx-router/provisioner" \
  -H "Content-Type: application/json" \
  -d '{"title":"Provisioner Job Failed","msg":"Smoke test for provisioner route","severity":"critical","source":"provisioner"}'
```
