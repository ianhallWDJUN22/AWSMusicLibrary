import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 client
const client = new S3Client({ region: "us-east-1" });

export const handler = async (event: any): Promise<any> => {
  // Retrieve bucket name at runtime
  const bucketName = process.env.BUCKET_NAME  || "";

  if (!bucketName) {
    console.error("Bucket name is not configured in environment variables");
    return createErrorResponse(500, "Bucket name not configured in environment variables");
  }

  console.log(`Delete Lambda invoked for bucket: ${bucketName}`);

  try {
    // Extract the file name from query string parameters
    const fileName = event.queryStringParameters?.fileName;
    if (!fileName) {
      console.warn("No fileName provided in the query string parameters");
      return createErrorResponse(400, "Missing 'fileName' in query string parameters");
    }

    console.log(`Attempting to delete file: ${fileName}`);

    // Send delete request to S3
    await client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: fileName }));

    console.log(`File ${fileName} deleted successfully`);

    // Return success response
    return createSuccessResponse(`File ${fileName} deleted successfully`);
  } catch (error: any) {
    console.error(`Failed to delete file: ${error.message}`, error);
    return createErrorResponse(500, "Failed to delete file", error.message);
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
