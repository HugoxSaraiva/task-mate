const fs = require("fs")
const { DynamoDB } = require("@aws-sdk/client-dynamodb")
const yaml = require("js-yaml")
const cloudformationSchema = require("@serverless/utils/cloudformation-schema")
const SERVERLESS_CONFIG = __dirname + "/../serverless.yml"

process.env.AWS_ACCESS_KEY_ID = "dummy-key"
process.env.AWS_SECRET_ACCESS_KEY = "dummy-secret"

const ddb = new DynamoDB({
  endpoint: "http://localhost:8001",
  region: "local",
})

const sls = {
  stage: "dev",
}

const schema = yaml.loadAll(fs.readFileSync(SERVERLESS_CONFIG), {
  schema: cloudformationSchema,
})[0]

function getCustomWithSlsApplied() {
  const custom = schema.custom
  const newCustom = { ...custom }
  const slsKeys = Object.keys(sls)
  Object.keys(custom).forEach((key) => {
    if (typeof custom[key] === "object") {
      newCustom[key] = getCustomWithSlsApplied(custom[key])
    }
    if (typeof custom[key] === "string") {
      slsKeys.forEach((slsKey) => {
        if (custom[key].includes("${sls:" + slsKey + "}")) {
          newCustom[key] = custom[key].replace(
            "${sls:" + slsKey + "}",
            sls[slsKey]
          )
        }
      })
    }
  })
  return newCustom
}

const custom = getCustomWithSlsApplied()

function getDynamoDBTableResources() {
  const tables = Object.entries(schema.resources.Resources).filter(
    ([, resource]) => resource.Type === "AWS::DynamoDB::Table"
  )
  return tables
}

function applyCustomVariablesToValues(obj) {
  const newObj = { ...obj }
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "object") {
      newObj[key] = applyCustomVariablesToValues(obj[key])
    }
    if (Array.isArray(obj[key])) {
      newObj[key] = obj[key].map((item) => {
        return applyCustomVariablesToValues(item)
      })
    }
    if (typeof obj[key] === "string") {
      if (obj[key].includes("${self:custom.")) {
        const customKey = obj[key]
          .replace("${self:custom.", "")
          .replace("}", "")
        newObj[key] = custom[customKey] ?? obj[key]
      }
    }
  })
  return newObj
}

;(async function main() {
  console.info("Setting up local DynamoDB tables")
  const tables = getDynamoDBTableResources().map(([logicalId, definition]) => [
    logicalId,
    applyCustomVariablesToValues(definition),
  ])
  const existingTables = (await ddb.listTables({})).TableNames
  for await ([logicalId, definition] of tables) {
    const {
      Properties: {
        BillingMode,
        TableName,
        AttributeDefinitions,
        KeySchema,
        GlobalSecondaryIndexes,
        LocalSecondaryIndexes,
      },
    } = definition
    console.log(`Processing table ${TableName}`)
    if (existingTables.find((table) => table === TableName)) {
      console.info(
        `${logicalId}: DynamoDB Local - Table already exists: ${TableName}. Skipping..`
      )
      continue
    }
    const result = await ddb.createTable({
      AttributeDefinitions,
      BillingMode,
      KeySchema,
      LocalSecondaryIndexes,
      GlobalSecondaryIndexes,
      TableName,
    })
    console.info(`${logicalId}: DynamoDB Local - Created table: ${TableName}`)
  }
})()
