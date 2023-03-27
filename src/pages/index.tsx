import Head from "next/head"
import { initializeApollo } from "@/lib/client"
import {
  TasksDocument,
  TasksQuery,
  useTasksQuery,
} from "../../generated/graphql-frontend"
import TaskList from "@/components/TaskList"
import CreateTaskForm from "@/components/CreateTaskForm"

const Home = () => {
  const { loading, error, data, refetch } = useTasksQuery()
  const tasks = data?.tasks
  return (
    <div>
      <Head>
        <title>Tasks</title>
        <link
          rel="icon"
          href="/favicon.ico"
        />
      </Head>
      <CreateTaskForm onSuccess={refetch}></CreateTaskForm>
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
