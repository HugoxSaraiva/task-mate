import { gql } from "@apollo/client"

export const typeDefs = gql`
  enum TaskStatus {
    active
    completed
  }

  type Task {
    id: ID!
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
