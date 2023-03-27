import Link from "next/link"
import React from "react"

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div>
      <Link
        className="logo"
        href="/"
      >
        <img
          src="/logo.png"
          alt="logo"
        />
      </Link>
      {children}
    </div>
  )
}

export default Layout
