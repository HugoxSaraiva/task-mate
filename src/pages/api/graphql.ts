import { ServerContext, context } from "@/backend/context"
import { schema } from "@/backend/schema"
import { createYoga } from "graphql-yoga"

export const config = {
  api: {
    // Disable body parsing (required for file uploads)
    bodyParser: false,
  },
}

export default createYoga<ServerContext>({
  schema,
  // Needed to be defined explicitly because our endpoint lives at a different path other than `/graphql`
  graphqlEndpoint: "/api/graphql",
  context,
})
