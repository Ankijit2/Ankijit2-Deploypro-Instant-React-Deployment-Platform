import express, { Request, response, Response } from 'express'
import { generateSlug } from 'random-word-slugs'
import { ECSClient, RunTaskCommand } from '@aws-sdk/client-ecs'
import { Server } from 'socket.io'
import cors from 'cors'
import { prisma } from './utils/prisma-client.js'
import { createClient } from '@clickhouse/client'
import { Kafka, Consumer, EachBatchPayload, Offsets } from 'kafkajs'
import { v4 as uuidv4 } from 'uuid'
import { createServer } from "http";
import path from 'path'
import { fileURLToPath } from 'url'
import z from 'zod'
import {decode} from "next-auth/jwt"
import { ProjectSchema } from './utils/types.js'
import NextAuth from 'next-auth'

const app = express()
const server = createServer(app);
const PORT = process.env.PORT || 4000;
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // Frontend origin
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
app.set('io', io);



const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID!,
    brokers: [process.env.KAFKA_BROKER!],
    ssl: {
        ca: process.env.KAFKA_CA!,
    },
    sasl: {
        username: process.env.KAFKA_USERNAME!,
        password: process.env.KAFKA_PASSWORD!,
        mechanism: 'plain'
    }
})

let client:any;
try {
    client = createClient({
        url: process.env.CLICKHOUSE_HOST!,
        database: process.env.CLICKHOUSE_DATABASE!,
        username: process.env.CLICKHOUSE_USERNAME!,
        password: process.env.CLICKHOUSE_PASSWORD!,
    })
    console.log('client connection established')

} catch (error) {
    console.error('Error connecting to ClickHouse:', error)
}

const consumer: Consumer = kafka.consumer({ groupId: 'api-server-logs-consumer' })

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Event for subscribing to deployment logs
    socket.on('subscribe', (deploymentId: string) => {
        if (!deploymentId) {
            socket.emit('error', { message: 'Invalid deployment ID' });
            return;
        }

        console.log(`Client subscribed to deployment logs: ${deploymentId}`);
        socket.join(deploymentId);
        socket.emit('message', { log: `Subscribed to deployment ID: ${deploymentId}` });
    });

    // Event for unsubscribing from deployment logs
    socket.on('unsubscribe', (deploymentId: string) => {
        if (!deploymentId) {
            socket.emit('error', { message: 'Invalid deployment ID' });
            return;
        }

        console.log(`Client unsubscribed from deployment logs: ${deploymentId}`);
        socket.leave(deploymentId);
        socket.emit('message', { log: `Unsubscribed from deployment ID: ${deploymentId}` });
    });

    // Handling client disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});




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

app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
}))


app.get('/', (req, res) => {
    res.send('Hello World!')
});


