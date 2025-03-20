import { S3Client, CopyObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

const client = new S3Client({ region: "us-east-1" });

export const handler = async (event: any): Promise<any> => {
  // Retrieve bucket name at runtime
  const bucketName = process.env.BUCKET_NAME  || "";
  console.log(`BUCKET_NAME at runtime: "${bucketName}"`);

  if (!bucketName) {
    console.error("Bucket name is not configured in environment variables");
    return createErrorResponse(500, "Bucket name not configured in environment variables");
  }

  console.log(`Edit Lambda invoked for bucket: ${bucketName}`);

  try {
    if (!event.body) {
      return createErrorResponse(400, "No file data received");
    }

    const { oldFileName, newFileName } = JSON.parse(event.body);
    if (!oldFileName || !newFileName) {
      return createErrorResponse(400, "Missing file names");
    }

    // Step 1: Check if the new filename already exists
    console.log(`Checking if file ${newFileName} already exists in bucket: ${bucketName}...`);
    
    const listCommand = new ListObjectsV2Command({ Bucket: bucketName, Prefix: newFileName });
    const existingFiles = await client.send(listCommand);

    if (existingFiles.Contents && existingFiles.Contents.length > 0) {
      console.warn(`File ${newFileName} already exists, preventing rename.`);
      return createErrorResponse(409, "File with this name already exists");
    }

    // Step 2: Rename file by copying and deleting the old file
    console.log(`Renaming file from ${oldFileName} to ${newFileName} in bucket: ${bucketName}...`);

    await client.send(
      new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: `${bucketName}/${oldFileName}`,
        Key: newFileName,
      })
    );

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: oldFileName,
      })
    );

    console.log(`Successfully renamed ${oldFileName} to ${newFileName}`);

    return createSuccessResponse(`Renamed ${oldFileName} to ${newFileName}`);
  } catch (error: any) {
    console.error(`Failed to rename file: ${error.message}`, error);
    return createErrorResponse(500, "Could not rename file", error.message);
  }
};

// Utility function to create a success response with CORS headers
const createSuccessResponse = (message: string) => ({
  statusCode: 200,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,DELETE",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
  },
  body: JSON.stringify({ message }),
});

// Utility function to create an error response with CORS headers
const createErrorResponse = (statusCode: number, message: string, errorDetails?: string) => ({
  statusCode,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,DELETE",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
  },
  body: JSON.stringify({ message, ...(errorDetails && { error: errorDetails }) }),
});
