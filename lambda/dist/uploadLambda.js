"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const client_s3_1 = require("@aws-sdk/client-s3");
const client = new client_s3_1.S3Client({ region: "us-east-1" });
const handler = async (event) => {
    if (!process.env.BUCKET_NAME) {
        console.error("Bucket name not configured");
        return { statusCode: 500, body: JSON.stringify("Bucket name not configured") };
    }
    const bucketName = process.env.BUCKET_NAME;
    console.log(`upload lambda invoked: ${bucketName}`);
    console.log(`event body: ${JSON.stringify(event)}`);
    try {
        if (!event.body) {
            console.log("No file received in the event body");
            return { statusCode: 400, body: JSON.stringify({ message: "no file received" }) };
        }
        const { eventType, fileName } = JSON.parse(event.body);
        if (!fileName || !eventType) {
            console.log("Missing required fields: fileName or eventType");
            return { statusCode: 400, body: JSON.stringify({ message: "missing required fields" }) };
        }
        console.log(`Event type: ${eventType}, File name: ${fileName}`);
        const urlExpiration = 15 * 60; // 15 minutes (in seconds)
        let command;
        // Generate the presigned URL based on the event type
        switch (eventType) {
            case "get":
                console.log("event type get detected");
                command = new client_s3_1.GetObjectCommand({ Bucket: bucketName, Key: fileName });
                break;
            case "upload":
                console.log("event type upload detected");
                command = new client_s3_1.PutObjectCommand({ Bucket: bucketName, Key: fileName });
                break;
            default:
                console.log("Invalid event type detected:", eventType);
                return { statusCode: 400, body: JSON.stringify({ message: "invalid event type" }) };
        }
        // Check if command was created
        if (!command) {
            console.log("Command creation failed");
            return { statusCode: 400, body: JSON.stringify({ message: "invalid event type" }) };
        }
        // Generate the presigned URL
        const presignedUrl = await (0, s3_request_presigner_1.getSignedUrl)(client, command, { expiresIn: urlExpiration });
        if (!presignedUrl) {
            console.log("Presigned URL generation failed");
            return { statusCode: 400, body: JSON.stringify({ message: "invalid event type" }) };
        }
        console.log("Successfully generated presigned URL");
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Replace "*" with your frontend URL in production
                "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, x-api-key",
            },
            body: JSON.stringify({ uploadUrl: presignedUrl, fileName })
        };
    }
    catch (error) {
        console.error("Error during Lambda execution:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Could not generate presigned URL" }) };
    }
};
exports.handler = handler;
