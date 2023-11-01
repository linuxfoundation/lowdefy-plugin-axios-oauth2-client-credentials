# client\_credentials Lowdefy HTTP Connection

## About

This repository is a Lowdefy 4 plugin that provides a new Connection, axios-oauth2-client-credentials. This supports the OAuth2 "client credentials grant" workflow, where a Client ID and Client Secret are exchanged for an access token, used as Bearer token to authenticate access to a protected API.  These access tokens typically expire and must be re-granted by the authorization server throughout the application runtime, and therefore cannot be configured at build time in Lowdefy using HTTP headers.

**This is a community effort, and is not developed or supported by Lowdefy, Inc.**

## Usage

This plugin is not released to any NPM repositories as a package. Rather, it is expected to be added to a Lowdefy monorepo under the plugins/ folder (e.g. using Git submodules). For more information on Lowdefy monorepos, please read the documentation at [lowdefy-example-plugins](https://github.com/lowdefy/lowdefy-example-plugins). For more information on Git submodules, please refer to [Pro Git](https://git-scm.com/book/en/v2/Git-Tools-Submodules).

### Example

**auth.tokenUrl**, **auth.clientId**, and **auth.clientSecret** are REQUIRED parameters for the connection. **auth.endpointParams** is optional.

The OAuth2 client\_credentials configuration MUST be on the connection definition, not the request.

```yaml
---
lowdefy: 4.0.0-rc.12
# [...]
plugins:
  - name: 'lowdefy-plugin-axios-oauth2-client-credentials'
    version: 'workspace:*'
auth:
  providers:
    - id: sso_auth
      type: MyProvider
      properties:
        clientId:
          _secret: MY_CLIENT_ID
        clientSecret:
          _secret: MY_CLIENT_SECRET
        issuer:
          _secret: IDP_BASEURL
connections:
  - my_oauth2_api:
    type: AxiosOAuth2ClientCredentials
    properties:
      baseURL: 'https://api.example.com/v1/'
      auth:
        tokenUrl:
          _string.concat:
            - _secret: IDP_BASEURL
            - '/oauth/token'
        clientId:
          _secret: MY_CLIENT_ID
        clientSecret:
          _secret: MY_CLIENT_SECRET
        endpointParams:
          audience: 'https://api.example.com/'
          # scope, etc, as needed
pages:
  - id: some_page
    # [...]
    requests:
      - id: hello_get
        type: AxiosOAuth2ClientCredentials
        connectionId: my_oauth2_api
        properties:
          url: /hello
```

## Design

This plugin is built on top of the existing Lowdefy Axios Connection, and extends its schema and its methods. Notably, the `auth` attribute of the connection (_not_ the request) is repurposed from being used to configure HTTP Basic authorization, and instead is used to configure the Client Credentials Grant token request.

Access tokens are cached in-memory (per Lowdefy app node) for the lifetime of the token, based on the expires\_in response from the issuing server. No introspection of the token is performed, so any token type (opaque, JWT, etc) is supported. Locking is used to avoid making multiple concurrent requests for a token at startup or when at token is expired. A cluster running N nodes should therefore make no more than N client\_credentials grants per the token lifetime. _For serverless deployments of Lowdefy: this token caching, as currently implemented, will much less effective, depending on how flat your concurrency is._

Parameters other than the token endpoint, client ID and client secret are specified as additional parameters, and are not subject to any schema verification, inspired by the configuration format used by `golang.org/x/oauth2/clientcredentials`.

It is intentional that there are no npm/yarn/pnpm lockfiles in this repo: those will be at the base of your monorepo.

## License

Copyright The Linux Foundation and each contributor.

This project's source code is licensed under the MIT License. A copy of the license is available in LICENSE.

This project's documentation is licensed under the Creative Commons Attribution 4.0 International License (CC-BY-4.0). A copy of the license is available in LICENSE-docs.
