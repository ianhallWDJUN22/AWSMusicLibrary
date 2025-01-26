"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
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
    console.log(`delete lambda invoked for bucket: ${bucketName}`);
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
        // Create command to delete the object
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: bucketName,
            Key: fileName,
        });
        await client.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: `File ${fileName} deleted successfully` }),
        };
    }
    catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Could not delete file" }),
        };
    }
};
exports.handler = handler;
