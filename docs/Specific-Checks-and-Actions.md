# Specific Checks and Actions

## Pod checks

Steps to be able to run pod checks or execute code on a pod:

- Create a workflow with the following components:
  - Manual Start Trigger
  - A Set node with your credential information
  - Call to **OC Login Common Component** to create a login string
  - A `Execute Command` node that.....
- Log in to the cluster/namespace where your pod is running
- Get the pod name using `oc get pods` and other selection criteria
- Get the pod details using `oc describe pod <pod-name>`
- Get the pod logs using `oc logs <pod-name>`
- Use `oc rsh <pod-name> <command>` to run commands on the pod
- or Use `oc exec <pod-name> <command>` to run commands on the pod
- Collect the output

## Database checks

Steps to be able to run database checks or execute sql on a database:

- Create a workflow with the following components:
  - Manual Start Trigger
  - A Set node with your credential information
  - Call to **OC Login Common Component** to create a login string
  - A `Execute Command` node that.....
- Log in to the cluster/namespace where your database pod is running
- Create a port forward to the database pod using `oc port-forward <pod-name> <local-port>:<pod-port>`
  - ```bash
    nohup oc port-forward svc/<database service> 15433:5432 > /dev/null 2>&1 & # Specifically this statement as it ensures that the port forward is not killed when the step completes and move to the next node
    sleep 10 # Give the port forward a chance to start
    jobs # Check that the port forward is running
    ```
- Add a database node to the workflow
- The database address is `localhost`
- The database port is the local port you used in the port forward
- The credentials for the database node need to be obtained from the secrets in the namespace
- Use the database node to run sql statements
- Collect the output

## Running arbitrary code

There are two places in your workflows where you can use code:

### Expressions

Use [expressions(https://docs.n8n.io/code-examples/expressions/)] to transform data in your nodes. You can use JavaScript in expressions, as well as n8n's Built-in methods and variables and Data transformation functions.

### Code node

The [Code node](https://docs.n8n.io/code-examples/javascript-functions/code-node/) allows you to add JavaScript to your workflow.
