import { S3Client, CopyObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

const client = new S3Client({ region: "us-east-1" });

export const handler = async (event: any): Promise<any> => {
  if (!process.env.BUCKET_NAME) {
    return { statusCode: 500, body: JSON.stringify("Bucket name not configured") };
  }

  const bucketName: string = process.env.BUCKET_NAME;
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
    const listCommand = new ListObjectsV2Command({
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
    await client.send(new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${oldFileName}`,
      Key: newFileName,
    }));

    await client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: oldFileName,
    }));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: `Renamed ${oldFileName} to ${newFileName}` }),
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: "Could not rename file" }) };
  }
};

