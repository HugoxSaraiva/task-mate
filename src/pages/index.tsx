import Head from "next/head"
import { initializeApollo } from "@/lib/client"
import {
  TasksDocument,
  TasksQuery,
  useTasksQuery,
} from "../../generated/graphql-frontend"
import TaskList from "@/components/TaskList"

const Home = () => {
  const { loading, error, data } = useTasksQuery()
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
      {loading ? (
        <div>Loading tasks...</div>
      ) : error ? (
        <div>An error occurred.</div>
      ) : tasks && tasks.length > 0 ? (
        <TaskList tasks={tasks}></TaskList>
      ) : (
        <div className="no-tasks-message">You've got no tasks</div>
      )}
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
