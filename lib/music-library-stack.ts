import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class MusicLibraryStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Creating music upload bucket
    const bucket = new s3.Bucket(this, "MusicUploadBucket", {
      versioned: true,
      cors: [
        {
          allowedOrigins: ["*"], // Change this to your frontend domain in production
          allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET],
          allowedHeaders: ["*"], // Adjust as needed
          exposedHeaders: ["ETag"], // Optional
        },
      ],
    });

    // Upload Lambda Function
    const uploadMusicFunction = new lambda.Function(this, "UploadMusicFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda/dist"),
      handler: "uploadLambda.handler",
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    });

    bucket.grantReadWrite(uploadMusicFunction);

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

    // Delete Lambda Function
    const deleteMusicFunction = new lambda.Function(this, "DeleteMusicFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "deleteLambda.handler",
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    });

    bucket.grantReadWrite(deleteMusicFunction);

    // API Gateway
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
    plan.addApiStage({ stage: api.deploymentStage });

    // === Upload Resource ===
    const uploadLambdaIntegration = new apigateway.LambdaIntegration(uploadMusicFunction);
    const uploadResource = api.root.addResource("uploadMusicResource");
    uploadResource.addMethod("POST", uploadLambdaIntegration, { apiKeyRequired: true });

    uploadResource.addMethod("OPTIONS", new apigateway.MockIntegration({
      integrationResponses: [{
        statusCode: "200",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Origin": "'*'",
          "method.response.header.Access-Control-Allow-Methods": "'POST,OPTIONS'",
          "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Api-Key'",
        },
      }],
      passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
      requestTemplates: {
        "application/json": "{\"statusCode\": 200}"
      }
    }), {
      methodResponses: [{
        statusCode: "200",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Origin": true,
          "method.response.header.Access-Control-Allow-Methods": true,
          "method.response.header.Access-Control-Allow-Headers": true,
        },
      }],
    });

    // === Edit Resource ===
    const editLambdaIntegration = new apigateway.LambdaIntegration(editMusicFunction);
    const editResource = api.root.addResource("editMusicResource");
    editResource.addMethod("PUT", editLambdaIntegration, { apiKeyRequired: true });

    editResource.addMethod("OPTIONS", new apigateway.MockIntegration({
      integrationResponses: [{
        statusCode: "200",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Origin": "'*'",
          "method.response.header.Access-Control-Allow-Methods": "'PUT,OPTIONS'",
          "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Api-Key'",
        },
      }],
      passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
      requestTemplates: {
        "application/json": "{\"statusCode\": 200}"
      }
    }), {
      methodResponses: [{
        statusCode: "200",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Origin": true,
          "method.response.header.Access-Control-Allow-Methods": true,
          "method.response.header.Access-Control-Allow-Headers": true,
        },
      }],
    });

    // === Delete Resource ===
    const deleteLambdaIntegration = new apigateway.LambdaIntegration(deleteMusicFunction);
    const deleteResource = api.root.addResource("deleteMusicResource");
    deleteResource.addMethod("DELETE", deleteLambdaIntegration, { apiKeyRequired: true });

    deleteResource.addMethod("OPTIONS", new apigateway.MockIntegration({
      integrationResponses: [{
        statusCode: "200",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Origin": "'*'",
          "method.response.header.Access-Control-Allow-Methods": "'DELETE,OPTIONS'",
          "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Api-Key'",
        },
      }],
      passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
      requestTemplates: {
        "application/json": "{\"statusCode\": 200}"
      }
    }), {
      methodResponses: [{
        statusCode: "200",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Origin": true,
          "method.response.header.Access-Control-Allow-Methods": true,
          "method.response.header.Access-Control-Allow-Headers": true,
        },
      }],
    });

  }
}