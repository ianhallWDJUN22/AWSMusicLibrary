"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const client_s3_1 = require("@aws-sdk/client-s3");
const client = new client_s3_1.S3Client({ region: "us-east-1" });
const handler = async (event) => {
    if (!process.env.BUCKET_NAME) {
        console.error("Bucket name not configured");
        return createErrorResponse(500, "Bucket name not configured");
    }
    const bucketName = process.env.BUCKET_NAME;
    console.log(`Get Lambda invoked for bucket: ${bucketName}`);
    try {
        const fileName = event.queryStringParameters?.fileName;
        if (fileName) {
            console.log(`Fetching presigned URL for file: ${fileName}`);
            return await generatePresignedGetUrl(bucketName, fileName);
        }
        else {
            console.log("Fetching list of files...");
            return await listFiles(bucketName);
        }
    }
    catch (error) {
        console.error("Error during Lambda execution:", error);
        return createErrorResponse(500, "Could not process request");
    }
};
exports.handler = handler;
// Retrieves a list of files from the S3 bucket with presigned URLs.
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
// Generates a presigned URL for retrieving just one file from S3.
const generatePresignedGetUrl = async (bucketName, fileName) => {
    console.log(`Generating presigned GET URL for file: ${fileName}`);
    const getCommand = new client_s3_1.GetObjectCommand({ Bucket: bucketName, Key: fileName });
    const presignedUrl = await (0, s3_request_presigner_1.getSignedUrl)(client, getCommand, { expiresIn: 15 * 60 });
    return createSuccessResponse({ downloadUrl: presignedUrl, fileName });
};
// Utility function to create a success response with CORS headers.
const createSuccessResponse = (body) => ({
    statusCode: 200,
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    },
    body: JSON.stringify(body),
});
// Utility function to create an error response with CORS headers.
const createErrorResponse = (statusCode, message) => ({
    statusCode,
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    },
    body: JSON.stringify({ message }),
});
