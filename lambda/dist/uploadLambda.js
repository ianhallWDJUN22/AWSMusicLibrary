"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const client_s3_1 = require("@aws-sdk/client-s3");
// Initialize S3 client
const client = new client_s3_1.S3Client({ region: "us-east-1" });
const handler = async (event) => {
    if (!process.env.BUCKET_NAME) {
        console.error("Bucket name not configured");
        return createErrorResponse(500, "Bucket name not configured");
    }
    const bucketName = process.env.BUCKET_NAME;
    console.log(`Upload Lambda invoked for bucket: ${bucketName}`);
    console.log(`Event body: ${JSON.stringify(event)}`);
    try {
        if (!event.body) {
            return createErrorResponse(400, "No file data received");
        }
        const { fileName } = JSON.parse(event.body);
        if (!fileName) {
            return createErrorResponse(400, "File name is required");
        }
        return await handleUpload(bucketName, fileName);
    }
    catch (error) {
        console.error("Error during Lambda execution:", error);
        return createErrorResponse(500, "Could not generate presigned URL");
    }
};
exports.handler = handler;
/**
 * Handles file upload by checking for duplicates and generating a presigned upload URL.
 */
const handleUpload = async (bucketName, fileName) => {
    console.log(`Checking if file ${fileName} already exists...`);
    const listCommand = new client_s3_1.ListObjectsV2Command({ Bucket: bucketName, Prefix: fileName });
    const existingFiles = await client.send(listCommand);
    if (existingFiles.Contents && existingFiles.Contents.length > 0) {
        console.log(`File ${fileName} already exists, preventing upload.`);
        return createErrorResponse(409, "File with this name already exists");
    }
    console.log(`File ${fileName} does not exist, generating presigned upload URL...`);
    const uploadCommand = new client_s3_1.PutObjectCommand({ Bucket: bucketName, Key: fileName });
    const presignedUrl = await (0, s3_request_presigner_1.getSignedUrl)(client, uploadCommand, { expiresIn: 15 * 60 });
    return createSuccessResponse({ downloadUrl: presignedUrl, fileName });
};
/**
 * Utility function to create a success response with CORS headers.
 */
const createSuccessResponse = (body) => ({
    statusCode: 200,
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    },
    body: JSON.stringify(body),
});
/**
 * Utility function to create an error response with CORS headers.
 */
const createErrorResponse = (statusCode, message) => ({
    statusCode,
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    },
    body: JSON.stringify({ message }),
});
