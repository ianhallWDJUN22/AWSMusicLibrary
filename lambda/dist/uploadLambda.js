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
    console.log(`upload lambda invoked: ${bucketName}`);
    console.log(`eventbody:${JSON.stringify(event)}`);
    // Check if the event body is present
    try {
        console.log(event.body);
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "no file received" }),
            };
        }
        const { eventType, fileName } = JSON.parse(event.body);
        if (!fileName) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "no file name received" }),
            };
        }
        if (!eventType) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "no event type received" }),
            };
        }
        // Set the expiration time for the presigned URL (e.g., 15 minutes)
        const urlExpiration = 15 * 60; // in seconds
        let command;
        // Generate the presigned URL
        switch (eventType) {
            case "get":
                command = new client_s3_1.GetObjectCommand({
                    Bucket: bucketName,
                    Key: fileName,
                });
                break;
            case "upload":
                command = new client_s3_1.PutObjectCommand({
                    Bucket: bucketName,
                    Key: fileName,
                    // add dynamoDB meta data fields here.. e.g. user id, size, last updated, length, etc.
                });
                break;
        }
        if (!command) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "no event type received" }),
            };
        }
        const presignedUrl = await (0, s3_request_presigner_1.getSignedUrl)(client, command, {
            expiresIn: urlExpiration,
        });
        return {
            statusCode: 200,
            body: JSON.stringify({ uploadUrl: presignedUrl, fileName }),
        };
    }
    catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Could not generate presigned URL" }),
        };
    }
};
exports.handler = handler;
