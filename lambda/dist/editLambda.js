"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const client_s3_1 = require("@aws-sdk/client-s3");
const client = new client_s3_1.S3Client({ region: "us-east-1" });
const handler = async (event) => {
    if (!process.env.BUCKET_NAME) {
        return {
            statusCode: 500,
            body: JSON.stringify("Bucket name not configured"),
        };
    }
    const bucketName = process.env.BUCKET_NAME;
    console.log(`edit lambda invoked for bucket: ${bucketName}`);
    console.log(`event body: ${JSON.stringify(event)}`);
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "no file received" }),
            };
        }
        const { fileName } = JSON.parse(event.body);
        if (!fileName) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "no file name received" }),
            };
        }
        // Set the expiration time for the presigned URL (e.g., 15 minutes)
        const urlExpiration = 15 * 60; // in seconds
        // Create command for updating the object
        const command = new client_s3_1.PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
        });
        const presignedUrl = await (0, s3_request_presigner_1.getSignedUrl)(client, command, {
            expiresIn: urlExpiration,
        });
        return {
            statusCode: 200,
            body: JSON.stringify({ updateUrl: presignedUrl, fileName }),
        };
    }
    catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Could not generate presigned URL for update" }),
        };
    }
};
exports.handler = handler;
