require('dotenv').config();
const axios = require('axios');
const querystring = require('querystring');

// Build the OAuth authorization URL
const tenantId = process.env.TENANT_ID;
const clientId = process.env.CLIENT_ID;
const redirectUrl = process.env.REDIRECT_URL;

const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`;

const params = {
  client_id: clientId,
  response_type: 'code',
  redirect_uri: redirectUrl,
  response_mode: 'query',
  scope: 'openid profile email', // Scope of the access request
  state: 'test_state' // Optional, for tracking request state
};

// Convert parameters to query string
const queryString = querystring.stringify(params);

// Full authorization URL
const fullUrl = `${authUrl}?${queryString}`;

// Log the cURL request
const curlCommand = `curl -X GET "${fullUrl}" -H "Accept: application/json"`;
console.log(`Generated cURL command: ${curlCommand}`);

// Function to make the request using axios
async function testSSO() {
  try {
    // Make a GET request to the authorization URL
    const response = await axios.get(fullUrl, {
      maxRedirects: 0, // This prevents automatic following of redirects
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Accept only 2xx and 3xx responses
      }
    });

    // If you get 302 (redirect), it's working; else, log unexpected status
    if (response.status === 302) {
      console.log('SSO Information is valid! Received a redirect response.');
      console.log(`Redirect URL: ${response.headers.location}`);
    } else if (response.status === 200) {
      console.log(
        'Unexpected 200 OK status. SSO might not be configured correctly.'
      );
      console.log('Response data (check for errors):', response.data);
    } else {
      console.log(`Unexpected status code: ${response.status}.`);
    }
  } catch (error) {
    if (error.response && error.response.status === 302) {
      console.log('SSO Information is valid! Received a redirect response.');
      console.log(`Redirect URL: ${error.response.headers.location}`);
    } else {
      console.error('Error during SSO test:', error.message);
    }
  }
}

// Run the test
testSSO();
