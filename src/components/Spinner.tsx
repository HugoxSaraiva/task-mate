import React from "react"
import styles from "./Spinner.module.css"

const Spinner: React.FC = () => {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.svg}
    >
      <circle
        className={styles.circle}
        cx="50"
        cy="50"
        r="45"
      />
    </svg>
  )
}

export default Spinner
