import Head from "next/head"
import { initializeApollo } from "@/lib/client"
import {
  TasksDocument,
  TasksQuery,
  useTasksQuery,
} from "../../generated/graphql-frontend"

const Home = () => {
  const { data } = useTasksQuery()
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

  await apolloClient.query<TasksQuery>({
    query: TasksDocument,
  })

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
  }
}

export default Home
