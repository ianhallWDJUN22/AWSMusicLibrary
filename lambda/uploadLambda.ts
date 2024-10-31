import { S3 } from 'aws-sdk';
import {v4 as uuidv4} from 'uuid';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const client = new S3Client({ region: 'us-east-1' });
// const s3 = new S3();

export const handler = async (event: any): Promise<any> => {
  if (!process.env.BUCKET_NAME){
    return {
          statusCode: 500,
          body: JSON.stringify('Bucket name not configured'),
        };
  }

  const bucketName: string = process.env.BUCKET_NAME;
  console.log(`upload lambda invoked: ${bucketName}`)
  console.log(`eventbody:${JSON.stringify(event)}`)
  // Check if the event body is present
  try {
    if(!event.body){
      return{
        statusCode: 400,
        body: JSON.stringify({message:'no file received'})
      }
    }
  // const bodyBuffer=Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8')
  
  const filename = `${uuidv4()}.mp3`
      // Set the expiration time for the presigned URL (e.g., 15 minutes)
      const urlExpiration = 15 * 60; // in seconds
    
      // Generate the presigned URL
      // 
    
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: filename,
      ContentType: 'audio/mpeg',
      });
      
      const presignedUrl = await getSignedUrl(client, command, { expiresIn: urlExpiration });
      
      // const presignedPost = await createPresignedPost(client, {
      //   Bucket: bucketName,
      //   Key: filename,
      //   Expires: 3600, 
      // });

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl: presignedUrl, filename }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not generate presigned URL' }),
    };
  }
};
