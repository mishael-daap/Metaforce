things that should be on the dashboard 
- models
- metadata library

Yes. To check if your local project matches your Salesforce org using the modern sf CLI, you use the preview commands.

Depending on which direction you want to check, use one of the following commands:

Bash
sf project retrieve preview
What it does: Compares your local metadata with the org's metadata and tells you exactly what exists in the org that hasn't been pulled yet (Remote Add / Remote Change).

If you are fully in sync: It will return No results found. under the Source Status table.

Bash
sf project deploy preview
What it does: Checks the opposite direction—showing you what local changes have not yet been pushed to the org.

If you are fully in sync: It will state No files will be deployed.

Notes on Source Tracking

to pull from manifest 

sf project retrieve start --manifest manifest/package.xml --target-org MySandboxAlias

sf org list 

sf org display --target-org MyOrgAlias
