import { typeDefs } from "./type-defs"
import { resolvers } from "./resolvers"
import { createSchema } from "graphql-yoga"
import { ServerContext } from "./context"
export const schema = createSchema<ServerContext>({
  typeDefs,
  resolvers,
})
