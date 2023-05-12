# Credentials Management

## Setting up and managing user credentials
Credentials are stored in N8N's database. They are encrypted using a key that is stored in the database. The key is generated when the N8N container is first started. The key is stored in the database and is used to encrypt and decrypt the credentials. The key is also stored in the N8N container's environment variables. This is done so that the key is available to the N8N container when it is restarted. If the key is not available, the credentials will not be decrypted and the workflows will fail.

This also means that credentials are not portable between N8N instances. If you want to move credentials from one N8N instance to another, you will need to export them (in a decrypted form) from the first instance and import them into the second instance.

Credentials are set upo through credential templates accessible from the N8N web application. The N8N website has comprehensive information on how to set up credentials. Refer to [this page](https://docs.n8n.io/credentials/) for more information.

### Exporting credentials
The N8N website has comprehensive information on how to export the credentials. Refer to [this page](https://docs.n8n.io/hosting/cli-commands/#credentials) for more information. This is a CLI command that must be run from the N8N container's command line. There is no way to export the credentials from the N8N web application of via the REST API interface.

## Security considerations and best practices
In our set up we need to store credentials for OpenShift Access. The problem is that N8N does not have a pre-defined facility to store credentials for OpenShift Access. We have to use the generic Header Auth template to store the credentials. This approach does mean that we needed to build additional code to properly extract and use OpenShift tokens in our `oc login` commands. This is not ideal, but it is the best we can do with the current version of N8N.
We create created a common component workflow for this specific purpose. This workflow is called when you want to build an `oc login` command. The workflow will find the token from the credential and will build the `oc login` statement that you can then use.

As a best practice, we recommend not storing credentials in a public place (even if they are encrypted).

## Troubleshooting common issues
As mentioned before, the credentials are encrypted using a key that is stored in the database. The key is generated when the N8N container is first started. The key is stored in the database and is used to encrypt and decrypt the credentials. The key is also stored in the N8N container's environment variables. This is done so that the key is available to the N8N container when it is restarted. If the key is not available, the credentials will not be decrypted and the workflows will fail.

If you are having issues with the credentials, check the following:
1. Is the N8N container running?
2. Is the N8N container's environment variable `N8N_ENCRYPTION_KEY` set?
3. Is the N8N container's environment variable `N8N_ENCRYPTION_KEY` set to the same value as the `encryptionKey` field in the `credentials` table in the database?
4. Is the `encryptionKey` field in the `credentials` table in the database set to the same value as the `N8N_ENCRYPTION_KEY` environment variable in the N8N container?

If the answer to any of these questions is "no", then you will need to fix the issue before the credentials will work.
The standard installation of N8N will set the `N8N_ENCRYPTION_KEY` environment variable to the same value as the `encryptionKey` field in the `credentials` table in the database. 
