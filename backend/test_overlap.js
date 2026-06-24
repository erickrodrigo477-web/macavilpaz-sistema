const http = require('http');

function post(url, data, token = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body || '{}') }));
    });
    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  try {
    // Try login (assuming a known user or trying to bypass if possible)
    console.log('Testing overlap logic...');
    // I will try to use the tecnico@test.com if possible, or I'll just check the DB state
  } catch (e) {
    console.error(e);
  }
}
test();
