import { ECSClient } from '@aws-sdk/client-ecs'

const ecsClient = new ECSClient({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_ID!,
        secretAccessKey: process.env.AWS_ACCESS_SECRET!
    }
})

const config = {
    CLUSTER: 'BuildCluster',
    TASK: 'builder-task'
}

export { ecsClient, config }
