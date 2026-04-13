const jwt = require('jsonwebtoken');
const fs = require('fs');
const { File } = require('buffer');

async function runTest() {
  try {
    const token = jwt.sign({ id: 'dummy', role: 'admin' }, 'secret', { expiresIn: '1h' });
    
    const buffer = fs.readFileSync('e:/PersonalProjects/DBMS_ICPS/test.pdf');
    const blob = new Blob([buffer], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('document_type', 'Medical Report');
    formData.append('files', blob, 'test.pdf');

    const res = await fetch('http://localhost:5000/api/claims/C401/documents', {
      method: 'POST',
      headers: {
        'Cookie': `token=${token}`
      },
      body: formData
    });

    const dataText = await res.text();
    console.log('RESPONSE:', dataText);
    const data = JSON.parse(dataText);

    console.log('UPLOAD SUCCESS:', data);
    
    // Now test retrieval
    const documentId = data.documents[0].file_path.split('/').pop();
    console.log('Retrieving Document ID:', documentId);
    
    const getRes = await fetch(`http://localhost:5000/api/documents/${documentId}`, {
      headers: { 'Cookie': `token=${token}` }
    });
    
    if (!getRes.ok) throw new Error('Retrieval failed: ' + getRes.statusText);
    
    console.log('RETRIEVAL SUCCESS (Content-Type):', getRes.headers.get('content-type'));
  } catch (err) {
    console.error('ERROR:', err);
  }
}
runTest();
