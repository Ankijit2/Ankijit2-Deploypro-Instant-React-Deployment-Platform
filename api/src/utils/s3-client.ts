import { S3Client,DeleteObjectCommand } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_ID!,
        secretAccessKey: process.env.AWS_ACCESS_SECRET!
    }
});

export function deleteProjectBuilds(projectId: string) {
    const bucket = process.env.AWS_BUCKET_NAME!;
    const key = `__outputs/${projectId}`;
    const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
    return s3Client.send(command);
}

export function deleteDeploymentBuilds(projectId: string, deploymentId: string) {
    const bucket = process.env.AWS_BUCKET_NAME!;
    const key = `__outputs/${projectId}/${deploymentId}`;
    const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
    return s3Client.send(command);
}

