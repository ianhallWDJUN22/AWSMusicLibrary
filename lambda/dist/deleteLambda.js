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
    console.log(`delete lambda invoked for bucket: ${bucketName}`);
    console.log(`event body: ${JSON.stringify(event)}`);
    try {
        //getting the file name from the event body
        const fileName = event.queryStringParameters?.fileName;
        if (!fileName) {
            return { statusCode: 400, body: JSON.stringify({ message: "no file name received" }) };
        }
        await client.send(new client_s3_1.DeleteObjectCommand({ Bucket: bucketName, Key: fileName }));
        console.log(`File ${fileName} deleted successfully`);
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // ✅ Important if frontend is making requests from localhost or other domains
                "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, x-api-key",
            },
            body: JSON.stringify({ message: `File ${fileName} deleted successfully` }),
        };
    }
    catch (error) {
        console.error("Delete error:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, x-api-key",
            },
            body: JSON.stringify({ error: "Could not delete file" }),
        };
    }
};
exports.handler = handler;
