import Image from "next/image"
import Link from "next/link"
import React from "react"
import Header from "./Header"

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="page">
      <Link
        className="logo"
        href="/"
      >
        <Image
          src="/logo.png"
          alt="logo"
          width={200}
          height={200}
        />
      </Link>
      {children}
    </div>
  )
}

export default Layout
