import { initializeApollo } from "@/lib/client"
import { GetServerSideProps } from "next"
import React from "react"
import {
  TaskDocument,
  TaskQuery,
  TaskQueryResult,
  TaskQueryVariables,
  useTaskQuery,
} from "../../../generated/graphql-frontend"
import { useRouter } from "next/router"
import Error from "next/error"
import UpdateTaskForm from "@/components/UpdateTaskForm"
import { getStringFromParam } from "@/lib/utils"

const UpdateTask = () => {
  const router = useRouter()
  const id = getStringFromParam(router.query.id)
  if (!id) {
    return <Error statusCode={404} />
  }
  const { data, loading, error } = useTaskQuery({ variables: { id } })
  const task = data?.task
  return loading ? (
    <div>Loading...</div>
  ) : error ? (
    <div>An error occurred.</div>
  ) : task ? (
    <UpdateTaskForm
      id={task.id}
      initialValues={{ title: task.title }}
    />
  ) : (
    <div>Task not found.</div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = getStringFromParam(context.params?.id)
  if (id) {
    const apolloClient = initializeApollo()
    await apolloClient.query<TaskQuery, TaskQueryVariables>({
      query: TaskDocument,
      variables: { id },
    })
    return {
      props: { initialApolloState: apolloClient.cache.extract() },
    }
  }
  return { props: {} }
}

export default UpdateTask
