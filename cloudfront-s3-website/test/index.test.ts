import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { CloudfrontS3Website } from '../src/index'


describe('CloudfrontS3Website tests', () => {
  const mockedBucketName = 'my-test-bucket-name'
  let template: Template

  beforeAll(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');

    new CloudfrontS3Website(stack, 'TestConstruct', {
      bucketName: mockedBucketName,
      sourcePath: 'test/assets',
    });

    template = Template.fromStack(stack);
  })

  test('S3 bucket is created with correct basic props', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketName: mockedBucketName,
      WebsiteConfiguration: {
        IndexDocument: 'index.html',
      }
    });
  });

  test('S3 bucket is not publicly accessible', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      }
    });
  })

  test('S3 bucket has correct deletion policy and autoDeleteObjects', () => {
    template.hasResource('AWS::S3::Bucket', {
      DeletionPolicy: 'Delete',
      UpdateReplacePolicy: 'Delete',
    });
  });

  test('CloudFront distribution is configured correctly', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        DefaultRootObject: 'index.html',
        DefaultCacheBehavior: Match.objectLike({
          ViewerProtocolPolicy: 'redirect-to-https',
          AllowedMethods: ['GET', 'HEAD', 'OPTIONS'],
          Compress: true,
        }),
        HttpVersion: 'http2',
        Enabled: true,
      },
    });
  });

  test('BucketDeployment is configured with cache invalidation', () => {
    template.hasResourceProperties('Custom::CDKBucketDeployment', {
      DistributionPaths: ['/*'],
    });
  });
})
