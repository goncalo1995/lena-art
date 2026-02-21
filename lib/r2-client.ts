import { AwsClient } from 'aws4fetch';

let awsClient: AwsClient | null = null;

// This helper creates a pre-configured client. It's not a singleton, but it's lightweight.
export function getAwsClient() {
  if (awsClient) return awsClient;
  if (!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || !process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
    throw new Error("Missing AWS credentials.");
  }
  awsClient = new AwsClient({
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      region: "auto",
      service: "s3",
    });
  return awsClient;
}

const getBucketUrl = () => {
  if (!process.env.CLOUDFLARE_R2_ACCOUNT_ID || !process.env.CLOUDFLARE_R2_BUCKET_NAME) {
    throw new Error("Missing R2 account/bucket config.");
  }
  return `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.eu.r2.cloudflarestorage.com/${process.env.CLOUDFLARE_R2_BUCKET_NAME}`;
};

/**
 * Generates a pre-signed URL for client-side uploads.
 */
export async function generateSignedUploadUrl(key: string, fileType: string) {
  const aws = getAwsClient();
  const url = `${getBucketUrl()}/${key}`;
  const signedRequest = await aws.sign(url, {
    method: 'PUT',
    headers: { 'Content-Type': fileType },
    aws: { signQuery: true }, // 5 minute validity
  });
  return signedRequest.url;
}

/**
 * Uploads a buffer directly from the server to R2.
 * Used for server-side operations like cropping.
 */
export async function uploadBufferToR2(key: string, body: Buffer, contentType: string) {
  const aws = getAwsClient();
  const url = `${getBucketUrl()}/${key}`;
  // The `body` is a Node.js Buffer. The `fetch` API expects a BodyInit type.
  // A Buffer is a Uint8Array, so we can pass it directly, but we cast it to
  // satisfy TypeScript's strict type checking. This has zero runtime cost.
  await aws.fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: body as unknown as BodyInit,
  });
}

/**
 * Deletes a file directly from the server from R2.
 */
export async function deleteFileFromR2(key: string) {
  const aws = getAwsClient();
  const url = `${getBucketUrl()}/${key}`;
  const response = await aws.fetch(url, { method: 'DELETE' });
  if (!response.ok) {
    // Log the error but don't throw, as we still want to delete the DB record.
    console.error(`Failed to delete '${key}' from R2:`, await response.text());
  }
}

/**
 * Deletes multiple files from R2 in a single batch request.
 * @param keys - An array of object keys to delete.
 */
export async function deleteFilesFromR2(keys: string[]) {
  if (keys.length === 0) {
    return;
  }

  const aws = getAwsClient();
  const bucketUrl = getBucketUrl();
  const BATCH_SIZE = 1000; // O limite máximo da API S3

  for (let i = 0; i < keys.length; i += BATCH_SIZE) {
    const batch = keys.slice(i, i + BATCH_SIZE);
    
    // The S3 Multi-Object Delete API requires a specific XML body.
    const xmlBody = `<Delete><Quiet>true</Quiet>${batch.map(key => `<Object><Key>${key}</Key></Object>`).join('')}</Delete>`;
    const url = `${bucketUrl}/?delete`;

    try {
      const response = await aws.fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Content-MD5': await crypto.subtle.digest('MD5', new TextEncoder().encode(xmlBody)).then(buf => btoa(String.fromCharCode(...new Uint8Array(buf)))),
        },
        body: xmlBody,
      });

      if (!response.ok) {
        console.error(`Failed to batch delete a chunk of ${batch.length} files from R2:`, await response.text());
      }
    } catch (error) {
      console.error("Error during batch delete request:", error);
    }
  }
}