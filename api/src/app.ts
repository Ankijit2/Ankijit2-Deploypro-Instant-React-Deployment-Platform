import express, { Request, response, Response } from 'express'


import { Server } from 'socket.io'
import cors from 'cors'
import { prisma } from './utils/prisma-client.js'

import { Consumer, EachBatchPayload } from 'kafkajs'
import { v4 as uuidv4 } from 'uuid'
import { createServer } from "http";
import { kafka } from './utils/kafka-client.js'
import { client } from './utils/clickhouse-client.js';
import authenticateJWT from './middlewares/auth.middleware.js'
import cookieParser from 'cookie-parser'

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


app.use(cookieParser());



app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
}))


app.get('/', (req, res) => {
    res.send('Hello World!')
});


import projectRoutes from './routes/project.routes.js'

app.use('/api/v1/project', authenticateJWT, projectRoutes)


const consumer: Consumer = kafka.consumer({ groupId: 'api-server-logs-consumer' })


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
 
 
 
               
                  io.to(DEPLOYEMENT_ID).emit('deployment-logs', { logs: logs })
                  
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

initkafkaConsumer()



server.listen(PORT, () => console.log(`API Server Running..${PORT}`))
