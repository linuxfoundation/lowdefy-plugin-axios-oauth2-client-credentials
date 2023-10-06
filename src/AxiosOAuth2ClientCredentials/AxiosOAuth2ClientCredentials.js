// Copyright The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// eslint-disable-next-line import/no-unresolved
import { AxiosHttp } from '@lowdefy/connection-axios-http/connections';
import NodeCache from 'node-cache';
import axios from 'axios';
import { promisify } from 'node:util';

const cache = new NodeCache();

const sleep = promisify(setTimeout);

async function newBearerToken(auth, cacheKey) {
  // Attempt to get a lock.
  let lockWait = false;
  for (;;) {
    if (cache.get(`lock/${cacheKey}`) === undefined) {
      // Lock for 10 seconds.
      cache.set(`lock/${cacheKey}`, true, 10);
      break;
    }
    lockWait = true;
    // Sleep for 120ms before we test lock again.
    // eslint-disable-next-line no-await-in-loop
    await sleep(120);
  }

  // Now that we have the lock: if we waited, it's possible that another thread
  // refreshed the token: if there is a token in the cache, use it.
  if (lockWait) {
    const cachedToken = cache.get(`bearer-token/${cacheKey}`);
    if (cachedToken !== undefined) {
      return cachedToken.access_token;
    }
  }

  // Our turn to fetch a new token.
  let response;
  const data = {
    grant_type: 'client_credentials',
    client_id: auth.clientId,
    client_secret: auth.clientSecret,
    ...auth.endpointParams,
  };
  try {
    response = await axios.post(auth.tokenUrl, data, {
      timeout: 15000,
    });
  } catch (err) {
    // Caller should handle, but caught first in order to unlock.
    cache.del(`lock/${cacheKey}`);
    throw err;
  }

  // Cache the token response body.
  if (response.data.expires_in !== undefined) {
    // Cache for 60 seconds less than the token expiry.
    cache.set(`bearer-token/${cacheKey}`, response.data, response.data.expires_in - 60);
  }

  // Unlock.
  cache.del(`lock/${cacheKey}`);

  return response.data.access_token;
}

async function bearerToken(auth) {
  let cacheKey = auth.clientId;
  if (typeof auth.endpointParams === 'object' && auth.endpointParams !== null) {
    // Compute a cache-key from the values of any additional params (like audience!).
    cacheKey = `${auth.clientId}-${Object.values(auth.endpointParams).join('-')}`;
  }

  // Attempt to fetch from cache.
  const cachedToken = cache.get(`bearer-token/${cacheKey}`);

  // Return on hit.
  if (cachedToken !== undefined) {
    return cachedToken.access_token;
  }

  // Otherwise, return a new token.
  return newBearerToken(auth, cacheKey);
}

async function AxiosOAuth2ClientCredentials({ request, connection }) {
  // Fetch a token for this endpoint (cached if possible).
  const token = await bearerToken(connection.auth);

  // Do not pass the "auth" from our connection to AxiosHTTP request.
  const conn2 = { ...connection };
  delete conn2.auth;

  if (request.headers === undefined) {
    request.headers = {};
  }
  request.headers.Authorization = `Bearer ${token}`;

  return AxiosHttp.requests.AxiosHttp({ request, connection: conn2 });
}

// Copy request schema over verbatim.
AxiosOAuth2ClientCredentials.schema = AxiosHttp.requests.AxiosHttp.schema;

AxiosOAuth2ClientCredentials.meta = {
  checkRead: false,
  checkWrite: false,
};

export default AxiosOAuth2ClientCredentials;
