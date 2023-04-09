const { marshall } = require("@aws-sdk/util-dynamodb")
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb")

const client = new DynamoDBClient({
  region: "local",
  endpoint: "http://localhost:8001",
  credentials: {
    accessKeyId: "dummy",
    secretAccessKey: "dummy",
  },
})

const user = {
  id: "1",
  username: "hugo",
  password: "123456",
  PK: "USER#1",
  SK: "USER#1",
}
const params = {
  TableName: "taksmate-table-dev",
  Item: marshall(user),
}

const command = new PutItemCommand(params)

client.send(command, function (err, data) {
  if (err) {
    console.log("Error seeding DynamoDB with data", err)
  } else {
    console.log("Added an user with id " + user.id + " to DynamoDB")
  }
})
