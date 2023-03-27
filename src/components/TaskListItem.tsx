import React, { useEffect, useState } from "react"
import {
  Task,
  TaskStatus,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} from "../../generated/graphql-frontend"
import Link from "next/link"
import { Reference } from "@apollo/client"

interface Props {
  task: Task
}

const TaskListItem: React.FC<Props> = ({ task }) => {
  const [deleteTask, { loading, error }] = useDeleteTaskMutation({
    variables: { input: { id: String(task.id) } },
    errorPolicy: "all",
    update: (cache, result) => {
      const deletedTask = result.data?.deleteTask

      if (deletedTask) {
        cache.modify({
          fields: {
            tasks(taskRefs: Reference[], { readField }) {
              return taskRefs.filter((taskRef) => {
                const id = readField("id", taskRef)
                return id !== task.id
              })
            },
          },
        })
      }
    },
  })

  useEffect(() => {
    if (error) {
      alert("An error occurred, please try again")
    }
  }, [error])

  const [status, setStatus] = useState(task.status)

  const [updateTask, { loading: updateTaskLoading, error: updateTaskError }] =
    useUpdateTaskMutation({ errorPolicy: "all" })

  useEffect(() => {
    if (updateTaskError) {
      alert("An error occurred, please try again")
    }
  }, [updateTaskError])

  const handleDelete: React.MouseEventHandler<HTMLButtonElement> = async (
    e
  ) => {
    try {
      await deleteTask()
    } catch (error) {
      // Log the error
      console.log(error)
    }
  }

  const handleStatusChange: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    const newStatus = e.target.checked
      ? TaskStatus.Completed
      : TaskStatus.Active
    try {
      await updateTask({
        variables: { input: { id: String(task.id), status: newStatus } },
      })
      setStatus(newStatus)
    } catch (error) {}
  }

  return (
    <li
      className="task-list-item"
      key={task.id}
    >
      <label className="checkbox">
        <input
          type="checkbox"
          onChange={handleStatusChange}
          checked={status == TaskStatus.Completed}
          disabled={updateTaskLoading}
        ></input>
        <span className="checkbox-mark">&#10003;</span>
      </label>
      <Link
        key={task.id}
        href="/update/[id]"
        as={`/update/${task.id}`}
        className="task-list-item-title"
      >
        {task.title} ({task.status})
      </Link>
      <button
        className="task-list-item-delete"
        onClick={handleDelete}
        disabled={loading}
      >
        &times;
      </button>
    </li>
  )
}

export default TaskListItem
