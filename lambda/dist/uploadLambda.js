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
            console.log("No file received in the event body");
            return createErrorResponse(400, "No file received");
        }
        const { eventType, fileName } = JSON.parse(event.body);
        switch (eventType) {
            case "list":
                return await listFiles(bucketName);
            case "upload":
                return await handleUpload(bucketName, fileName);
            case "get":
                return await generatePresignedGetUrl(bucketName, fileName);
            default:
                console.log(`Invalid event type: ${eventType}`);
                return createErrorResponse(400, "Invalid event type");
        }
    }
    catch (error) {
        console.error("Error during Lambda execution:", error);
        return createErrorResponse(500, "Could not generate presigned URL");
    }
};
exports.handler = handler;
/**
 * Retrieves a list of files from the S3 bucket with presigned URLs.
 */
const listFiles = async (bucketName) => {
    console.log("Fetching list of files from S3 bucket...");
    const listObjectsCommand = new client_s3_1.ListObjectsV2Command({ Bucket: bucketName });
    const data = await client.send(listObjectsCommand);
    if (!data.Contents || data.Contents.length === 0) {
        console.log("No files found in the bucket.");
        return createSuccessResponse([]);
    }
    // Generate presigned URLs for all files
    const musicFilesWithUrls = await Promise.all(data.Contents.map(async (item) => {
        const command = new client_s3_1.GetObjectCommand({ Bucket: bucketName, Key: item.Key });
        const presignedUrl = await (0, s3_request_presigner_1.getSignedUrl)(client, command, { expiresIn: 15 * 60 });
        return {
            fileName: item.Key,
            downloadUrl: presignedUrl,
        };
    }));
    return createSuccessResponse(musicFilesWithUrls);
};
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
 * Generates a presigned URL for retrieving a file from S3.
 */
const generatePresignedGetUrl = async (bucketName, fileName) => {
    console.log(`Generating presigned GET URL for file: ${fileName}`);
    const getCommand = new client_s3_1.GetObjectCommand({ Bucket: bucketName, Key: fileName });
    const presignedUrl = await (0, s3_request_presigner_1.getSignedUrl)(client, getCommand, { expiresIn: 15 * 60 });
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
