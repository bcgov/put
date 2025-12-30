
# Allowing Cross-User Sub-Workflow Calls in n8n Community (Hacky Workaround)

> **NOTE!!!!!!!**  
> This guide describes an **unsupported hack** against n8n Community Edition internals.  
> It may break on upgrades, and n8n won't officially support issues caused by these changes.  
> Use **only** if you understand the risks and always test in a non‑production environment first.

---

## 1. Background and Problem

In newer n8n versions(Version 1.119.1), workflows can have a **caller policy** that restricts which other workflows are allowed to execute them via the **Execute Workflow** node.

On **n8n Community Edition**:

- You do **not** have the UI options (like *"This workflow can be called by: Any workflow"*).
- The default policy is effectively **`workflowsFromSameOwner`**, so:
  - Workflow A can only call Workflow B if n8n considers them to have the same "owner" (or same project, depending on schema/version).
- As a result, if:
  - The *parent* workflow was created by one user, and
  - The *sub-workflow* was created by another user,
  - you may see the error:

    ```text
    The sub-workflow (XX) cannot be called by this workflow
    The sub-workflow you're trying to execute limits which workflows it can be called by. Update sub-workflow settings to allow other workflows to call it.
    ```

Because the Community Edition does not expose the caller policy in the UI, you cannot simply switch it to *"Any workflow"* from the frontend.

---

## 2. High-Level Idea of the Hack

We work around this limitation by **editing the n8n Postgres database directly** to:

1. Ensure all workflows live under the **same project** (so they effectively share the same "owner/project").
2. Change the specific sub-workflow's **`callerPolicy`** from:
   - `workflowsFromSameOwner` → `any`

After this, the parent workflow can successfully call the sub-workflow, even though they were originally created by different users.

Redis is used by n8n as a **queue / cache backend**, not the source of truth for workflows. The authoritative data is in **Postgres**; Redis may cache some mappings (e.g., workflow → project), which is why clearing Redis cache can sometimes be needed. In this particular case, updating the `callerPolicy` alone was enough to fix the call without clearing the cache.

---

## 3. Environment and Components

- **Database**: Postgres (stores users, workflows, permissions, projects, etc.).
- **Cache / Queue**: Redis (stores queued jobs and some cached mappings).
- **Backup helper**: a dedicated **backup container** with a helper script:

  ```bash
  ./backup.sh -1
  ```

  used to create a database backup before doing any direct DB edits.

---

## 4. Step 0 – Backup the Database (Mandatory)

Before touching Postgres, **always create a backup**.

1. Enter the backup container (example):

   ```bash
   oc exec -it <backup-pod-name> -- bash
   ```

2. Run the backup script:

   ```bash
   ./backup.sh -1
   ```

   This should create a full database backup (check your internal backup docs for where the file is stored and how to restore it).

3. Exit the container after confirming the backup completed without errors.

If anything goes wrong later, you can restore from this backup.

---

## 5. Step 1 – Change the Sub-Workflow `callerPolicy` to `any`

Even with projects aligned, the sub-workflow is still restricted by its internal **caller policy**, which by default is `workflowsFromSameOwner`. On Community Edition, you can't change this from the UI, but it is stored in the `settings` JSON column in `workflow_entity`.

### 5.1 Inspect current settings for the sub-workflow

Because `id` in `workflow_entity` is stored as **text**, you must compare it as a string:

```sql
SELECT id, name, settings
FROM workflow_entity
WHERE id = '28';
```

Example output:

```text
 id |          name               | settings
----+-----------------------------+-------------------------------------------------------
 28 | OC Login Common Component   | {"saveDataSuccessExecution":"all",
                                   |  "saveManualExecutions":false,
                                   |  "callerPolicy":"workflowsFromSameOwner",
                                   |  "errorWorkflow":"41",
                                   |  "executionTimeout":3600,
                                   |  "executionOrder":"v1",
                                   |  "availableInMCP":false,
                                   |  "saveDataErrorExecution":"all"}
```

Note `"callerPolicy":"workflowsFromSameOwner"`.

### 5.2 Update `callerPolicy` to `any`

Use `jsonb_set` to update **only** the `callerPolicy` field in the JSON:

```sql
UPDATE workflow_entity
SET settings = jsonb_set(
  COALESCE(settings::jsonb, '{}'::jsonb),
  '{callerPolicy}',
  '"any"',
  true
)
WHERE id = '28';
```

Verify again:

```sql
SELECT id, name, settings
FROM workflow_entity
WHERE id = '28';
```

You should now see:

```json
"callerPolicy":"any"
```

inside the `settings` JSON.

At this point, you have:

- All workflows sharing the same `projectId`.
- The specific sub-workflow configured to accept calls from **any** workflow (`callerPolicy: "any"`).

---

## 6. (Optional) Step 2 – Clear Redis Workflow Cache

In some setups, n8n caches workflow → project mappings in Redis under a key like:

- `n8n:cache:workflow-project`

If you suspect stale cache is interfering, you can clear it.

1. Connect to Redis:

   ```bash
   redis-cli -h <redis-host> -p <port> -a <password>
   ```

2. Check for the key:

   ```bash
   KEYS n8n:cache:workflow*
   ```

3. Delete the workflow project cache:

   ```bash
   DEL n8n:cache:workflow-project
   ```

   Expected output (if the key existed):

   ```text
   (integer) 1
   ```