app.post('/deploy', async (req: Request, res: Response): Promise<any> => {
   try {
     const safeParsedData = ProjectSchema.safeParse(req.body);
     const authHeader = req.headers.authorization; 
     if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })
        const token = authHeader.split(" ")[1];
        const decodedToken =await decode({
            token,
            secret:process.env.AUTH_SECRET!,
            salt:"authjs.session-token"
        });
        const id = decodedToken?.id as string;
        if (!id) {
            return res.status(401).json({ error: 'Unauthorized' })
        }
       
     if(!safeParsedData.success) return res.status(400).json({ error: safeParsedData.error })

        const project = await prisma.project.create({
            data: {
                name: safeParsedData.data.name,
                gitURL: safeParsedData.data.gitURL,
                subDomain: generateSlug(),
                userId: id
            }
        })
  if(!project) return res.status(500).json({ error: 'Error creating project' })

     const project_id = project.id
 
     // Check if there is no running deployment
     const deployment = await prisma.deployement.create({
         data: {
             projectId: project_id,
             status: 'QUEUED',
             is_main:  true
         }
     })
 if(!deployment) return res.status(500).json({ error: 'Error creating deployment' })
     // Spin the container
     const command = new RunTaskCommand({
         cluster: config.CLUSTER,
         taskDefinition: config.TASK,
         launchType: 'FARGATE',
         count: 1,
         networkConfiguration: {
             awsvpcConfiguration: {
                 assignPublicIp: 'ENABLED',
                 subnets: process.env.ECS_SUBNETS?.split(',') || [],
                 securityGroups: [process.env.ECS_SECURITY!]
             }
         },
         overrides: {
             containerOverrides: [
                 {
                     name: 'build-task',
                     environment: [
                         { name: 'GIT_REPOSITORY_URL', value: project.gitURL },
                         { name: 'PROJECT_ID', value: project_id },
                         { name: 'DEPLOYEMENT_ID', value: deployment.id },
                         { name: 'AWS_ACCESS_ID', value: process.env.AWS_ACCESS_ID! },
                         { name: 'AWS_ACCESS_SECRET', value: process.env.AWS_ACCESS_SECRET! },
                         { name: 'AWS_REGION', value: process.env.AWS_REGION! },
                         { name: 'KAFKA_BROKER', value: process.env.KAFKA_BROKER! },
                         { name: 'KAFKA_USERNAME', value: process.env.KAFKA_USERNAME! },
                         { name: 'KAFKA_PASSWORD', value: process.env.KAFKA_PASSWORD! },
                         { name: 'KAFKA_CA', value: process.env.KAFKA_CA! },
                     ]
                 }
             ]
         }
     })
 
     await ecsClient.send(command)
 
     return res.json({ status: 'queued', data: { deploymentId: deployment.id, projectId: project.id } })
   } 
catch (error: any) {
    console.log(error)
    return res.status(500).json({ error: error })
   }
})

app.get('/logs/:id', async (req: Request, res: Response): Promise<any> => {
    const id = req.params.id;
    console.log(id)
    try {
        const logs = await client.query({
            query: 'SELECT event_id, deployment_id, log, timestamp FROM log_events WHERE deployment_id = {deployment_id:String}',
            query_params: {
                deployment_id: id,
            },
            format: 'JSONEachRow',
        });

        const rawLogs = await logs.json();
      
        return res.json({ logs: rawLogs });
    } catch (error) {
        console.error('Error fetching logs:', error);
        return res.status(500).json({ error: 'Failed to fetch logs.' });
    }
});


async function initkafkaConsumer() {
   try {
     await consumer.connect()
     await consumer.subscribe({ topics: ['container-logs'], fromBeginning: true })
 
     await consumer.run({
         eachBatch: async ({ batch, heartbeat, commitOffsetsIfNecessary, resolveOffset }: EachBatchPayload) => {
             const messages = batch.messages
             console.log(`Recv. ${messages.length} messages..`)
             for (const message of messages) {
                
                 if (!message.value) continue
                 const stringMessage = message.value.toString()
                 const { PROJECT_ID, DEPLOYEMENT_ID, log, timeStamp ,status} = JSON.parse(stringMessage)

//logs incomming
                 const logs = { event_id: uuidv4(), deployment_id: DEPLOYEMENT_ID, log:log,timestamp: timeStamp,  project_id: PROJECT_ID, status: status }



              
                 io.to(DEPLOYEMENT_ID).emit('message', { logs: logs })
                 
                 try {
                     const { query_id } = await client.insert({
                         table: 'log_events',
                         values: [logs],
                         format: 'JSONEachRow'
                     })
                     console.log(query_id)
                     resolveOffset(message.offset)
                     await commitOffsetsIfNecessary(message.offset as any)
                     await heartbeat()
                 } catch (err) {
                     console.log(err)
                 }
                 if(status === 'building') continue;
                else{
                 await prisma.deployement.update({
                     where: { id: DEPLOYEMENT_ID, projectId: PROJECT_ID },
                     data: { status: status }
                 });
                }
             }
         }
     })
   } catch (error) {
     console.error('Error connecting to Kafka:', error)
   }
}


// initkafkaConsumer()

setInterval(() => {
    console.log("test")
    io.emit('message', { log: 'Broadcasting to all clients' });
    io.to("deployment-logs").emit('message', { logs: "test" })
}, 5000);

server.listen(PORT, () => console.log(`API Server Running..${PORT}`))
