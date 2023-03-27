import Head from "next/head"
import Image from "next/image"
import { gql, useQuery } from "@apollo/client"
import { Task } from "../../generated/graphql-backend"
import { initializeApollo } from "@/lib/client"

const TaskQueryDocument = gql`
  query Tasks {
    tasks {
      id
      status
      title
    }
  }
`

interface TaskQuery {
  tasks: Pick<Task, "id" | "title" | "status">[]
}

const Home = () => {
  const { data } = useQuery<TaskQuery>(TaskQueryDocument)
  const tasks = data?.tasks
  return (
    <div>
      <Head>
        <title>Tasks</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <link
          rel="icon"
          href="/favicon.ico"
        />
      </Head>
      {tasks &&
        tasks.length > 0 &&
        tasks.map((task) => {
          return (
            <div key={task.id}>
              {task.id} - {task.title} ({task.status})
            </div>
          )
        })}
    </div>
  )
}

export async function getStaticProps() {
  const apolloClient = initializeApollo()

  await apolloClient.query({
    query: TaskQueryDocument,
  })

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
  }
}

export default Home
