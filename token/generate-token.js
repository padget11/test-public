const jwt = require('jsonwebtoken');
const fetch = require('node-fetch')
const fs = require('fs');
 
// Get the private key, App ID, and Installation ID from environment variables
const privateKey = process.env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n');
const appId = process.env.APP_ID;
const installationId = process.env.INSTALLATION_ID;
 
if (!privateKey || !appId || !installationId) {
  console.error('GITHUB_APP_PRIVATE_KEY, APP_ID, and INSTALLATION_ID are required');
  process.exit(1);
}
 
// Generate the JWT
const generateJWT = () => {
  return jwt.sign(
    {
      iss: appId,
    },
    privateKey,
    {
      algorithm: 'RS256',
      expiresIn: '10m',
    }
  );
};
 
// Fetch the installation access token
const fetchInstallationToken = async (jwtToken) => {
  const url = `https://api.github.com/app/installations/${installationId}/access_tokens`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      Accept: 'application/vnd.github+json',
    },
  });
 
  if (!response.ok) {
    console.error(`Failed to fetch installation token: ${response.statusText}`);
    process.exit(1);
  }
 
  const data = await response.json();
  return data.token;
};
 
// Main function
(async () => {
  try {
    const jwtToken = generateJWT();
    const installationToken = await fetchInstallationToken(jwtToken);
 
    // Save the installation token to a file
    const outputFile = 'token.txt';
    fs.writeFileSync(outputFile, installationToken, { encoding: 'utf8' });
    console.log(`Installation token saved to ${outputFile}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
})();