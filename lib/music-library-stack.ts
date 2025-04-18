import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class MusicLibraryStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "MusicUploadBucket", {
      versioned: true,
      
      // Solution for CORS issues when running app on localhost
      cors: [
        {
          allowedOrigins: ["*"],
          allowedMethods: [
            s3.HttpMethods.PUT,
            s3.HttpMethods.GET,
            s3.HttpMethods.DELETE,
          ],
          allowedHeaders: ["*"],
          exposedHeaders: ["ETag"],
        },
      ],
    });

    const uploadMusicFunction = new lambda.Function(this, "UploadMusicFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda/dist"),
      handler: "uploadLambda.handler",
      environment: { BUCKET_NAME: bucket.bucketName },
    });

    const getMusicFunction = new lambda.Function(this, "GetMusicFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda/dist"),
      handler: "getLambda.handler",
      environment: { BUCKET_NAME: bucket.bucketName },
    });

    const editMusicFunction = new lambda.Function(this, "EditMusicFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda/dist"),
      handler: "editLambda.handler",
      environment: { BUCKET_NAME: bucket.bucketName },
    });

    const deleteMusicFunction = new lambda.Function(this, "DeleteMusicFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda/dist"),
      handler: "deleteLambda.handler",
      environment: { BUCKET_NAME: bucket.bucketName },
    });

    // Grant S3 access
    bucket.grantReadWrite(uploadMusicFunction);
    bucket.grantReadWrite(getMusicFunction);
    bucket.grantReadWrite(editMusicFunction);
    bucket.grantReadWrite(deleteMusicFunction);

    const s3Policy = new cdk.aws_iam.PolicyStatement({
      actions: [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:DeleteObject",
      ],
      resources: [bucket.bucketArn, `${bucket.bucketArn}/*`],
    });
    
    uploadMusicFunction.addToRolePolicy(s3Policy);
    getMusicFunction.addToRolePolicy(s3Policy);
    editMusicFunction.addToRolePolicy(s3Policy);
    deleteMusicFunction.addToRolePolicy(s3Policy);

    const api = new apigateway.RestApi(this, "MusicAPIIngestion", {
      restApiName: "MusicLibraryService",
      description: "Ingress for music library service",
      binaryMediaTypes: [
        "application/octet-stream",
        "multipart/form-data",
        "image/*",
        "audio/mpeg",
      ],
      defaultCorsPreflightOptions: {
        allowOrigins: ["*"],
        allowMethods: ["OPTIONS", "GET", "POST", "PUT", "DELETE"],
        allowHeaders: ["Content-Type", "X-Api-Key"],
      },
    });

    const apiKey = api.addApiKey("MusicIngestionAPIKey");
    const plan = api.addUsagePlan("MusicIngestionUsagePlan", {
      name: "Easy",
      throttle: { rateLimit: 100, burstLimit: 200 },
    });
    plan.addApiKey(apiKey);
    plan.addApiStage({ stage: api.deploymentStage });

    const uploadResource = api.root.addResource("uploadMusicResource");
    uploadResource.addMethod("POST", new apigateway.LambdaIntegration(uploadMusicFunction), { apiKeyRequired: true });

    const getMusicResource = api.root.addResource("getMusicResource");
    getMusicResource.addMethod("GET", new apigateway.LambdaIntegration(getMusicFunction), { apiKeyRequired: true });

    const editResource = api.root.addResource("editMusicResource");
    editResource.addMethod("PUT", new apigateway.LambdaIntegration(editMusicFunction), { apiKeyRequired: true });

    const deleteResource = api.root.addResource("deleteMusicResource");
    deleteResource.addMethod("DELETE", new apigateway.LambdaIntegration(deleteMusicFunction), { apiKeyRequired: true });
  }
}