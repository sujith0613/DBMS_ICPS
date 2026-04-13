const http = require('http');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ id: 'dummy', role: 'admin' }, 'secret');
const boundary = '---WebKitFormBoundary' + Math.random().toString(36).substring(2);
const body = '--' + boundary + '\r\n' +
             'Content-Disposition: form-data; name="document_type"\r\n\r\n' +
             'Medical Report\r\n' +
             '--' + boundary + '\r\n' +
             'Content-Disposition: form-data; name="files"; filename="test.pdf"\r\n' +
             'Content-Type: application/pdf\r\n\r\n' +
             'PDFCONTENT\r\n' +
             '--' + boundary + '--\r\n';

const reqData = Buffer.from(body);
const req = http.request({
  host: 'localhost',
  port: 5000,
  path: '/api/claims/CLM5001/documents',
  method: 'POST',
  headers: {
    'Cookie': 'token='+token,
    'Content-Type': 'multipart/form-data; boundary=' + boundary,
    'Content-Length': reqData.length
  }
}, (res) => {
  console.log('STATUS:', res.statusCode);
  res.on('data', d => process.stdout.write(d.toString()));
});

req.on('error', (e) => console.error('REQUEST ERROR:', e));
req.write(reqData);
req.end();
