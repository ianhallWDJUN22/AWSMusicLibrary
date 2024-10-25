// import { S3 } from 'aws-sdk';

// const s3 = new S3();

export const handler = async (event: any): Promise<any> => {
  if (!process.env.BUCKET_NAME){
    return {
          statusCode: 500,
          body: JSON.stringify('bad'),
        };
  }

  const bucketName: string = process.env.BUCKET_NAME;
  console.log(`upload lambda invoked: ${bucketName}`)
  return {
        statusCode: 200,
        body: JSON.stringify('any'),
      };

  // try {
  //   const objects = await s3.listObjectsV2({ Bucket: bucketName! }).promise();
  //   return {
  //     statusCode: 200,
  //     body: JSON.stringify(objects),
  //   };
  // } catch (error) {
  //   return {
  //     statusCode: 500,
  //     body: JSON.stringify(error),
  //   };
  // }
};
