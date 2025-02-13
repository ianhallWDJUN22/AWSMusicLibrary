import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({ region: "us-east-1" });

export const handler = async (event: any): Promise<any> => {
  if (!process.env.BUCKET_NAME) {
    return { statusCode: 500, body: JSON.stringify("Bucket name not configured") };
  }

  const bucketName: string = process.env.BUCKET_NAME;
  console.log(`delete lambda invoked for bucket: ${bucketName}`);
  console.log(`event body: ${JSON.stringify(event)}`);

  try {
    //getting the file name from the event body
    const fileName = event.queryStringParameters?.fileName;
    if (!fileName) {
      return { statusCode: 400, body: JSON.stringify({ message: "no file name received" }) };
    }

    await client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: fileName }));

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
  } catch (error) {
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

