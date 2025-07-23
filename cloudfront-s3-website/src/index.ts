import { Construct } from 'constructs';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3'
import { RemovalPolicy } from 'aws-cdk-lib';
import { AllowedMethods, Distribution, SecurityPolicyProtocol, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';


export interface CloudfrontS3WebsiteProps {
  /** The bucket name test for IDEs. */
  bucketName: string
  /** Source path of the static files */
  sourcePath: string
}

export class CloudfrontS3Website extends Construct {
  public readonly bucket: Bucket
  public readonly cloudfrontDistribution: Distribution
  public readonly bucketDeployment: BucketDeployment

  constructor(scope: Construct, id: string, props: CloudfrontS3WebsiteProps) {
    super(scope, id);

    const { bucketName, sourcePath  } = props

    this.bucket = new Bucket(this, bucketName, {
      bucketName,
      websiteIndexDocument: 'index.html',
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    this.cloudfrontDistribution = new Distribution(this, `SiteDistribution-${bucketName}`, {
      defaultRootObject: 'index.html',
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(this.bucket),
        compress: true,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      }
    })

    this.bucketDeployment = new BucketDeployment(this,   `BucketDeployment-${bucketName}`, {
      sources: [Source.asset(sourcePath)],
      destinationBucket: this.bucket,
      distribution: this.cloudfrontDistribution,
      distributionPaths: ['/*'],
    });
  }
}
