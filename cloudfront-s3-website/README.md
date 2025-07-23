## cloudfront-s3-website
A static website using an S3 bucket and cloudfront.

### Main features
* S3 bucket not publicly accessible
* Built-in redirects to https
* Cache invalidation after deployments

For more details, check [unit tests](https://github.com/andrelopesmds/cdk-custom-constructs/tree/main/cloudfront-s3-website/test)

### Usage

```ts
import { CloudfrontS3Website }  from '@andrelopesmds/cloudfront-s3-website'

new CloudfrontS3Website(scope, id, {
  bucketName: 'my-bucket-name',
  sourcePath: './dist/'
})
```
