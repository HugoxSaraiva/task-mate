import Head from "next/head"
import { initializeApollo } from "../lib/client"
import {
  TasksQuery,
  TasksDocument,
  TasksQueryVariables,
  useTasksQuery,
} from "../../generated/graphql-frontend"
import TaskList from "../components/TaskList"
import CreateTaskForm from "../components/CreateTaskForm"
import TaskFilter from "../components/TaskFilter"
import { useRouter } from "next/router"
import { TaskStatus } from "../../generated/graphql-frontend"
import { GetServerSideProps } from "next"
import { useRef, useEffect } from "react"
import { getStringFromParamArray } from "@/lib/utils"
import Custom404 from "./404"
import QueryResult from "@/components/QueryResult"

const isTaskStatus = (value: string): value is TaskStatus =>
  Object.values(TaskStatus).includes(value as TaskStatus)

export default function Home() {
  const router = useRouter()
  const status = getStringFromParamArray(router.query.status)

  const prevStatus = useRef(status)
  useEffect(() => {
    prevStatus.current = status
  }, [status])

  const { refetch, error, loading, data } = useTasksQuery({
    variables: { status: (status as TaskStatus | undefined) ?? undefined },
    fetchPolicy:
      prevStatus.current === status ? "cache-first" : "cache-and-network",
  })
  if (status !== undefined && !isTaskStatus(status)) {
    return <Custom404 />
  }
  return (
    <div>
      <Head>
        <title>Tasks</title>
        <link
          rel="icon"
          href="/favicon.ico"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
      </Head>
      <CreateTaskForm onSuccess={refetch} />
      <QueryResult
        error={error}
        loading={loading}
        data={data}
      >
        <TaskList
          tasks={data?.tasks!}
          onUpdate={refetch}
        />
      </QueryResult>
      <TaskFilter status={status} />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const status = getStringFromParamArray(context.params?.status)

  if (status === undefined || isTaskStatus(status)) {
    const apolloClient = initializeApollo()

    await apolloClient.query<TasksQuery, TasksQueryVariables>({
      query: TasksDocument,
      variables: { status },
    })

    return {
      props: {
        initialApolloState: apolloClient.cache.extract(),
      },
    }
  }
  return { props: {} }
}
