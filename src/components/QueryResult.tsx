import React from "react"
import Spinner from "./Spinner"
import { SpinnerContainer } from "./SpinnerContainer"

interface Props<T extends any> {
  loading: boolean
  error?: { message: string } | undefined
  children: React.ReactNode | React.FC<{ data: NonNullable<T> }>
  data: T
  called?: boolean
  onLoadClick?: () => void
}

/**
 * Query Results conditionally renders Apollo useQuery hooks states:
 * loading, error or its children when data is ready
 */
export default function QueryResult<T extends any>({
  loading,
  error,
  data,
  children,
  called,
  onLoadClick,
}: Props<T>) {
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    if (onLoadClick) {
      onLoadClick()
    }
  }

  if (error) {
    return <p>ERROR: {error.message}</p>
  }
  if (loading && !data) {
    return (
      <SpinnerContainer>
        <Spinner />
      </SpinnerContainer>
    )
  } else if (loading && data) {
    return (
      <>
        <>{children}</>
        <SpinnerContainer>
          <Spinner />
        </SpinnerContainer>
      </>
    )
  }
  // If called is undefined, it means that the query is not lazy
  if (called === false) {
    return <button onClick={handleClick}>Load</button>
  }
  if (!data) {
    return <p>Oops you got nothing to show...</p>
  } else {
    return <>{children}</>
  }
}
