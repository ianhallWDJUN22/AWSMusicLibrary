"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
// Initialize S3 client
const client = new client_s3_1.S3Client({ region: "us-east-1" });
const handler = async (event) => {
    // Ensure the bucket name is set in the Lambda environment variables
    const bucketName = process.env.BUCKET_NAME;
    if (!bucketName) {
        console.error("Bucket name is not configured in environment variables");
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                message: "Bucket name not configured in environment variables",
            }),
        };
    }
    console.log(`Delete lambda invoked for bucket: ${bucketName}`);
    try {
        // Extract the file name from query string parameters
        const fileName = event.queryStringParameters?.fileName;
        if (!fileName) {
            console.warn("No fileName provided in the query string parameters");
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({
                    message: "Missing 'fileName' in query string parameters",
                }),
            };
        }
        console.log(`Attempting to delete file: ${fileName}`);
        // Send delete request to S3
        await client.send(new client_s3_1.DeleteObjectCommand({ Bucket: bucketName, Key: fileName }));
        console.log(`File ${fileName} deleted successfully`);
        // Success response with CORS headers
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,GET,POST,DELETE",
                "Access-Control-Allow-Headers": "Content-Type, x-api-key",
            },
            body: JSON.stringify({
                message: `File ${fileName} deleted successfully`,
            }),
        };
    }
    catch (error) {
        console.error(`Failed to delete file: ${error.message}`, error);
        // Error response with CORS headers
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,GET,POST,DELETE",
                "Access-Control-Allow-Headers": "Content-Type, x-api-key",
            },
            body: JSON.stringify({
                message: "Failed to delete file",
                error: error.message,
            }),
        };
    }
};
exports.handler = handler;
