import { S3Client, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({ region: "us-east-1" });

export const handler = async (event: any): Promise<any> => {
  if (!process.env.BUCKET_NAME) {
    return { statusCode: 500, body: JSON.stringify("Bucket name not configured") };
  }

  const bucketName: string = process.env.BUCKET_NAME;
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
    await client.send(new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${oldFileName}`,
      Key: newFileName,
    }));

    // Delete the old file
    await client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: oldFileName,
    }));

    return { statusCode: 200, body: JSON.stringify({ message: `Renamed ${oldFileName} to ${newFileName}` }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: "Could not rename file" }) };
  }
};


// For reference pre-edits:

// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// const client = new S3Client({ region: "us-east-1" });

// export const handler = async (event: any): Promise<any> => {
//   if (!process.env.BUCKET_NAME) {
//     return {
//       statusCode: 500,
//       body: JSON.stringify("Bucket name not configured"),
//     };
//   }

//   const bucketName: string = process.env.BUCKET_NAME;

//   console.log(`edit lambda invoked for bucket: ${bucketName}`);
//   console.log(`event body: ${JSON.stringify(event)}`);

//   try {
//     if (!event.body) {
//       return {
//         statusCode: 400,
//         body: JSON.stringify({ message: "no file received" }),
//       };
//     }

//     const { fileName } = JSON.parse(event.body);
//     if (!fileName) {
//       return {
//         statusCode: 400,
//         body: JSON.stringify({ message: "no file name received" }),
//       };
//     }

//     // Set the expiration time for the presigned URL (e.g., 15 minutes)
//     const urlExpiration = 15 * 60; // in seconds

//     // Create command for updating the object
//     const command = new PutObjectCommand({
//       Bucket: bucketName,
//       Key: fileName,
//     });

//     const presignedUrl = await getSignedUrl(client, command, {
//       expiresIn: urlExpiration,
//     });

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ updateUrl: presignedUrl, fileName }),
//     };
//   } catch (error) {
//     console.error(error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: "Could not generate presigned URL for update" }),
//     };
//   }
// };
