// Copyright The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// eslint-disable-next-line import/no-unresolved
import { AxiosHttp } from '@lowdefy/connection-axios-http/connections';

import AxiosOAuth2ClientCredentials from './AxiosOAuth2ClientCredentials/AxiosOAuth2ClientCredentials';

// Shallow copy schema, including properties.
const connectionSchema = { ...AxiosHttp.schema };

// Override schema from upstream connection-axios-http to use `auth` to configure OAuth2.
connectionSchema.properties = { ...connectionSchema.properties };
connectionSchema.auth = {
  type: 'object',
  description:
    'Configures OAuth2 token endpoint, client ID, client secret, and additional endpoint params for OAuth2 Client Credentials grant.',
  properties: {
    tokenUrl: {
      type: 'string',
      description: 'OAuth2 token URL to POST the credential_credentials grant request.',
      errorMessage: {
        type: 'AxiosOAuth2ClientCredentials property "auth.tokenURL" should be a string.',
      },
    },
    clientId: {
      type: 'string',
      description: 'The Client ID that this application uses to authorize itself to the authentication server.',
      errorMessage: {
        type: 'AxiosOAuth2ClientCredentials property "auth.clientID" should be a string.',
      },
    },
    clientSecret: {
      type: 'string',
      description: 'The Client Secret that this application uses to authorize itself to the authentication server.',
      errorMessage: {
        type: 'AxiosOAuth2ClientCredentials property "auth.clientSecret" should be a string.',
      },
    },
    endpointParams: {
      type: 'object',
      description: 'Additional parameters for the token request, e.g. audience.',
      errorMessage: {
        type: 'AxiosOAuth2ClientCredentials property "auth.endpointParams" should be an object.',
      },
    },
  },
  required: [
    'tokenURL',
    'clientId',
    'clientSecret',
  ],
  errorMessage: {
    type: 'AxiosHttp property "auth" should be an object.',
  },
};

// Ensure that our overridden 'auth' is also a mandatory property.
connectionSchema.required = ['auth'];

export default {
  schema: connectionSchema,
  requests: {
    AxiosOAuth2ClientCredentials,
  },
};
