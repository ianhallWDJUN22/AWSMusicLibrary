import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class MusicLibraryStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    // Creating music upload bucket
    const bucket = new s3.Bucket(this, "MusicUploadBucket", {
      versioned: true,
    });

    // DynamoDB Table
    const metadataTable = new dynamodb.Table(this, "MetadataTable", {
      partitionKey: { name: "FileID", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "UserID", type: dynamodb.AttributeType.STRING }, // Optional, based on your design
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Retain data when the stack is deleted
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Upload (Put/Get) Lambda Function
    const uploadMusicFunction = new lambda.Function(
      this,
      "UploadMusicFunction",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset("lambda/dist"),
        handler: "uploadLambda.handler",
        environment: {
          BUCKET_NAME: bucket.bucketName,
        },
      });

    bucket.grantReadWrite(uploadMusicFunction);
    metadataTable.grantReadWriteData(uploadMusicFunction);

    // Edit Lambda Function
    const editMusicFunction = new lambda.Function(this, "EditMusicFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "editLambda.handler",
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    });

    bucket.grantReadWrite(editMusicFunction);
    metadataTable.grantReadWriteData(editMusicFunction);

    // Delete Lambda Function
    const deleteMusicFunction = new lambda.Function(
      this,
      "DeleteMusicFunction",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset("lambda"),
        handler: "deleteLambda.handler",
        environment: {
          BUCKET_NAME: bucket.bucketName,
        },
      }
    );

    bucket.grantReadWrite(deleteMusicFunction);
    metadataTable.grantReadWriteData(deleteMusicFunction);

    const api = new apigateway.RestApi(this, "MusicAPIIngestion", {
      restApiName: "MusicLibraryService",
      description: "Ingress for music library service",
      binaryMediaTypes: [
        "application/octet-stream",
        "multipart/form-data",
        "image/*",
        "audio/mpeg",
      ],
      apiKeySourceType: apigateway.ApiKeySourceType.HEADER,
    });

    const apiKey = api.addApiKey("MusicIngestionAPIKey");

    const plan = api.addUsagePlan("MusicIngestionUsagePlan", {
      name: "Easy",
      throttle: {
        rateLimit: 100,
        burstLimit: 200,
      },
    });

    plan.addApiKey(apiKey);

    plan.addApiStage({
      stage: api.deploymentStage,
    });

    // Upload Resource and Method
    const uploadLambdaIntegration = new apigateway.LambdaIntegration(
      uploadMusicFunction
    );
    const uploadResource = api.root.addResource("uploadMusicResource");
    uploadResource.addMethod("POST", uploadLambdaIntegration, {
      apiKeyRequired: true,
    });

    // Edit Resource and Method
    const editLambdaIntegration = new apigateway.LambdaIntegration(
      editMusicFunction
    );
    const editResource = api.root.addResource("editMusicResource");
    editResource.addMethod("PUT", editLambdaIntegration, {
      apiKeyRequired: true,
    });

    // Delete Resource and Method
    const deleteLambdaIntegration = new apigateway.LambdaIntegration(
      deleteMusicFunction
    );
    const deleteResource = api.root.addResource("deleteMusicResource");
    deleteResource.addMethod("DELETE", deleteLambdaIntegration, {
      apiKeyRequired: true,
    });
  }
}
