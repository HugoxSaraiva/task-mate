import React, { useEffect } from "react"
import { Task, useDeleteTaskMutation } from "../../generated/graphql-frontend"
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

  useEffect(() => {
    if (error) {
      alert("An error occurred, please try again")
    }
  }, [error])

  return (
    <li
      className="task-list-item"
      key={task.id}
    >
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
