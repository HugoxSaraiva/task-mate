import { createYoga, createSchema } from "graphql-yoga"
import type { NextApiRequest, NextApiResponse } from "next"

type ServerContext = {
  req: NextApiRequest
  res: NextApiResponse
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

const resolvers = {
  Query: {
    tasks(parent: unknown, args: unknown, context: ServerContext) {
      return []
    },
    task(parent: unknown, args: unknown, context: ServerContext) {
      return null
    },
  },
  Mutation: {
    createTask(parent: unknown, args: unknown, context: ServerContext) {
      return null
    },
    updateTask(parent: unknown, args: unknown, context: ServerContext) {
      return null
    },
    deleteTask(parent: unknown, args: unknown, context: ServerContext) {
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

export default createYoga<ServerContext>({
  schema,
  // Needed to be defined explicitly because our endpoint lives at a different path other than `/graphql`
  graphqlEndpoint: "/api/graphql",
})
