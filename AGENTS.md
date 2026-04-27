# AGENTS.md — lowdefy-plugin-axios-oauth2-client-credentials

## What this repo is

A Lowdefy 4 plugin that adds an `AxiosOAuth2ClientCredentials` connection type. It extends the
built-in `@lowdefy/connection-axios-http` connection to support the OAuth2 **client credentials
grant** flow: a client ID and secret are exchanged for a Bearer token, which is cached in memory
and transparently refreshed on expiry.

This repo is not published to npm. It is consumed as a **Git submodule** inside a Lowdefy
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
| `@lowdefy/connection-axios-http` | Base connection; pinned to `^4.7.3` to match parent monorepo |
| `axios` | HTTP client; pinned to `^1.15.2` |
| `node-cache` | In-memory token cache |
| `eslint` + `eslint-config-airbnb-base` | Dev: linting |

## Development

```sh
npm install
npm run lint
```

No lockfile is committed (see `.gitignore`) — the lockfile lives at the root of the consuming
monorepo. When adding or changing dependencies, pin explicit semver ranges in `package.json`
rather than using `*`.

## Versioning & releases

Bump `version` in `package.json` for any meaningful change. The consuming monorepo references
this via submodule SHA, so a release tag is helpful but not required for deployment.
