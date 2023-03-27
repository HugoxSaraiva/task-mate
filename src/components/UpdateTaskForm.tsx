import React, { useState } from "react"
import { useUpdateTaskMutation } from "../../generated/graphql-frontend"
import { useRouter } from "next/router"

interface Values {
  title: string
}

interface Props {
  id: number
  initialValues: Values
}

const UpdateTaskForm: React.FC<Props> = ({ id, initialValues }) => {
  const [{ title }, setValues] = useState<Values>(initialValues)
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target
    setValues((prevValues) => {
      return { ...prevValues, [name]: value }
    })
  }

  const [updateTask, { loading, error }] = useUpdateTaskMutation()

  const router = useRouter()

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    try {
      const { data } = await updateTask({
        variables: { input: { id: String(id), title: title } },
      })
      if (data?.updateTask) {
        // Request was successfull
        router.push("/")
      }
    } catch (error) {}
  }

  let errorMessage = ""
  if (error) {
    if (error.networkError) {
      errorMessage = "A network error has occurred"
    } else {
      console.log(JSON.stringify(error.graphQLErrors))
      errorMessage = "Sorry, an error occurred."
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert-error">{errorMessage}</div>}
      <div>
        <label className="field-label">Title</label>
        <input
          type="text"
          name="title"
          className="text-input"
          value={title}
          onChange={handleChange}
        />
      </div>
      <div>
        <button
          className="button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Loading" : "Save"}
        </button>
      </div>
    </form>
  )
}

export default UpdateTaskForm
