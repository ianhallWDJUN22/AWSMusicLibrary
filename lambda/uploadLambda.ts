import { S3 } from 'aws-sdk';
import {v4 as uuidv4} from "uuid";
const s3 = new S3();

export const handler = async (event: any): Promise<any> => {
  if (!process.env.BUCKET_NAME){
    return {
          statusCode: 500,
          body: JSON.stringify('bad'),
        };
  }

  const bucketName: string = process.env.BUCKET_NAME;
  console.log(`upload lambda invoked: ${bucketName}`)
  console.log(`eventbody:${JSON.stringify(event)}`)
  try {
    if(!event.body){
      return{
        statusCode: 400,
        body: JSON.stringify({message:'no file received'})
      }
    }
  // const bodyBuffer=Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8')
  
  const filename=uuidv4()
      // Set the expiration time for the presigned URL (e.g., 15 minutes)
      const urlExpiration = 15 * 60; // in seconds
    
      // Generate the presigned URL
      // 
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: `${filename}.png`
      });
  
  
      const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      
    return {
      statusCode: 200,
      body: JSON.stringify({message:`file uploaded successfully ${presignedUrl}`}),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};
