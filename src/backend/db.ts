import psql from "serverless-postgres"
import { TaskStatus } from "../../generated/graphql-backend"

export const db = new psql({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  debug: true,
  delayMs: 3000,
})

type DB = typeof db

export interface TaskDbRow {
  id: number
  title: string
  task_status: TaskStatus
}
