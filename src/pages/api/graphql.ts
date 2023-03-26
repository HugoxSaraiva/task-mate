import { createYoga, createSchema } from "graphql-yoga"
import type { NextApiRequest, NextApiResponse } from "next"
import psql from "serverless-postgres"

interface ServerContext {
  req: NextApiRequest
  res: NextApiResponse
}

type Context = Awaited<ReturnType<typeof context>>

type Resolvers<TContext = any> = {
  [parentKey: string]: {
    [fieldKey: string]: (
      parent: unknown,
      args: unknown,
      context: TContext
    ) => any
  }
}

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

const resolvers: Resolvers<Context> = {
  Query: {
    async tasks(parent, args, { db }) {
      await db.connect()
      const dbQueryResult = (await db.query(
        "SELECT 'HELLO WORLD' AS hello_world;"
      )) as { rows: { hello_word: string }[] }
      const result = dbQueryResult.rows[0]
      await db.clean()
      return []
    },
    task(parent, args, context) {
      return null
    },
  },
  Mutation: {
    createTask(parent, args, context) {
      return null
    },
    updateTask(parent, args, context) {
      return null
    },
    deleteTask(parent, args, context) {
      return null
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
