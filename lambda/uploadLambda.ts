import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const client = new S3Client({ region: "us-east-1" });

//Add the line underneath back in when you are ready to resume connecting 
//this lambda function to DynamoDB 
//const dynamoClient = new DynamoDBClient({ region: "us-east-1" });

export const handler = async (event: any): Promise<any> => {
  if (!process.env.BUCKET_NAME) {
    return {
      statusCode: 500,
      body: JSON.stringify("Bucket name not configured"),
    };
  }

  const bucketName: string = process.env.BUCKET_NAME;

  console.log(`upload lambda invoked: ${bucketName}`);
  console.log(`eventbody:${JSON.stringify(event)}`);

  // Check if the event body is present
  try {
    
    console.log(event.body)
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
        command = new GetObjectCommand({
          Bucket: bucketName,
          Key: fileName,
        });
        break;
      case "upload":
        command = new PutObjectCommand({
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

    const presignedUrl = await getSignedUrl(client, command, {
      expiresIn: urlExpiration,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl: presignedUrl, fileName }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not generate presigned URL" }),
    };
  }
};
