import { Kafka } from 'kafkajs'
import { prisma } from './prisma-client.js'


export  const kafka = new Kafka({
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




