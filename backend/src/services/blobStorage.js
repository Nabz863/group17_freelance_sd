const { BlobServiceClient } = require('@azure/storage-blob');

const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_BLOB_CONTAINER;

if (!connStr || !containerName) {
  throw new Error(
    'Missing AZURE_STORAGE_CONNECTION_STRING or AZURE_BLOB_CONTAINER in environment'
  );
}

async function uploadBuffer(buffer, blobName, contentType) {
  const blobService = BlobServiceClient.fromConnectionString(connStr);
  const containerClient = blobService.getContainerClient(containerName);
  await containerClient.createIfNotExists();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType },
  });
  return blockBlobClient.url;
}

module.exports = { uploadBuffer };