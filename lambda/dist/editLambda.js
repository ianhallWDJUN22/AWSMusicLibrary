"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const client = new client_s3_1.S3Client({ region: "us-east-1" });
const handler = async (event) => {
    if (!process.env.BUCKET_NAME) {
        return { statusCode: 500, body: JSON.stringify("Bucket name not configured") };
    }
    const bucketName = process.env.BUCKET_NAME;
    console.log(`edit lambda invoked for bucket: ${bucketName}`);
    try {
        if (!event.body) {
            return { statusCode: 400, body: JSON.stringify({ message: "No file data received" }) };
        }
        const { oldFileName, newFileName } = JSON.parse(event.body);
        if (!oldFileName || !newFileName) {
            return { statusCode: 400, body: JSON.stringify({ message: "Missing file names" }) };
        }
        // Step 1: Check if the new filename already exists
        const listCommand = new client_s3_1.ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: newFileName,
        });
        const existingFiles = await client.send(listCommand);
        if (existingFiles.Contents && existingFiles.Contents.length > 0) {
            return {
                statusCode: 409,
                body: JSON.stringify({ message: "File with this name already exists" }),
            };
        }
        // Step 2: Rename file
        await client.send(new client_s3_1.CopyObjectCommand({
            Bucket: bucketName,
            CopySource: `${bucketName}/${oldFileName}`,
            Key: newFileName,
        }));
        await client.send(new client_s3_1.DeleteObjectCommand({
            Bucket: bucketName,
            Key: oldFileName,
        }));
        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: `Renamed ${oldFileName} to ${newFileName}` }),
        };
    }
    catch (error) {
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ error: "Could not rename file" }) };
    }
};
exports.handler = handler;
