import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';


export class MusicLibraryStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
//creating music upload bucket
    const bucket = new s3.Bucket(this, 'MusicUploadBucket', {
      versioned: true,
    });
    
    const uploadMusicFunction = new lambda.Function(this, 'UploadMusicFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('lambda/dist'),
      handler: 'uploadLambda.handler',
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    });    

    bucket.grantRead(uploadMusicFunction);

    const api = new apigateway.RestApi(this, 'MusicAPIIngestion', {
      restApiName: 'MusicLibraryService',
      description: 'Ingress for music library service',
      apiKeySourceType: apigateway.ApiKeySourceType.HEADER,
    });

    const apiKey = api.addApiKey('MusicIngestionAPIKey');

    const plan = api.addUsagePlan('MusicIngestionUsagePlan', {
      name: 'Easy',
      throttle: {
        rateLimit: 100,
        burstLimit: 200,
      },
    });
    
    plan.addApiKey(
      apiKey
    )

    plan.addApiStage({
      stage: api.deploymentStage
    })

    const lambdaIntegration = new apigateway.LambdaIntegration(uploadMusicFunction);

const resource = api.root.addResource('uploadMusicResource');
resource.addMethod('POST', lambdaIntegration, {
  apiKeyRequired: true,
});

  }
}
