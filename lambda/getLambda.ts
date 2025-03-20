import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 client
const client = new S3Client({ region: "us-east-1" });

export const handler = async (event: any): Promise<any> => {
  // Retrieve bucket name at runtime
  const bucketName = process.env.BUCKET_NAME  || "";
  console.log(`BUCKET_NAME at runtime: "${bucketName}"`);

  if (!bucketName) {
    console.error("Bucket name not configured in environment variables");
    return createErrorResponse(500, "Bucket name not configured in environment variables");
  }

  console.log(`Get Lambda invoked for bucket: ${bucketName}`);

  try {
    const fileName = event.queryStringParameters?.fileName;

    if (fileName) {
      console.log(`Fetching presigned URL for file: ${fileName}`);
      return await generatePresignedGetUrl(bucketName, fileName);
    } else {
      console.log("Fetching list of files...");
      return await listFiles(bucketName);
    }
  } catch (error: any) {
    console.error(`Error during Lambda execution: ${error.message}`, error);
    return createErrorResponse(500, "Could not process request", error.message);
  }
};

// Retrieves a list of files from the S3 bucket with presigned URLs.
const listFiles = async (bucketName: string) => {
  console.log(`Fetching list of files from S3 bucket: ${bucketName}...`);

  const listObjectsCommand = new ListObjectsV2Command({ Bucket: bucketName });
  const data = await client.send(listObjectsCommand);

  if (!data.Contents || data.Contents.length === 0) {
    console.log("No files found in the bucket.");
    return createSuccessResponse([]);
  }

  // Generate presigned URLs for all files
  const musicFilesWithUrls = await Promise.all(
    data.Contents.map(async (item) => {
      const command = new GetObjectCommand({ Bucket: bucketName, Key: item.Key });
      const presignedUrl = await getSignedUrl(client, command, { expiresIn: 15 * 60 });

      return {
        fileName: item.Key,
        downloadUrl: presignedUrl,
      };
    })
  );

  return createSuccessResponse(musicFilesWithUrls);
};

// Generates a presigned URL for retrieving just one file from S3.
const generatePresignedGetUrl = async (bucketName: string, fileName: string) => {
  console.log(`Generating presigned GET URL for file: ${fileName} in bucket: ${bucketName}...`);
  const getCommand = new GetObjectCommand({ Bucket: bucketName, Key: fileName });
  const presignedUrl = await getSignedUrl(client, getCommand, { expiresIn: 15 * 60 });

  return createSuccessResponse({ downloadUrl: presignedUrl, fileName });
};

// Utility function to create a success response with CORS headers.
const createSuccessResponse = (body: any) => ({
  statusCode: 200,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
  },
  body: JSON.stringify(body),
});

// Utility function to create an error response with CORS headers.
const createErrorResponse = (statusCode: number, message: string, errorDetails?: string) => ({
  statusCode,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
  },
  body: JSON.stringify({ message, ...(errorDetails && { error: errorDetails }) }),
});
