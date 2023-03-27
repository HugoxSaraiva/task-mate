import sql, { Sql, empty, join } from "sql-template-tag"
import { Resolvers, Task, TaskStatus } from "../../generated/graphql-backend"
import { GraphQLError } from "graphql"
import { getFistElementSafe } from "@/lib/utils"
import { Context } from "./context"
import { TaskDbRow } from "./db"

export class TaskSelector {
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

export async function getDbQueryResult<TResult>(
  db: Context["db"],
  query: Sql
): Promise<TResult> {
  await db.connect()
  const dbQueryResult = await db.query(query)
  await db.clean()
  const result = dbQueryResult.rows
  return result
}

export const resolvers: Resolvers<Context> = {
  Query: {
    async tasks(_, { status }, context) {
      const { db } = context
      const tasks = await getDbQueryResult<TaskDbRow[]>(
        db,
        sql`SELECT id, title, task_status FROM tasks ${
          status ? sql`WHERE task_status = ${status}` : empty
        } ORDER BY id ASC;`
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
