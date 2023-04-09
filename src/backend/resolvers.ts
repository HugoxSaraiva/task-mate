import sql, { Sql, empty, join } from "sql-template-tag"
import { Resolvers, Task, TaskStatus } from "../../generated/graphql-backend"
import { GraphQLError } from "graphql"
import { Context } from "./context"
import * as TaskRepository from "./models/task"
import { sortBy } from "lodash"
const USER_ID = "1"

function mapStatusToTaskStatus<T extends { status: string }>(input: T) {
  return { ...input, status: input.status as TaskStatus }
}

export const resolvers: Resolvers<Context> = {
  Query: {
    async tasks(_, { status }) {
      return TaskRepository.getAllTasksForUser({
        userId: USER_ID,
        status: status ?? undefined,
      })
        .then((tasks) =>
          sortBy(tasks, [(task) => -new Date(task.updatedAt).getTime()])
        )
        .then((tasks) => tasks.map(mapStatusToTaskStatus))
    },
    async task(_, { id }, { db }) {
      return TaskRepository.getTaskById(id).then(mapStatusToTaskStatus)
    },
  },
  Mutation: {
    async createTask(_, { input: { title } }, { db }) {
      const taskCreated = await TaskRepository.createTask({
        title,
        status: TaskStatus.Active,
        userId: USER_ID,
      })
      if (!taskCreated) {
        return null
      }
      return mapStatusToTaskStatus(taskCreated)
    },
    async updateTask(_, { input: { id, title, status } }, { db }) {
      if (!title && !status) {
        throw new GraphQLError("At least one argument to update must be sent")
      }
      const updatedTask = await TaskRepository.updateTask({
        id,
        title: title ?? undefined,
        status: status ?? undefined,
        userId: USER_ID,
      })
      return mapStatusToTaskStatus(updatedTask)
    },
    async deleteTask(_, { input: { id } }, { db }) {
      const taskDeleted = await TaskRepository.deleteTask(USER_ID, id)
      return mapStatusToTaskStatus(taskDeleted)
    },
  },
}
