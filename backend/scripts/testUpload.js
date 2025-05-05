// backend/scripts/testUpload.js

const fs = require('fs');
const path = require('path');
// require your helper
const { uploadBuffer } = require('../src/services/blobStorage');

(async () => {
  try {
    // point at a sample PDF in the same folder
    const filePath = path.resolve(__dirname, 'sample.pdf');
    const buffer = fs.readFileSync(filePath);

    // upload under documents/contracts
    const url = await uploadBuffer(
      buffer,
      'documents/test.pdf',
      'application/pdf'
    );

    console.log('Uploaded to:', url);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
