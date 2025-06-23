# Archive Viewer Connector Metadata

This repo contains the Archive Viewer Connector metadata that will allow users to view their Gearset archive within Salesforce using the Gearset API.

## Developing locally

The archive viewer connector can be deployed and validated locally, assuming you have the following installed:

1. The [Salesforce CLI](https://developer.salesforce.com/tools/salesforcecli)
2. The node packages (run `npm ci`)

Optionally, it is possible to use an Idea IDE such as Rider, IntelliJ or WebStorm as an editor for the connector.
Alternatively [VSCode](https://code.visualstudio.com/) with the [Salesforce Extension](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode) for VSCode
works well.

_Note: before deploying or validating, you must build the project using `npm run build`_.

### Authenticating the Salesforce CLI

To develop this metadata, you will likely want to be able to easily deploy your changes to your Salesforce org. It is
recommended that you create a separate org for the development of this metadata.

To login to your org, run the following command.

```shell
sf org login web --set-default
```

If you don't want this org to be your default, use an alias and remember to use `-o my-org` when running subsequent commands.

```shell
sf org login web --alias my-org
```

### Configuring network locations

Environment files are used to define the location of the UI and the endpoints from the Gearset app needed to run the viewer
.
There are 3 versions `.env.dev`, `.env.staging` and `.env.prod` for `dev`, `staging` and `production` respectively. `.env.dev` is not included
in the repository because it is dependent on your own environment.

Each `.env` file has the location of the UI (`IFRAME_URL`) and REST end points (`API_URL`).

`.env.staging` and `.env.prod` are preconfigured with staging and production locations and should be used as is.

If you are running `sf` from the command line and not via one of the `npm` scripts, you can use `npx dotenv -f <env-file> -- sf <command>`
to select the `.env` file to use, e.g. to deploy using staging use:

```shell
npx dotenvx run -f .env.staging -- sf project deploy start
```

### Running development version

#### ngrok

The connector runs on the Salesforce infrastructure and makes inbound requests which are normally blocked by a firewall
(such as your router or Gearset) from reaching your development host. To work around this you can install and run
[`ngrok`](https://ngrok.com/) to provide an end point that can be tunneled to your development environment.

#### .env.dev

`.env.dev` will need to be created using the location of your `ngrok` endpoint for the `API_URL` and `IFRAME_URL`, e.g.
assuming an end point of `usable-lovebug-endless.ngrok-free.app`, the file would be:

```properties
SF_APPLY_REPLACEMENTS_ON_CONVERT=true
API_URL=https://usable-lovebug-endless.ngrok-free.app
IFRAME_URL=https://usable-lovebug-endless.ngrok-free.app
```

#### Running and using the connector.

Assuming the `ngrok` end point assigned to you is `usable-lovebug-endless.ngrok-free.app`.

1. Update both `API_URL` and `IFRAME_URL` in `.env.dev` to `https://usable-lovebug-endless.ngrok-free.app`.
2. Build and deploy the connector using `.env.dev`
3. Add the LWC to the `Account` page in your Salesforce Org.
4. Create an API key using the wizard in Salesforce. Make sure to copy the key somewhere safe.
5. Following the [Connector docs](https://docs.gearset.com/en/articles/10961189), manually add the API key to Salesforce. If you have used `npm run package:dev` the named credential will be named `Dev Gearset Archive Viewer`

You should be able to browse the archive using the viewer embedded on the Account page of your Org.

`ngrok` will show the connections being made to the viewer, allowing you to diagnose issues.

```shell
ngrok http --url=usable-lovebug-endless.ngrok-free.app http://localhost:5173
```

An alternative is to use a `ngrok.yml` configuration file and start ngrok using `ngrok start --all`. See https://ngrok.com/docs/agent/config/

```yaml
version: "3"
agent:
    authtoken: TOKEN
endpoints:
    - name: archive-viewer-connector
      url: URL
      upstream:
          url: 5173
```

### Deploying multiple versions

The `IFRAME_URL` and `API_URL` environment variables are encoded into the configuration and can't be changed easily. To help, there
are a few `npm` scripts that can be used to create separate `zip` files which can then be deployed into an org using Gearset compare & deploy.
The scripts rename and patch the output from the build command to allow multiple versions to be deployed safely with no interactions between the different versions.
For instance, you can deploy a copy of the connector that works on `staging` and one that works locally with your `dev` environment to allow you to verify local
changes in the viewer UI with the same `Org` on `staging`.

Each `npm` script runs a `bash` script to rename and patch the built files. If the LWC, Apex class or other configuration files are changed you may
need to update the `add-prefixes.sh` script to ensure all the references are updated.

To create a `zip` to be used with staging run:

```shell
npm run package:staging && npm run package:zip
```

This will build the connector using the `staging` network location, change the names of configuration, Apex class and LWC to include the prefix
`stg`, compress the bundle into a `zip` file. The zip file can be deployed using Gearset. The uncompressed bundle can be found in `metadataPackage`
should you want to inspect the changes.

### Deploying to Salesforce

> Note: Using this mechanism will make it harder to have two copies of the connector in an org, but it may be faster to use this for development.
> For example you could use this for your development copy and use `npm run package:staging` for your staging version.

This project uses environment variables to control the iframe URL and the API URL, `IFRAME_URL` and `API_URL` respectively.
It is recommended that you create a local `.env.dev` to store the values for these. See example above.

Before deploying the files, be sure to build the project using `npm run build`.

To deploy the metadata directly to Salesforce with the settings from `.env.dev`, use the following command:

```shell
npm run deploy:dev
```

To deploy using Gearset, you must convert the project into a metadata that can be deployed, using the following command:

```shell
npm run package:prod && npm run package:zip
```

This will create the `zip` file ready for upload to Compare and Deploy.

### Validating on Salesforce

To validate the metadata on Salesforce with the settings from `.env.dev`, use the following command:

_Note: this will run all tests on your org._

```shell
npm run validate:dev
```

### Running a specific test

To run a specific test that is on your org (with a human readable format), use the following command:

```shell
sf apex test run -n TestName --result-format human
```

_Note: you must deploy the test before it can be ran_

## Useful Documentation

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
