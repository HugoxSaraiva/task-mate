import {
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb"
import { getDynamicUpdateParameters } from "./utils"
import { client } from "./client"
import { unmarshall } from "@aws-sdk/util-dynamodb"

type User = {
  id: string
  username: string
  password: string
}

type UserUpdateInput = Partial<Omit<User, "id">> & Pick<User, "id">

// CREATE a new user
export const createUser = async (user: User) => {
  console.log("Creating user with id " + user.id)
  const command = new PutItemCommand({
    TableName: process.env.DYNAMO_TABLE,
    Item: {
      PK: {
        S: `USER#${user.id}`,
      },
      SK: {
        S: `USER#${user.id}`,
      },
      id: { S: user.id },
      username: { S: user.username },
      password: { S: user.password },
    },
    ConditionExpression: "attribute_not_exists(PK)",
  })
  try {
    const data = await client.send(command)
    console.log(`User ${user.id} created successfully`)
    if (data.Attributes) {
      console.log(
        `Added user with attributes: ${
          (JSON.stringify(unmarshall(data.Attributes)), null, 2)
        }`
      )
    }
  } catch (err) {
    console.error(err)
    throw err
  }
}

// READ a user by ID
export const getUserById = async (id: string): Promise<User> => {
  console.log("Getting user with id " + id)
  const command = new GetItemCommand({
    TableName: process.env.DYNAMO_TABLE,
    Key: {
      PK: { S: `USER#${id}` },
      SK: { S: `USER#${id}` },
    },
  })

  try {
    const result = await client.send(command)
    if (result.Item) {
      const user = unmarshall(result.Item) as User

      console.log(`User ${user.id} retrieved successfully`)
      return user
    }
    throw new Error(`User ${id} not found`)
  } catch (error) {
    console.error(error)
    throw error
  }
}

// UPDATE a user
export const updateUser = async (input: UserUpdateInput): Promise<void> => {
  const { id, ...updateInput } = input
  const {
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
  } = getDynamicUpdateParameters(updateInput)
  const command = new UpdateItemCommand({
    TableName: process.env.DYNAMO_TABLE,

    Key: {
      PK: { S: `USER#${id}` },

      SK: { S: `USER#${id}` },
    },

    UpdateExpression,

    ExpressionAttributeNames,

    ExpressionAttributeValues,
    ReturnValues: "ALL_NEW",
  })

  try {
    const data = await client.send(command)
    if (data.Attributes) {
      const user = unmarshall(data.Attributes) as User
      console.log(`User ${user.id} updated successfully`)
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

// DELETE a user
export const deleteUser = async (id: string): Promise<User> => {
  const command = new DeleteItemCommand({
    TableName: process.env.DYNAMO_TABLE,
    Key: {
      PK: { S: `USER#${id}` },
      SK: { S: `USER#${id}` },
    },
    ReturnValues: "ALL_OLD",
  })

  try {
    const data = await client.send(command)
    if (data.Attributes) {
      const user = unmarshall(data.Attributes) as User
      console.log(`User ${id} deleted successfully`)
      return user
    }
    throw new Error(`User ${id} not found`)
  } catch (error) {
    console.error(error)
    throw error
  }
}
