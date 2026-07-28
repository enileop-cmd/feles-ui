const fs = require('fs');
const path = '.netlify/functions-internal/server/main.mjs';

if (fs.existsSync(path)) {
  let code = fs.readFileSync(path, 'utf8');
  // Replace the error serialization to include stack
  code = code.replace(
    /message: error\.message/g,
    'message: String(error.message || ""), stack: String(error.stack || "")'
  );
  fs.writeFileSync(path, code);
  console.log('Patched main.mjs to include error stack trace.');
} else {
  console.error('main.mjs not found at', path);
}
