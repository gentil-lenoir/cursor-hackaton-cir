const fs = require('node:fs');
const path = require('node:path');

const defaults = {
  apiBaseUrl: 'https://gentillenoir075.helioho.st/api',
  adminEmail: 'admin2004@gmail.com',
  adminPassword: 'admin123',
};

function loadConfig() {
  const configPath = path.join(__dirname, '..', 'config.json');

  if (!fs.existsSync(configPath)) {
    return { ...defaults };
  }

  try {
    return { ...defaults, ...JSON.parse(fs.readFileSync(configPath, 'utf8')) };
  } catch {
    return { ...defaults };
  }
}

module.exports = { loadConfig };
