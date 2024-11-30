import { createClient } from '@clickhouse/client'

export const client = createClient({
        url: process.env.CLICKHOUSE_HOST!,
        database: process.env.CLICKHOUSE_DATABASE!,
        username: process.env.CLICKHOUSE_USERNAME!,
        password: process.env.CLICKHOUSE_PASSWORD!,
    })


