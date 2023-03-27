import { NextApiRequest, NextApiResponse } from "next"
import { db } from "./db"

export const context = {
  db,
}

export interface ServerContext {
  req: NextApiRequest
  res: NextApiResponse
}

export type Context = typeof context
// Awaited<ReturnType<typeof context>>
