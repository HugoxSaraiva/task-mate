import { DynamoDBClient } from "@aws-sdk/client-dynamodb"

const additionnalConfig =
  process.env.AWS_REGION == "local"
    ? {
        endpoint: "http://localhost:8001",
        credentials: {
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        },
      }
    : {}

export const client = new DynamoDBClient({
  apiVersion: "2012-08-10",
  region: process.env.AWS_REGION,
  ...additionnalConfig,
})
