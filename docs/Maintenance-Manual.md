# Maintenance Manual

## Backing up the system and configurations

The N8N database is not automatically backed up. To back up the database, you can use the https://github.com/BCDevOps/backup-container
The backup container will back up the database to a backup PVC.

WE also implemented a secondary back up mechanism that will back up the workflows and credentials to a different backup PVC. This is done by using the `Backup All` workflow. This workflow is scheduled to run once every 24 hours. This backup is part of the OpenShift install and needs the workflow to be installed.

The configuration for N8N is completely captured in the Deployment Configuration provided and N8N can be deployed using the same configuration at will. No further backup is required.

## Monitoring resource usage and optimizing performance

It is advisable to review actual usage over the longer term and adjust resource requests and limits accordingly. The following commands can be used to review resource usage. One caveat: Be careful to not shrink the resource allocation too much as this can cause N8N to fail start up when it is trying to install a new image.

## Making users owner

The N8N OpenSource version does not allow for credentials and workflow sharing between users. To get around this, we need to assign new users as the owner of all workflows and credentials. To make a user the owner of all workflows and credentials, you need to run the following SQL query:

```sql
update "user" set "globalRoleId"=1 where "id"=1;
```

This query needs to be run on the n8n database pod by running the following statements in terminal:

```bash
psql
\c n8n # This will connect you to the n8n database
\dt # This will list all the tables in the database making sure you are in the right database
select * from "user"; # Find the id of the user you want to make the owner
update "user" set "globalRoleId"=1 where "id"=<id of user>;
```

## Insert global variables

The N8N OpenSource version does not allow usage of a new powerful features called [Variables](https://docs.n8n.io/environments/variables/). To get around this, we need to insert manually global variables into the database. To insert a global variable, you need to run the following SQL query:

```sql
insert into "variables"(key,type,value) values (`name of value`,'string',`content of value`);
```

This query needs to be run on the n8n database pod by running the following statements in terminal:

```bash
psql
\c n8n # This will connect you to the n8n database
\dt # This will list all the tables in the database making sure you are in the right database
insert into "variables"(key,type,value) values (`name of value`,'string',`content of value`);
```
