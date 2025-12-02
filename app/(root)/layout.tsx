import React, {ReactNode} from 'react'

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <p>Root Layout</p>
      {children}
    </>
  )
}
export default RootLayout
