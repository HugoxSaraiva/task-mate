import React, { useState } from "react"

interface Values {
  title: string
}

interface Props {
  initialValues: Values
}

const UpdateTaskForm: React.FC<Props> = ({ initialValues }) => {
  const [values, setValues] = useState<Values>(initialValues)
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target
    setValues((prevValues) => {
      return { ...prevValues, [name]: value }
    })
  }

  return (
    <form>
      <div>
        <label className="field-label">Title</label>
        <input
          type="text"
          name="title"
          className="text-input"
          value={values.title}
          onChange={handleChange}
        />
      </div>
      <div>
        <button
          className="button"
          type="submit"
        >
          Save
        </button>
      </div>
    </form>
  )
}

export default UpdateTaskForm
