
command to get sf token from console: console.log(document.cookie.match(/sid=([^;]+)/)[1]);
command to get domain from console: window.location.origin.replace('.lightning.force.com', '.my.salesforce.com').replace('-setup', '')

Comands to login to salesforce using salesforce cli
$env:SF_ACCESS_TOKEN="access token"

sf org login access-token --instance-url https://orgfarm-cf567c8e83-dev-ed.develop.my.salesforce.com --alias MyTokenOrg --no-prompt

command to deploy metadata: sf project deploy start --source-dir force-app --target-org MyTokenOrg

dry run validation: sf project deploy start --source-dir force-app --dry-run
actual deployment: sf project deploy start --source-dir force-app
convert from dx to mdataapi: sf project convert source  --source-dir force-app --output-dir mdapi_output

list connected orgs: sf org list