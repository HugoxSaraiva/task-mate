import React from "react"
import { Task } from "../../generated/graphql-frontend"
import Link from "next/link"
import TaskListItem from "./TaskListItem"

interface Props {
  tasks: Task[]
  onUpdate: () => void
}

const TaskList: React.FC<Props> = ({ tasks, onUpdate }) => {
  return (
    <ul className="task-list">
      {tasks.map((task) => {
        return (
          <TaskListItem
            key={task.id}
            task={task}
            onUpdate={onUpdate}
          />
        )
      })}
    </ul>
  )
}

export default TaskList
