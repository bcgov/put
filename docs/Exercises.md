# Exercises

The following Exercise helps you to get familiar with the framework and the components.

Log In to: https://console.apps.clab.devops.gov.bc.ca/k8s/ns/e31b6b-dev

## Exercise 1:

I have a testpsql pod running there.

I need you to:

1. Create a service account that you can use as a credential (role bind as edit)
2. Create a credential in N8N with that SA.

Then:  3. Create a workflow that:
    3.a Does a 'oc login'
    3.b Runs the following statement on the testpsql pod: 'psql --version'
    3.c Captures the version
    3.d emails the version to yourself

## Exercise 2:

1. Add the Error Handler to the just created workflow.

## Exercise 3.

1. Check the version and report an error by email and rocketchat #devops-post-update-testing if the version <> 12.4

## Exercise 4.

1. Obtain the run status from https://artifacts.apps.clab.devops.gov.bc.ca/router/api/v1/system/health
2. Email result to yourself
3. Make this scheduled job, that kicks off every 1 minute

## Exercise 5.

1. Run the following sql statements against the testpsql instance in https://console.apps.clab.devops.gov.bc.ca/k8s/ns/e31b6b-dev

```sql
create table IF NOT EXISTS <username>\_lat_longs  (   c1 bigint generated always as identity,   c2 float );  
insert into <username>\_lat_longs(c2) select random() _ 100 from generate_series(1,10e3) as g(id);  commit;  
select count(_) from <username>\_lat_longs;
drop table <username>\_lat_longs;
```

2. Properly close all connections after you are done.
3. Test for 10000 count

## Exercise 6.

Make the previous workflow enterprise ready:

- Error handling
- Reporting
- Scheduling
   - Etc.

## Exercise 7.

Create a workflow that queries and reports on the n8n version running.

## Exercise 8.

Create a workflow that queries the N8N Postgres database (mind you this is in the same namespace)
Execute the following query: "select name, active from workflow_entity"
