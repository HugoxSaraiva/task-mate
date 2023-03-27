import React from "react"
import { Task } from "../../generated/graphql-frontend"
import Link from "next/link"

interface Props {
  tasks: Task[]
}

const TaskList: React.FC<Props> = ({ tasks }) => {
  return (
    <ul className="task-list">
      {tasks.map((task) => {
        return (
          <li
            className="task-list-item"
            key={task.id}
          >
            <Link
              href="/update/[id]"
              as={`/update/${task.id}`}
              className="task-list-item-title"
            >
              {task.title} ({task.status})
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default TaskList
