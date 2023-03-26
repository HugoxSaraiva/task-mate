import { createYoga, createSchema } from "graphql-yoga"
import type { NextApiRequest, NextApiResponse } from "next"
import psql from "serverless-postgres"
import sql, { Sql, empty, join } from "sql-template-tag"
import { Resolvers, Task, TaskStatus } from "../../../generated/graphql-backend"
import { GraphQLError } from "graphql"

interface ServerContext {
  req: NextApiRequest
  res: NextApiResponse
}

type Context = Awaited<ReturnType<typeof context>>

const typeDefs = `
  enum TaskStatus {
    active
    completed
  }

  type Task {
    id: Int!
    title: String!
    status: TaskStatus!
  }

  input CreateTaskInput {
    title: String!
  }

  input UpdateTaskInput {
    id: ID!
    title: String
    status: TaskStatus
  }

  input DeleteTaskInput {
    id: ID!
  }

  type Query {
    tasks(status: TaskStatus): [Task!]!
    task(id: ID!): Task
  }

  type Mutation {
    createTask(input: CreateTaskInput!): Task
    updateTask(input: UpdateTaskInput!): Task
    deleteTask(input: DeleteTaskInput!): Task
  }
`

interface TaskDbRow {
  id: number
  title: string
  task_status: TaskStatus
}

const getFistElementSafe = <T>(input: T[]) => (input.length ? input[0] : null)

class TaskSelector {
  constructor(private db: Context["db"]) {}
  getById: (id: TaskDbRow["id"]) => Promise<Task | null> = async (id) => {
    const tasks = await getDbQueryResult<TaskDbRow[]>(
      this.db,
      sql`SELECT id, title, task_status FROM tasks WHERE id = ${id};`
    )
    const task = getFistElementSafe(tasks)
    return task
      ? { id: task.id, title: task.title, status: task.task_status }
      : null
  }
}

async function getDbQueryResult<TResult>(
  db: Context["db"],
  query: Sql
): Promise<TResult> {
  await db.connect()
  const dbQueryResult = await db.query(query)
  await db.clean()
  const result = dbQueryResult.rows
  return result
}

const resolvers: Resolvers<Context> = {
  Query: {
    async tasks(_, { status }, { db }) {
      const tasks = await getDbQueryResult<TaskDbRow[]>(
        db,
        sql`SELECT id, title, task_status FROM tasks ${
          status ? sql`WHERE task_status = ${status}` : empty
        };`
      )
      return tasks.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.task_status,
      }))
    },
    async task(_, { id }, { db }) {
      const selector = new TaskSelector(db)
      return selector.getById(Number(id))
    },
  },
  Mutation: {
    async createTask(_, { input: { title } }, { db }) {
      const taskId = await getDbQueryResult<{ id: number }[]>(
        db,
        sql`INSERT INTO tasks (title, task_status) VALUES (${title}, ${TaskStatus.Active}) RETURNING id;`
      ).then((idsObj) => getFistElementSafe(idsObj)?.id)
      if (!taskId) {
        return null
      }
      return { id: taskId, title: title, status: TaskStatus.Active }
    },
    async updateTask(_, { input: { id, title, status } }, { db }) {
      if (!title && !status) {
        throw new GraphQLError("At least one argument to update must be sent")
      }
      const selector = new TaskSelector(db)
      const task = await selector.getById(Number(id))
      if (!task) {
        throw new GraphQLError("Could not find task")
      }
      const result = await getDbQueryResult<[]>(
        db,
        sql`UPDATE tasks SET ${join(
          [
            title ? sql`title=${title}` : empty,
            title ? ` , ` : empty,
            status ? sql`task_status=${status}` : empty,
          ],
          " "
        )} WHERE id=${id};`
      )
      return selector.getById(Number(id))
    },
    async deleteTask(_, { input: { id } }, { db }) {
      const selector = new TaskSelector(db)
      const taskToBeDeleted = await selector.getById(Number(id))
      if (!taskToBeDeleted) {
        throw new GraphQLError("Could not find task")
      }
      const result = await getDbQueryResult<[]>(
        db,
        sql`DELETE FROM tasks WHERE id=${id};`
      )
      return taskToBeDeleted
    },
  },
}

const schema = createSchema<ServerContext>({
  typeDefs,
  resolvers,
})

export const config = {
  api: {
    // Disable body parsing (required for file uploads)
    bodyParser: false,
  },
}

const db = new psql({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  debug: true,
  delayMs: 3000,
})

const context = () => {
  return { db }
}

export default createYoga<ServerContext>({
  schema,
  // Needed to be defined explicitly because our endpoint lives at a different path other than `/graphql`
  graphqlEndpoint: "/api/graphql",
  context,
})
