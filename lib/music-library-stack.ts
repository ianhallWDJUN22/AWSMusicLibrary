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

    bucket.grantReadWrite(uploadMusicFunction);
    bucket.grantReadWrite(editMusicFunction);
    bucket.grantReadWrite(deleteMusicFunction);

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

    const editResource = api.root.addResource("editMusicResource");
    editResource.addMethod("PUT", new apigateway.LambdaIntegration(editMusicFunction), { apiKeyRequired: true });

    const deleteResource = api.root.addResource("deleteMusicResource");
    deleteResource.addMethod("DELETE", new apigateway.LambdaIntegration(deleteMusicFunction), { apiKeyRequired: true });
  }
}

