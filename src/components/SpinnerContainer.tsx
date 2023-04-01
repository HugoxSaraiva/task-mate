import React from "react"
import styles from "./SpinnerContainer.module.css"

interface Props {
  children: React.ReactNode
}

export const SpinnerContainer: React.FC<Props> = ({ children }) => {
  return <div className={styles.container}>{children}</div>
}
