## Smithy Server Generator for TypeScript Example Service

### Overview

This repository is divided into three projects:

- `model` contains the Smithy model for the service.
- `typescript-client` contains the generated TypeScript client generated from `model`.
- `server` contains the service, written in TypeScript, for `model`.

### Building

#### Prerequisites

Before beginning:
- Install
    - [JDK](https://aws.amazon.com/corretto/) >= 8
    - [NodeJS](https://nodejs.org/en/download/) >= 14
    - [AWS CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/cli.html)
- Enable [corepack](https://nodejs.org/api/corepack.html#enabling-the-feature) by running `corepack enable`
- Set up an [AWS account](https://portal.aws.amazon.com/billing/signup) if you do not have one
- [Configure your workstation](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html#getting_started_prerequisites)
  so the CDK can use your account

### Getting started

1. After the first checkout, you will need to kick off the initial code generation and build by running:
    ```bash
    ./gradlew build && yarn install && yarn build
    ```
   After this initial build, `yarn build` in the root of the project will regenerate the client and server and recompile
   all of the code.
2. To deploy the service, switch to the `server` directory and run `cdk deploy`. When complete, the CDK will print out the endpoint URL
   for your newly deployed service.
   >   Note: this step will create resources in your AWS account that may incur charges.
3. To test your service, switch to the `typescript-client` directory and use `yarn str-length` to call the `Length`
   operation. For example, given an output from the CDK of
   `https://somerandomstring.execute-api.us-west-2.amazonaws.com/prod/`,
   ```bash
   yarn str-length https://somerandomstring.execute-api.us-west-2.amazonaws.com/prod/ foobar
   ```
   should print out `6`.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.

