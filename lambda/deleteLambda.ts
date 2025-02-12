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
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ message: "no file received" }) };
    }

    const { fileName } = JSON.parse(event.body);
    if (!fileName) {
      return { statusCode: 400, body: JSON.stringify({ message: "no file name received" }) };
    }

    await client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: fileName }));

    return { statusCode: 200, body: JSON.stringify({ message: `File ${fileName} deleted successfully` }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: "Could not delete file" }) };
  }
};