4. Restart n8n (main instance and any workers) so they reconnect and repopulate the cache based on your updated Postgres data.

> In the specific case described here, updating `callerPolicy` to `any` was enough to resolve the issue **even without** clearing Redis cache, but clearing the cache is a good additional step if the problem persists.

---

## 7. Step 3 – Restart n8n and Test

After updating the DB:

1. Restart your n8n services (Docker containers, Kubernetes deployments, etc.).
2. Open the **parent** workflow (the one with the **Execute Workflow** node).
3. Manually execute it or trigger it so that it calls the sub-workflow.

If everything was applied correctly, the previous error:

```text
The sub-workflow (28) cannot be called by this workflow
The sub-workflow you're trying to execute limits which workflows it can be called by. Update sub-workflow settings to allow other workflows to call it.
```

should disappear, and the sub-workflow should run as expected.

---

## 8. Why This Works (and Why It's a Hack)

### 8.1 Caller Policy Logic

Internally, n8n uses a **caller policy** per workflow to decide which workflows are allowed to execute it as a sub-workflow. Values include (among others):

- `any` – **any** workflow can call this.
- `workflowsFromSameOwner` / `workflowsFromSameProject` – only workflows from the same owner/project can call this.
- `workflowsFromAList` – only specific workflows can call this.

On commercial editions, you can configure these via the UI. On Community Edition, the setting is present in the DB but **not exposed** in the UI, so you can't change it normally.

By manually editing the `settings` JSON, we are:

- Bypassing the lack of UI controls.
- Forcing the sub-workflow to use `callerPolicy: "any"`, effectively disabling the restriction.

---

## 9. Rollback Strategy

If something goes wrong, you have two main rollback options:

1. **Full DB Restore**  
   Use the backup created with `./backup.sh -1` to restore the entire database to its previous state (follow your internal restore procedures).

2. **Targeted Undo (Advanced)**  
   If you know exactly what you changed, you can:
   - Restore `projectId` values in `shared_workflow` from a backup copy or manually set them back.
   - Reset `callerPolicy` for the sub-workflow back to `workflowsFromSameOwner`:

     ```sql
     UPDATE workflow_entity
     SET settings = jsonb_set(
       COALESCE(settings::jsonb, '{}'::jsonb),
       '{callerPolicy}',
       '"workflowsFromSameOwner"',
       true
     )
     WHERE id = '28';
     ```

   This is more fragile than a full restore, so only do it if you're confident in the scope of your changes.

---

## 10. Summary

- This is an **unsupported hack** but can be useful in controlled environments where upgrading to a commercial edition or redesigning workflows is not immediately feasible.

---

## Appendix: Attempts That Didn't Work

Worth keeping this record so we don't try these again in the future.

### A.1 Inspect Users and Workflows

Connect to Postgres (for example, via `psql`):

```bash
psql -U n8n -d n8n
```

#### List users

```sql
SELECT id, email FROM "user";
```

Example output:

```text
                  id                  |               email
--------------------------------------+----------------------------------------
dd971dd1-ac27-4b54-a6b2-a6f703068a8d | billy.li@gov.bc.ca
4d1ce663-1824-44d7-9047-f64a2a57e70b | artem.kravchenko@gov.bc.ca
...
```

Note your own user ID (e.g. `dd971dd1-ac27-4b54-a6b2-a6f703068a8d`).

#### List workflows

```sql
SELECT id, name FROM workflow_entity ORDER BY id;
```

Example:

```text
 id |                   name
----+------------------------------------------
  3 | Artifactory Basic Health Check CLAB
 12 | Vault Check
 14 | Patroni Main
 16 | Report Error Calling Stub
 28 | OC Login Common Component
 ...
```

Decide:

- **Parent workflow**: the one that has the **Execute Workflow** node.
- **Sub-workflow**: the workflow being called (e.g. `OC Login Common Component`, id `28`).

In the example, the problematic sub-workflow is **ID `28`**.

---

### A.2 Align All Workflows to a Single Project (Did Not Work Alone)

Newer n8n versions use **projects** internally, and workflow permissions can depend on the `projectId`. To simplify ownership logic, we tried assigning **all workflows** to a single project.

> ⚠️ This is heavy-handed. In a more complex, multi-team setup you might prefer to only update a subset of workflows rather than everything.

#### Check the `shared_workflow` table

```sql
SELECT "workflowId", "projectId", role
FROM shared_workflow
ORDER BY "workflowId";
```

You'll see rows for each workflow, with a `projectId` and `role` like `workflow:owner`.

#### Choose a project ID

List existing projects:

```sql
SELECT id, name FROM project;
```

Pick a project ID to use globally (e.g. `8TL7f7Zh5T94reb3`).

#### Point all workflows to that project

Update **every** workflow's `projectId`:

```sql
UPDATE shared_workflow
SET "projectId" = '8TL7f7Zh5T94reb3'
WHERE "projectId" IS DISTINCT FROM '8TL7f7Zh5T94reb3';
```

Verify:

```sql
SELECT "workflowId", "projectId", role
FROM shared_workflow
ORDER BY "workflowId";
```

You should now see all rows using the same `projectId` (`8TL7f7Zh5T94reb3`) with role `workflow:owner`.

> **Result**: This alone did NOT fix the issue. The `callerPolicy` change (Section 5) was still required.
