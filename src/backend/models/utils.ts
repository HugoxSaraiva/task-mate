import { convertToAttr } from "@aws-sdk/util-dynamodb"
import { marshall } from "@aws-sdk/util-dynamodb"

export function getDynamicUpdateParameters(updateObject: {
  [key: string]: any
}) {
  const updatedObjectWithoutUndefined = Object.fromEntries(
    Object.entries(updateObject).filter(([_, value]) => value !== undefined)
  )
  const attributesToUpdate = Object.keys(updatedObjectWithoutUndefined)
    .map((key) => `#${key} = :${key}`)
    .join(", ")
  const UpdateExpression = "set " + attributesToUpdate
  const ExpressionAttributeNames = Object.fromEntries(
    Object.keys(updatedObjectWithoutUndefined).map((key) => [`#${key}`, key])
  )
  const ExpressionAttributeValues = Object.fromEntries(
    Object.keys(updatedObjectWithoutUndefined).map((key) => [
      `:${key}`,
      convertToAttr(updatedObjectWithoutUndefined[key]),
    ])
  )
  return {
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
  }
}
