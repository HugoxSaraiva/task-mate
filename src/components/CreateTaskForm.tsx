import React, { useEffect, useState } from "react"
import { useCreateTaskMutation } from "../../generated/graphql-frontend"

interface Props {
  onSuccess?: () => void
}

const CreateTaskForm: React.FC<Props> = ({ onSuccess }) => {
  const [title, setTitle] = useState("")

  const [createTask, { loading, error }] = useCreateTaskMutation({
    onCompleted: () => {
      if (onSuccess) {
        onSuccess()
      }
      setTitle("")
    },
  })

  const handleTitleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setTitle(e.target.value)
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (loading) return
    try {
      await createTask({ variables: { input: { title: title } } })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert-error">An error occurred</div>}
      <input
        type="text"
        name="title"
        placeholder="What would you like to get done?"
        autoComplete="off"
        className="text-input new-task-text-input"
        value={title}
        onChange={handleTitleChange}
      ></input>
    </form>
  )
}

export default CreateTaskForm
