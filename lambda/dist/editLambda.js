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
    console.log(`event body: ${JSON.stringify(event)}`);
    try {
        if (!event.body) {
            return { statusCode: 400, body: JSON.stringify({ message: "no file data received" }) };
        }
        const { oldFileName, newFileName } = JSON.parse(event.body);
        if (!oldFileName || !newFileName) {
            return { statusCode: 400, body: JSON.stringify({ message: "missing file names" }) };
        }
        // Copy the old file to the new file name
        await client.send(new client_s3_1.CopyObjectCommand({
            Bucket: bucketName,
            CopySource: `${bucketName}/${oldFileName}`,
            Key: newFileName,
        }));
        // Delete the old file
        await client.send(new client_s3_1.DeleteObjectCommand({
            Bucket: bucketName,
            Key: oldFileName,
        }));
        return { statusCode: 200, body: JSON.stringify({ message: `Renamed ${oldFileName} to ${newFileName}` }) };
    }
    catch (error) {
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ error: "Could not rename file" }) };
    }
};
exports.handler = handler;
