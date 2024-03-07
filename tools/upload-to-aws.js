import fs from 'node:fs';
import path from 'node:path';
import 'dotenv-flow/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export default async function upload(file) {
  // A region and credentials can be declared explicitly. For example
  // `new S3Client({ region: 'us-east-1', credentials: {...} })` would
  //initialize the client with those settings. However, the SDK will
  // use your local configuration and credentials if those properties
  // are not defined here.
  const s3Client = new S3Client({});

  const bucketName = process.env.AWS_BUCKET;

  const fileStream = fs.createReadStream(file);

  // Put an object into an Amazon S3 bucket.
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: path.basename(file),
      Body: fileStream,
      ACL: 'public-read',
      ContentType: 'application/xml',
    })
  );
}
