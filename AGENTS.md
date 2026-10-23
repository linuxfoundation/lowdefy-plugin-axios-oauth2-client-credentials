# AGENTS.md — lowdefy-plugin-axios-oauth2-client-credentials

## What this repository is

A Lowdefy 6 plugin that adds an `AxiosOAuth2ClientCredentials` connection type. It extends the
built-in `@lowdefy/connection-axios-http` connection to support the OAuth2 **client credentials
grant** flow: a client ID and secret are exchanged for a Bearer token, which is cached in memory
and transparently refreshed on expiry.

This repository is not published to npm. It is consumed as a **Git submodule** inside a Lowdefy
monorepo (e.g. under `plugins/`), referenced with `version: 'workspace:*'` in `lowdefy.yaml`.

## Source layout

```
src/
  connections.js                         # Exports the connection for Lowdefy plugin discovery.
  types.js                               # Exports TypeScript-style type info.
  AxiosOAuth2ClientCredentials/          # Main implementation directory.
  AxiosOAuth2ClientCredentials.js        # Schema definition; extends AxiosHttp schema,
                                         # overriding `auth` for OAuth2 config.
```

## Key design points

- Builds on `@lowdefy/connection-axios-http` — schema and request handler are shallow-copied and
  extended, not rewritten from scratch.
- The `auth` property on the **connection** (not the request) is repurposed for OAuth2 config:
  `tokenUrl`, `clientId`, `clientSecret`, and optional `endpointParams`.
- Tokens are cached **in-memory per node** for their `expires_in` lifetime. A mutex prevents
  concurrent token requests at startup or on expiry.
- No token introspection — works with opaque tokens, JWTs, etc.

## Dependencies

| Package | Role |
|---|---|
| `@lowdefy/connection-axios-http` | Base connection; pinned to `^6.2.0` to match parent monorepo |
| `axios` | HTTP client; pinned to `^1.20.0` |
| `node-cache` | In-memory token cache |
| ESLint + `eslint-config-airbnb-base` | Dev: linting |

## Development

```sh
npm install
npm run lint
```

No lockfile is committed (see `.gitignore`) — the lockfile lives at the root of the consuming
monorepo. When adding or changing dependencies, pin explicit semver ranges in `package.json`
rather than using `*`.

## Keeping the README in sync

The README states a minimum supported Lowdefy version ("Lowdefy 4 (or later) plugin") and its
code example pins a `lowdefy:` version in the sample `lowdefy.yaml`. When bumping the
`@lowdefy/connection-axios-http` dependency in `package.json`, also update the README's code
example `lowdefy:` version to match the new pinned version, so the documentation never drifts
from the dependency that is actually pinned.

## Versioning & releases

Bump `version` in `package.json` for any meaningful change. The consuming monorepo references
this via submodule SHA, so a release tag is helpful but not required for deployment.
