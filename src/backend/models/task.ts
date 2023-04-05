import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/client-dynamodb"
import { getDynamicUpdateParameters } from "./utils"
import { client } from "./client"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"
import { v4 as uuidv4 } from "uuid"
import { TaskStatus } from "../../../generated/graphql-backend"

interface DynamoDBTask extends Task {
  PK: string
  SK: string
  taskStatus: string
}

interface Task {
  id: string
  title: string
  status: string
  userId: string
  createdAt: string
  updatedAt: string
}

type UnchangeableTaskFields = "id" | "createdAt" | "PK" | "SK"
type RepositoryAutomaticFields = "id" | "createdAt" | "updatedAt"

type TaskCreateInput = Omit<Task, RepositoryAutomaticFields>

type TaskUpdateInput = Partial<Omit<Task, RepositoryAutomaticFields>> &
  Pick<Task, "id">

type TaskUpdateInputWithDBFields = Partial<
  Omit<DynamoDBTask, UnchangeableTaskFields>
>

const getUpdateAndStatusString = (updatedAt: string, status: string) => {
  return `UPDATED:${updatedAt}#STATUS:${status}`
}

// CREATE a new task
export const createTask = async (task: TaskCreateInput) => {
  const id = uuidv4()
  const now = new Date().toISOString()
  const taskCreateObject: DynamoDBTask = {
    PK: `USER#${task.userId}`,
    SK: `TASK#${id}`,
    userId: task.userId,
    taskStatus: task.status,
    id: id,
    title: task.title,
    status: task.status,
    createdAt: now,
    updatedAt: now,
  }
  const taskItem = marshall(taskCreateObject)
  console.log(JSON.stringify(taskItem, null, 2))
  const command = new PutItemCommand({
    TableName: process.env.DYNAMO_TABLE,
    Item: taskItem,
    ConditionExpression: "attribute_not_exists(PK)",
  })
  try {
    const data = await client.send(command)
    console.log(`Task ${id} created successfully`)
    return taskCreateObject as DynamoDBTask
  } catch (err) {
    console.error(err)
    throw err
  }
}

// READ a task by ID
export const getTaskById = async (taskId: string): Promise<Task> => {
  const params = {
    TableName: process.env.DYNAMO_TABLE,
    IndexName: "TasksBySK",
    KeyConditionExpression: "#sk = :sk",
    ExpressionAttributeNames: {
      "#sk": "SK",
    },
    ExpressionAttributeValues: {
      ":sk": { S: `TASK#${taskId}` },
    },
  }
  const command = new QueryCommand(params)
  try {
    const response = await client.send(command)
    if ((response.Items ?? []).length > 0) {
      // Since taskId is a uuid, there should only be one item in the array
      const taskItem = response.Items![0]
      const task = unmarshall(taskItem) as Task
      console.log(`Task ${task.id} retrieved successfully`)
      return task
    }
    throw new Error(`Task ${taskId} not found`)
  } catch (error) {
    console.error(error)
    throw error
  }
}

// UPDATE a task
export const updateTask = async (input: TaskUpdateInput): Promise<Task> => {
  const { id, userId, ...updateInput } = input
  const now = new Date().toISOString()
  const updateInputWithDBFields: TaskUpdateInputWithDBFields = {
    ...updateInput,
    updatedAt: now,
    taskStatus: updateInput.status,
  }
  const {
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
  } = getDynamicUpdateParameters(updateInputWithDBFields)
  const command = new UpdateItemCommand({
    TableName: process.env.DYNAMO_TABLE,
    Key: {
      PK: { S: `USER#${userId}` },
      SK: { S: `TASK#${id}` },
    },
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    ReturnValues: "ALL_NEW",
  })
  try {
    const data = await client.send(command)
    if (data.Attributes) {
      const task = unmarshall(data.Attributes) as Task
      console.log(`Task ${task.id} updated successfully`)
      return task
    }
    throw new Error(`Task ${id} not found`)
  } catch (error) {
    console.error(error)
    throw error
  }
}

// DELETE a task
export const deleteTask = async (
  userId: string,
  taskId: string
): Promise<Task> => {
  const command = new DeleteItemCommand({
    TableName: process.env.DYNAMO_TABLE,
    Key: {
      PK: { S: `USER#${userId}` },
      SK: { S: `TASK#${taskId}` },
    },
    ReturnValues: "ALL_OLD",
  })

  try {
    const data = await client.send(command)
    if (data.Attributes) {
      const task = unmarshall(data.Attributes) as DynamoDBTask
      console.log(`Task ${taskId} deleted successfully`)
      return task
    }
    throw new Error(`Task ${taskId} not found`)
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const getAllTasksForUser = async (input: {
  userId: string
  status?: string
}): Promise<Task[]> => {
  const { userId, status } = input
  console.log(
    `Getting all tasks for user with id ${userId}${
      status ? " and status " + status : ""
    }`
  )
  let KeyConditionExpression = ""
  let ExpressionAttributeNames: Record<string, string> = {}
  let ExpressionAttributeValues: Record<string, any> = {}
  if (status) {
    KeyConditionExpression = "#uid = :userId and #taskStatus = :taskStatus"
    ExpressionAttributeNames = {
      "#uid": "userId",
      "#taskStatus": "taskStatus",
    }
    ExpressionAttributeValues = marshall({
      ":userId": userId,
      ":taskStatus": status,
    })
  } else {
    KeyConditionExpression = "#uid = :userId"
    ExpressionAttributeNames = {
      "#uid": "userId",
    }
    ExpressionAttributeValues = marshall({
      ":userId": userId,
    })
  }

  const params: QueryCommandInput = {
    TableName: process.env.DYNAMO_TABLE,
    IndexName: "TasksByUserAndStatus",
    KeyConditionExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    ScanIndexForward: true,
  }
  const command = new QueryCommand(params)

  try {
    const data = await client.send(command)
    if ((data.Items ?? []).length > 0) {
      const tasks =
        data.Items!.map((item) => unmarshall(item) as DynamoDBTask) ?? []
      console.log(
        `Retrieved ${tasks.length} tasks for user with id ${userId}${
          status ? " and status " + status : ""
        }`
      )
      return tasks
    }
    return []
  } catch (error) {
    console.error(error)
    throw error
  }
}
